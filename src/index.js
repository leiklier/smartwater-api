
import express from 'express'

import constants from './config/constants'
import './config/database'
import apiRoutes from './modules'
import applyMiddleware from './config/middlewares.js'

const app = express()

applyMiddleware(app)
apiRoutes(app)

app.listen(constants.express.port, err => {
  if(err) {
    throw err
  } else {
    console.log('Server running')
  }
})
