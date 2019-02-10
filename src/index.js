// https://github.com/krissnawat/nodejs-restapi/blob/ep-12/src/modules/posts/post.model.js
import process from 'process'
import express from 'express'
import expressWs from 'express-ws'

import constants from './config/constants'
import './config/database'
import apiRoutes from './modules'
import applyMiddleware from './config/middlewares.js'

const app = express()

expressWs(app)
applyMiddleware(app)
apiRoutes(app)

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
	app.listen(constants.express.devPort, err => {
		if (err) {
			throw err
		} else {
			console.log('Development server running')
		}
	})
} else {
  console.log('Production server running')
	require('greenlock-express')
		.create({
			email: 'leik.lima-eriksen@lyse.net',
			agreeTos: true,
			configDir: '~/.config/acme',
			app: app
		})
		.listen(80, 443)
}
