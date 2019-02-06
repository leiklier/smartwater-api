import { Router } from 'express'
import validate from 'express-validation'

import * as measurementController from './measurement.controllers'
import measurementValidation from './measurement.validations'

const routes = new Router()

routes.get(
	'/:nodeId/:fromTimestamp?/:toTimestamp?',
	validate(measurementValidation.listMeasurements),
	measurementController.listMeasurements
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
