// Libraries
const express = require('express')
var bodyParser = require('body-parser')
const axios = require("axios");
const mysql = require('mysql2')

// Server prop
const app = express()
const port = 5001

// Final vars
const SERVICE_NAME = "AuthService";

// Endpoints
const MONITORING_URL = "http://monitoring-service:5005/log";
// const GET_CART_URL = "http://cart-service:5002/cart/";
const GET_CART_URL = "http://cart-service:5002/cart/";

var promisePool;
// create application/json parser
var jsonParser = bodyParser.json()

// Define paths

// POST /login gets urlencoded bodies
app.post('/login', jsonParser, async function (req, res) {
    postAsyncLog("Endpoint login called")

    console.log("Username: " + req.body.username);
    console.log("Password: " + req.body.password);
    
    const [result, fields] = await promisePool.query(`SELECT guid, username FROM users where username = '${req.body.username}' and password = '${req.body.password}'`)
    postAsyncLog(`Results fetched: ${result}`)


    // Call cart with guid
    /**
     * {
    "cartDetails": [
        {
            "guid": 1,
            "items": "cola",
            "quantity": 1
        }
    ]
    }
     */
    const cartDetails = await fetchCartForGuid(result[0].guid);

    const respondeJson = {
        'userDetails': result,
        'cartDetails': cartDetails.data.cartDetails
    }

    res.send(result);
})

app.get('/', (req, res) => res.send('Hello World!'))

// Define http Method For generic use
const postAsyncLog = async message => {
    try {
        params = {
            service: SERVICE_NAME,
            timestamp: Date.now(),
            message: message,
        }

        const response = await axios.post(MONITORING_URL, params);
        if (response.status == 200) {
            console.log("Successfully sent to monitoring");
        }
    } catch (error) {
        console.log(error);
    }
};

const fetchCartForGuid = async guid => {
    try {
        const response = await axios.get(GET_CART_URL + guid);

        return response;
    } catch (error) {
        console.log(error);
    }
};


// Start server and establish connection to db
app.listen(port, () => {

    console.log(`Example app listening at http://localhost:${port}`)
    console.log(`Establish connection to db...`)

    const pool = mysql.createPool({
        host: 'db-service',
        user: 'root',
        database: 'happystoredb',
        password: 'admin',
        port: 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    // now get a Promise wrapped instance of that pool
    promisePool = pool.promise();
   
})