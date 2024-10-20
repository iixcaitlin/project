//https://www.passportjs.org/concepts/authentication/sessions/
require("dotenv").config({ path: require("find-config")(".env") })
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
const { marked } = require("marked");
const createDOMPurify = require("dompurify")
const { JSDOM } = require("jsdom")
const emotionData = require("./emotionData.js").data

const User = require("./models/db.js").User
const Entry = require("./models/db.js").Entry
const Login = require("./models/db.js").Login

const { NlpManager } = require('node-nlp');
const manager = new NlpManager({ languages: ['en'] });

async function loadEmotions() {
	await manager.load("model.nlp")
}
loadEmotions()
const apiKey = process.env.openAI_key

const OpenAI = require("openai")
const openai = new OpenAI({ apiKey: apiKey });

async function getPrompt(username, name) {
	let chatPrompt = `
	Act as a psychologist in a therapy session. Remember to act exactly as a therapist, with questioning, analyzing the person 
	through what they say, and giving tips to the person to overcome their issues. You shall use the knowledge a person with 
	several years of learning about psychology should have, such as several years of college. Do not tell the user to keep in 
	mind that you are not a substitute to therapy, because the user already is aware of that, and saying otherwise makes the 
	user feel bad and even annoyed that they aren't using actual help. Make sure your output is just your response. it should not 
	be a JSON object. The patient's name is ${name} and attatched below are their journal entries to help you gain insight to 
	what might have contributed to the things they talk about. Help ${name} talk things through and reference things in their 
	journal when necessary. Do not immediately give an analysis of their journal, as they might feel overwhelmed or they might
	want to talk about other things. They should lead the conversation, and you should be guiding them and help them talk about
	their feelings.`
	if (username != "") {
		await Entry.find({username: username}).then((doc) => {
			for (let i = 0; i < doc.length; i ++) {
				chatPrompt = chatPrompt + "\n" + doc[i].text
			}
		})
	}
	return chatPrompt
}

async function activities(username) {
	console.log("running activities function...")
	var prompt = `
	Below are the user's journal entries. Provide 5 - 10 suggestions on things they can do to increase their happiness.
	Try to suggest things that you think they might enjoy. Suggestions could range from short and simple (giving a hug) to something 
	that requires more time (going on a bike ride). If not enough information is provided, suggest things that would generally 
	improve happiness. Only suggest the activity, no additional information is needed. Output the suggestions into a javascript list.
	DO NOT write the word javascript in the output.
	`

	if (username != "") {
		await Entry.find({username: username})
		.then((doc) => {
			console.log(doc)
			prompt = prompt + doc
		})
	}
	const chatCompletion = await openai.chat.completions.create({
		messages: [{role: "user", content: prompt}],
		model: "gpt-4-turbo",
		max_tokens: 1000
	})
	let list = JSON.parse(chatCompletion.choices[0].message.content)

	let activities = {}
	for (let i = 0; i < list.length; i++) {
		activities[i] = list[i]
	}
	return activities
}

// console.log(openai)
async function main(text) {
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
		messages: [{ role: "user", content: prompt }],
		model: "gpt-4-turbo",
		max_tokens: 1000
	})
	return chatCompletion.choices[0].message.content
}

async function chat(log) {
	console.log(log)
	const chatCompletion = await openai.chat.completions.create({
		messages: log,
		model: "gpt-4-turbo",
		max_tokens: 1000
	})
	return chatCompletion.choices[0].message.content
}

const { SentimentAnalyzer } = require("node-nlp");
const sentiment = new SentimentAnalyzer({ language: "en" })

async function getSentiment(text) {
	// console.log("getSentiment running...")
	// var sentimentAnalysis = ""
	// await sentiment.getSentiment(text)
	// 	.then(result => {
	// 		sentimentAnalysis = result
	// 	})
	const response = await manager.process("en", text)
	return response
}


//------ middleware -------
app.set("view engine", "ejs")
app.use(express.static("../public"))

app.use(express.urlencoded({ extended: false }))
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


function isAuth(req, res, next) {
	if (req.isAuthenticated()) {
		next()
	} else {
		res.redirect("/")
	}
}

