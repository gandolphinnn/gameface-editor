import { Model } from "./components.js";
import { modelData } from "./model.js";

const _model = new Model(modelData);

/** The one and only true model */
export const Bind = {
	count: _model.count,
	increment: (value: number) => {
		Bind.count += value;
		Connector.updateModel();
	}
}

engine.whenReady.then(() => {
	Connector.createModel();
})


export class Connector {
	static createModel() {
		engine.createJSModel('Bind', Bind);
		engine.synchronizeModels();
	}

	static updateModel() {
		engine.updateWholeModel(Bind);
		engine.synchronizeModels();
	}
}