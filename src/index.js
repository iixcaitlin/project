//https://www.passportjs.org/concepts/authentication/sessions/
require("dotenv").config({path: require("find-config")(".env")})
const express = require("express")
const app = express()
const mongoose = require("mongoose")
const myHash = require("./util.js")
// const cookieParser = require("cookie-parser")
// const mySecret = process.env.mongoPassword
const sessionSecret = process.env.session_secret
const session = require("express-session")
const MongoStore = require("connect-mongo")
const cors = require("cors")
const passport = require("./config/passportConfig.js").passport
const {marked} = require("marked");
const createDOMPurify = require("dompurify")
const { JSDOM } = require("jsdom")
const apiKey = process.env.openAI_key

const OpenAI = require("openai")
const openai = new OpenAI({apiKey: apiKey});
// console.log(openai)
async function main(text){
	var prompt = `
	Below is a journal entry I wrote today as a part of my daily journaling routine. I want you to act as a therapist reviewing 
	my journal and help me identify which parts of what I write I can provide more clarity on. Highlighted sections should be 
	direct quotes from my journal, they should not be paraphrased or shortened. Output the highlighted sections and your response 
	to them in the following JSON format. (if not enough information is provided, output an empty JSON object):

	{ 
	what I wrote: response 1
	}
	`
	 
	prompt = prompt + text
	const chatCompletion = await openai.chat.completions.create({
		messages: [{role: "user", content: prompt}],
		model: "gpt-4-turbo",
		max_tokens: 1000
	})
	return chatCompletion.choices[0].message.content
}

const User = require("./models/db.js").User
const Entry = require("./models/db.js").Entry
const Login = require("./models/db.js").Login

//------ middleware -------
app.set("view engine", "ejs")
app.use(express.static("../public"))

app.use(express.urlencoded({extended:false}))
app.use(cors({
	origin: "http://127.0.0.1:8080",
	credentials: true,
}))
// app.use(cookieParser())
app.use(express.json()) // only works for unpacking JSON!

// DONT ERASE- MAGIC CODE
app.set("trust proxy", 1)

app.use(session({
	secret: sessionSecret,
	resave: false,
	saveUninitialized: true,
	// set to true in production
	cookie: {
		secure: false, 
		// httpOnly: false,
		// domain: "http://localhost:8080",	
		maxAge: 1000 * 60 * 60 * 24, 
		// sameSite: 'none'
	},
	store: MongoStore.create({
		mongoUrl: process.env.dbURL,
		dbName: 'project'
	})
}))



app.use(passport.initialize())
app.use(passport.session())


function isAuth (req,res,next){
	if (req.isAuthenticated()) {
		next()
	}else{
		res.status(401).send("Your not allowed here")
	}
}
//-----------routes-------------

//Session is just data the server store (SERVER ONLY!)
//about certain 'conversation' with a particular client
var session_data = {
	"dfsi432": {
		"views": 0
	}
}


app.get("/home", isAuth,  async (req,res)=>{
	var allJournalEntry = await Entry.find({username: req.user.username})
	for (let i=0; i < allJournalEntry.length; i++ ){
		allJournalEntry[i].text = marked.parse(allJournalEntry[i].text)
	}
	res.render("mainPage", {
		data: allJournalEntry
	})
	
})

app.get("/", async (req,res)=>{
	// look upp the session ID from the req req.sessionID

	
	if (req.session.views){
		req.session.views += 1
	} else {
		req.session.views = 1
	}
	
	req.session.save()
	console.log(req.session)
	const id = req.sessionID
	// use the Id to look up the session data from mongo collection
	// then increment the view count if it exist set to 1 if not
	res.render("landing", {session_data: JSON.stringify(req.session)})
})

//personal middlewares

// creating new journal
app.get("/createJournal",isAuth, (req,res)=>{
	res.render("createJournalPage")
})

app.post("/createJournal", async (req, res) => {
	console.log("sending data...", req.body.data)
	var response = await main(req.body.data)
	console.log(response)
	res.send(response)
})

app.post("/submitJournal", async (req, res) =>{
	console.log("Submit:",req.body.entry)
	var title = (!req.body.title)? new Date().toDateString() : req.body.title

	// read about this later (sanitize)
	const window = new JSDOM("").window
	const DOMPurify = createDOMPurify(window)
	const clean = DOMPurify.sanitize(req.body.entry)

	console.log("clean:", clean)
	const new_entry = new Entry ({
		username: req.user.username,
		title: title,
		text: clean,
	});
	console.log("sending to DB:", new_entry)
	await new_entry.save()
	res.redirect("/home") //redirect user
}) 


// creating new account
app.get("/signup", (req, res) => {
	res.render("signup")
})

app.post("/createUser", async (req, res) => {
	// hashing the password
	let password, salt
	[ password, salt ] = myHash(req.body.password, salting = true)
	console.log("new password:", password,salt)
	
	const new_user = new User ({
		email: req.body.email,
		username: req.body.username,
		password: password,
		salt: salt
	});
	
	console.log("sending to DB: ", new_user)
	await new_user.save()
	res.redirect("/login")
})


// logging in to account
app.get("/login", async (req, res) => {

	console.log(req.session)
	res.render("login")
})

app.post("/login", passport.authenticate("local", {
	failureRedirect: "/login", 
	successRedirect: "/home"}
))

app.get("/logout", async(req, res) => {

	console.log('pre logout')
	req.logout(function(err) {
			if (err) { return next(err); }
			console.log("in logout")
			res.redirect('/');
		});

	console.log("post logout")	
	
})

app.get("/journal/:id", (req, res) => {
	var id = req.params.id
	Entry.findById(id)
		.then((docs) => {
			console.log(docs)
			res.render("viewEntry", {entry: docs, id: req.params.id})
		})
		.catch((err) => {
			console.log(err)
			res.redirect("/home")
		})
})

app.post("/journal/:id", async (req, res) => {
	// console.log(req.body.data)
	var response = await main(req.body.data)
	console.log(response)
	res.send(response)
})

app.get("/edit/:id", (req, res) => {
	var id = req.params.id
	Entry.findById(id)
		.then((docs) => {
			console.log(docs)
			res.render("editEntry", {entry: docs, id: id})
		})
		.catch((err) => {
			console.log(err)
			res.redirect("/home")
		})
})

app.put("/edit/:id", (req, res) => {
	var id = req.params.id
	Entry.findById(id)
	.then(async (docs) => {
		docs.title = req.body.title
		docs.text = req.body.text
		await docs.save()
		console.log(docs)
		res.redirect(`/journal/${id}`)
	})
})

//start the server
app.listen(8080, () => {
	console.log("server start")
})