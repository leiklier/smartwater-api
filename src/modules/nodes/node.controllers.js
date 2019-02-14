import HTTPStatus from 'http-status'

import Node from './node.model'

export async function getNodes(req, res) {
	const { nodeId } = { ...req.params }

	var nodes
	try {
		if (nodeId) {
			nodes = await Node.getOneNode(nodeId)
		} else {
			nodes = await Node.getAllNodes()
		}
		var result = new Object() // Sparce array where index=nodeId
		for (const node of nodes) {
			result[node.nodeId] = {
				name: node.name,
				settings: node.settings
			}
		}
		return res.status(HTTPStatus.OK).json(result)
	} catch (e) {
		return res.status(HTTPStatus.BAD_REQUEST).json(e)
	}
}
