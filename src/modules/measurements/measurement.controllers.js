import HTTPStatus from 'http-status'

import Measurement from './measurement.model'

export async function createOneMeasurement(req, res) {
	try {
		var newMeasurement = { ...req.body, ...req.params }

		if (newMeasurement.timeCreated) {
			newMeasurement.timeCreated = new Date(newMeasurement.timeCreated)
		}

		const measurementWritten = await Measurement.createOneMeasurement(
			newMeasurement
		)
		return res.status(HTTPStatus.CREATED).json(measurementWritten)
	} catch (e) {
		return res.status(HTTPStatus.BAD_REQUEST).json(e)
	}
}

export async function createManyMeasurements(req, res) {
	const input = { ...req.params, ...req.body }
	var measurements = new Array()

	for (var index in input.payload_fields) {
		var thisMeasurement = {
			nodeId: input.nodeId,
			type: input.payload_fields[index].type,
			value: input.payload_fields[index].value,
			// position: input.position
			position: {
				lat: input.metadata.latitude,
				lng: input.metadata.longitude
			}
		}

		if (input.payload_fields[index].timeCreated) {
			thisMeasurement.timeCreated = new Date(
				input.payload_fields[index].timeCreated
			)
		} else if (input.metadata.time) {
			thisMeasurement.timeCreated = new Date(input.metadata.time)
		}

		measurements.push(thisMeasurement)
	}

	try {
		const measurementsWritten = await Measurement.createManyMeasurements(
			measurements
		)
		return res.status(HTTPStatus.CREATED).json(measurementsWritten)
	} catch (e) {
		return res.status(HTTPStatus.BAD_REQUEST).json(e)
	}
}

export async function getMeasurements(req, res) {
	try {
		const { nodeId, types, fromTimestamp, toTimestamp, aggregate } = {
			...req.params,
			...req.query
		}

		var measurements
		if (typeof fromTimestamp === 'undefined') {
			// No time restrictions, so return only latest
			measurements = await Measurement.getLatestMeasurements({
				nodeId,
				types
			})
		} else if (typeof aggregate === 'undefined') {
			// Return all measurements within time restrictions
			measurements = await Measurement.listMeasurements({
				nodeId,
				types,
				fromTimestamp,
				toTimestamp
			})
		} else {
			// Aggregate measurements within time restrictions
			measurements = await Measurement.getAggregatedMeasurements({
				nodeId,
				types,
				fromTimestamp,
				toTimestamp,
				aggregate
			})
		}

		var result = { nodeId: nodeId, data: {} }

		for (var measurement of measurements) {
			result.data[measurement.type] = Array.isArray(
				result.data[measurement.type]
			)
				? result.data[measurement.type]
				: new Array()

			result.data[measurement.type].push({
				value: measurement.value,
				timeCreated: measurement.timeCreated,
				position: measurement.position
			})
		}

		return res.status(HTTPStatus.OK).json(result)
	} catch (e) {
		return res.status(HTTPStatus.BAD_REQUEST).json(e)
	}
}
