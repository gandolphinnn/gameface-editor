export const model: EditorModel = {
	menu: [
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
	],
	viewport: [
		{
			id: 'viewport.showGrid',
			name: 'Show Grid',
			onClick: () => {
				console.log('Show Grid');
			},
		},
	],
	window: [],
}