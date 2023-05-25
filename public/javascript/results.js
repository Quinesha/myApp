const shows = [
	{ id: 15260, name: "Adventure Time" },
	{ id: 61175, name: "Steven Universe" },
	{ id: 60625, name: "Rick and Morty" }
]

const apiKey = "144e7356ac0d3a69d8ea8bfa8b56c9f8"
const baseUrl = "https://api.themoviedb.org/3/tv/"

shows.forEach(show => {
	const url = `${baseUrl}${show.id}?api_key=${apiKey}`
    
	fetch(url)
		.then(response => response.json())
		.then(data => {
			const showId = data.id
			const showName = data.name
			const overview = data.overview

			const showData = document.getElementById("show-data")
			const showElement = document.createElement("div")
			showElement.innerHTML = `
          <p>TV Show ID: ${showId}</p>
          <p>Name: ${showName}</p>
          <p class="results-p">Overview: ${overview}</p>
          <img class="resultImages" src="/images/${showName.toLowerCase().replace(/\s/g, "-")}.jpg" alt="A titlecard image of the show ${showName}">
        `
			showData.appendChild(showElement)
		})
		.catch(error => {
			console.log("Error occurred while fetching show data:", error)
		})
})
