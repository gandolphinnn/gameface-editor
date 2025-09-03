declare enum ESlot {
	Start,
	Center,
	End,
}

declare interface EditorObject {
	id: string,
	name?: string,
	icon?: string,
	visible?: boolean,
	slot?: ESlot,
	order?: number,
}

declare interface EditorButton extends EditorObject {
	onClick: Function,
}

/** Menus are on the top of the screen */
declare interface EditorMenu extends EditorObject {
	items: (EditorMenu | EditorButton | null)[],
	opened?: boolean,
}

declare interface EditorWindow extends EditorObject {
	headerButtons: EditorButton[],
	content: string,
	opened?: boolean,
}

declare interface EditorModel {
	menu: EditorMenu[],
	viewport: EditorButton[],
	window: EditorWindow[],
}