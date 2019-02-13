import express from 'express'
import validate from 'express-validation'

import expressWs from 'express-ws'
expressWs(express()) // Modify global express.Router prototype

import { createEventEmitter } from './measurement.model'
import * as measurementController from './measurement.controllers'
import measurementValidation, {
	VALID_MEASUREMENTS
} from './measurement.validations'

createEventEmitter.on('error', e => {
	console.log(e)
})

const routes = express.Router()

routes.ws('/:nodeId', function(ws, req) {
	const typesInput = req.query.types
		? req.query.types.split(',')
		: VALID_MEASUREMENTS
	var types = new Array() // Holds types listened to at any moment

	function handleCreateEventEmitter(measurement) {
		ws.send(JSON.stringify(measurement))
	}
	function addCreateEventEmitter(type) {
		if (VALID_MEASUREMENTS.includes(type) && !types.includes(type)) {
			types.push(type)

			createEventEmitter.on(
				`${req.params.nodeId}_${type}`,
				handleCreateEventEmitter
			)
		}
	}
	function removeCreateEventEmitter(type) {
		if (types.includes(type)) {
			types = types.filter(element => element !== type)

			createEventEmitter.removeListener(
				`${req.params.nodeId}_${type}`,
				handleCreateEventEmitter
			)
		}
	}

	ws.on('message', msg => {
		if (/types/.test(msg)) {
			if (/^types\+=/.test(msg)) {
				for (const type of msg.substring(7).split(',')) {
					addCreateEventEmitter(type)
				}
			} else if (/^types-=/.test(msg)) {
				for (const type of msg.substring(7).split(',')) {
					removeCreateEventEmitter(type)
				}
			}
			ws.send(`types=${types.join(',')}`)
		} else {
			// No valid commands, echo for tunnel testing
			console.log(types)
		}
	})

	// Bind correct createEmitter-events to websocket
	for (const type of typesInput) {
		addCreateEventEmitter(type)
	}

	ws.on('close', () => {
		// We should detach from createEmitter
		for (const type of types) {
			removeCreateEventEmitter(type)
		}
	})
})

routes.get(
	'/:nodeId/:fromTimestamp?/:toTimestamp?',
	validate(measurementValidation.getMeasurements),
	measurementController.getMeasurements
)

routes.post(
	'/:nodeId',
	(req, res, next) => {
		if (req.body.payload) {
			validate(measurementValidation.createManyMeasurements)(req, res, next)
		} else if (req.body.payload_fields) {
			validate(measurementValidation.createManyMeasurementsTTN)(req, res, next)
		} else {
			validate(measurementValidation.createOneMeasurement)(req, res, next)
		}
	},
	(req, res) => {
		if (req.body.payload) {
			measurementController.createManyMeasurements(req, res)
		} else if (req.body.payload_fields) {
			measurementController.createManyMeasurementsTTN(req, res)
		} else {
			measurementController.createOneMeasurement(req, res)
		}
	}
)

export default routes
