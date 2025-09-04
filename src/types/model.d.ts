declare enum ESlot {
	Start = 'start',
	Center = 'center',
	End = 'end',
}

declare enum EBarSlot {
	Left = 'left',
	Right = 'right',
	Bottom = 'bottom',
}

declare interface IComponent {
	id: string,
	name?: string,
	//icon?: string,
	//visible?: boolean,
	slot?: ESlot,
	order?: number,
}

declare interface IButton extends IComponent {
	onClick?: Function,
}

/** Menus are on the top of the screen */
declare interface IButtonGroup extends IButton {
	items: IButton[],
	//opened?: boolean,
}

declare interface ITab extends IComponent {
	//headerButtons: IButton[],
	slot?: EBarSlot,
}
declare interface IBarData {
	size: number,
}

/** The data of the 3 bars */
declare interface IBarsData {
	[EBarSlot.Left]: IBarData,
	[EBarSlot.Right]: IBarData,
	[EBarSlot.Bottom]: IBarData,
}

declare interface IModel {
	barsData: IBarsData,
	//menu: IButtonGroup[],
	//viewport: IButton[],
	//tool: IButtonGroup[],
	tabs: ITab[],
}