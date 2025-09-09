import { Connector } from "./index.js";
import { Tab, TabFactory } from "./components/tab.js";
import { BarSlot, IBarsData, IModel } from "./types/types.js";
import { ResizableHandlerParams } from "./handlers/resizable.js";

export class Model implements IModel {
	barsData: IBarsData;
	tabs: Tab[];
	activeTab: Record<BarSlot, Tab | null> = {
		left: null,
		right: null,
		bottom: null,
	};
	
	tabGroups: Record<BarSlot, Tab[]> = {
		left: [],
		right: [],
		bottom: [],
	};

	resizeBarParams: Record<BarSlot, ResizableHandlerParams> = {
		left: 'r',
		right: 'l',
		bottom: 't',
	};
	success: boolean
	
	constructor(data: IModel) {
		this.barsData = data.barsData;
		this.tabs = data.tabs.map(tab => TabFactory(tab));
		
		this.tabs.forEach(tab => {
			this.tabGroups[tab.slot].push(tab);
		});

		this.fetch();
	}

	async fetch() {
		try {
			const response = await fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
			const data = await response.json()
			console.log(data)
			this.success = true;
		} catch (error: any) {
			console.log(error)
			this.success = false;
		}
	}

	selectTab(slot: BarSlot, tab: Tab) {
		if (this.activeTab[slot] === tab) {
			tab = null;
		}

		this.activeTab[slot] = tab;
		Connector.updateModel('Editor');
	}
}