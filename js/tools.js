/**
 * Editor Tools System
 * Individual tool implementations for the editor
 */

// Base Tool Class
class EditorTool {
    constructor(name) {
        this.name = name;
        this.isActive = false;
        this.cursor = 'default';
    }

    activate() {
        this.isActive = true;
        document.body.style.cursor = this.cursor;
        this.onActivate();
    }

    deactivate() {
        this.isActive = false;
        document.body.style.cursor = 'default';
        this.onDeactivate();
    }

    onActivate() {
        // Override in subclasses
    }

    onDeactivate() {
        // Override in subclasses
    }

    onMouseMove(deltaX, deltaY) {
        // Override in subclasses
    }

    onMouseDown(x, y) {
        // Override in subclasses
    }

    onMouseUp(x, y) {
        // Override in subclasses
    }

    onKeyDown(event) {
        // Override in subclasses
    }
}

// Select Tool
class SelectTool extends EditorTool {
    constructor() {
        super('select');
        this.cursor = 'default';
        this.selectionBox = null;
        this.isBoxSelecting = false;
        this.startPos = null;
    }

    onActivate() {
        console.log('Select tool activated');
    }

    onMouseDown(x, y) {
        this.startPos = { x, y };
        this.isBoxSelecting = true;
    }

    onMouseMove(deltaX, deltaY) {
        if (this.isBoxSelecting && this.startPos) {
            // Update selection box visualization
            this.updateSelectionBox();
        }
    }

    onMouseUp(x, y) {
        if (this.isBoxSelecting) {
            this.finishBoxSelection(x, y);
        }
        this.isBoxSelecting = false;
        this.startPos = null;
    }

    updateSelectionBox() {
        // Visual feedback for box selection
        // In a real implementation, this would draw a selection rectangle
    }

    finishBoxSelection(endX, endY) {
        if (!this.startPos) return;

        const minX = Math.min(this.startPos.x, endX);
        const maxX = Math.max(this.startPos.x, endX);
        const minY = Math.min(this.startPos.y, endY);
        const maxY = Math.max(this.startPos.y, endY);

        // Find objects within selection box
        const selectedObjects = [];
        if (window.editorViewport) {
            for (const obj of window.editorViewport.objects) {
                const screenPos = window.editorViewport.worldToScreen(obj.position);
                if (screenPos.x >= minX && screenPos.x <= maxX &&
                    screenPos.y >= minY && screenPos.y <= maxY) {
                    selectedObjects.push(obj.id);
                }
            }
        }

        if (selectedObjects.length > 0) {
            window.editorCore.selectMultipleObjects(selectedObjects);
        }
    }
}

// Move Tool
class MoveTool extends EditorTool {
    constructor() {
        super('move');
        this.cursor = 'move';
        this.isDragging = false;
        this.dragAxis = null; // 'x', 'y', 'z', or null for free movement
    }

    onActivate() {
        console.log('Move tool activated');
    }

    onMouseMove(deltaX, deltaY) {
        if (!this.isDragging || !window.editorCore.selectedObjects.length) return;

        const sensitivity = 0.01;
        const selectedObjects = window.editorCore.selectedObjects;

        selectedObjects.forEach(objectId => {
            const obj = window.editorViewport.getObject(objectId);
            if (!obj) return;

            let deltaWorldX = 0;
            let deltaWorldY = 0;

            if (!this.dragAxis || this.dragAxis === 'x') {
                deltaWorldX = deltaX * sensitivity;
            }
            if (!this.dragAxis || this.dragAxis === 'y') {
                deltaWorldY = -deltaY * sensitivity; // Invert Y for screen coordinates
            }

            // Update object position
            obj.position.x += deltaWorldX;
            obj.position.y += deltaWorldY;

            // Update transform binding
            if (selectedObjects.length === 1) {
                window.gamefaceBinding.updateModel('editorModel.transform.position', obj.position);
            }
        });

        // Call game engine update
        window.gamefaceBinding.callGameFunction('UpdateObjectTransforms', selectedObjects);
    }

    onMouseDown(x, y) {
        if (window.editorCore.selectedObjects.length > 0) {
            this.isDragging = true;
            
            // Check if clicking on a specific axis gizmo
            this.dragAxis = this.getAxisFromGizmo(x, y);
        }
    }

    onMouseUp(x, y) {
        if (this.isDragging) {
            this.isDragging = false;
            this.dragAxis = null;
            
            // Add to history
            window.editorCore.addToHistory('Move Objects', () => {
                // Undo move operation
                console.log('Undo move operation');
            });
        }
    }

    getAxisFromGizmo(x, y) {
        // Determine which axis gizmo was clicked
        // This would be more sophisticated in a real implementation
        return null; // Free movement for now
    }

    onKeyDown(event) {
        // Constrain movement to specific axes
        switch (event.key.toLowerCase()) {
            case 'x':
                this.dragAxis = 'x';
                break;
            case 'y':
                this.dragAxis = 'y';
                break;
            case 'z':
                this.dragAxis = 'z';
                break;
            case 'shift':
                // Snap to grid
                break;
        }
    }
}

