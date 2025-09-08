export type TabId = 'tab.assets' | 'tab.details' | 'tab.marketplace' | 'tab.outliner';
export type Slot = 'start' | 'center' | 'end';
export type BarSlot = 'left' | 'right' | 'bottom';

export interface IComponent {
	id: string,
	name?: string,
	icon?: string,
	//visible?: boolean,
	order?: number,
}

export interface IButton extends IComponent {
	slot?: Slot,
	onClick?: Function,
}

/** Menus are on the top of the screen */
export interface IButtonGroup extends IButton {
	items: IButton[],
	//opened?: boolean,
}

export interface ITab extends IComponent {
	//headerButtons: IButton[],
	id: TabId,
	slot?: BarSlot,
}
export interface IBarData {
	size: number,
}

/** The data of the 3 bars */
export interface IBarsData extends Record<BarSlot, IBarData> {}

export interface IModel {
	barsData: IBarsData,
	//menu: IButtonGroup[],
	//viewport: IButton[],
	//tool: IButtonGroup[],
	tabs: ITab[],
}