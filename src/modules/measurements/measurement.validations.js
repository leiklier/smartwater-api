import Joi from 'joi'

const csvJoi = Joi.extend(joi => ({
	base: joi.array(),
	name: 'stringArray',
	coerce: (value, state, options) =>
		typeof value !== 'undefined' && value.split ? value.split(',') : value
}))

export const VALID_MEASUREMENTS = [
	'BATTERY',
	'TEMPERATURE',
	'TURBIDITY',
	'DISSOLVED_OXYGEN',
	'PH',
	'CONDUCTIVITY'
]

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
				.single()
		}
	}
}
