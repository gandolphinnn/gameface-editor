/**
 * Editor Core System
 * Main editor functionality and state management
 */

class EditorCore {
    constructor() {
        this.selectedObjects = [];
        this.clipboard = [];
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this.isInitialized = false;
        
        this.tools = {
            select: new SelectTool(),
            move: new MoveTool(),
            rotate: new RotateTool(),
            scale: new ScaleTool(),
            brush: new BrushTool(),
            eraser: new EraserTool()
        };
        
        this.activeTool = this.tools.select;
        this.scene = new EditorScene();
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.initializeScene();
        this.loadAssets();
        this.isInitialized = true;
        
        console.log('Editor Core initialized');
        this.logMessage('Editor initialized successfully', 'info');
    }

    setupEventListeners() {
        // Tool selection
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const toolName = e.currentTarget.dataset.tool;
                if (toolName === 'undo') {
                    this.undo();
                } else if (toolName === 'redo') {
                    this.redo();
                } else if (this.tools[toolName]) {
                    this.setActiveTool(toolName);
                }
            });
        });

        // Menu actions
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const menuType = e.currentTarget.dataset.menu;
                this.showMenu(menuType);
            });
        });

        // Viewport controls
        document.querySelectorAll('.viewport-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const viewType = e.currentTarget.dataset.view;
                this.setViewportMode(viewType);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcut(e);
        });

        // Context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY);
        });

        // Hide context menu on click
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });

        // Panel toggles
        document.querySelectorAll('.panel-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.togglePanel(e.currentTarget.closest('.panel'));
            });
        });

        // Console command execution
        const consoleExecute = document.getElementById('console-execute');
        const consoleCommand = document.getElementById('console-command');
        
        if (consoleExecute && consoleCommand) {
            consoleExecute.addEventListener('click', () => {
                this.executeConsoleCommand(consoleCommand.value);
                consoleCommand.value = '';
            });
            
            consoleCommand.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.executeConsoleCommand(consoleCommand.value);
                    consoleCommand.value = '';
                }
            });
        }
    }

    setActiveTool(toolName) {
        if (!this.tools[toolName]) return;

        // Deactivate current tool
        if (this.activeTool) {
            this.activeTool.deactivate();
        }

        // Update UI
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const toolBtn = document.querySelector(`[data-tool="${toolName}"]`);
        if (toolBtn) {
            toolBtn.classList.add('active');
        }

        // Activate new tool
        this.activeTool = this.tools[toolName];
        this.activeTool.activate();

        // Update binding
        window.gamefaceBinding.setActiveTool(toolName);
        
        this.updateStatusMessage(`${toolName.charAt(0).toUpperCase() + toolName.slice(1)} tool selected`);
    }

    initializeScene() {
        this.scene.initialize();
        this.updateSceneInfo();
    }

    loadAssets() {
        // Mock asset loading
        const assetGrid = document.getElementById('asset-grid');
        if (!assetGrid) return;

        const mockAssets = [
            { name: 'Cube', type: 'model', icon: '📦' },
            { name: 'Sphere', type: 'model', icon: '🔵' },
            { name: 'Cylinder', type: 'model', icon: '🥫' },
            { name: 'Plane', type: 'model', icon: '⬜' },
            { name: 'Light', type: 'light', icon: '💡' },
            { name: 'Camera', type: 'camera', icon: '📷' }
        ];

        assetGrid.innerHTML = '';
        mockAssets.forEach(asset => {
            const assetElement = document.createElement('div');
            assetElement.className = 'asset-item';
            assetElement.innerHTML = `
                <div class="asset-icon">${asset.icon}</div>
                <div class="asset-name">${asset.name}</div>
            `;
            assetElement.addEventListener('click', () => this.selectAsset(asset));
            assetElement.addEventListener('dblclick', () => this.addAssetToScene(asset));
            assetGrid.appendChild(assetElement);
        });
    }

    selectAsset(asset) {
        document.querySelectorAll('.asset-item').forEach(item => {
            item.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        this.updateStatusMessage(`Asset selected: ${asset.name}`);
    }

    addAssetToScene(asset) {
        const object = this.scene.addObject(asset);
        this.addToHistory('Add Object', () => {
            this.scene.removeObject(object.id);
        });
        this.updateSceneInfo();
        this.logMessage(`Added ${asset.name} to scene`, 'info');
    }

    selectObject(objectId) {
        this.selectedObjects = [objectId];
        this.scene.selectObject(objectId);
        window.gamefaceBinding.selectObject(objectId);
        this.updatePropertiesPanel();
        this.updateSelectionInfo();
    }

    selectMultipleObjects(objectIds) {
        this.selectedObjects = objectIds;
        this.scene.selectMultipleObjects(objectIds);
        this.updatePropertiesPanel();
        this.updateSelectionInfo();
    }

    deleteSelectedObjects() {
        if (this.selectedObjects.length === 0) return;

        const deletedObjects = this.selectedObjects.map(id => 
            this.scene.getObject(id)
        );

        this.selectedObjects.forEach(id => {
            this.scene.removeObject(id);
        });

        this.addToHistory('Delete Objects', () => {
            deletedObjects.forEach(obj => {
                this.scene.addObject(obj);
            });
        });

        this.selectedObjects = [];
        this.updatePropertiesPanel();
        this.updateSelectionInfo();
        this.updateSceneInfo();
    }

    duplicateSelectedObjects() {
        if (this.selectedObjects.length === 0) return;

        const newObjects = [];
        this.selectedObjects.forEach(id => {
            const original = this.scene.getObject(id);
            const duplicate = this.scene.duplicateObject(original);
            newObjects.push(duplicate.id);
        });

        this.selectMultipleObjects(newObjects);
        this.addToHistory('Duplicate Objects', () => {
            newObjects.forEach(id => {
                this.scene.removeObject(id);
            });
        });

        this.updateSceneInfo();
    }

    copySelectedObjects() {
        this.clipboard = this.selectedObjects.map(id => 
            this.scene.getObject(id)
        );
        this.updateStatusMessage(`Copied ${this.clipboard.length} object(s)`);
    }

    pasteObjects() {
        if (this.clipboard.length === 0) return;

        const newObjects = [];
        this.clipboard.forEach(obj => {
            const pasted = this.scene.addObject(obj);
            newObjects.push(pasted.id);
        });

        this.selectMultipleObjects(newObjects);
        this.addToHistory('Paste Objects', () => {
            newObjects.forEach(id => {
                this.scene.removeObject(id);
            });
        });

        this.updateSceneInfo();
    }

    // History management
    addToHistory(actionName, undoCallback) {
        // Remove any history after current index
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Add new action
        this.history.push({
            name: actionName,
            undo: undoCallback,
            timestamp: Date.now()
        });

        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    undo() {
        if (this.historyIndex >= 0) {
            const action = this.history[this.historyIndex];
            action.undo();
            this.historyIndex--;
            this.updateStatusMessage(`Undid: ${action.name}`);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const action = this.history[this.historyIndex];
            // Redo would require storing redo callbacks too
            this.updateStatusMessage(`Redid: ${action.name}`);
        }
    }

    // Keyboard shortcuts
    handleKeyboardShortcut(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'c':
                    e.preventDefault();
                    this.copySelectedObjects();
                    break;
                case 'v':
                    e.preventDefault();
                    this.pasteObjects();
                    break;
                case 'd':
                    e.preventDefault();
                    this.duplicateSelectedObjects();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveScene();
                    break;
            }
        } else {
            switch (e.key) {
                case 'Delete':
                    this.deleteSelectedObjects();
                    break;
                case 'q':
                    this.setActiveTool('select');
                    break;
                case 'w':
                    this.setActiveTool('move');
                    break;
                case 'e':
                    this.setActiveTool('rotate');
                    break;
                case 'r':
                    this.setActiveTool('scale');
                    break;
            }
        }
    }

    // UI Updates
    updatePropertiesPanel() {
        if (this.selectedObjects.length === 1) {
            const obj = this.scene.getObject(this.selectedObjects[0]);
            if (obj) {
                // Update transform properties
                window.gamefaceBinding.updateModel('editorModel.transform', obj.transform);
                window.gamefaceBinding.updateModel('editorModel.material', obj.material);
            }
        }
    }

    updateSelectionInfo() {
        const selectionInfo = document.getElementById('selection-info');
        if (selectionInfo) {
            if (this.selectedObjects.length === 0) {
                selectionInfo.textContent = 'Nothing selected';
            } else if (this.selectedObjects.length === 1) {
                const obj = this.scene.getObject(this.selectedObjects[0]);
                selectionInfo.textContent = `Selected: ${obj ? obj.name : 'Unknown'}`;
            } else {
                selectionInfo.textContent = `Selected: ${this.selectedObjects.length} objects`;
            }
        }
    }

    updateSceneInfo() {
        const objectCount = this.scene.getObjectCount();
        window.gamefaceBinding.updateModel('editorModel.viewport.objectCount', objectCount);
        
        const viewportObjects = document.getElementById('viewport-objects');
        if (viewportObjects) {
            viewportObjects.textContent = `Objects: ${objectCount}`;
        }
    }

    updateStatusMessage(message) {
        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
            statusMessage.textContent = message;
        }
    }

    // Console system
    executeConsoleCommand(command) {
        if (!command.trim()) return;

        this.logMessage(`> ${command}`, 'command');

        try {
            // Parse and execute command
            const result = this.parseCommand(command);
            if (result !== undefined) {
                this.logMessage(result, 'info');
            }
        } catch (error) {
            this.logMessage(`Error: ${error.message}`, 'error');
        }
    }

    parseCommand(command) {
        const parts = command.trim().split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        switch (cmd) {
            case 'help':
                return 'Available commands: help, clear, select, delete, add, save, load';
            case 'clear':
                this.clearConsole();
                return 'Console cleared';
            case 'select':
                if (args[0]) {
                    this.selectObject(args[0]);
                    return `Selected object: ${args[0]}`;
                }
                return 'Usage: select <objectId>';
            case 'delete':
                this.deleteSelectedObjects();
                return 'Deleted selected objects';
            case 'add':
                if (args[0]) {
                    this.addAssetToScene({ name: args[0], type: 'model' });
                    return `Added ${args[0]} to scene`;
                }
                return 'Usage: add <assetName>';
            default:
                return `Unknown command: ${cmd}`;
        }
    }

    logMessage(message, type = 'info') {
        const consoleOutput = document.getElementById('console-output');
        if (!consoleOutput) return;

        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = message;
        
        consoleOutput.appendChild(logEntry);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    clearConsole() {
        const consoleOutput = document.getElementById('console-output');
        if (consoleOutput) {
            consoleOutput.innerHTML = '';
        }
    }

    // Menu system
    showMenu(menuType) {
        console.log(`Showing menu: ${menuType}`);
        // Implement menu logic here
    }

    showContextMenu(x, y) {
        const contextMenu = document.getElementById('context-menu');
        if (!contextMenu) return;

        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;
        contextMenu.classList.remove('hidden');
    }

    hideContextMenu() {
        const contextMenu = document.getElementById('context-menu');
        if (contextMenu) {
            contextMenu.classList.add('hidden');
        }
    }

    togglePanel(panel) {
        const content = panel.querySelector('.panel-content');
        const toggle = panel.querySelector('.panel-toggle');
        
        if (content && toggle) {
            const isCollapsed = content.style.display === 'none';
            content.style.display = isCollapsed ? 'block' : 'none';
            toggle.textContent = isCollapsed ? '−' : '+';
        }
    }

    setViewportMode(mode) {
        document.querySelectorAll('.viewport-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const viewBtn = document.querySelector(`[data-view="${mode}"]`);
        if (viewBtn) {
            viewBtn.classList.add('active');
        }

        window.gamefaceBinding.updateModel('editorModel.viewport.camera', mode);
        
        const cameraInfo = document.getElementById('camera-info');
        if (cameraInfo) {
            cameraInfo.textContent = `Camera: ${mode.charAt(0).toUpperCase() + mode.slice(1)}`;
        }
    }

    saveScene() {
        const sceneData = this.scene.serialize();
        // In a real implementation, this would save to file or send to game engine
        console.log('Saving scene:', sceneData);
        this.logMessage('Scene saved successfully', 'info');
    }

    loadScene(sceneData) {
        this.scene.deserialize(sceneData);
        this.updateSceneInfo();
        this.logMessage('Scene loaded successfully', 'info');
    }
}

// Global editor instance
window.editorCore = new EditorCore();
