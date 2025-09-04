export class InnerHtmlHandler implements IHandler<string> {
	init(element: HTMLElement, value: string) {
		element.innerHTML = value;
	}

	update(element: HTMLElement, value: string) {
		element.innerHTML = value;
	}

	deinit(element: HTMLElement) {
		element.innerHTML = '';
	}
}