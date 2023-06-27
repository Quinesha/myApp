const shows2=[{id:92685,name:"The owl house"},{id:85349,name:"Amphibia"},{id:95599,name:"Kipo"},{id:40075,name:"Grafity falls"},{id:61923,name:"Star vs the forces of evil"},{id:37606,name:"The amazing world of Gumball"},{id:15260,name:"Adventure Time"},{id:61175,name:"Steven Universe"},{id:2190,name:"South Park"},{id:60625,name:"Rick and Morty"}],apiKey2="144e7356ac0d3a69d8ea8bfa8b56c9f8",baseUrl2="https://api.themoviedb.org/3/tv/",showData=document.getElementById("show-data2"),resultList=document.createElement("ul");resultList.id="show-list2",showData.appendChild(resultList),shows2.forEach(e=>{e=""+baseUrl2+e.id+"?api_key="+apiKey2;fetch(e).then(e=>e.json()).then(e=>{var a=e.id,t=e.name,e=e.overview,i=document.createElement("li");i.innerHTML=`
		  <h3>${t}</h3>
		  <p>TV Show ID: ${a}</p>
		  <p>Overview: ${e}</p>
		  <img class="resultImages" src="/images/${t.toLowerCase().replace(/\s/g,"-")}.jpg" alt="A titlecard image of the show ${t}">
		`,resultList.appendChild(i)}).catch(e=>{console.log("Error occurred while fetching show data:",e)})});