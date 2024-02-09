const express = require('express');
const app = express();
var path = require("path");

app.use(express.json());

app.set('port', 3000);
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
    next();
});

const MongoClient = require('mongodb').MongoClient;
let db;

MongoClient.connect('mongodb+srv://kurtxsp:website@clustercw2.iexxwoz.mongodb.net/', (err, client) => {
    db = client.db('website');
});

var staticPath = path.resolve(__dirname, "static");
app.use(express.static(staticPath));
// app.use("/api", apiRouter);

var publicPath = path.resolve(__dirname, "public");
var imagePath = path.resolve(__dirname, "Icons");

app.use('/public', express.static(publicPath));
app.use('/Icons', express.static(imagePath));
app.use(function(req, res, next) {
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Looks like you didn't find a static file.")
    next();
});

app.get('/', (req, res, next) => {
    res.send('Select a collection, e.g., /collection/messages');
});

app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((e, results) => {
        if (e) return next(e);
        res.send(results);
    });
});

app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (e, results) => {
        if (e) return next(e);
        res.send(results.ops);
    });
});

const ObjectID = require('mongodb').ObjectID;
app.get('/collection/:collectionName/:id',
    (req, res, next) => {
        req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
            if (e) return next(e);
            res.send(result);
        });
    });
    app.put('/collection/:collectionName/:id', (req, res, next) =>{
        req.collection.update(
            {_id: new ObjectID(req.params.id)},
            {$set: req.body},
            {safe: true, multi: false},
            (e, result) => {
                if(e) return next(e)
                res.send((result.result.n === 1) ? {msg:'success'} : {msg: 'error'})
        })
        
    })
// app.put('/collection/:collectionName/:id', (req, res, next) => {
//     console.log('PUT Request Received:', req.body);
//     console.log('ID:', req.params.id);

//     req.collection.updateOne(
//         { _id: new ObjectID(req.params.id) },
//         { $set: req.body },
//         (err, result) => {
//             if (err) {
//                 console.error('Error updating spaces:', err);
//                 return res.status(500).json({ msg: 'error', error: err.message });
//             }

//             if (result.matchedCount === 1 && result.modifiedCount === 1) {
//                 res.json({ msg: 'success', updatedDocument: result.ops[0] });
//             } else {
//                 res.status(404).json({ msg: 'error', error: 'No document found for update.' });
//             }
//         }
//     );
// });

app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        { _id: new ObjectID(req.params.id) },
        (e, result) => {
            if (e) return next(e);
            res.send((result.result.n === 1) ?
                { msg: 'success' } : { msg: 'error' });
        });
});

// Serving static images
//app.use('/Icons', express.static(__dirname + '/Icons'));

const port = process.env.PORT || 3000;
app.listen(port, () => {
    
});


console.log('Server is running on port', port);