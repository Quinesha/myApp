const express = require("express")
const app = express()
const { engine } = require("express-handlebars")
const session = require("express-session")
const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")
const https = require("https")

app.use(express.static("public"))


require("dotenv").config()

// The User schema defined
const userSchema = new mongoose.Schema({
	name: String,
	email: String,
	age: Number,
	username: String,
	password: String,
	savedShows: [{ name: String, overview: String }],
})

// Create the User model
const User = mongoose.model("User", userSchema)

app.engine(
	"handlebars",
	engine({
		defaultLayout: "main",
		// Disable prototype access check
		runtimeOptions: {
			allowProtoPropertiesByDefault: true,
			allowProtoMethodsByDefault: true,
		},
	})
)

app.set("view engine", "handlebars")
app.set("views", "views")

// Configure session
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 15 * 60 * 1000, // Set the expiration time to 15 minutes in milliseconds
		},
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
			res.render("quiz", { error: "" })
		})

		app.post("/quiz", (req, res) => {
			// Process the quiz submission
			// For simplicity, let's assume all answers are correct
			const score = 5 // Total score
			res.render("results", { score: score })
		})

		const getRandomShowId = () => {
			// Retrieve a random show ID
			const showIds = [92685, 85349, 95599, 40075, 61923, 37606, 15260, 61175, 2190, 60625] //show IDs
			const randomIndex = Math.floor(Math.random() * showIds.length)
			return showIds[randomIndex]
		}

		app.get("/results", (req, res) => {
			// Retrieve the randomly selected showId
			const showId = getRandomShowId()

			// Construct the API endpoint URL using the showId
			const apiEndpoint = `https://api.themoviedb.org/3/tv/${showId}?api_key=${process.env.API_KEY}`

			// Send an HTTP request to the API endpoint
			https.get(apiEndpoint, (apiResponse) => {
				let data = ""

				apiResponse.on("data", (chunk) => {
					data += chunk
				})

				apiResponse.on("end", () => {
					try {
						const show = JSON.parse(data)
						const showName = show.name
						const showOverview = show.overview

						// Send the show data back as the response
						res.send({ show: show, showName: showName, showOverview: showOverview })
					} catch (error) {
						console.error("Error parsing API response:", error)
						res.status(500).render("error", { error: "Failed to parse API response" })
					}
				})
			}).on("error", (error) => {
				console.error("Error making API request:", error)
				res.status(500).render("error", { error: "Failed to fetch data from API" })
			})
		})

		app.get("/shows", (req, res) => {
			res.render("shows")
		})

		app.get("/savedShows", async (req, res) => {
			try {
				// Check if the user is logged in
				if (req.session.loggedIn) {
					// Find the current user based on the session username
					const foundUser = await User.findOne({ username: req.session.username })
	
					if (foundUser) {
						// Retrieve the saved shows for the user
						const savedShows = foundUser.savedShows
	
						// Render the savedShows view with the username and saved shows data
						res.render("savedShows", { username: req.session.username, savedShows: savedShows })
					} else {
						// User not found, redirect to the login page
						res.redirect("/login")
					}
				} else {
					// User is not logged in, redirect to the login page
					res.redirect("/login")
				}
			} catch (err) {
				console.log(err)
				res.render("savedShows", { username: req.session.username, savedShows: [] })
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

		app.post("/addShow", async (req, res) => {
			try {
				// Check if the user is logged in
				if (req.session.loggedIn) {
					// Find the current user based on the session username
					const foundUser = await User.findOne({ username: req.session.username })
		
					if (foundUser) {
						// Retrieve the show details from your API
						const showId = getRandomShowId() 
						const apiEndpoint = `https://api.themoviedb.org/3/tv/${showId}?api_key=${process.env.API_KEY}`
		
						// Make the API request to fetch the show data
						https.get(apiEndpoint, async (apiRes) => {
							let data = ""
		
							apiRes.on("data", (chunk) => {
								data += chunk
							})
		
							apiRes.on("end", async () => {
								const show = JSON.parse(data)
		
								// Check if the show is already saved
								const isShowSaved = foundUser.savedShows.some(
									(savedShow) => savedShow.name === show.name && savedShow.overview === show.overview
								)
		
								console.log("Received name:", show.name) // Log the received name
		
								if (isShowSaved) {
									// Show is already saved, redirect back to savedShows
									console.log("Show already saved:", show.name)
									res.redirect("/savedShows")
								} else {
									// Create a show object with the name and overview from the API response
									const showData = {
										name: show.name,
										overview: show.overview,
									}
		
									// Add the show to the user's savedShows array
									foundUser.savedShows.push(showData)
		
									// Save the user with the updated savedShows array
									await foundUser.save()
									console.log("Show saved:", show.name)
									res.redirect("/savedShows")
								}
							})
						})
					} else {
						// User not found, redirect to the login page
						console.log("User not found")
						res.redirect("/login")
					}
				} else {
					// User is not logged in, redirect to the signup page
					console.log("User not logged in")
					res.redirect("/signUp")
				}
			} catch (err) {
				console.log(err)
				res.redirect("/savedShows")
			}
		})
		

		app.post("/removeShow/:showId", async (req, res) => {
			try {
				// Check if the user is logged in
				if (req.session.loggedIn) {
					// Find the current user based on the session username
					const foundUser = await User.findOne({ username: req.session.username })
	
					if (foundUser) {
						const showId = req.params.showId // Get the show ID from the request params
	
						// Find the index of the show with the given ID in the savedShows array
						const showIndex = foundUser.savedShows.findIndex((savedShow) => savedShow._id == showId)
	
						if (showIndex !== -1) {
							// Remove the show from the user's savedShows array at the specified index
							foundUser.savedShows.splice(showIndex, 1)
	
							// Save the user with the updated savedShows array
							await foundUser.save()
							console.log("Show removed with ID:", showId)
						} else {
							console.log("Show not found with ID:", showId)
						}
					} else {
						// User not found, redirect to the login page
						console.log("User not found")
						res.redirect("/login")
						return
					}
				} else {
					// User is not logged in, redirect to the login page
					console.log("User not logged in")
					res.redirect("/login")
					return
				}
	
				res.redirect("/savedShows")
			} catch (err) {
				console.log(err)
				res.redirect("/savedShows")
			}
		})

		app.use((req, res) => {
			res.status(404).render("404", { imagePath: "/images/404.png" })
		})

		const PORT = process.env.PORT || 8080
		app.listen(PORT, () => {
			console.log(`Server listening on port ${PORT}`)
		})
	})
	.catch((error) => {
		console.error("Error connecting to the database:", error)
	})
