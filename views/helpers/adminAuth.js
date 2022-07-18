const flashMessage = require("./messenger");

const ensureAdminAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        if(req.user.role == "A" || req.user.role == "T"){
            return next();
        }else{
            flashMessage(res, 'error', 'You are unauthorized to view this page.');
            res.redirect("/");
        }
      
    } else {
        flashMessage(res, 'error', 'You Need to Login to Access this Page!');
        res.redirect("/login");
    }
  };


module.exports = ensureAdminAuthenticated;
  