// Retrieve form data from localStorage if available
const storedFormData = localStorage.getItem("signupFormData")
if (storedFormData) {
	const formData = JSON.parse(storedFormData)
	populateForm(formData)
}

// Add submit event listener to the form
const form = document.getElementById("signupForm")
form.addEventListener("submit", (e) => {
	e.preventDefault() // Prevent form submission

	// Get form data
	const formData = getFormData()

	// Store form data in localStorage
	localStorage.setItem("signupFormData", JSON.stringify(formData))

	// Submit the form
	form.submit()
})

// Function to get form data as an object
function getFormData() {
	const formData = {}
	const inputs = document.querySelectorAll("#signupForm input")
	inputs.forEach((input) => {
		formData[input.name] = input.value
	})
	return formData
}

// Function to populate form fields with data
function populateForm(formData) {
	const inputs = document.querySelectorAll("#signupForm input")
	inputs.forEach((input) => {
		input.value = formData[input.name] || ""
	})
}