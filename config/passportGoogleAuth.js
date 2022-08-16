const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User")
const passport = require("passport")

async function InitaliseGoogleLogin() {
    passport.use(
      new GoogleStrategy(
        {
          clientID:
            "942963403664-omj6a3j7r754dkg0fgjttdhemoeruaek.apps.googleusercontent.com",
          clientSecret: "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",
          callbackURL: "http://localhost:5000/login-google/callback",
          
        },
        async (accessToken, refreshToken, profile, done) => {
        
         const [user, created] = await User.findOrCreate({
            where: { email: profile.emails[0].value },
            defaults: {
              name: profile.displayName,
              password: null,
              email: profile.emails[0].value,
              
            },
          });
  
            if (created){
            return done(null, user, {message: "You created your account! Welcome"})
          }
          else {
            // if(user.disabled) {
            //   return done(null, false, {message: "Your account has been disabled!"})
            // }
            return done(null, user, {message: "Welcome!"})
          }
        }
      )
    );
  
    passport.serializeUser((user, done) => {
      return done(null, user);
    });
  
    passport.deserializeUser((user, done) => {
      return done(null, user);
    });
  }
    
  module.exports = InitaliseGoogleLogin