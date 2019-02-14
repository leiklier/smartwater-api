import express from 'express'
import validate from 'express-validation'

import * as nodeController from './node.controllers'

import nodeValidation from './node.validations'

const routes = express.Router()

routes.get(
	'/:nodeId?',
	validate(nodeValidation.getNodes),
	nodeController.getNodes
)

export default routes
