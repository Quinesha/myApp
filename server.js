const express = require("express")
const app = express()
const { engine } = require("express-handlebars")

app.engine("handlebars", engine({ defaultLayout: "main" }))
app.set("view engine", "handlebars")
app.set("views", "views")

app.use(express.static("public"))

app.use(express.urlencoded({ extended: true }))

// Define your API endpoints
app.get("/api/users", (req, res) => {
	// Handle GET request to /api/users endpoint
	res.json({ message: "GET /api/users" })
})
  
app.post("/api/users", (req, res) => {
	// Handle POST request to /api/users endpoint
	res.json({ message: "POST /api/users" })
})

app.listen(8080, () => {
	console.log("server is at port 8080", 8080)
})

//routing
app.get("/", (req, res) => {
	res.render("index")
	//homepage
})

app.get("/guest", (req, res) => {
	res.render("login", { message: "" })
	//loginpage versie 2
})

app.get("/quiz", (req, res) => {
	res.render("quiz")
	//first quiz page
})

app.get("/quizQuestion2", (req, res) => {
	res.render("quizQuestion2")
	//second quiz page
})

app.get("/quizQuestion3", (req, res) => {
	res.render("quizQuestion3")
	//third quiz page
})

app.get("/quizQuestion4", (req, res) => {
	res.render("quizQuestion4")
	//fourth quiz page
})

app.get("/quizQuestion5", (req, res) => {
	res.render("quizQuestion5")
	//fifth quiz page
})

app.get("/results", (req, res) => {
	res.render("results")
	//fifth quiz page
})

app.post("/login", (req, res) => {
	// const { username, password } = req.body
	// check if everything is correct
	if (req.body.username === "Quinesha" && req.body.password === "meep") {
		res.render("login")
	} else {
		res.render("index", { error: "Invalid username or password" })
		//display error message
	}
})

const mongoose = require("mongoose")

//connect to mongoose using an mongodb connection string
mongoose.connect("mongodb+srv://Quinesha:mewmew@cluster0.dxzuovb.mongodb.net/?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log("Connected to the database")
	})
	.catch((error) => {
		console.error("Error connecting to the database:", error)
	})

const User = require("./user")

const newUser = new User({
	name: "Quinesha van Burgh",
	email: "quinesha@hotmail.com",
	age: 23
})
   
//create new user
newUser.save()
	.then(() => {
		console.log("User created successfully")
	})
	.catch((error) => {
		console.error("Error creating user:", error)
	})



//404 page
app.use((req, res) => {
	res.status(404).render("404", { imagePath: "/images/404.png" })
})