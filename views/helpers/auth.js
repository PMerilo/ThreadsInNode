const flashMessage = require("./messenger");
const User = require("../../models/User")

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.session.redirectTo = req.originalUrl
    flashMessage(res, 'error', 'You Need to Login to Access this Page!');
    res.redirect("/login");
  };


module.exports = ensureAuthenticated;
  