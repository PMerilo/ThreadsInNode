const flashMessage = require("./messenger");

const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    flashMessage(res, 'error', 'You Need to Login to Access this Page!');
    res.redirect("/login");
  };


module.exports = ensureAuthenticated;
  