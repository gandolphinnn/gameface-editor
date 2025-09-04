import { EBarSlot, IModel } from "./types/types.js";

export const modelData: IModel = {
	barsData: {
		[EBarSlot.Left]: { size: 20 },
		[EBarSlot.Right]: { size: 20 },
		[EBarSlot.Bottom]: { size: 20 },
	},
	tabs: [
		{
			id: 'tab.outliner',
			name: 'Outliner',
			slot: EBarSlot.Left,
			order: 1,
		},
		{
			id: 'tab.git',
			name: 'Git',
			slot: EBarSlot.Left,
			order: 2,
		},
		{
			id: 'tab.details',
			name: 'Details',
			slot: EBarSlot.Right,
			order: 1,
		},
		{
			id: 'tab.terminal',
			name: 'Terminal',
			slot: EBarSlot.Bottom,
			order: 1,
		},
	]
	/* menu: [
		{
			id: 'menu.file',
			name: 'File',
			items: [
				{
					id: 'menu.file.new',
					name: 'New',
					onClick: () => {
						console.log('New');
					},
				},
			],
			slot: ESlot.Start,
			order: 1,
		},
		{
			id: 'menu.edit',
			name: 'Edit',
			items: [
				{
					id: 'menu.edit.undo',
					name: 'Undo',
					onClick: () => {
						console.log('Undo');
					},
				},
			],
			slot: ESlot.Start,
			order: 2,
		},
		{
			id: 'menu.view',
			name: 'View',
			items: [
				{
					id: 'menu.view.contentDrawer',
					name: 'Content drawer',
					onClick: () => {
						console.log('Content drawer');
					},
				},
				{
					id: 'menu.view.viewport',
					name: 'Viewport',
					items: [
						{
							id: 'menu.view.viewport.split',
							name: 'Split',
							onClick: () => {
								console.log('Split');
							},
						},
					]
				},
			],
			slot: ESlot.Start,
			order: 3,
		},
		{
			id: 'menu.help',
			name: 'Help',
			items: [
				{
					id: 'menu.help.about',
					name: 'About',
					onClick: () => {
						console.log('About');
					},
				},
			],
			slot: ESlot.End,
			order: 1,
		},
	],
	tool: [],
	bars: [],
	viewport: [
		{
			id: 'viewport.showGrid',
			name: 'Show Grid',
			onClick: () => {
				console.log('Show Grid');
			},
		},
	], */
}