// Populate form fields with data
const populateForm = (formData) => {
	const inputs = document.querySelectorAll("#signupForm input")
	inputs.forEach((input) => {
		input.value = formData[input.name] || ""
	})
}
  
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
  
// Get form data as an object
const getFormData = () => {
	const formData = {}
	const inputs = document.querySelectorAll("#signupForm input")
	inputs.forEach((input) => {
		formData[input.name] = input.value
	})
	return formData
}

// toggle password visibility 

const togglePasswordVisibility = (toggleIconId) => {
	const passwordInput = document.getElementById("password")
	const toggleIcon = document.getElementById(toggleIconId)
  
	if (passwordInput.type === "password") {
		passwordInput.type = "text"
		toggleIcon.classList.remove("fa-eye")
		toggleIcon.classList.add("fa-eye-slash")
	} else {
		passwordInput.type = "password"
		toggleIcon.classList.remove("fa-eye-slash")
		toggleIcon.classList.add("fa-eye")
	}
}
  
  
const toggleConfirmPasswordVisibility = () => {
	const confirmPasswordInput = document.getElementById("confirmPassword")
	const toggleIcon = document.getElementById("confirmPasswordToggleIcon")
  
	if (confirmPasswordInput.type === "password") {
		confirmPasswordInput.type = "text"
		toggleIcon.classList.remove("fa-eye")
		toggleIcon.classList.add("fa-eye-slash")
	} else {
		confirmPasswordInput.type = "password"
		toggleIcon.classList.remove("fa-eye-slash")
		toggleIcon.classList.add("fa-eye")
	}
}
   