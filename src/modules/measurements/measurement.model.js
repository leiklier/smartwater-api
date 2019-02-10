import mongoose, { Schema } from 'mongoose'
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
		return this.create(measurement)
	},

	createManyMeasurements(measurements) {
		var measurementsWritten = new Array()

		for (const measurement of measurements) {
			this.createOneMeasurement(measurement)
			measurementsWritten.push(measurement)
		}

		return measurementsWritten
	},

	getLatestMeasurements(args) {
		var aggregate = [
			{
				$match: {
					nodeId: args.nodeId
				}
			},
			{
				$sort: {
					// Sort ascending first by type, then timeCreated
					type: 1,
					timeCreated: 1
				}
			},
			{
				$group: {
					// Group all measurements by _id: type and show these fields:
					_id: '$type',
					type: { $last: '$type' },
					value: { $last: '$value' },
					position: { $last: '$position' },
					timeCreated: { $last: '$timeCreated' }
				}
			}
		]
		if (args.types) {
			// Type is specified in query, so restrict result to those matching
			aggregate[0].$match.type = {
				$in: args.types
			}
		}

		return this.aggregate(aggregate, (err, response) => {})
	},

	listMeasurements(args) {
		var query = {
			nodeId: args.nodeId,
			$or: [
				{
					// Lower bound on time restriction
					timeCreated: { $gte: new Date(parseInt(args.fromTimestamp)) }
				}
			]
		}

		if (args.toTimestamp) {
			// Query should have upper bound on time restriction
			query.$or[0].timeCreated.$lt = new Date(parseInt(args.toTimestamp))
		}
		if (args.types) {
			// Query should be restricted to only certain measurement types
			query.type = args.types
		}
		// Run query
		return this.find(query, (err, response) => {})
	}
}

export default mongoose.model('Measurement', MeasurementSchema)
