import Joi from 'joi'

export default {
	getNodes: {
		params: {
			nodeId: Joi.number().integer()
		}
	}
}
