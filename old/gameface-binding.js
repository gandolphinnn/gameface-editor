/**
 * Gameface Data Binding System
 * Handles communication between the UI and game engine
 */

class GamefaceBinding {
    constructor() {
        this.bindings = new Map();
        this.models = new Map();
        this.eventHandlers = new Map();
        this.isGamefaceEnvironment = typeof engine !== 'undefined';
        
        this.initializeBinding();
    }

    initializeBinding() {
        // Initialize data binding for Gameface
        if (this.isGamefaceEnvironment) {
            // Gameface specific initialization
            engine.on('ready', () => {
                this.setupGamefaceBindings();
            });
        } else {
            // Fallback for browser testing
            this.setupMockBindings();
        }

        // Set up automatic binding for elements with data-binding attributes
        this.setupAutomaticBinding();
    }

    setupGamefaceBindings() {
        // Register models with Gameface
        engine.createJSModel('editorModel', {
            transform: {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            },
            material: {
                albedo: '#ffffff',
                metallic: 0,
                roughness: 0.5
            },
            selection: {
                selectedObject: null,
                selectedObjects: []
            },
            viewport: {
                camera: 'perspective',
                showGrid: true,
                fps: 60,
                objectCount: 0
            },
            tools: {
                activeTool: 'select',
                brushSize: 10,
                brushOpacity: 1
            }
        });

        // Set up synchronization
        engine.synchronizeModels();
    }

    setupMockBindings() {
        // Mock data for browser testing
        this.models.set('editorModel', {
            transform: {
                position: { x: 0, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 1, y: 1, z: 1 }
            },
            material: {
                albedo: '#ffffff',
                metallic: 0,
                roughness: 0.5
            },
            selection: {
                selectedObject: null,
                selectedObjects: []
            },
            viewport: {
                camera: 'perspective',
                showGrid: true,
                fps: 60,
                objectCount: 0
            },
            tools: {
                activeTool: 'select',
                brushSize: 10,
                brushOpacity: 1
            }
        });
    }

    setupAutomaticBinding() {
        // Find all elements with data-binding attributes
        const bindingElements = document.querySelectorAll('[data-binding]');
        
        bindingElements.forEach(element => {
            const bindingPath = element.getAttribute('data-binding');
            this.bindElement(element, bindingPath);
        });
    }

    bindElement(element, bindingPath) {
        // Store binding information
        this.bindings.set(element, bindingPath);

        // Set up event listeners based on element type
        const eventType = this.getEventTypeForElement(element);
        
        element.addEventListener(eventType, (event) => {
            this.updateModel(bindingPath, this.getValueFromElement(element));
        });

        // Initial value sync
        const initialValue = this.getModelValue(bindingPath);
        if (initialValue !== undefined) {
            this.setElementValue(element, initialValue);
        }
    }

    getEventTypeForElement(element) {
        const tagName = element.tagName.toLowerCase();
        const type = element.type;

        if (tagName === 'input') {
            if (type === 'range' || type === 'number') {
                return 'input';
            } else if (type === 'checkbox') {
                return 'change';
            } else if (type === 'color') {
                return 'change';
            }
            return 'input';
        } else if (tagName === 'select') {
            return 'change';
        }
        
        return 'input';
    }

    getValueFromElement(element) {
        const tagName = element.tagName.toLowerCase();
        const type = element.type;

        if (tagName === 'input') {
            if (type === 'checkbox') {
                return element.checked;
            } else if (type === 'number' || type === 'range') {
                return parseFloat(element.value) || 0;
            }
            return element.value;
        } else if (tagName === 'select') {
            return element.value;
        }
        
        return element.textContent;
    }

    setElementValue(element, value) {
        const tagName = element.tagName.toLowerCase();
        const type = element.type;

        if (tagName === 'input') {
            if (type === 'checkbox') {
                element.checked = Boolean(value);
            } else {
                element.value = value;
            }
        } else if (tagName === 'select') {
            element.value = value;
        } else {
            element.textContent = value;
        }
    }

    updateModel(path, value) {
        const pathParts = path.split('.');
        const modelName = pathParts[0];
        const propertyPath = pathParts.slice(1);

        if (this.isGamefaceEnvironment) {
            // Update Gameface model
            const updatePath = propertyPath.join('.');
            engine.updateWholeModel(modelName, this.setNestedProperty(
                this.models.get(modelName) || {}, 
                propertyPath, 
                value
            ));
            engine.synchronizeModels();
        } else {
            // Update local model
            const model = this.models.get(modelName) || {};
            this.setNestedProperty(model, propertyPath, value);
            this.models.set(modelName, model);
        }

        // Trigger change event
        this.triggerModelChange(path, value);
    }

    getModelValue(path) {
        const pathParts = path.split('.');
        const modelName = pathParts[0];
        const propertyPath = pathParts.slice(1);

        const model = this.models.get(modelName);
        if (!model) return undefined;

        return this.getNestedProperty(model, propertyPath);
    }

    setNestedProperty(obj, path, value) {
        const result = { ...obj };
        let current = result;
        
        for (let i = 0; i < path.length - 1; i++) {
            const key = path[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            } else {
                current[key] = { ...current[key] };
            }
            current = current[key];
        }
        
        current[path[path.length - 1]] = value;
        return result;
    }

    getNestedProperty(obj, path) {
        let current = obj;
        for (const key of path) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return undefined;
            }
        }
        return current;
    }

    // Event system for model changes
    onModelChange(path, callback) {
        if (!this.eventHandlers.has(path)) {
            this.eventHandlers.set(path, []);
        }
        this.eventHandlers.get(path).push(callback);
    }

    triggerModelChange(path, value) {
        // Trigger specific path handlers
        if (this.eventHandlers.has(path)) {
            this.eventHandlers.get(path).forEach(callback => {
                callback(value, path);
            });
        }

        // Trigger wildcard handlers
        const pathParts = path.split('.');
        for (let i = 1; i <= pathParts.length; i++) {
            const partialPath = pathParts.slice(0, i).join('.') + '.*';
            if (this.eventHandlers.has(partialPath)) {
                this.eventHandlers.get(partialPath).forEach(callback => {
                    callback(value, path);
                });
            }
        }
    }

    // Game engine communication methods
    callGameFunction(functionName, ...args) {
        if (this.isGamefaceEnvironment) {
            return engine.call(functionName, ...args);
        } else {
            console.log(`Mock call: ${functionName}(${args.join(', ')})`);
            return Promise.resolve();
        }
    }

    registerGameEvent(eventName, callback) {
        if (this.isGamefaceEnvironment) {
            engine.on(eventName, callback);
        } else {
            // Mock event registration
            console.log(`Mock event registration: ${eventName}`);
        }
    }

    // Utility methods for common operations
    selectObject(objectId) {
        this.updateModel('editorModel.selection.selectedObject', objectId);
        this.callGameFunction('SelectObject', objectId);
    }

    updateTransform(transform) {
        this.updateModel('editorModel.transform', transform);
        this.callGameFunction('UpdateTransform', transform);
    }

    setActiveTool(toolName) {
        this.updateModel('editorModel.tools.activeTool', toolName);
        this.callGameFunction('SetActiveTool', toolName);
    }

    // Synchronize all bindings
    synchronizeAll() {
        this.bindings.forEach((bindingPath, element) => {
            const value = this.getModelValue(bindingPath);
            if (value !== undefined) {
                this.setElementValue(element, value);
            }
        });

        if (this.isGamefaceEnvironment) {
            engine.synchronizeModels();
        }
    }
}

// Global instance
window.gamefaceBinding = new GamefaceBinding();