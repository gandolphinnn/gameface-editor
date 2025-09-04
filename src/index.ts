import { Model } from "./components.js";
import { modelData } from "./modelData.js";

/** The one and only true model */
const Bind = new Model(modelData);

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

engine.whenReady.then(() => {
	Connector.createModel();
})