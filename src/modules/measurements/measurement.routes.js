import express from 'express'
import validate from 'express-validation'

import expressWs from 'express-ws'
expressWs(express()) // Modify global express.Router prototype

import * as measurementController from './measurement.controllers'
import measurementValidation from './measurement.validations'

const routes = express.Router()

routes.ws('/:nodeId', function(ws, req) {
	ws.on('open', function open() {
		console.log('connected')
	})
	ws.on('message', function incoming(data) {
		ws.send(req.params.nodeId)
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
