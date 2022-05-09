var FlashMessenger = require('./FlashMessenger');
var Alert = require('./Alert');

var middleware = function (req,res,next) {
	delete req.session.flashMessenger;
	var fm = new FlashMessenger(req.session);
	res.flashMessenger = fm;
	res.locals.flashMessenger = fm;
	//fm.flushStorage();
	next();
};
module.exports = {};
module.exports.middleware = middleware;
module.exports.Alert = Alert;