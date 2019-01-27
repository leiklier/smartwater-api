import HTTPStatus from 'http-status'

import Measurement from './measurement.model'

export async function createMeasurement(req, res) {
  try {
    const { params, body } = req
    const measurement = await Measurement.createMeasurement({...body, ...params})
    return res.status(HTTPStatus.CREATED).json(measurement)

  } catch(e) {
    return res.status(HTTPStatus.BAD_REQUEST).json(e)
  }
}

export async function listMeasurements(req, res) {
  try {
    const { params, query } = req
    const measurements = await Measurement.listMeasurements({...params, ...query})
    
    var result = { nodeId: params.nodeId, data: {} }
    for(var measurement of measurements) {
      result.data[measurement.type] = Array.isArray(result.data[measurement.type]) ?
                                          result.data[measurement.type] :
                                          new Array()
      result.data[measurement.type].push({value: measurement.value, time: measurement.type})
    }

    return res.status(HTTPStatus.OK).json(result)

  } catch(e) {
    return res.status(HTTPStatus.BAD_REQUEST).json(e)
  }
}
