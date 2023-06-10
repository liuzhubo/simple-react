import {
	appendInitialChild,
	Container,
	createInstance,
	createTextInstance
} from 'hostConfig';
import { FiberNode } from './fiber';
import { NoFlags } from './fiberFlags';
import {
	FunctionComponent,
	HostComponent,
	HostRoot,
	HostText
} from './workTag';

export const completeWork = (wip: FiberNode) => {
	// 归阶段
	const newProps = wip.pendingProps;
	const current = wip.alternate;

	switch (wip.tag) {
		case HostComponent:
			// 1 构建Dom
			// 2 把Dom插入Dom树中
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// mount
				// const instance = createInstance(wip.type, newProps);
				const instance = createInstance(wip.type);
				appendAllChildren(instance, wip);
				wip.stateNode = instance;
				bubbleProperties(wip);
			}
			return null;
		case HostText:
			if (current !== null && wip.stateNode) {
				// update
			} else {
				// mount
				const instance = createTextInstance(newProps.content);
				wip.stateNode = instance;
				bubbleProperties(wip);
			}
			return null;
		case HostRoot:
			bubbleProperties(wip);
			return null;
		case FunctionComponent:
			bubbleProperties(wip);
			return null;
		default:
			console.warn('未处理的边界情况', wip);
			break;
	}
};

function appendAllChildren(parent: Container, wip: FiberNode) {
	let node = wip.child;
	while (node !== null) {
		if (node.tag === HostComponent || node.tag === HostText) {
			appendInitialChild(parent, node?.stateNode);
		} else if (node.child !== null) {
			node.child.return = node;
			node = node.child;
			continue;
		}
		if (node === wip) {
			return;
		}
		while (node.sibling === null) {
			if (node.return === null || node.return === wip) {
				return;
			}
			node = node?.return;
		}
		node.sibling.return = node.return;
		node = node.sibling;
	}
}

function bubbleProperties(wip: FiberNode) {
	let subTreeFlags = NoFlags;
	let child = wip.child;
	while (child !== null) {
		subTreeFlags |= child.subTreeFlags;
		subTreeFlags |= child.flags;
		child.return = wip;
		child = child.sibling;
	}
	wip.subTreeFlags |= subTreeFlags;
}
