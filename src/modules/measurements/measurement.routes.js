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
  validate(measurementValidation.createOneMeasurement),
  measurementController.createOneMeasurement
)

export default routes
