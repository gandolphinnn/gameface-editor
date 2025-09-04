/** The one and only true model */
const Bind = {
	count: 0,
	increment: (value: number) => {
		Bind.count += value;
		Connector.updateModel();
	}
}

engine.whenReady.then(() => {
	Connector.createModel();
})

class Connector {
	static createModel() {
		engine.createJSModel('Bind', Bind);
		engine.synchronizeModels();
	}

	static updateModel() {
		engine.updateWholeModel(Bind);
		engine.synchronizeModels();
	}
}