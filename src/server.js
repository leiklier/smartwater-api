// https://stackoverflow.com/questions/40730604/mongoose-find-with-multiple-ids-that-are-the-same?rq=1
// https://stackoverflow.com/questions/36552395/query-multiple-date-ranges-in-mongoose

const validReadingTypes = ['BATTERY', 'TEMPERATURE', 'HUMIDITY', 'PH']
const express = require('express')
const bodyParser = require('body-parser')
const api = express()

const port = process.env.PORT || 5000

const mongoose = require('mongoose')
const Schema = mongoose.Schema
const autoIncrement = require('mongoose-auto-increment')

mongoose.connect('mongodb://localhost:27017/vannovervakning', {useNewUrlParser:true})
autoIncrement.initialize(mongoose)

const sensorReadingSchema = new Schema({
  // The field below is Primary Key and is automatically generated
  // _id: Number,
  nodeId: Number,
  type: String,
  value: Number,
  time: {
    type: Date,
    default: Date.now,
    required: "Time cannot be blank."
  }
}, {
  collection: "readings"
})

sensorReadingSchema.plugin(autoIncrement.plugin, 'sensorReading')

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




api.get('/api/sensorReadings/:nodeId/:fromTimestamp?/:toTimestamp?', (req, res) => {
  // GET sensor readings
  // No timestamps specified returns the latest reading.
  const returnFields = {
    _id: 0,
    type: 1,
    value: 1,
    time: 1
  }

  var query = {
    nodeId: req.params.nodeId
  }

  var result = { nodeId: parseInt(req.params.nodeId) }

  if(req.params.fromTimestamp) {
    query.$or = [{
      time: {'$gte': new Date(parseInt(req.params.fromTimestamp))}
    }]
    
    if(req.params.toTimestamp) {
      query.$or[0].time.$lt = new Date(parseInt(req.params.toTimestamp))
    }
  }


  if(req.query.types) {
    // User has specified which types of readings he wants
    var types = []
    types = req.query.types.split(',')

    for(var i = 0; i < types.length; i++) {
      // Validate types
      if(!validReadingTypes.includes(types[i])) {
        res.send('ERR_ILLEGAL_READINGS_TYPE')
      }
    }
    query.type = types
  }
 
  sensorReading.find(query, returnFields, function(err, response){
    if (err) {
      res.send(err)
    }
    result.data = {}
    for(var i = 0; i < response.length; i++) {
      // Create array if not exists
      result.data[response[i].type] = Array.isArray(result.data[response[i].type]) ? result.data[response[i].type] : [];

      result.data[response[i].type].push({value: response[i].value, time: response[i].time})
    }
    res.json(result)
    })
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




