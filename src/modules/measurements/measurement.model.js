import mongoose, { Schema } from 'mongoose'
const autoIncrement = require('mongoose-auto-increment')

import config from '../../config/constants.js'

autoIncrement.initialize(mongoose)

const MeasurementSchema = new Schema(
  { 
    // The field below is Primary Key and is automatically populated
    // _id: Number,
    nodeId: Number,
    type: String,
    value: Number,
    position: {
      lng: Number,
      lat: Number
    },
    timeCreated: {
      type: Date,
      default: Date.now,
      required: true
    }
  },
  {
    collection: config.mongodb.measurementsCollection
  }
)

MeasurementSchema.plugin(autoIncrement.plugin, 'Measurement')

MeasurementSchema.statics = {
  createOneMeasurement(measurement) {
    return this.create( measurement )
  },
  
  createManyMeasurements(measurements) {
    var measurementsWritten = new Array()

    for(const measurement of measurements) {
      this.createOneMeasurement(measurement)
      measurementsWritten.push(measurement)
    }

    return measurementsWritten
  },

  listMeasurements(args) {
    var query = {
      nodeId: args.nodeId
    }

    if(args.fromTimestamp) {
    // Query should be time restricted
      query.$or = [{
        time: {'$gte': new Date(parseInt(args.fromTimestamp))}
      }]
      if(args.toTimestamp) {
        query.$or[0].time.$lt = new Date(parseInt(args.toTimestamp))
      }
    }
    

    if(args.types) {
      // Query should be restricted to only certain measurement types
      query.type = args.types
    }

    return this.find(query, (err, response) => {})
  }
}

export default mongoose.model('Measurement', MeasurementSchema)
