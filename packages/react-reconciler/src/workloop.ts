import { beginWork } from './beginWort';
import { commitMutationEffects } from './commitWork';
import { completeWork } from './completeWork';
import { createWorkInProgress, FiberNode, FiberRootNode } from './fiber';
import { MustationMask, NoFlags } from './fiberFlags';
import { HostRoot } from './workTag';

let workInProgress: FiberNode | null = null; // 当前工作的FiberNode

function prepareRefreshStack(root: FiberRootNode) {
	// 将workInProgress 指向需要遍历的第一个FiberNode
	workInProgress = createWorkInProgress(root.current, {});
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// 调度功能
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = node.return;
	while (parent) {
		node = parent;
		parent = node.return;
	}
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

function renderRoot(root: FiberRootNode) {
	// 初始化
	prepareRefreshStack(root);
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			console.log(`Error: workLoop发生错误`);
			workInProgress = null;
		}
	} while (true);

	const finishedWork = root.current.alternate;
	root.finishedWork = finishedWork;

	commitRoot(root);
}

function commitRoot(root: FiberRootNode) {
	const finishedWork = root.finishedWork;
	if (finishedWork === null) {
		return;
	}
	console.log('commit阶段begin', finishedWork);
	// 重置
	root.finishedWork = null;
	const subtreeHasEffect =
		(finishedWork.subTreeFlags & MustationMask) !== NoFlags;
	const rootHasEffect = (finishedWork.flags & MustationMask) !== NoFlags;
	if (subtreeHasEffect || rootHasEffect) {
		// beforeMutation
		// mutation
		commitMutationEffects(finishedWork);
		root.current = finishedWork;
		// layout
	} else {
		root.current = finishedWork;
	}
}

function workLoop() {
	while (workInProgress) {
		performUnitWork(workInProgress);
	}
}

function performUnitWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memorizedProps = fiber.pendingProps;
	if (next === null) {
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;
	do {
		completeWork(node);
		const sibling = fiber.sibling;
		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		node = node.return;
	} while (node !== null);
}
