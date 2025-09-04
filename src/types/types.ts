export enum ESlot {
	Start = 'start',
	Center = 'center',
	End = 'end',
}

export enum EBarSlot {
	Left = 'left',
	Right = 'right',
	Bottom = 'bottom',
}

export interface IComponent {
	id: string,
	name?: string,
	//icon?: string,
	//visible?: boolean,
	order?: number,
}

export interface IButton extends IComponent {
	slot?: ESlot,
	onClick?: Function,
}

/** Menus are on the top of the screen */
export interface IButtonGroup extends IButton {
	items: IButton[],
	//opened?: boolean,
}

export interface ITab extends IComponent {
	//headerButtons: IButton[],
	slot?: EBarSlot,
}
export interface IBarData {
	size: number,
}

/** The data of the 3 bars */
export interface IBarsData {
	[EBarSlot.Left]: IBarData,
	[EBarSlot.Right]: IBarData,
	[EBarSlot.Bottom]: IBarData,
}

export interface IModel {
	barsData: IBarsData,
	//menu: IButtonGroup[],
	//viewport: IButton[],
	//tool: IButtonGroup[],
	tabs: ITab[],
}