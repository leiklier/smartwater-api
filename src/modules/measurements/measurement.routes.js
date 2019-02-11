import express from 'express'
import validate from 'express-validation'

import expressWs from 'express-ws'
expressWs(express()) // Modify global express.Router prototype

import { createEventEmitter } from './measurement.model'
import * as measurementController from './measurement.controllers'
import measurementValidation from './measurement.validations'

createEventEmitter.on('error', e => {
	console.log(e)
})

const routes = express.Router()

routes.ws('/:nodeId', function(ws, req) {
	const types = req.query.types.split(',')

	ws.on('message', msg => ws.send(msg))

	// Bind correct createEmitter-events to websocket
	for (const type of types) {
		createEventEmitter.on(`${req.params.nodeId}_${type}`, measurement => {
			ws.send(JSON.stringify(measurement))
		})
	}
	ws.on('close', () => {
		// We should detach from createEmitter
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
		} else {
			validate(measurementValidation.createOneMeasurement)(req, res, next)
		}
	},
	(req, res) => {
		if (req.body.payload) {
			measurementController.createManyMeasurements(req, res)
		} else {
			measurementController.createOneMeasurement(req, res)
		}
	}
)

export default routes
