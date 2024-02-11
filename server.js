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
// Error handling middleware
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
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

// Handle GET request for a specific collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});

// Handle POST request to insert data into a collection
app.post('/collection/:collectionName', (req, res, next) => {
    console.log('Order Placed:', req.body);
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e);
        res.send(results.ops);
    });
});

// Import ObjectID from mongodb library
const ObjectID = require('mongodb').ObjectID;
// Handle GET request for a specific document in a collection
app.get('/collection/:collectionName/:id',
    (req, res, next) => {
        req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
            if (e) return next(e);
            res.send(result);
        });
    });

// Handle PUT request to update a document in a collection
app.put('/collection/:collectionName/:id', (req, res, next) => {    // Update a document in the specified collection by ID
    // Formulate the update query
    req.collection.update(
        { _id: new ObjectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (error, result) => {        // Handle errors and send success or error response
            if (error) return next(error);
            res.send(result.result.n === 1 ? { msg: 'success' } : { msg: 'error' });
        }
    );
});


// Handle DELETE request to delete a document from a collection
// app.delete('/collection/:collectionName/:id', (req, res, next) => {
//     req.collection.deleteOne(
//         { _id: new ObjectID(req.params.id) },
//         (e, result) => {
//             if (e) return next(e);
//             res.send((result.result.n === 1) ?
//                 { msg: 'success' } : { msg: 'error' });
//         });
// });

// Set the port for the server
const port = process.env.PORT || 3000;
// Start the server and listen on the specified port
app.listen(port, () => {
    
});

// Log a message indicating that the server is running
console.log('Server is running on port', port);
