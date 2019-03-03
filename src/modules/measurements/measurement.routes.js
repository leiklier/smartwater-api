import express from 'express'
import validate from 'express-validation'

import expressWs from 'express-ws'
expressWs(express()) // Modify global express.Router prototype

import { createEventEmitter } from './measurement.model'
import * as measurementController from './measurement.controllers'
import { handleWebsocket } from './measurement.websocket'

import measurementValidation from './measurement.validations'

createEventEmitter.on('error', e => {
	console.log(e)
})

const routes = express.Router()

routes.ws('/', handleWebsocket)

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
