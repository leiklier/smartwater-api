import measurementRoutes from './measurements/measurement.routes'

export default app => {
  app.use('/api/v1/measurements', measurementRoutes)
}
