const shows2 = [
	{ id: 92685, name: "The owl house" },
	{ id: 85349, name: "Amphibia" },
	{ id: 95599, name: "Kipo" },
	{ id: 40075, name: "Grafity falls" },
	{ id: 61923, name: "Star vs the forces of evil" },
	{ id: 37606, name: "The amazing world of Gumball" },
	{ id: 15260, name: "Adventure Time" },
	{ id: 61175, name: "Steven Universe" },
	{ id: 2190, name: "South Park" },
	{ id: 60625, name: "Rick and Morty" }
]
  
const apiKey2 = "144e7356ac0d3a69d8ea8bfa8b56c9f8"
const baseUrl2 = "https://api.themoviedb.org/3/tv/"
  
const showData = document.getElementById("show-data")
const resultList = document.createElement("ul")
resultList.id = "show-list"
showData.appendChild(resultList)
  
shows2.forEach(show => {
	const url = `${baseUrl2}${show.id}?api_key=${apiKey2}`
	
	fetch(url)
		.then(response => response.json())
		.then(data => {
			const showId = data.id
			const showName = data.name
			const overview = data.overview
  
			const showElement = document.createElement("li")
			showElement.innerHTML = `
		  <h3>${showName}</h3>
		  <p>TV Show ID: ${showId}</p>
		  <p>Overview: ${overview}</p>
		  <img class="resultImages" src="/images/${showName.toLowerCase().replace(/\s/g, "-")}.jpg" alt="A titlecard image of the show ${showName}">
		`
  
			resultList.appendChild(showElement)
		})
		.catch(error => {
			console.log("Error occurred while fetching show data:", error)
		})
})
  