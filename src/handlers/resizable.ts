export type ResizableHandlerDirection = 'l' | 'r' | 't' | 'b';
export type ResizableHandlerParams =
`${ResizableHandlerDirection}` |
`${ResizableHandlerDirection}${ResizableHandlerDirection}` |
`${ResizableHandlerDirection}${ResizableHandlerDirection}${ResizableHandlerDirection}` |
`${ResizableHandlerDirection}${ResizableHandlerDirection}${ResizableHandlerDirection}${ResizableHandlerDirection}`;

export class ResizableHandler implements IHandler<string> {
	private hooks: HTMLElement[] = [];

	init(element: HTMLElement, params: string) {
		element.style.position = 'relative';
		const directions = params.split('') as ResizableHandlerDirection[];
		new Set(directions).forEach((dir) => {
			const hook = document.createElement('div');
			hook.className = `resize-hook-${dir}`;
			hook.addEventListener('mousedown', e => this.resizeStart(e, hook, dir));
			element.appendChild(hook);
			this.hooks.push(hook);
		});
	}
	
	update(element: HTMLElement, value: string) {
	}
	
	deinit() {
		this.hooks.forEach((hook) => {
			hook.remove();
		});
	}
	
	resizeStart(event: MouseEvent, hook: HTMLElement, direction: ResizableHandlerDirection) {
		hook.classList.add('selected');
		const styleField = (direction === 'l' || direction === 'r') ? 'width' : 'height';
		const eventField = (styleField === 'width') ? 'clientX' : 'clientY';
		const elementField = (styleField === 'width') ? 'offsetWidth' : 'offsetHeight';
		const getOffset = (start: number, end: number) => ('lt'.includes(direction) ? start - end : end - start);
		const start = event[eventField];
		const element = hook.parentElement;
		const initialSize = element[elementField];
		const mouseMove = (e: MouseEvent) => {
			const end = e[eventField];
			const offset = getOffset(start, end);
			element.style[styleField] = (initialSize + offset) + 'px';
		};
		const mouseOut = () => {
			document.removeEventListener("mousemove", mouseMove);
			document.removeEventListener("mouseup", mouseOut);
			hook.classList.remove('selected');
		};
		document.addEventListener("mousemove", mouseMove);
		document.addEventListener("mouseup", mouseOut);
	}
}