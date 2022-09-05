// Populate dropdown menu with all the available genres
const populateGenreDropdown = async(genres) => {
    // Get the element of the dropdown 
    const select = document.getElementById('genres')

    // Loop through input array 
    for (const genre of genres) {
        // Create a new option tag 
        let option = document.createElement("option");
        // Set the attributes of the element 
        option.value = genre.id;
        option.text = genre.name;
        // Add it as a child element 
        select.appendChild(option);
    }
};

// Returns the current genre selection from the dropdown menu
const getSelectedGenre = () => {
    const selectedGenre = document.getElementById('genres').value;
    return selectedGenre;
};

// Displays the like and dislike buttons on the page
const showBtns = () => {
    const btnDiv = document.getElementById('likeOrDislikeBtns');
    btnDiv.removeAttribute('hidden');
};

// Clear the current movie from the screen
const clearCurrentMovie = () => {
    // Setup page elements 
    const moviePosterDiv = document.getElementById('moviePoster');
    const movieTextDiv = document.getElementById('movieText');
    moviePosterDiv.innerHTML = '';
    movieTextDiv.innerHTML = '';
}

// Used to send like/dislike to API 
async function postRating(rating) {

    // Fetch guest session token from backend Express endpoint 
    var guestToken = new Promise(async function (resolve, reject) {
        try {
            // Fetch local API for key 
            var response = await fetch("http://localhost:8080/guest_session");
            await response; 

            // Verify response
            if (response.ok) {
                
                // Return key 
                resolve(await response.json());

            } else {
                console.log("Error: " + response.status);
                reject(new Error("Error: " + response.status));
            }

        } catch (error) {
            console.log(error.message);
            reject(error.message);
        }
    });

    // Now that we have the guest token we can send rating to API

    // Construct URL to rate movie 
    var likeMovieEndpoint = tmdbBaseUrl + "/movie/" + m_id + "/rating";
    var urlToPost = likeMovieEndpoint + "?api_key=" + tmdbKey + "&guest_session_id=" + await guestToken;

    // Setup required headers 
    var headers_obj = {"Content-Type" : "application/json;charset=utf-8"};
    // Send a static rating for likes 
    var body = {"value" : rating};

    try {
        // Configure POST request 
        var response = await fetch (urlToPost, { 
            method: 'POST',
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers : headers_obj,
            body: JSON.stringify(body)
        });

        // Wait for a response 
        if (response.ok) {
            var jsonResponse = await response.json(); 

            // Make sure success is returned! 
            if (jsonResponse.status_code == 1) {
                console.log("Successfully rated movie as " + rating + "/10");
            } else if (jsonResponse.status_code == 12) {
                console.log("Updated movie rating to " + rating + "/10");
            } else {
                console.log("Error: " + jsonResponse.status_code);
                console.log("Error: " + jsonResponse.status_message);
            }

        }

    } catch (err) {
        console.log(err.message); 
        throw new Error(err.message);
    }
    
}

// After liking a movie, clears the current movie from the screen and gets another random movie
const likeMovie = () => {

    // Like movie statically as 8
    postRating(8); // DONT AWAIT THIS FUNCTION

    // Update display
    clearCurrentMovie();
    showRandomMovie();

    // Increment movies seen 
    moviesSeen++;
    console.log("Movies seen increased: " + moviesSeen);
    
};

// After disliking a movie, clears the current movie from the screen and gets another random movie
const dislikeMovie = () => {

    // Rate movie statically as 3
    postRating(3); // DONT AWAIT THIS FUNCTION

    // Update display
    clearCurrentMovie();
    showRandomMovie();

    // Increment movies seen 
    moviesSeen++;
    console.log("Movies seen increased: " + moviesSeen);
}
// Create HTML for movie poster
const createMoviePoster = (posterPath) => {
    // Get image 
    const moviePosterUrl = `https://image.tmdb.org/t/p/original/${posterPath}`;

    // Setup page element 
    const posterImg = document.createElement('img');
    posterImg.setAttribute('src', moviePosterUrl);
    posterImg.setAttribute('id', 'moviePoster');
  
    return posterImg;
};

// Create HTML for movie title
const createMovieTitle = (title) => {
    // Setup page element
    const titleHeader = document.createElement('h1');
    titleHeader.setAttribute('id', 'movieTitle');
    titleHeader.innerHTML = title;
  
    return titleHeader;
};

// Create HTML for movie overview
const createMovieOverview = (overview) => {

    // Setup page element 
    const overviewParagraph = document.createElement('p');
    overviewParagraph.setAttribute('id', 'movieOverview');
    overviewParagraph.innerHTML = overview;
  
    return overviewParagraph;
};

// Create further details for movie 
const createMovieDetails = (movieInfo) => {
    const movieDetails = document.createElement('p');
    movieDetails.setAttribute('id', 'movieDetails');

    // Calculate movie runtime
    var hour = Math.floor(movieInfo.runtime / 60);
    var minutes = movieInfo.runtime % 60;
    var time = hour + "hr " + minutes + "minutes";

    // Reorder date because America 
    var year = movieInfo.release_date.substring(0, 4);
    var month = movieInfo.release_date.substring(5, 7);
    var day = movieInfo.release_date.substring(8, 10);

    movieDetails.innerHTML = `${month}-${day}-${year} | ${time} | ${movieInfo.vote_average.toFixed(1)} | ${movieInfo.original_language.toUpperCase()}`;
    return movieDetails;
}

// Returns a random movie from the first page of movies
const getRandomMovie = (movies) => {
    // Calculate random index
    const randomIndex = Math.floor(Math.random() * movies.length);
    ind = randomIndex;

    // Grab the movie
    const randomMovie = movies[randomIndex];
    return randomMovie;
};

// Uses the DOM to create HTML to display the movie
const displayMovie = (movieInfo) => {
    
    const moviePosterDiv = document.getElementById('moviePoster');
    const movieTextDiv = document.getElementById('movieText');
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
  
    // Create HTML content containing movie info
    const moviePoster = createMoviePoster(movieInfo.poster_path);
    const titleHeader = createMovieTitle(movieInfo.title);
    const overviewText = createMovieOverview(movieInfo.overview);
    const movieDetail = createMovieDetails(movieInfo);
  
    // Append title, poster, and overview to page
    moviePosterDiv.appendChild(moviePoster);
    movieTextDiv.appendChild(titleHeader);
    movieTextDiv.appendChild(overviewText);
    movieTextDiv.appendChild(movieDetail);
  
    // Display buttons 
    showBtns();

    // Used for rating movie before removal
    m_id = movieInfo.id;

    // Even listeners for buttons
    likeBtn.onclick = likeMovie;
    dislikeBtn.onclick = dislikeMovie;

    // Increment movies 
    moviesSeen++;

    // Added here so user never sees duplicates 
    movies.splice(ind, 1);

};
