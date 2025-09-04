import { EBarSlot, IBarsData, IModel, ITab } from "./types/types.js";

export class Tab implements ITab {
	id: string;
	name: string;
	slot: EBarSlot;
	order: number;

	constructor(data: ITab) {
		this.id = data.id;
		this.name = data.name || '';
		this.slot = data.slot || EBarSlot.Left;
		this.order = data.order || 99;
	}

	getHtml() {
		return `<div class="sidebar-${this.slot}" >${this.name}</div>`;
	}
}

export class Bar implements ITab {
	id: string;
	name: string;
	slot: EBarSlot;
	order: number;

	constructor(data: ITab) {
		this.id = data.id;
		this.name = data.name || '';
		this.slot = data.slot || EBarSlot.Left;
		this.order = data.order || 99;
	}

	getHtml() {
		return `<div class="sidebar-${this.slot}" >${this.name}</div>`;
	}
}

export class Model implements IModel {
	barsData: IBarsData;
	tabs: Bar[];

	/** @test */
	count = 12;

	constructor(data: IModel) {
		this.barsData = data.barsData;
		this.tabs = data.tabs.map(bar => new Bar(bar));
	}

	toHtml() {
		const editor = document.getElementById('editor');
		editor.innerHTML = this.tabs.map(bar => bar.getHtml()).join('');
		const barL = document.getElementById('sidebar-l');
		const barR = document.getElementById('sidebar-r');
		const barB = document.getElementById('sidebar-b');
		barL.style.width = `${this.barsData.left}%`;
		barR.style.width = `${this.barsData.right}%`;
		barB.style.height = `${this.barsData.bottom}%`;
	}
}