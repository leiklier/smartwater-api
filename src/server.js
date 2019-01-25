const express = require('express')
const bodyParser = require('body-parser')
const api = express()

const port = process.env.PORT || 5000

const mongoose = require('mongoose')
const Schema = mongoose.Schema
mongoose.connect('mongodb://localhost:27017/vannovervakning', {useNewUrlParser: true})

const sensorReadingSchema = new Schema({
  id: Number,
  nodeId: Number,
  type: String,
  value: Decimal128
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
  res.send(`You request info about node #${req.params.nodeId}`)
})



api.get('/api/sensorReadings/:nodeId/:param/:fromTimestamp?/:toTimestamp?', (req, res) => {
  // GET sensor readings
  // No timestamps specified returns the latest reading
  res.send(req.params)
})

api.post('/api/sensorReadings/:nodeId', (req, res) => {
  res.send(req.params)
})