// Rotate Tool
class RotateTool extends EditorTool {
    constructor() {
        super('rotate');
        this.cursor = 'crosshair';
        this.isRotating = false;
        this.rotationAxis = null;
        this.startAngle = 0;
    }

    onActivate() {
        console.log('Rotate tool activated');
    }

    onMouseMove(deltaX, deltaY) {
        if (!this.isRotating || !window.editorCore.selectedObjects.length) return;

        const sensitivity = 0.01;
        const rotationDelta = deltaX * sensitivity; // Use horizontal movement for rotation

        const selectedObjects = window.editorCore.selectedObjects;

        selectedObjects.forEach(objectId => {
            const obj = window.editorViewport.getObject(objectId);
            if (!obj) return;

            // Initialize rotation if not present
            if (!obj.rotation) {
                obj.rotation = { x: 0, y: 0, z: 0 };
            }

            // Apply rotation based on axis
            switch (this.rotationAxis) {
                case 'x':
                    obj.rotation.x += rotationDelta;
                    break;
                case 'y':
                    obj.rotation.y += rotationDelta;
                    break;
                case 'z':
                    obj.rotation.z += rotationDelta;
                    break;
                default:
                    obj.rotation.y += rotationDelta; // Default to Y-axis
            }

            // Update transform binding
            if (selectedObjects.length === 1) {
                window.gamefaceBinding.updateModel('editorModel.transform.rotation', obj.rotation);
            }
        });

        // Call game engine update
        window.gamefaceBinding.callGameFunction('UpdateObjectTransforms', selectedObjects);
    }

    onMouseDown(x, y) {
        if (window.editorCore.selectedObjects.length > 0) {
            this.isRotating = true;
            this.rotationAxis = this.getRotationAxis(x, y);
        }
    }

    onMouseUp(x, y) {
        if (this.isRotating) {
            this.isRotating = false;
            this.rotationAxis = null;
            
            // Add to history
            window.editorCore.addToHistory('Rotate Objects', () => {
                console.log('Undo rotate operation');
            });
        }
    }

    getRotationAxis(x, y) {
        // Determine rotation axis from gizmo interaction
        return 'y'; // Default to Y-axis
    }

    onKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'x':
                this.rotationAxis = 'x';
                break;
            case 'y':
                this.rotationAxis = 'y';
                break;
            case 'z':
                this.rotationAxis = 'z';
                break;
        }
    }
}

// Scale Tool
class ScaleTool extends EditorTool {
    constructor() {
        super('scale');
        this.cursor = 'nw-resize';
        this.isScaling = false;
        this.scaleAxis = null;
        this.uniformScale = true;
    }

    onActivate() {
        console.log('Scale tool activated');
    }

    onMouseMove(deltaX, deltaY) {
        if (!this.isScaling || !window.editorCore.selectedObjects.length) return;

        const sensitivity = 0.01;
        const scaleDelta = deltaX * sensitivity;

        const selectedObjects = window.editorCore.selectedObjects;

        selectedObjects.forEach(objectId => {
            const obj = window.editorViewport.getObject(objectId);
            if (!obj) return;

            // Initialize scale if not present
            if (!obj.scale) {
                obj.scale = { x: 1, y: 1, z: 1 };
            }

            if (this.uniformScale) {
                // Uniform scaling
                const newScale = Math.max(0.1, obj.scale.x + scaleDelta);
                obj.scale.x = obj.scale.y = obj.scale.z = newScale;
            } else {
                // Axis-specific scaling
                switch (this.scaleAxis) {
                    case 'x':
                        obj.scale.x = Math.max(0.1, obj.scale.x + scaleDelta);
                        break;
                    case 'y':
                        obj.scale.y = Math.max(0.1, obj.scale.y + scaleDelta);
                        break;
                    case 'z':
                        obj.scale.z = Math.max(0.1, obj.scale.z + scaleDelta);
                        break;
                }
            }

            // Update transform binding
            if (selectedObjects.length === 1) {
                window.gamefaceBinding.updateModel('editorModel.transform.scale', obj.scale);
            }
        });

        // Call game engine update
        window.gamefaceBinding.callGameFunction('UpdateObjectTransforms', selectedObjects);
    }

    onMouseDown(x, y) {
        if (window.editorCore.selectedObjects.length > 0) {
            this.isScaling = true;
            this.scaleAxis = this.getScaleAxis(x, y);
        }
    }

    onMouseUp(x, y) {
        if (this.isScaling) {
            this.isScaling = false;
            this.scaleAxis = null;
            
            // Add to history
            window.editorCore.addToHistory('Scale Objects', () => {
                console.log('Undo scale operation');
            });
        }
    }

    getScaleAxis(x, y) {
        // Determine scale axis from handle interaction
        return null; // Uniform scaling by default
    }

    onKeyDown(event) {
        switch (event.key.toLowerCase()) {
            case 'x':
                this.scaleAxis = 'x';
                this.uniformScale = false;
                break;
            case 'y':
                this.scaleAxis = 'y';
                this.uniformScale = false;
                break;
            case 'z':
                this.scaleAxis = 'z';
                this.uniformScale = false;
                break;
            case 'shift':
                this.uniformScale = true;
                this.scaleAxis = null;
                break;
        }
    }
}

