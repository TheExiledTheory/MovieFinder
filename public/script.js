// Obtained from https://www.themoviedb.org/settings/api

// Api key 
let tmdbKey = null;
// Base url of the API 
const tmdbBaseUrl = 'https://api.themoviedb.org/3';
// Get the element for user interaction 
const playBtn = document.getElementById('playBtn');
// Tracking variables 
let page = 1;
let movies = [];
let moviesSeen = 0;
let ind = 0;
let m_id = -1; 

// Retrieve API KEY from internal express server
var getKey = new Promise(async function (resolve, reject) {
	try {
		// Fetch local API for key 
		var response = await fetch("http://localhost:8080/api");
		await response; 

		// Verify response
		if (response.ok) {
			// Return key 
			var key = await response.json();
			resolve(key); 
		} else {
			console.log("Error: " + response.status);
			throw new Error("Error in fetching request!");
		}

	} catch (error) {
		console.log(error.message);
		reject("Error");
	}
});

// Fetch the genres 
const getGenres = async() => {

	// Set the global API key 
	tmdbKey = await getKey;

  	// Setup request URL 
  	var genreRequestEndpoint = tmdbBaseUrl + '/genre/movie/list'; 
  	var requestParams = '?api_key=' + tmdbKey + '&language=en-US';
  	var urlToFetch = genreRequestEndpoint + requestParams; 

  	try {
      	// Generate a fetch request 
      	var response = await fetch(urlToFetch);
      	// Check for a valid response 
      	if (response.ok) {
        	// Grab genres
        	var jsonResponse = await response.json(); 
        	var genres = jsonResponse['genres']; 
        	return genres;
      	}
      	//Error check 
      	throw new Error('Failed request');

  	} catch (error) {
      	console.log(error.message);
  	}

};

const getMovies = async() => {

	// Check to see if we have exhausted list 
	if (moviesSeen >= 20) {
		console.log("movieSeen >= 20!");
		
		// Create a custom alert here 

		// Update vars 
		page++;
		moviesSeen = 0;
		movies.splice(0, movies.length);

	}

  	// Get the selected genre from drop down 
  	const selectedGenre = getSelectedGenre();

  	// Setup the request URL 
  	var discoverMovieEndpoint = tmdbBaseUrl + '/discover/movie';
  	var requestParams = "?api_key=" + tmdbKey + "&language=en-US" + "&with_genres=" + selectedGenre + "&sort_by=popularity.desc&primary_release_year=" + new Date().getFullYear + "&page=" + page;
  	var urlToFetch = discoverMovieEndpoint + requestParams + ""; 

  	try {
    	// Send request 
    	var response = await fetch(urlToFetch);
    	await response; 

		// Check for a valid response
		if (response.ok) {

			// Grab movies from response 
			var jsonResponse = await response.json(); 
			var temp_movies = await jsonResponse['results'];

			// Loop through movies and save to array 
			for (movie in temp_movies) {
				movies.push(temp_movies[movie]);
			}

			return; 
		}
		// Error check 
		throw new Error('Failed request');

  	} catch (error) {
    	console.log(error.message);
  	}

};
// Fetch info on movies
const getMovieInfo = async(movie) => {

  	// Get the movie id field 
  	var movieId = movie.id; 

	// Setup the request URL 
	var movieEndpoint = '/movie/' + movieId;
	var requestParams = "?api_key=" + tmdbKey + "&language=en-US";
	var urlToFetch = tmdbBaseUrl + movieEndpoint + requestParams; 

	try {
		// Send request 
		var response = await fetch(urlToFetch); 
		await response; 

		// Check if valid response
		if (response.ok) {

			var movieInfo = await response.json(); 
			return movieInfo; 
		}
	} catch (error) {
		console.log(error.message); 
	}

};

// Command function for dynamic functionality 
const showRandomMovie = async() => {
	const movieInfo = document.getElementById('movieInfo');

	// Check for displayed movies
	if (movieInfo.childNodes.length > 0) {
		// Remove movies shown 
		clearCurrentMovie();
	};

	// Check for movies array states
	if (movies.length === 0) { 
		console.log("Movies array is empty!")
		// Fetch movies
		await getMovies();
	} 

	// Get movie and details for it 
	var randomMovie = await getRandomMovie(movies); 
	var info = await getMovieInfo(randomMovie);

	// Configure html elements 
	displayMovie(info); 
};

// Immediately add genres from API
getGenres().then(populateGenreDropdown);
// Starts global event chain!
playBtn.onclick = showRandomMovie;
// Listen for user changing genres 
document.getElementById("genres").addEventListener("change", () => {
	// Reset movies and count 
	movies.splice(0, movies.length);
	moviesSeen = 0;
});

