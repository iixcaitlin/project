require("dotenv").config({path: require("find-config")(".env")})
mongoose = require("mongoose")

//--------Mongo Schema & Model ----------
const entrySchema = new mongoose.Schema({
	date:{ type: Date, default: Date.now()},
	title: String,
	text: String
})

const loginSchema = new mongoose.Schema({
	email: String,
	password: String
})

const userSchema = new mongoose.Schema({
	email: String,
	username: String,
	password: String,
	salt: String
})


const Entry = new mongoose.model("entry", entrySchema, "entry") //creating schema model
const User = new mongoose.model("user", userSchema, "user")
const Login = new mongoose.model("login", loginSchema, "login")


//connects to mongo
async function DBconnect(){
	mongoose.connect(process.env.dbURL, {dbName: "project"}).then(
		()=>{
			console.log("connected to DB")
		}
	)
}
DBconnect()



// function isAdmin(req,res,next){
// 	User.findById(req.session.passport.user).then((user)=>{
// 		if (user.title === "Admin"){
// 			next()
// 		}else;
// 	})
// }

module.exports = {
    Entry: Entry,
    User, User,
    Login, Login,
}