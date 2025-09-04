import { Connector } from "./index.js";
import { Tab, TabFactory } from "./components/tab.js";
import { BarSlot, IBarsData, IModel } from "./types/types.js";

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
	
	constructor(data: IModel) {
		this.barsData = data.barsData;
		this.tabs = data.tabs.map(tab => TabFactory(tab));
		
		this.tabs.forEach(tab => {
			this.tabGroups[tab.slot].push(tab);
		});
	}

	selectTab(slot: BarSlot, tab: Tab) {
		this.activeTab[slot] = tab;
		Connector.updateModel();
	}
	
	/** @test Used to test the functionality of the 2-way bindings */
	count = 12;
	/** @test Used to test the functionality of the 2-way bindings */
	increment(value: number) {
		this.count += value;
		Connector.updateModel();
	}
}