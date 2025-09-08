export class InnerHtmlHandler implements IHandler<string> {
	private oldHtml: string;

	init(element: HTMLElement, value: string) {
		this.oldHtml = element.innerHTML || '';
		element.innerHTML = value;
	}

	update(element: HTMLElement, value: string) {
		element.innerHTML = value;
	}

	deinit(element: HTMLElement) {
		element.innerHTML = this.oldHtml;
	}
}