const flashMessage = require('../views/helpers/messenger');
const User = require("../models/User")


const loginRedirect = async (req, res) => {
  var role = req.user.role;
  let redirectTo = req.session.redirectTo;
  delete req.session.redirectTo;
  if (role == "C") {
    console.log(req.user.id, 'wuehfoihfoiehfoisihfioes')
    userr1 = await User.findOne({ where: { id: req.user.id } })
    console.log(userr1.isban, 'wuehfoihfoiehfoisihfioes')
    if (userr1.isban == "T") {
      req.logout()
      flashMessage(res, 'error', 'You have been banned! Please contact your local administrator');
      return res.redirect('/login')
    }
    flashMessage(res, 'success', "Success You are logged in as: " + req.user.name);
    res.redirect(redirectTo || '/profile');
  } else if (role == "A" || "T") {
    flashMessage(res, 'success', "Success You are logged in as Administrator: " + req.user.name);
    res.redirect(redirectTo || "/admin")
  } else if (role == "S") {
    userr1 = await User.findOne({ where: { id: req.user.id } })
    if (userr1.isban == "T") {
      req.logout()
      flashMessage(res, 'error', 'You have been banned! Please contact your local administrator');
      return res.redirect('/login')
    }
    flashMessage(res, 'success', "Success You are logged in as Seller: " + req.user.name);
    res.redirect(redirectTo || "/seller")
  }

  else {
    res.redirect("/login")
  }
}

module.exports = {
  loginRedirect,
}