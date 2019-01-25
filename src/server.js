// https://stackoverflow.com/questions/40730604/mongoose-find-with-multiple-ids-that-are-the-same?rq=1
// https://stackoverflow.com/questions/36552395/query-multiple-date-ranges-in-mongoose


const express = require('express')
const bodyParser = require('body-parser')
const api = express()

const port = process.env.PORT || 5000

const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.connect('mongodb://localhost:27017/vannovervakning', {useNewUrlParser:true})

const sensorReadingSchema = new Schema({
  _id: Number,
  nodeId: Number,
  type: String,
  value: Number,
  time: {
    type: Date,
    default: Date.now,
    required: "rewortwe"
  }
}, {
  collection: "readings"
})

var sensorReading = mongoose.model('sensorReading', sensorReadingSchema)

api.use(bodyParser.json())          // to support JSON-encoded bodies
api.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

var server = api.listen(port, (err) => {
  if(err) {
    console.log(err)
    process.exit(1)
  }
  console.log(`API server started at port ${port}`)
})



// ROUTES

api.get('/api/node/:nodeId?', (req, res) => {
  // Get info about this node
  // Returns all entries on that node
  sensorReading.find({nodeId: req.params.nodeId}, function(err, node) {
    if (err) {
        res.send(err);
    }
    // console.log(node);
    res.json(node);
    });
})




api.get('/api/node/:nodeId?/:param?/:fromTimestamp?/:toTimestamp?', (req, res) => {
  // GET sensor readings
  // No timestamps specified returns the latest reading.

// Possible solution
  sensorReading.find({nodeId: req.params.nodeId,
    $or: [
      { // range 1
        time: { '$gte': new Date(req.params.fromTimestamp), '$lt': new Date(req.params.toTimestamp) }
      },
    ]
    }, function(err, node){
    if (err) {
      res.send(err);
    }
    res.json(node);
    });
})



api.post('/api/sensorReadings/:nodeId', (req, res) => {
  const reading = new sensorReading(req.body)
  reading.save()
    .then(reading=> {
      res.json('reading stored securely in database')
    })
    .catch(err => {
      res.status(400).send('unable to store reading')
    })
})