// Brush Tool
class BrushTool extends EditorTool {
    constructor() {
        super('brush');
        this.cursor = 'crosshair';
        this.brushSize = 10;
        this.brushOpacity = 1.0;
        this.brushColor = '#ffffff';
        this.isPainting = false;
    }

    onActivate() {
        console.log('Brush tool activated');
        this.showBrushSettings();
    }

    onDeactivate() {
        this.hideBrushSettings();
    }

    showBrushSettings() {
        // Show brush-specific UI controls
        const toolbar = document.querySelector('.toolbar');
        if (toolbar && !document.getElementById('brush-controls')) {
            const brushControls = document.createElement('div');
            brushControls.id = 'brush-controls';
            brushControls.className = 'tool-group';
            brushControls.innerHTML = `
                <label>Size: <input type="range" id="brush-size" min="1" max="50" value="${this.brushSize}"></label>
                <label>Opacity: <input type="range" id="brush-opacity" min="0" max="1" step="0.1" value="${this.brushOpacity}"></label>
                <input type="color" id="brush-color" value="${this.brushColor}">
            `;
            toolbar.appendChild(brushControls);

            // Add event listeners
            document.getElementById('brush-size').addEventListener('input', (e) => {
                this.brushSize = parseInt(e.target.value);
                window.gamefaceBinding.updateModel('editorModel.tools.brushSize', this.brushSize);
            });

            document.getElementById('brush-opacity').addEventListener('input', (e) => {
                this.brushOpacity = parseFloat(e.target.value);
                window.gamefaceBinding.updateModel('editorModel.tools.brushOpacity', this.brushOpacity);
            });

            document.getElementById('brush-color').addEventListener('change', (e) => {
                this.brushColor = e.target.value;
            });
        }
    }

    hideBrushSettings() {
        const brushControls = document.getElementById('brush-controls');
        if (brushControls) {
            brushControls.remove();
        }
    }

    onMouseMove(deltaX, deltaY) {
        if (this.isPainting) {
            this.paint(deltaX, deltaY);
        }
    }

    onMouseDown(x, y) {
        this.isPainting = true;
        this.paint(0, 0); // Paint at initial position
    }

    onMouseUp(x, y) {
        if (this.isPainting) {
            this.isPainting = false;
            
            // Add to history
            window.editorCore.addToHistory('Paint Stroke', () => {
                console.log('Undo paint stroke');
            });
        }
    }

    paint(deltaX, deltaY) {
        // Apply brush effect
        const brushData = {
            size: this.brushSize,
            opacity: this.brushOpacity,
            color: this.brushColor,
            deltaX: deltaX,
            deltaY: deltaY
        };

        // Call game engine paint function
        window.gamefaceBinding.callGameFunction('ApplyBrush', brushData);
        
        console.log('Painting with brush:', brushData);
    }
}

// Eraser Tool
class EraserTool extends EditorTool {
    constructor() {
        super('eraser');
        this.cursor = 'crosshair';
        this.eraserSize = 15;
        this.isErasing = false;
    }

    onActivate() {
        console.log('Eraser tool activated');
        this.showEraserSettings();
    }

    onDeactivate() {
        this.hideEraserSettings();
    }

    showEraserSettings() {
        const toolbar = document.querySelector('.toolbar');
        if (toolbar && !document.getElementById('eraser-controls')) {
            const eraserControls = document.createElement('div');
            eraserControls.id = 'eraser-controls';
            eraserControls.className = 'tool-group';
            eraserControls.innerHTML = `
                <label>Size: <input type="range" id="eraser-size" min="5" max="100" value="${this.eraserSize}"></label>
            `;
            toolbar.appendChild(eraserControls);

            document.getElementById('eraser-size').addEventListener('input', (e) => {
                this.eraserSize = parseInt(e.target.value);
            });
        }
    }

    hideEraserSettings() {
        const eraserControls = document.getElementById('eraser-controls');
        if (eraserControls) {
            eraserControls.remove();
        }
    }

    onMouseMove(deltaX, deltaY) {
        if (this.isErasing) {
            this.erase(deltaX, deltaY);
        }
    }

    onMouseDown(x, y) {
        this.isErasing = true;
        this.erase(0, 0);
    }

    onMouseUp(x, y) {
        if (this.isErasing) {
            this.isErasing = false;
            
            // Add to history
            window.editorCore.addToHistory('Erase Stroke', () => {
                console.log('Undo erase stroke');
            });
        }
    }

    erase(deltaX, deltaY) {
        const eraserData = {
            size: this.eraserSize,
            deltaX: deltaX,
            deltaY: deltaY
        };

        // Call game engine erase function
        window.gamefaceBinding.callGameFunction('ApplyEraser', eraserData);
        
        console.log('Erasing with eraser:', eraserData);
    }
}

// Export tools for global access
window.EditorTool = EditorTool;
window.SelectTool = SelectTool;
window.MoveTool = MoveTool;
window.RotateTool = RotateTool;
window.ScaleTool = ScaleTool;
window.BrushTool = BrushTool;
window.EraserTool = EraserTool;
