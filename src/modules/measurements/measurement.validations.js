import Joi from 'joi'

const csvJoi = Joi.extend((joi) => ({
  base: joi.array(),
  name: 'stringArray',
  coerce: (value, state, options) => (value.split ? value.split(',') : value)
}))

export const VALID_MEASUREMENTS = [
  'BATTERY',
  'TEMPERATURE',
  'HUMIDITY',
  'PH',
  'CONDUCTIVITY'
]

export default {
  createMeasurement: {
    params: {
      nodeId: Joi.number().integer().required()
    },
    body: {
      type: Joi.string().valid( ...VALID_MEASUREMENTS ).required(),
      value: Joi.number().required(),
      timeCreated: Joi.number().integer(),
      position: {
        lat: Joi.number(),
        lng: Joi.number()
      }
    }
  },
  listMeasurements: {
    params: {
      nodeId: Joi.number().integer().required(),
      fromTimestamp: Joi.number().integer(),
      toTimestamp: Joi.number().integer()
    },
    query: {
      types: csvJoi.stringArray().items(Joi.string().valid( ...VALID_MEASUREMENTS )).single()
    }
  }
}
