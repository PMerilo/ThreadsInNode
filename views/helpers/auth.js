const flashMessage = require("./messenger");
const User = require("../../models/User")

const ensureAuthenticated = (req, res, next) => {
    // userr1 = User.findOne({ where: { id: req.user.id } })
    // if (userr1.isban == "T"){
    //     req.logout()
    //     flashMessage(res, 'error', 'You have been banned! Please contact your local administrator');
    //     return res.redirect('/login')
    // }
    if (req.isAuthenticated()) {
      return next();
    }
    req.session.redirectTo = req.originalUrl
    flashMessage(res, 'error', 'You Need to Login to Access this Page!');
    res.redirect("/login");
  };


module.exports = ensureAuthenticated;
  