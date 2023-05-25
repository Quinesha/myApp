const express = require("express")
const app = express()
const { engine } = require("express-handlebars")
const session = require("express-session")
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")

require("dotenv").config()


// The User schema defined
const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	age: Number,
	username: String,
	password: String,
})

// Create the User model
const User = mongoose.model("User", userSchema)

app.engine("handlebars", engine({ defaultLayout: "main" }))
app.set("view engine", "handlebars")
app.set("views", "views")

// Configure session
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	})
)

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }))

// Connect to MongoDB using a MongoDB connection string
mongoose
	.connect(process.env.DB_CONNECTION_STRING, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log("Connected to the database")

		// Routing
		app.get("/", (req, res) => {
			const errorMessage = req.session.error
			req.session.error = "" // Clear the error message from the session
			const username = req.session.loggedIn ? req.session.username : "" // Get the username from the session
			res.render("index", { error: errorMessage, username: username })
		})

		app.get("/guest", (req, res) => {
			res.render("login", { error: "" })
		})

		app.get("/quiz", (req, res) => {
			res.render("quiz")
		})

		app.get("/quizQuestion2", (req, res) => {
			res.render("quizQuestion2")
		})

		app.get("/quizQuestion3", (req, res) => {
			res.render("quizQuestion3")
		})

		app.get("/quizQuestion4", (req, res) => {
			res.render("quizQuestion4")
		})

		app.get("/quizQuestion5", (req, res) => {
			res.render("quizQuestion5")
		})

		app.get("/results", (req, res) => {
			res.render("results")
		})

		app.get("/shows", (req, res) => {
			res.render("shows")
		})

		app.get("/savedShows", (req, res) => {
			// Check if the user is logged in
			if (req.session.loggedIn) {
				// Render the savedShows view
				const username = req.session.username
				res.render("savedShows", { username: username })
			} else {
				// User is not logged in, redirect to the login page
				res.redirect("/login")
			}
		})

		app.get("/login", (req, res) => {
			const errorMessage = req.session.error
			req.session.error = "" // Clear the error message from the session
			const username = req.session.loggedIn ? req.session.username : "" // Get the username from the session
			res.render("login", { error: errorMessage, username: username })
		})

		app.get("/signUp", (req, res) => {
			// Check if the user is already logged in
			if (req.session.loggedIn) {
				res.redirect("/savedShows")
			} else {
				res.render("signUp")
			}
		})

		// Signup as a new user
		app.post("/signup", (req, res) => {
			const { username, password, confirmPassword, name, email, age } = req.body
		
			// Check if username is filled in
			if (!username) {
				req.session.error = "Username is required"
				res.redirect("/signup") // Redirect to the signup page
				return
			}
		
			// Check if password and confirm password match
			if (password !== confirmPassword) {
				req.session.error = "Passwords do not match"
				res.render("signUp", { error: req.session.error }) // Render the signup page with the error message
				return
			}
		
			// Hash the password
			bcrypt.hash(password, 10, (err, hashedPassword) => {
				if (err) {
					console.error("Error hashing password:", err)
					req.session.error = "Failed to create user"
					res.redirect("/signup") // Redirect to the signup page
					return
				}
		
				// Create a new user object with the filled-in information
				const newUser = new User({
					name: name,
					email: email,
					age: age,
					username: username,
					password: hashedPassword,
				})
		
				// Save the new user to the database
				newUser
					.save()
					.then(() => {
						req.session.loggedIn = true
						req.session.username = username
						req.session.save(() => {
							res.redirect("/savedShows")
						})
					})
					.catch((error) => {
						console.error("Error creating user:", error)
						if (error.code === 11000) {
							// Duplicate key error
							req.session.error = "Email already in use"
						} else {
							req.session.error = "Failed to create user"
						}
						res.render("signUp", { error: req.session.error }) // Render the signup page with the error message
					})
			})
		})
		

		app.post("/login", (req, res) => {
			const { username, password } = req.body

			// Find the user in the database with the provided username
			User.findOne({ username: username })
				.then((user) => {
					if (user) {
						// if user found compare the provided password with the hashed password
						bcrypt.compare(password, user.password, (error, result) => {
							if (result) {
								// Password matches, set loggedIn session variable to true
								req.session.loggedIn = true
								req.session.username = username
								req.session.save(() => {
									res.redirect("/savedShows")
								})
							} else {
								// Password does not match
								req.session.error = "Invalid password"
								res.redirect("/")
							}
						})
					} else {
						// User not found
						req.session.error = "User not found"
						res.redirect("/")
					}
				})
				.catch((error) => {
					console.error("Error finding user:", error)
					req.session.error = "Failed to login"
					res.redirect("/")
				})
		})

		app.post("/logout", (req, res) => {
			req.session.destroy()
			res.redirect("/")
		})

		app.use((req, res) => {
			res.status(404).render("404", { imagePath: "/images/404.png" })
		})

		app.listen(8080, () => {
			console.log("Server is running on port 8080")
		})
	})
	.catch((error) => {
		console.error("Error connecting to the database:", error)
	})

	
