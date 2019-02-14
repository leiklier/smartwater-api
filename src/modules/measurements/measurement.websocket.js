import { createEventEmitter } from './measurement.model'
import { VALID_MEASUREMENTS } from './measurement.validations'

export function handleWebsocket(ws, req) {
	const typesInput = req.query.types
		? req.query.types.split(',')
		: VALID_MEASUREMENTS
	var types = new Array() // Holds types listened to at any moment

	function handleCreateEventEmitter(measurement) {
		ws.send(JSON.stringify(measurement))
	}
	function addCreateEventEmitter(type) {
		if (VALID_MEASUREMENTS.includes(type) && !types.includes(type)) {
			types.push(type)

			createEventEmitter.on(
				`${req.params.nodeId}_${type}`,
				handleCreateEventEmitter
			)
		}
	}
	function removeCreateEventEmitter(type) {
		if (types.includes(type)) {
			types = types.filter(element => element !== type)

			createEventEmitter.removeListener(
				`${req.params.nodeId}_${type}`,
				handleCreateEventEmitter
			)
		}
	}

	ws.on('message', msg => {
		if (/types/.test(msg)) {
			if (/^types\+=/.test(msg)) {
				for (const type of msg.substring(7).split(',')) {
					addCreateEventEmitter(type)
				}
			} else if (/^types-=/.test(msg)) {
				for (const type of msg.substring(7).split(',')) {
					removeCreateEventEmitter(type)
				}
			}
			ws.send(`types=${types.join(',')}`)
		} else {
			// No valid commands, echo for tunnel testing
			ws.send(msg)
		}
	})

	// Bind correct createEmitter-events to websocket
	for (const type of typesInput) {
		addCreateEventEmitter(type)
	}

	ws.on('close', () => {
		// We should detach from createEmitter
		for (const type of types) {
			removeCreateEventEmitter(type)
		}
	})
}
