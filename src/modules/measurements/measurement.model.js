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

	getAggregatedMeasurements(args) {
		var query = [
			{
				$match: {
					nodeId: args.nodeId,
					$and: [
						{
							// Lower bound on time restriction
							timeCreated: { $gte: new Date(parseInt(args.fromTimestamp)) }
						}
					]
				}
			},
			{
				$sort: {
					// Sort ascending first by type, then value
					type: 1,
					value: 1
				}
			}
		]

		if (args.toTimestamp) {
			// Query should have upper bound on time restriction
			query[0].$match.$and[0].timeCreated.$lt = new Date(
				parseInt(args.toTimestamp)
			)
		}

		if (args.types) {
			// Type is specified in query, so restrict result to those matching
			query[0].$match.type = {
				$in: args.types
			}
		}

		var aggregate, $group
		switch (args.aggregate) {
		case 'LOWEST':
			aggregate = '$first'
			$group = {
				_id: '$type',
				type: { [aggregate]: '$type' },
				value: { [aggregate]: '$value' },
				position: { [aggregate]: '$position' },
				timeCreated: { [aggregate]: '$timeCreated' }
			}
			break
		case 'HIGHEST':
			aggregate = '$last'
			$group = {
				_id: '$type',
				type: { [aggregate]: '$type' },
				value: { [aggregate]: '$value' },
				position: { [aggregate]: '$position' },
				timeCreated: { [aggregate]: '$timeCreated' }
			}
			break
		case 'AVERAGE':
			aggregate = '$avg'
			$group = {
				_id: '$type',
				type: { $last: '$type' },
				value: { [aggregate]: '$value' }
			}
			break
		}

		query.push({ $group: $group })
		return this.aggregate(query, (err, response) => {})
	},

	listMeasurements(args) {
		var query = {
			nodeId: args.nodeId,
			$and: [
				{
					// Lower bound on time restriction
					timeCreated: { $gte: new Date(parseInt(args.fromTimestamp)) }
				}
			]
		}

		if (args.toTimestamp) {
			// Query should have upper bound on time restriction
			query.$and[0].timeCreated.$lt = new Date(parseInt(args.toTimestamp))
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