function notAuth (req, res, next) {
	if (req.isAuthenticated()) {
		res.redirect("/home")
	} else {
		next()
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


app.get("/home", isAuth, async (req, res) => {
	var allJournalEntry = await Entry.find({ username: req.user.username })
	for (let i = 0; i < allJournalEntry.length; i++) {
		allJournalEntry[i].text = marked.parse(allJournalEntry[i].text)
	}
	res.render("mainPage", {
		name: req.user.name,
		loggedIn: (req.user ? true : false),
		data: allJournalEntry
	})

})

app.get("/profile", isAuth, async (req, res) => {
	await Entry.find({username: req.user.username})
	.then(async (doc) => {
		let emotionNames = []
		let emotionScores = []
		let sentimentScores = {}
		let totalEmotions = {}
		for (let i = 0; i < doc.length; i++) {
			let curDate = doc[i].date
			let date = curDate.getMonth() + "/" + curDate.getDate() + "/" + curDate.getFullYear()
			sentimentScores[date] = doc[i].sentimentScore
			for (let emotion in doc[i].emotions) {
				if (emotionNames.includes(emotion)){
					emotionScores[emotionNames.indexOf(emotion)] += doc[i].emotions[emotion]
				} else {
					emotionNames.push(emotion)
					emotionScores.push(doc[i].emotions[emotion])
				}
			}
		}
		for (let i = 0; i < emotionNames.length; i++) {
			totalEmotions[emotionNames[i]] = emotionScores[i]
		}

		console.log(totalEmotions)
		console.log(sentimentScores)
		let activitySuggestions = await activities(req.user.username)

		res.render("profile", {
			loggedIn: (req.user ? true : false),
			emotions: JSON.stringify(totalEmotions),
			sentiments: JSON.stringify(sentimentScores),
			activities: JSON.stringify(activitySuggestions),
			name: req.user.name
		})
	})
	.catch((err) => {
		console.log(err)
		res.redirect("/home")
	})
})

app.get("/", async (req, res) => {
	// look upp the session ID from the req req.sessionID	
	if (req.session.views) {
		req.session.views += 1
	} else {
		req.session.views = 1
	}

	req.session.save()
	console.log(req.session)
	const id = req.sessionID
	// use the Id to look up the session data from mongo collection
	// then increment the view count if it exist set to 1 if not

	// const emotions = emotionData.split(/\r\n|\n/)
	// for (let i = 0; i < emotions.length; i++){
	// 	let curAnalysis = emotions[i].split(",")
	// 	let curEmotion = curAnalysis[1]
	// 	if (curEmotion == 0){
	// 		curEmotion = "emotion.sad"
	// 	} else if (curEmotion == 1) {
	// 		curEmotion = "emotion.happy"
	// 	} else if (curEmotion == 2) {
	// 		curEmotion = "emotion.love"
	// 	} else if (curEmotion == 3) {
	// 		curEmotion = "emotion.angry"
	// 	} else {
	// 		curEmotion = "emotion.fear"
	// 	}
	// 	manager.addDocument("en", curAnalysis[0], curEmotion)
	// }
	// await manager.train()
	// manager.save()
	let loggedIn = (req.user ? true : false)
	console.log(loggedIn)

	res.render("landing", { session_data: JSON.stringify(req.session), loggedIn: loggedIn })
})


// creating new journal
app.get("/createJournal", isAuth, (req, res) => {
	res.render("createJournalPage", {
		loggedIn: (req.user ? true : false)
	})
})

app.post("/createJournal", async (req, res) => {
	console.log("sending data...", req.body.data)
	var response = await main(req.body.data)
	console.log(response)
	res.send(response)
})

app.post("/submitJournal", async (req, res) => {
	console.log("Submit:", req.body)
	var title = (!req.body.title) ? new Date().toDateString() : req.body.title

	// read about this later (sanitize)
	const window = new JSDOM("").window
	const DOMPurify = createDOMPurify(window)
	const clean = DOMPurify.sanitize(req.body.entry)

	console.log("clean:", clean)
	const new_entry = new Entry({
		username: req.user.username,
		title: title,
		text: clean,
	});
	console.log("sending to DB:", new_entry)
	await new_entry.save()
	res.redirect("/home") //redirect user
})

app.get("/deleteEntry/:id", async (req, res) => {
	await Entry.findByIdAndDelete(req.params.id)
	.then((result) => {
		res.redirect("/home")
	})
})


// creating new account
app.get("/signup", notAuth, (req, res) => {
	res.render("signup")
})

app.post("/createUser", async (req, res) => {
	// hashing the password
	let password, salt
	[password, salt] = myHash(req.body.password, salting = true)
	console.log("new password:", password, salt)

	const new_user = new User({
		email: req.body.email,
		username: req.body.username,
		name: req.body.name,
		password: password,
		salt: salt
	});

	console.log("sending to DB: ", new_user)
	await new_user.save()
	res.redirect("/login")
})


// logging in to account
app.get("/login", notAuth, async (req, res) => {

	console.log(req.session)
	res.render("login")
})

app.post("/login", passport.authenticate("local", {
	failureRedirect: "/login",
	successRedirect: "/home"
}
))

app.get("/logout", async (req, res) => {
	req.logout(function (err) {
		if (err) { return next(err); }
		res.redirect('/');
	});
})

app.post("/chat", async (req, res) => {
	let username, name;
	try {
		username = req.user.username
	} catch {
		username = ""
	}
	try {
		name = req.user.name
	} catch {
		name = ""
	}
	let chatLog = JSON.parse(req.body.log)
	let prompt = await getPrompt(username, name)
	console.log("prompt:", prompt)
	chatLog.unshift({role: "user", content: prompt})
	var response = await chat(chatLog)
	res.send({ response: response })
})

app.get("/journal/:id", isAuth, (req, res) => {
	var id = req.params.id
	Entry.findById(id)
		.then((docs) => {
			console.log(docs)
			res.render("viewEntry", {
				entry: docs,
				id: req.params.id,
				loggedIn: (req.user ? true : false)
			})
		})
		.catch((err) => {
			console.log(err)
			res.redirect("/home")
		})
})

function dataParse(data) {
    start = data.indexOf("{")
    end = data.indexOf("}")
    data = data.slice(start, end + 1)
    console.log("after parsing:",data)
    return data
}

app.post("/update", async(req, res) => {
	console.log("update route running")
	var text = req.body.data
	var response = await main(text)
	response = dataParse(response)
	console.log("SERVERSIDE: ", response)
	console.log(typeof response)
	res.json(response)
})

app.post("/journal/:id", async (req, res) => {
	var text = req.body.data
	var response = await main(text)
	let finalSentiment = {}
	var sentimentScore = 0

	if (text.length > 350) {
		let words = text.split(" ")
		let sections = []
		for (let i = 0; i < Math.ceil(words.length/20); i++) {
			sections.push(words.slice(i*20, (i*20) + 21))
		}
		let emotionList = []
		let emotionScores = []

		for (let i = 0; i < sections.length; i++) {
			let curSentiment = await getSentiment(sections[i].join(" "))
			sentimentScore += curSentiment.sentiment.score
			console.log(curSentiment.sentiment.score)
			curSentiment = curSentiment.classifications
			for (let j = 0; j < curSentiment.length; j++) {
				if (emotionList.includes(curSentiment[j].intent)){
					emotionScores[emotionList.indexOf(curSentiment[j].intent)] += curSentiment[j].score
				} else {
					emotionList.push(curSentiment[j].intent)
					emotionScores.push(curSentiment[j].score)
				}
			}
		}
		sentimentScore /= sections.length
		for (let i = 0; i < emotionList.length; i++) {
			finalSentiment[emotionList[i]] = emotionScores[i]
		}
	} else {
		var sentiment = await getSentiment(req.body.data)
		sentimentScore = sentiment.sentiment.score
	}

	await Entry.findById(req.params.id)
	.then((doc) => {
		if (doc.emotions) {
			// pass
		} else {
			doc.emotions = {}
		}
		if (response.length > 350) {
			doc.emotions = finalSentiment
		} else {
			let emotionList = sentiment.classifications
			console.log("emotion list:", emotionList)
			for (let i=0; i < emotionList.length; i++) {
				let curEmotion = emotionList[i].intent
				doc.emotions[curEmotion]? doc.emotions[curEmotion] += emotionList[i].score: doc.emotions[curEmotion] = emotionList[i].score
			}
		}
		console.log(sentimentScore)
		doc.sentimentScore = sentimentScore
		console.log(doc)
		doc.save()
	})
	entryData = [response, sentiment]
	res.send({
		GPTresponse: response,
		sentiment: sentiment
	})
})

app.get("/edit/:id", isAuth, (req, res) => {
	var id = req.params.id
	Entry.findById(id)
		.then((docs) => {
			console.log(docs)
			res.render("editEntry", {
				entry: docs,
				id: id,
				loggedIn: (req.user ? true : false)
			})
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