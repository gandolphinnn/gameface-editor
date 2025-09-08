export type ResizeHandlerDirection = 'l' | 'r' | 't' | 'b';
export type ResizeHandlerParams = { [key in ResizeHandlerDirection]?: { min?: number; max?: number } };

export class ResizeHandler implements IHandler<string> {
	private readonly hook = `<div class="resize-hook-$1" onmousedown="ResizeHandler.resizeStart(event, $2)"></div>`;

	init(element: HTMLElement, value: string) {
		console.log('@471863:', element, value);
		Object.entries(JSON.parse(value)).forEach(([key, value]) => {
			element.innerHTML += this.hook.replace('$1', key).replace('$2', JSON.stringify(value));
		});
	}

	update(element: HTMLElement, value: string) {
		console.log('@471863:', element, value);
	}

	deinit(element: HTMLElement) {
		element.querySelectorAll('.resize-hook').forEach((hook) => {
			hook.remove();
		});
	}

	static resizeStart(event: MouseEvent, params: string) {
		console.log('resizeStart', event, params);
		const startX = event.clientX;
		const startY = event.clientY;
		document.addEventListener("mousemove", this.resize.bind(startX, startY));
		document.addEventListener("mouseup", this.resizeEnd.bind(startX, startY));
	}

	static resize(startX: number, startY: number, event: MouseEvent) {
		console.log('resize', startX, startY, event);
		const element = event.currentTarget as HTMLElement;
		const rect = element.getBoundingClientRect();
		const width = event.clientX - rect.left;
		const height = event.clientY - rect.top;
		element.style.width = width + "px";
		element.style.height = height + "px";
	}

	static resizeEnd(startX: number, startY: number) {
		console.log('resizeEnd', startX, startY);
		document.removeEventListener('mousemove', this.resize.bind(startX, startY));
		document.removeEventListener('mouseup', this.resizeEnd.bind(startX, startY));
	}
}