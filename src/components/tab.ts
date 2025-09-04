import { BarSlot, ITab, TabId } from "../types/types.js";

export class Tab implements ITab {
	id: TabId;
	name: string;
	slot: BarSlot;
	order: number;

	constructor(data: ITab) {
		this.id = data.id;
		this.name = data.name || '';
		this.slot = data.slot || 'left';
		this.order = data.order || 99;
	}
	
	innerHtml = '';
}

export class AssetsTab extends Tab {
	name = 'Assets';
	innerHtml = `
		<div class="assets-tab">
			Assets
		</div>
	`;

	constructor(data: ITab) {
		super(data);
	}
}

export class DetailsTab extends Tab {
	name = 'Details';
	innerHtml = `
		<div class="details-tab">
			Details
		</div>
	`;

	constructor(data: ITab) {
		super(data);
	}
}

export class MarketplaceTab extends Tab {
	name = 'Marketplace';
	innerHtml = `
		<div class="marketplace-tab">
			Marketplace
		</div>
	`;

	constructor(data: ITab) {
		super(data);
	}
}

export class OutlinerTab extends Tab {
	name = 'Outliner';
	innerHtml = `
		<div class="outliner-tab">
			Outliner
		</div>
	`;

	constructor(data: ITab) {
		super(data);
	}
}

export function TabFactory(data: ITab) {
	switch (data.id) {
		case 'tab.assets':
			return new AssetsTab(data);
		case 'tab.details':
			return new DetailsTab(data);
		case 'tab.marketplace':
			return new MarketplaceTab(data);
		case 'tab.outliner':
			return new OutlinerTab(data);
		default:
			return new Tab(data);
	}
}