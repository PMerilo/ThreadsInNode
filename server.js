const express = require("express")
const { engine } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const app = express()
const path = require('path');
const session = require('express-session');
const main = require("./views/routes/main")
const user = require("./views/routes/user")
const admin = require("./views/routes/admin")
const bodypassword = require('body-parser')

app.use(bodypassword.json())
app.use(bodypassword.urlencoded({extended: false}))
// To send forms and shit

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
	resave: false,
	saveUninitialized: false,
}));

//database
const sequelizeDB = require("./config/DBConfig")
  

// Passport Config 

const passport = require('passport');
const passportConfig = require('./config/passport');
passportConfig(passport)
app.use(passport.session())

// Initilize Passport middleware 


//Message Library
const flash = require('connect-flash');
app.use(flash());
const flashMessenger = require('flash-messenger');
app.use(flashMessenger.middleware);

// Place to define global variables
app.use(function (req, res, next) {
	res.locals.messages = req.flash('message');
	res.locals.errors = req.flash('error');
	res.locals.user = req.user;
	res.locals.authenticated = req.isAuthenticated();
	next();
});

app.engine(
	"handlebars",
	engine({
	  handlebars: allowInsecurePrototypeAccess(Handlebars),
	  defaultLayout: "main",
	  helpers: {
		equals(arg1, arg2, options) {
		  return arg1 == arg2 ? options.fn(this) : options.inverse(this);
		},
  
	  },
	})
  );

app.set('view engine', 'handlebars');

//Sets up engine and the default layout for handlebars

app.use(express.static(path.join(__dirname, 'public')));

// Creates static folder for publicly accessible HTML, CSS and Javascript files

app.use("/", main)
app.use("/", user)
app.use("/admin",admin)


const port = 5000;



// Starts the server and listen to port
app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});