import { Connector } from "./index.js";
import { Tab, TabFactory } from "./components/tab.js";
import { BarSlot, IBarsData, IModel } from "./types/types.js";
import { ResizeHandlerParams } from "./handlers/resizer.js";

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

	resizeBarParams: Record<BarSlot, string> = {
		left: JSON.stringify({ r: { min: 200 } }),
		right: JSON.stringify({ l: { min: 200 } }),
		bottom: JSON.stringify({ t: { min: 200 } }),
	};
	
	constructor(data: IModel) {
		this.barsData = data.barsData;
		this.tabs = data.tabs.map(tab => TabFactory(tab));
		
		this.tabs.forEach(tab => {
			this.tabGroups[tab.slot].push(tab);
		});
	}

	selectTab(slot: BarSlot, tab: Tab) {
		if (this.activeTab[slot] === tab) {
			tab = null;
		}

		this.activeTab[slot] = tab;
		Connector.updateModel('Editor');
	}
}