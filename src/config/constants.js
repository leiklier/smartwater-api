export default {
	express: {
		port: process.env.PORT || 5000
	},
	mongodb: {
		host: 'localhost',
		port: 27017,
		database: 'vannovervakning',
		measurementsCollection: 'measurements'
	}
}
