const flashMessage = require("./messenger");

const ensureAdminAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        if(req.user.role == "A"){
            return next();
        }else{
            flashMessage(res, 'error', 'You are unauthorized to view this page.');
            res.redirect("/");
        }
      
    }
    flashMessage(res, 'error', 'You Need to Login to Access this Page!');
    res.redirect("/login");
  };


module.exports = ensureAdminAuthenticated;
  