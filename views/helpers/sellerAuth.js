const flashMessage = require("./messenger");

const ensureSellerAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        if(req.user.role == "S"){
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


module.exports = ensureSellerAuthenticated;
  