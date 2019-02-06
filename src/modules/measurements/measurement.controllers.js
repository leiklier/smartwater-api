import HTTPStatus from 'http-status'

import Measurement from './measurement.model'

export async function createOneMeasurement(req, res) {
  try {
    var newMeasurement = {...req.body, ...req.params}

    if(newMeasurement.timeCreated) {
      newMeasurement.timeCreated = new Date(newMeasurement.timeCreated)
    }

    const measurementWritten = await Measurement.createOneMeasurement(newMeasurement)
    return res.status(HTTPStatus.CREATED).json(measurementWritten)

  } catch(e) {
    return res.status(HTTPStatus.BAD_REQUEST).json(e)
  }
}

export async function createManyMeasurements(req, res) {
  const input = { ...req.params, ...req.body }
  var measurements = new Array()

  for(var index in input.payload) {
    var thisMeasurement = {
      nodeId: input.nodeId,
      type: input.payload[index].type,
      value: input.payload[index].value,
      position: input.position
    }

    if(input.payload[index].timeCreated) {
      thisMeasurement.timeCreated = new Date(input.payload[index].timeCreated)
    } else if(input.timeCreated) {
      thisMeasurement.timeCreated = new Date(input.timeCreated)
    }

    measurements.push(thisMeasurement)
  }

  try {
    const measurementsWritten = await Measurement.createManyMeasurements( measurements )
    return res.status(HTTPStatus.CREATED).json( measurementsWritten )
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
      result.data[measurement.type].push({
        value: measurement.value,
        timeCreated: measurement.timeCreated,
        position: measurement.position
      })
    }

    return res.status(HTTPStatus.OK).json(result)

  } catch(e) {
    return res.status(HTTPStatus.BAD_REQUEST).json(e)
  }
}
