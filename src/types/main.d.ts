/**
 * Interface representing the Gameface engine object
 */
interface GamefaceEngine {
	/**
	 * Register an event handler
	 * @param eventName - Name of the event to listen for
	 * @param callback - Function to call when the event occurs
	 */
	on(eventName: string, callback: (...args: any[]) => void): void;

	/**
	 * Call a function in the game engine
	 * @param functionName - Name of the function to call
	 * @param args - Arguments to pass to the function
	 */
	call(functionName: string, ...args: any[]): Promise<any>;

	/**
	 * Create a JavaScript model for data binding
	 * @param modelName - Name of the model to create
	 * @param data - Initial data for the model
	 */
	createJSModel(modelName: string, data: any): void;

	/**
	 * Synchronize all models with the UI
	 */
	synchronizeModels(): void;

	/**
	 * Update a model with new data
	 * @param modelName - Name of the model to update
	 * @param data - New data for the model
	 */
	updateWholeModel(modelName: string, data: any): void;

	/**
	 * Register a command that can be called from the game
	 * @param commandName - Name of the command
	 * @param handler - Function to handle the command
	 */
	registerCommand?(commandName: string, handler: (...args: any[]) => void): void;
}

// Global engine variable
declare const engine: GamefaceEngine | undefined;

// Extend Window interface to include the engine object and gamefaceBinding
declare global {
    interface Window {
        engine?: GamefaceEngine;
    }
}
interface Window {
	gamefaceBinding: GamefaceBinding;
}