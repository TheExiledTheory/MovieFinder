// Entry Point of the API Server 
const express = require('express');         // Express library 
const cors = require('cors');               // Allows other origins 
//const http = require('http');               // Create a server over HTTP 
//const fs = require('fs');                   // Allow nav of filesystem 
//const https = require('https');             // Create a server over HTTPS
const helmet = require('helmet');           // Secure HTTP with headers 
const morgan = require('morgan');           // Adds logging capabilities 
const bodyParser = require('body-parser');  // Converts requests to objects  

// The following is a workaround for CommonJS environment to import node-fetch 
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Define express app 
const app = express();

// Define array to serve as local database 
const key = [
    {
        tmdbKey : "d4ab58455caaba186672e8476cc49f82",
        guestKey: "",
        expire: ""
    }
]

// Define express attributes 
app.use(bodyParser.json())                          // Convert JSON into objects 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(helmet());                                  // Secure API
app.use(morgan('combined'));                        // Log HTTP requests 
app.use(cors());                                    // Allow other origins

// API route to send API_KEY
app.get('/api', (req, res, next) => {
    console.log("Request for api key recieved!");
    console.log("Made by " + req.ip);
    // Make sure that the requester is internal only 
    //if (req.ip !== '::ffff:127.0.0.1') {
    //    res.status(404).send(new Error("Cannot request from outside internal server")); 
    //}
    
    // Send forward the API key 
    res.json(key[0].tmdbKey);
        
});
  
// Function to determine expiration of guest session token 
let expired = () => {
    // Get the current time 
    var currentDate = new Date().getTime(); 

    // Check if token is expired 
    if (currentDate - key[0].expire > 0) {
        return true;
    } else {
        return false; 
    }

}

// This needs to be in a database so that the record isnt held in memory 

// API route to send guest_session_id
app.get('/guest_session', async(req, res, next) => {
    console.log("Request to for guest token recieved!");
    console.log("Made by " + req.ip);
    // Make sure that the requester is internal only 
    //if (req.ip !== '::ffff:127.0.0.1') {
    //    res.status(404).send(new Error("Cannot request from outside internal server")); 
    //}

    // Check if we need to fetch a new key 
    if (key[0].guestKey === "" || expired()) {

        var url = "https://api.themoviedb.org/3/authentication/guest_session/new?api_key=d4ab58455caaba186672e8476cc49f82";
        let guest = null;

        try {
            // Make call to external API 
            var response = await fetch(url);

            // If valid 200 response 
            if (response.ok) {
                // Grab response as JSON
                var jresponse = await response.json();
                
                // Rather than get the expiration from the response and convert. 
                // We simply calculate 24hrs from current moment.

                // Calculate the current time 
                const utcDate = new Date().getTime();

                // Add 24hrs and set key expiration
                key[0].expire = utcDate + (60 * 60 * 24 * 1000);
                key[0].guestKey = jresponse.guest_session_id;

                // Send forward the API key
                res.json(key[0].guestKey);

            } else {
                console.log("Did not get a valid 200 response... instead got: " + response.status);
                res.status(response.status).send(new Error("Invalid response from external API!"));
            }

        } catch (err) { 
            console.log(err.message);
            res.status(500).send(new Error("Failed to make request for guest token."));
        }
    } 
    // Simply return current key 
    else {
        res.json(key[0].guestKey);
    }


});

app.listen(8080, () => {
    console.log("Listening on 8080");
});


/* Used for connecting to Postgre backend db 
//Connect to Postgre Server 
//const Pool = require('pg').Pool;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'gfgbackend',
    password: 'postgres',
    dialect: 'postgres',
    port: 5432
});


pool.connect((err, client, release) => {
    if (err) {
        return console.error(
            'Error acquiring client', err.stack)
    }
    client.query('SELECT NOW()', (err, result) => {
        release()
        if (err) {
            return console.error(
                'Error executing query', err.stack)
        }
        console.log("Connected to Database !")
    })
})
*/
