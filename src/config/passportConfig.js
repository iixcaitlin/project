const mongoose = require("mongoose")
const User = require("../models/db.js").User
const myHash = require("../util.js")

const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy



passport.serializeUser(function(user,done){
	return done(null, user.id);
});


//how to set for deserializeUser
passport.deserializeUser(function(id, done) {
	User.findById(id).then( (user)=>{
		done(null, user)
	} )
});


function verifyUser(email, password, done){
	console.log("---calling verifyuser---")
	console.log(email,password)
	User.findOne({ email: email })
		.then((doc)=>{
			if (doc.password === myHash(password + doc.salt)[0]){
				console.log("login successful")
				return done(null, doc)
			} else {
				return done(null, false)
			}
		})
		.catch((err)=>{
			return done(err)
		});

}

//remeber to rewrite form 'username' fieldname to "email"
const strategy = new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password'
},verifyUser)


passport.use(strategy)

module.exports = {
    passport: passport
}