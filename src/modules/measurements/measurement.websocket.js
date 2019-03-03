import { createEventEmitter } from './measurement.model'
import { VALID_MEASUREMENTS } from './measurement.validations'

export function handleWebsocket(ws, req) {
	var types = new Object() // Holds types listened to at any moment, sparse array with key=nodeId

	function handleCreateEventEmitter(measurement) {
		ws.send(
			JSON.stringify({
				type: 'WEBSOCKET_MEASUREMENTS_RX',
				payload: {
					action: 'INCOMING_DATA',
					data: measurement
				}
			})
		)
	}

	function addCreateEventEmitters(typesInput) {
		for (const nodeId in typesInput) {
			if (!types[nodeId]) types[nodeId] = new Array()

			for (const type of typesInput[nodeId]) {
				if (
					VALID_MEASUREMENTS.includes(type) &&
					!types[nodeId].includes(type)
				) {
					types[nodeId].push(type)

					createEventEmitter.on(`${nodeId}_${type}`, handleCreateEventEmitter)
				}
			}
		}
	}

	function removeCreateEventEmitters(typesInput) {
		for (const nodeId in typesInput) {
			if (!types[nodeId]) continue

			for (const type of typesInput[nodeId]) {
				if (types[nodeId].includes(type)) {
					types[nodeId] = types[nodeId].filter(element => element !== type)

					createEventEmitter.removeListener(
						`${nodeId}_${type}`,
						handleCreateEventEmitter
					)
				}
			}

			if (Object.keys(types[nodeId]).length === 0) delete types[nodeId]
		}
	}

	ws.on('message', message => {
		try {
			const request = JSON.parse(message)

			const response = {
				type: 'WEBSOCKET_MEASUREMENTS_RX',
				payload: new Object()
			}

			if (request.type !== 'WEBSOCKET_MEASUREMENTS_TX') {
				response.payload.action = 'ERR_INVALID_TYPE'
			}

			switch (request.payload.action) {
			case 'ADD_SUBSCRIPTIONS': {
				addCreateEventEmitters(request.payload.types)
				response.payload.action = 'ADD_SUBSCRIPTIONS_FULFILLED'
				response.payload.types = types
				break
			}

			case 'REMOVE_SUBSCRIPTIONS': {
				removeCreateEventEmitters(request.payload.types)
				response.payload.action = 'REMOVE_SUBSCRIPTIONS_FULFILLED'
				response.payload.types = types
				break
			}

			default: {
				if (!response.payload.action)
					response.payload.action = 'ERR_INVALID_ACTION'
			}
			}

			ws.send(JSON.stringify(response))
		} catch (e) {
			ws.send(JSON.stringify(e))
		}
	})

	// Bind correct createEmitter-events to websocket
	// for (const nodeId of nodeIdsInput) {
	// 	for (const type of typesInput) {
	// 		addCreateEventEmitter(nodeId, type)
	// 	}
	// }

	ws.on('close', () => {
		// We should detach from createEventEmitter
		removeCreateEventEmitters(types)
	})
}
