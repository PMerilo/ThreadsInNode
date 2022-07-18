const flashMessage = require('../views/helpers/messenger');


const loginRedirect = (req, res) => {
    var role = req.user.role;
    let redirectTo = req.session.redirectTo;
    delete req.session.redirectTo;
    if(role=="C"){
      flashMessage(res, 'success', "Success You are logged in as: "+ req.user.name);
      res.redirect(redirectTo || '/profile');
    } else if(role == "A" || role == "T"){
      flashMessage(res, 'success', "Success You are logged in as Administrator: "+ req.user.name);
      res.redirect(redirectTo || "/admin")
    }else if(role=="S"){
      flashMessage(res, 'success', "Success You are logged in as Seller: "+ req.user.name);
      res.redirect(redirectTo || "/seller")
    }

    else{
      res.redirect("/login")
    }
}

module.exports = {
    loginRedirect,
}