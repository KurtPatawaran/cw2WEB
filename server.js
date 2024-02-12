// Import the express library
const express = require('express');
// Create an instance of the express application
const app = express();
// Import the path module
var path = require("path");

// Resolve the path for the 'static' directory
var staticPath = path.resolve(__dirname, "static");
// Use the express.json middleware for parsing JSON requests
app.use(express.json());
// Set the port number for the application
app.set('port', 3000);
// Set up middleware for handling CORS headers
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    next();
});

//logger middleware, logs all requests done
app.use(function (req, res, next) {
    console.log("In comes a " + req.method + " to " + req.url);
    next();
});

// Connect to MongoDB
const MongoClient = require('mongodb').MongoClient;
let db;
MongoClient.connect('mongodb+srv://kurtxsp:website@clustercw2.iexxwoz.mongodb.net/', (err, client) => {
    db = client.db('website');
});

// Serve static files from the 'static' directory
app.use(express.static(staticPath));

// Resolve the paths for 'public' and 'Icons' directories
var publicPath = path.resolve(__dirname, "public");
var imagePath = path.resolve(__dirname, "Icons");

// Serve static files from the 'public' and 'Icons' directories
app.use('/public', express.static(publicPath));
app.use('/Icons', express.static(imagePath));

// Custom middleware for handling 404 errors related to static files
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/Icons/')) {
        res.status(404).send("Static File does not exist");
    } else {
        next(); // Let other routes and middleware handle non-static file errors
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    console.error(err.stack);
    res.status(500).send("Internal Server Error");
});

// Handle GET request for the root path
app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages');
});

// Middleware to handle collection name parameter
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

// Handle GET request for logging search queries
app.get('/log-search', (req, res, next) => {
    const searchQuery = req.query.searchQuery;
    console.log('Search Query:', searchQuery);

    // You can perform additional actions with the search query if needed
    res.send({ msg: 'Logged search query in Terminal' });
});

// Handle GET request for a specific collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});

// Handle POST request to insert data into a collection
app.post('/collection/:collectionName', (req, res, next) => {
    // Log the order details received in the request body to the console
    console.log('Order Placed:', req.body);
    req.collection.insert(req.body, (e, results) => {   // Use MongoDB's insert method to add the data from the request body to the specified collection
        // error-handling middleware
        if (e) return next(e);
            res.send(results.ops);// Send the inserted data back as the response to the client
    });
});


// Import ObjectID from mongodb library
const ObjectID = require('mongodb').ObjectID;

// Handle GET request for a specific document in a collection
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
        if (e) return next(e);
        res.send(result);
    });
});

// Handle PUT request to update availableSpaces in a specific document
app.put('/collection/:collectionName/:id', (req, res, next) => {
    // Extract the newAvailableSpaces value from the request body
    const newAvailableSpaces = req.body.availableSpaces;

    // Validate that newAvailableSpaces is a valid number
    if (typeof newAvailableSpaces !== 'number' || isNaN(newAvailableSpaces)) {
        // Return a 400 Bad Request response if the provided value is not a valid number
        return res.status(400).send('Invalid value for availableSpaces');
    }

    // Update the document in the specified collection using MongoDB's update method
    req.collection.update(
        // Specify the document to be updated based on its ID
        { _id: new ObjectID(req.params.id) },
        { $set: { availableSpaces: newAvailableSpaces } },      // Set the availableSpaces field to the new value using MongoDB's $set operator
        { safe: true, multi: false },                   // Set options for the update operation (safe, multi)
        (error, result) => {                        // Callback function to handle the result of the update operation           
            if (error) return next(error);      //error-handling middleware
            res.send(result.result.n === 1 ? { msg: 'success' } : { msg: 'error' });    // Send a response indicating the success or failure of the update operation
        }
    );
});


// Set the port for the server
const port = process.env.PORT || 3000;
// Start the server and listen on the specified port
app.listen(port, () => {});

// Log a message indicating that the server is running
console.log('Server is running on port', port);
