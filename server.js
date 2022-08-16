const express = require("express")
const { engine } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const handlebarhelper = require("./views/helpers/handlebars");
const app = express()
const path = require('path');
const session = require('express-session');
const main = require("./routes/main")
const user = require("./routes/user")
const admin = require("./routes/admin")
const seller = require("./routes/seller")
const services = require("./routes/services")
const datapipeline = require("./routes/datapipeline")
const api = require("./routes/api")
const msg = require("./routes/messaging")
const bodypassword = require('body-parser')
const GoogleAuth = require("./config/passportGoogleAuth")
const DBConnection = require('./config/DBConnection');
const Request = require('./models/Request')
const Service = require('./models/Service')
const User = require('./models/User')
const moment = require("moment")
const serviceController = require("./controllers/serviceController")
const { createServer } = require("http");
const { Server } = require("socket.io");

app.use('/webhook', express.raw({ type: "*/*" }));
app.use(express.json());
app.use(bodypassword.urlencoded({ extended: false }))
// To send forms and shit

// socket implementation
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

const testHandler = require("./sockets/test")
const bookingHandler = require("./sockets/booking")
const messagingHandler = require("./sockets/messaging")

const onConnection = (socket) => {
	socket.onAny((eventName, ...args) => {
		console.log(eventName, "was just fired", args)
	});
	socket.userid = socket.handshake.auth.id
	socket.join(`User ${socket.userid}`)
	console.log(`User ${socket.handshake.auth.id} has connected with socket id of ${socket.id}`)
	// io.of("/").adapter.on("join-room", (room, id) => {
	// 	console.log(`socket ${id} has joined room ${room}`);
	// 	console.log(socket.rooms)
	// });
	bookingHandler(io, socket)
	messagingHandler(io, socket)
	testHandler(io, socket)
	console.log(socket.rooms)

	socket.on('disconnecting', (reason) => {
		socket.rooms.forEach(room => {
			console.log(room)
			io.to(room).emit('livechat:disconnect', room)
		});
	})
}

io.on("connection", onConnection);
app.set('io', io)


// Library to use MySQL to store session objects 
const MySQLStore = require('express-mysql-session');

var options = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PWD,
	database: process.env.DB_NAME,
	clearExpired: true, // The maximum age of a valid session; milliseconds: 
	expiration: 3600000, // 1 hour = 60x60x1000 milliseconds
	// How frequently expired sessions will be cleared; milliseconds: 
	checkExpirationInterval: 1800000 // 30 min 
}

// To sstore: new MySQLStore(options),tore session information. By default it is stored as a cookie on browser
app.use(session({
	key: 'vidjot_session',
	secret: 'tojdiv',
	store: new MySQLStore(options),
	resave: false,
	saveUninitialized: false,
}));

//database
DBConnection.setUpDB(false)

// Passport Config 

const passport = require('passport');
const passportConfig = require('./config/passport');
passportConfig(passport)
app.use(passport.session())


// Google Authentication
GoogleAuth()


// Initilize Passport middleware 


//Message Library
const flash = require('connect-flash');
app.use(flash());
const flashMessenger = require('flash-messenger');
const Tailor = require("./models/Tailor");
app.use(flashMessenger.middleware);




// Place to define global variables
app.use(async function (req, res, next) {
	res.locals.messages = req.flash('message');
	res.locals.errors = req.flash('error');
	res.locals.user = req.user;
	res.locals.authenticated = req.isAuthenticated();
	res.locals.today = moment().format('YYYY-MM-DD')
	res.locals.time = moment().format('HH:mm:ss')
	next();
});



app.engine(
	"handlebars",
	engine({
		handlebars: allowInsecurePrototypeAccess(Handlebars),
		defaultLayout: "main",
		helpers:
		{
			equals(arg1, arg2, options) {
				return arg1 == arg2 ? options.fn(this) : options.inverse(this);
			},
			identifystring(s1, s2) {
				return s1 == s2;
			},

			setVar(name, value, options) {
				options.data.root[name] = value;
			},

			gt(a, b) {
				var next = arguments[arguments.length - 1];
				return (a > b) ? next.fn(this) : next.inverse(this);
			},

			ge(a, b) {
				var next = arguments[arguments.length - 1];
				return (a >= b) ? next.fn(this) : next.inverse(this);
			},

			ne(a, b) {
				var next = arguments[arguments.length - 1];
				return (a !== b) ? next.fn(this) : next.inverse(this);
			},

			async options() {
				return res.json({
					total: await Request.count(),
					rows: await Request.findAll({
						where: {
							[Op.or]: [
								{ userId: req.user.id },
								{ tailorID: req.user.id }
							]

						},
						include: ['service', "user"],
					})
				})
			},
			identifygender(v1, v2) {
				if (String(v1) == v2) {
					return true;

				}
				return false;
			},
			phonenumbercheck(number) {
				if (number) {
					return true;
				}
				return false;
			},
			isbanTrue(boo) {
				if (boo == "T") {
					return true;
				}
				return false;
			},
			radioCheck(value, radioValue) {
				return (value == radioValue) ? 'checked' : '';
			},
			backupcodechecker(n) {
				if (n == "not used") {
					return true;
				}
				return false;
			},
			tempuserchecker(i, n) {
				console.log(i, n)
				if (String(i) == String(n)) {
					return true;
				}
				return false;
			}

		},
	})
);

app.set('view engine', 'handlebars');

//Sets up engine and the default layout for handlebars

app.use(express.static(path.join(__dirname, 'public')));


// Creates static folder for publicly accessible HTML, CSS and Javascript files

app.all("/*", (req, res, next) => {
	req.app.locals.layout = 'main';
	next()
});

// app.all('/*', serviceController.checkAppointment)

//Set layout for all routes

app.use("/", main)
app.use("/", user)
app.use("/admin", admin)
app.use("/services", services)
app.use("/seller", seller)
app.use("/datapipeline", datapipeline)
app.use("/api", api)

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// catch 404 and forward to error handler
	app.use(function (req, res, next) {
		var err = new Error('Not Found');
		err.status = 404;
		next(err);
	});

	// error handler
	app.use(function (err, req, res, next) {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};

		// render the error page
		res.status(err.status || 500);
		res.render('error404');
	});

	
})
const port = 5000;
// Starts the server and listen to port
httpServer.listen(port, () => {
	console.log(`Server started on port ${port}`);
})