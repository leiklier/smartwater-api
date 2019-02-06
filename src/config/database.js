import mongoose from 'mongoose'

import constants from './constants.js'
const mongodb = constants.mongodb

const MONGO_URL = `mongodb://${mongodb.host}:${mongodb.port}/${
	mongodb.database
}`

try {
	mongoose.connect(
		MONGO_URL,
		{ useNewUrlParser: true }
	)
} catch (err) {
	mongoose.createConnection(MONGO_URL)
}

mongoose.connection
	.once('open', () => console.log('MongoDB connection established'))
	.on('error', e => {
		throw e
	})
