import { Props, Key, Ref, ReactElementType } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, WorkTag } from './workTag';
import { Flags, NoFlags } from './fiberFlags';
import { Container } from 'hostConfig';
import { UpdateQueue } from './updateQueue';
export class FiberNode {
	type: any;
	tag: WorkTag;
	key: Key;
	pendingProps: Props;
	memorizedProps: Props | null;
	memorizedState: any;
	stateNode: any;
	ref: Ref;
	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;
	alternate: FiberNode | null;
	flags: Flags;
	subTreeFlags: Flags;
	updateQueue: unknown;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例属性
		this.tag = tag;
		this.key = key;
		this.stateNode = null; // 真实Dom
		this.type = null; // fiberNode类型 eg FuncitonComponent : () => ()

		// 构成树状结构
		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;
		this.ref = null;

		// 作为工作单元
		this.pendingProps = pendingProps;
		this.memorizedProps = null;
		this.alternate = null;
		this.updateQueue = null;
		this.memorizedState = null;

		// 副作用
		this.flags = NoFlags;
		this.subTreeFlags = NoFlags;
	}
}

export class FiberRootNode {
	container: Container;
	current: FiberNode;
	finishedWork: FiberNode | null;
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	let wip = current.alternate;
	if (wip === null) {
		// mount
		wip = new FiberNode(current.tag, current.pendingProps, current.key);
		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update
		wip.pendingProps = pendingProps;
		wip.flags = NoFlags;
		wip.subTreeFlags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.child = current.child;
	wip.memorizedProps = current.memorizedProps;
	wip.memorizedState = current.memorizedState;

	return wip;
};

export function createFiberFromElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element;
	let fiberTag: WorkTag = FunctionComponent;
	if (typeof type === 'string') {
		fiberTag = HostComponent;
	} else if (typeof type !== 'function') {
		console.warn('未实现的tag', element);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
