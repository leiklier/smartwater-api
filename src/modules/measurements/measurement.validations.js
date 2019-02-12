import Joi from 'joi'

const csvJoi = Joi.extend(joi => ({
	base: joi.array(),
	name: 'stringArray',
	coerce: (value, state, options) =>
		typeof value !== 'undefined' && value.split ? value.split(',') : value
}))

const ISO_8601_REGEX = /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/

export const VALID_MEASUREMENTS = [
	'BATTERY',
	'TEMPERATURE',
	'TURBIDITY',
	'DISSOLVED_OXYGEN',
	'PH',
	'CONDUCTIVITY'
]

export const VALID_AGGREGATES = ['HIGHEST', 'LOWEST', 'AVERAGE']

export default {
	createOneMeasurement: {
		params: {
			nodeId: Joi.number()
				.integer()
				.required()
		},
		body: {
			type: Joi.string()
				.valid(...VALID_MEASUREMENTS)
				.required(),
			value: Joi.number().required(),
			timeCreated: Joi.number().integer(),
			position: Joi.object({
				lat: Joi.number(),
				lng: Joi.number()
			})
		}
	},
	createManyMeasurements: {
		params: {
			nodeId: Joi.number()
				.integer()
				.required()
		},
		body: {
			timeCreated: Joi.number().integer(),
			position: {
				lat: Joi.number(),
				lng: Joi.number()
			},
			payload: Joi.array()
				.items(
					Joi.object({
						type: Joi.string()
							.valid(...VALID_MEASUREMENTS)
							.required(),
						value: Joi.number().required(),
						timeCreated: Joi.number().integer()
					})
				)
				.required()
		}
	},
	createManyMeasurementsTTN: {
		params: {
			nodeId: Joi.number()
				.integer()
				.required()
		},
		body: {
			metadata: Joi.object({
				time: Joi.string().regex(ISO_8601_REGEX),
				latitude: Joi.number(),
				longitude: Joi.number()
			}),
			payload_fields: Joi.object({
				data: Joi.array()
					.items(
						Joi.object({
							type: Joi.string()
								.valid(...VALID_MEASUREMENTS)
								.required(),
							value: Joi.number().required(),
							timeCreated: Joi.number().integer()
						})
					)
					.required()
			}).required()
		}
	},
	getMeasurements: {
		params: {
			nodeId: Joi.number()
				.integer()
				.required(),
			fromTimestamp: Joi.number().integer(),
			toTimestamp: Joi.number().integer()
		},
		query: {
			types: csvJoi
				.stringArray()
				.items(Joi.string().valid(...VALID_MEASUREMENTS))
				.single(),
			aggregate: Joi.string().valid(...VALID_AGGREGATES)
		}
	}
}
