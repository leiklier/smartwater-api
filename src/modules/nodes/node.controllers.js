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
		return res.status(HTTPStatus.OK).json(nodes)
	} catch (e) {
		return res.status(HTTPStatus.BAD_REQUEST).json(e)
	}
}
