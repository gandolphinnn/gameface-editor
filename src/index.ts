import { Model } from "./components.js";
import { InnerHtmlHandler } from "./handlers/innerHtml.js";
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

	static registerBindingAttribute(name: string, HandlerClass: new () => IHandler<any>) {
		engine.registerBindingAttribute(name, HandlerClass);
	}
}

engine.whenReady.then(() => {
	Connector.createModel();
	Connector.registerBindingAttribute('inner-html', InnerHtmlHandler);
})