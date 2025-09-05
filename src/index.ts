import { Model } from "./components.js";
import { InnerHtmlHandler } from "./handlers/innerHtml.js";
import { modelData } from "./modelData.js";

/** The one and only true model */
const EditorModel = new Model(modelData);
/** @test Used to test the functionality of the 2-way bindings */
/* const DataModel = {
	count: 12,
	increment: (value: number) => {
		DataModel.count += value;
		Connector.updateModel('Data');
	}
} */

export class Connector {
	private static models: Map<string, any> = new Map();

	static createModel(modelName: string, model: any) {
		this.models.set(modelName, model);
		engine.createJSModel(modelName, model);
		engine.synchronizeModels();
	}

	static updateModel(modelName: string) {
		const model = this.models.get(modelName);
		engine.updateWholeModel(model);
		engine.synchronizeModels();
	}

	static registerBindingAttribute(name: string, HandlerClass: new () => IHandler<any>) {
		engine.registerBindingAttribute(name, HandlerClass);
	}
}

engine.whenReady.then(() => {
	Connector.createModel('Editor', EditorModel);
	//Connector.createModel('Data', DataModel);
	Connector.registerBindingAttribute('inner-html', InnerHtmlHandler);
})