/**
 * Main Application Entry Point
 * Initializes the Gameface Editor and coordinates all systems
 */

class GamefaceEditor {
    constructor() {
        this.version = '1.0.0';
        this.isInitialized = false;
        this.systems = {};
        
        this.initialize();
    }

    async initialize() {
        try {
            console.log(`Initializing Gameface Editor v${this.version}`);
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }

            // Initialize core systems in order
            await this.initializeSystems();
            
            // Set up global event handlers
            this.setupGlobalEventHandlers();
            
            // Initialize Gameface-specific features
            this.initializeGamefaceFeatures();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('Gameface Editor initialized successfully');
            this.showWelcomeMessage();
            
        } catch (error) {
            console.error('Failed to initialize Gameface Editor:', error);
            this.showErrorMessage('Failed to initialize editor: ' + error.message);
        }
    }

    async initializeSystems() {
        // Initialize systems in dependency order
        
        // 1. Data binding system (foundation)
        if (window.gamefaceBinding) {
            this.systems.binding = window.gamefaceBinding;
            console.log('✓ Data binding system ready');
        }

        // 2. Scene management
        if (window.EditorScene) {
            this.systems.scene = new EditorScene();
            console.log('✓ Scene system ready');
        }

        // 3. Viewport system
        if (window.editorViewport) {
            this.systems.viewport = window.editorViewport;
            console.log('✓ Viewport system ready');
        }

        // 4. Core editor functionality
        if (window.editorCore) {
            this.systems.core = window.editorCore;
            console.log('✓ Core editor system ready');
        }

        // 5. UI management
        if (window.uiManager) {
            this.systems.ui = window.uiManager;
            console.log('✓ UI management system ready');
        }

        // Set up cross-system communication
        this.setupSystemCommunication();
    }

    setupSystemCommunication() {
        // Connect viewport to core editor
        if (this.systems.viewport && this.systems.core) {
            // Sync viewport camera changes with core
            this.systems.binding.onModelChange('editorModel.viewport.camera', (camera) => {
                this.systems.viewport.setViewMode(camera);
            });

            // Sync grid visibility
            this.systems.binding.onModelChange('editorModel.viewport.showGrid', (showGrid) => {
                this.systems.viewport.grid.visible = showGrid;
            });
        }

        // Connect transform changes to viewport
        this.systems.binding.onModelChange('editorModel.transform.*', (value, path) => {
            if (this.systems.core && this.systems.core.selectedObjects.length === 1) {
                const objectId = this.systems.core.selectedObjects[0];
                const obj = this.systems.viewport.getObject(objectId);
                
                if (obj) {
                    const pathParts = path.split('.');
                    const property = pathParts[pathParts.length - 1];
                    const transformType = pathParts[pathParts.length - 2];
                    
                    if (!obj[transformType]) obj[transformType] = {};
                    obj[transformType][property] = value;
                }
            }
        });
    }

    setupGlobalEventHandlers() {
        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleGlobalKeyboard(e);
        });

        // Window resize handling
        window.addEventListener('resize', () => {
            this.handleWindowResize();
        });

        // Before unload warning
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });

        // Handle visibility changes (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.onEditorHidden();
            } else {
                this.onEditorVisible();
            }
        });

        // Error handling
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });

        window.addEventListener('unhandledrejection', (e) => {
            this.handleUnhandledRejection(e);
        });
    }

    initializeGamefaceFeatures() {
        // Check if running in Gameface environment
        if (typeof engine !== 'undefined') {
            console.log('Running in Gameface environment');
            this.setupGamefaceIntegration();
        } else {
            console.log('Running in browser environment (development mode)');
            this.setupBrowserFallbacks();
        }

        // Initialize Gameface-specific UI components
        this.initializeGamefaceComponents();
    }

    setupGamefaceIntegration() {
        // Register with game engine
        engine.on('ready', () => {
            console.log('Gameface engine ready');
            this.onGamefaceReady();
        });

        // Handle engine events
        engine.on('sceneChanged', (sceneData) => {
            this.onSceneChanged(sceneData);
        });

        engine.on('objectSelected', (objectId) => {
            if (this.systems.core) {
                this.systems.core.selectObject(objectId);
            }
        });

        engine.on('transformChanged', (objectId, transform) => {
            this.onTransformChanged(objectId, transform);
        });

        // Register editor commands with engine
        this.registerEngineCommands();
    }

    setupBrowserFallbacks() {
        // Mock engine object for browser testing
        window.engine = {
            call: (functionName, ...args) => {
                console.log(`Mock engine call: ${functionName}(${args.join(', ')})`);
                return Promise.resolve();
            },
            on: (eventName, callback) => {
                console.log(`Mock engine event registration: ${eventName}`);
            },
            createJSModel: (modelName, data) => {
                console.log(`Mock model creation: ${modelName}`, data);
            },
            updateWholeModel: (modelName, data) => {
                console.log(`Mock model update: ${modelName}`, data);
            },
            synchronizeModels: () => {
                console.log('Mock model synchronization');
            }
        };

        // Simulate engine ready event
        setTimeout(() => {
            this.onGamefaceReady();
        }, 100);
    }

    initializeGamefaceComponents() {
        // Initialize custom Gameface UI components
        this.initializeSliders();
        this.initializeDropdowns();
        this.initializeCheckboxes();
        this.initializeTabs();
    }

    initializeSliders() {
        document.querySelectorAll('input[type="range"]').forEach(slider => {
            this.enhanceSlider(slider);
        });
    }

    enhanceSlider(slider) {
        // Add Gameface-specific enhancements to sliders
        const container = slider.parentElement;
        if (container && !container.classList.contains('gameface-slider-enhanced')) {
            container.classList.add('gameface-slider-enhanced');
            
            // Add value display
            const valueDisplay = document.createElement('span');
            valueDisplay.className = 'slider-value';
            valueDisplay.textContent = slider.value;
            container.appendChild(valueDisplay);
            
            slider.addEventListener('input', () => {
                valueDisplay.textContent = slider.value;
            });
        }
    }

    initializeDropdowns() {
        document.querySelectorAll('select').forEach(select => {
            this.enhanceDropdown(select);
        });
    }

    enhanceDropdown(select) {
        // Add Gameface-specific dropdown enhancements
        if (!select.classList.contains('gameface-dropdown-enhanced')) {
            select.classList.add('gameface-dropdown-enhanced');
            
            // Custom styling and behavior can be added here
        }
    }

    initializeCheckboxes() {
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            this.enhanceCheckbox(checkbox);
        });
    }

    enhanceCheckbox(checkbox) {
        if (!checkbox.classList.contains('gameface-checkbox-enhanced')) {
            checkbox.classList.add('gameface-checkbox-enhanced');
            
            // Add custom checkbox styling
            const wrapper = document.createElement('div');
            wrapper.className = 'gameface-checkbox-wrapper';
            checkbox.parentNode.insertBefore(wrapper, checkbox);
            wrapper.appendChild(checkbox);
        }
    }

    initializeTabs() {
        document.querySelectorAll('.tab-headers').forEach(tabContainer => {
            this.setupTabSystem(tabContainer);
        });
    }

    setupTabSystem(tabContainer) {
        const headers = tabContainer.querySelectorAll('.tab-header');
        const panels = tabContainer.parentElement.querySelectorAll('.tab-panel');
        
        headers.forEach((header, index) => {
            header.addEventListener('click', () => {
                // Remove active class from all headers and panels
                headers.forEach(h => h.classList.remove('active'));
                panels.forEach(p => p.classList.remove('active'));
                
                // Add active class to clicked header and corresponding panel
                header.classList.add('active');
                if (panels[index]) {
                    panels[index].classList.add('active');
                }
            });
        });
    }

    // Event Handlers
    handleGlobalKeyboard(e) {
        // Global shortcuts that work regardless of focus
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'n':
                    e.preventDefault();
                    this.newScene();
                    break;
                case 'o':
                    e.preventDefault();
                    this.openScene();
                    break;
                case 's':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.saveSceneAs();
                    } else {
                        this.saveScene();
                    }
                    break;
                case ',':
                    e.preventDefault();
                    this.openSettings();
                    break;
            }
        } else {
            switch (e.key) {
                case 'F1':
                    e.preventDefault();
                    this.showHelp();
                    break;
                case 'F11':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
            }
        }
    }

    handleWindowResize() {
        if (this.systems.viewport) {
            this.systems.viewport.resize();
        }
    }

    handleGlobalError(e) {
        console.error('Global error:', e.error);
        this.showErrorMessage(`Unexpected error: ${e.error.message}`);
    }

    handleUnhandledRejection(e) {
        console.error('Unhandled promise rejection:', e.reason);
        this.showErrorMessage(`Promise rejection: ${e.reason}`);
    }

    // Gameface Event Handlers
    onGamefaceReady() {
        console.log('Gameface integration ready');
        if (this.systems.binding) {
            this.systems.binding.synchronizeAll();
        }
    }

    onSceneChanged(sceneData) {
        if (this.systems.scene) {
            this.systems.scene.deserialize(sceneData);
        }
    }

    onTransformChanged(objectId, transform) {
        if (this.systems.core && this.systems.core.selectedObjects.includes(objectId)) {
            this.systems.binding.updateModel('editorModel.transform', transform);
        }
    }

    onEditorHidden() {
        // Pause non-essential operations when editor is hidden
        console.log('Editor hidden - pausing operations');
    }

    onEditorVisible() {
        // Resume operations when editor becomes visible
        console.log('Editor visible - resuming operations');
        if (this.systems.binding) {
            this.systems.binding.synchronizeAll();
        }
    }

    // Engine Command Registration
    registerEngineCommands() {
        const commands = {
            'Editor.SelectObject': (objectId) => {
                if (this.systems.core) {
                    this.systems.core.selectObject(objectId);
                }
            },
            'Editor.DeleteSelected': () => {
                if (this.systems.core) {
                    this.systems.core.deleteSelectedObjects();
                }
            },
            'Editor.SetTool': (toolName) => {
                if (this.systems.core) {
                    this.systems.core.setActiveTool(toolName);
                }
            },
            'Editor.SaveScene': () => {
                this.saveScene();
            },
            'Editor.LoadScene': (sceneData) => {
                if (this.systems.core) {
                    this.systems.core.loadScene(sceneData);
                }
            }
        };

        // Register commands with engine
        Object.entries(commands).forEach(([name, handler]) => {
            if (typeof engine !== 'undefined' && engine.registerCommand) {
                engine.registerCommand(name, handler);
            }
        });
    }

    // File Operations
    newScene() {
        if (this.hasUnsavedChanges()) {
            const confirmed = confirm('You have unsaved changes. Create new scene anyway?');
            if (!confirmed) return;
        }

        if (this.systems.scene) {
            this.systems.scene.objects.clear();
            this.systems.scene.setupHierarchyTree();
            this.systems.scene.populateDefaultObjects();
        }

        if (this.systems.viewport) {
            this.systems.viewport.clear();
        }

        this.showNotification('New scene created', 'success');
    }

    openScene() {
        // In a real implementation, this would open a file dialog
        console.log('Open scene dialog');
        this.showNotification('Open scene functionality not implemented in demo', 'info');
    }

    saveScene() {
        if (this.systems.core) {
            this.systems.core.saveScene();
            this.showNotification('Scene saved successfully', 'success');
        }
    }

    saveSceneAs() {
        // In a real implementation, this would open a save dialog
        console.log('Save scene as dialog');
        this.showNotification('Save As functionality not implemented in demo', 'info');
    }

    openSettings() {
        if (this.systems.ui) {
            this.systems.ui.showModal('settings-modal');
        }
    }

    showHelp() {
        this.showNotification('Help: Use WASD for camera, Q/W/E/R for tools, Ctrl+S to save', 'info');
    }

    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.documentElement.requestFullscreen();
        }
    }

    // Utility Methods
    hasUnsavedChanges() {
        // In a real implementation, track if scene has been modified
        return false;
    }

    showWelcomeMessage() {
        const message = `
            <div style="text-align: center;">
                <h3>Welcome to Gameface Editor</h3>
                <p>Your in-game editor is ready!</p>
                <ul style="text-align: left; display: inline-block;">
                    <li><strong>Q</strong> - Select Tool</li>
                    <li><strong>W</strong> - Move Tool</li>
                    <li><strong>E</strong> - Rotate Tool</li>
                    <li><strong>R</strong> - Scale Tool</li>
                    <li><strong>Ctrl+S</strong> - Save Scene</li>
                    <li><strong>F1</strong> - Show Help</li>
                </ul>
            </div>
        `;
        
        if (this.systems.core) {
            this.systems.core.logMessage('Welcome to Gameface Editor v' + this.version, 'info');
            this.systems.core.logMessage('Use keyboard shortcuts or toolbar to select tools', 'info');
        }
    }

    showErrorMessage(message) {
        console.error(message);
        if (this.systems.core) {
            this.systems.core.logMessage(message, 'error');
        }
        if (this.systems.ui) {
            this.systems.ui.showNotification(message, 'error');
        }
    }

    showNotification(message, type = 'info') {
        if (this.systems.ui) {
            this.systems.ui.showNotification(message, type);
        }
        if (this.systems.core) {
            this.systems.core.logMessage(message, type);
        }
    }

    // Public API
    getVersion() {
        return this.version;
    }

    isReady() {
        return this.isInitialized;
    }

    getSystem(name) {
        return this.systems[name];
    }

    // Cleanup
    destroy() {
        // Clean up resources
        Object.values(this.systems).forEach(system => {
            if (system && typeof system.destroy === 'function') {
                system.destroy();
            }
        });
        
        this.systems = {};
        this.isInitialized = false;
        
        console.log('Gameface Editor destroyed');
    }
}

// Initialize the editor
const gamefaceEditor = new GamefaceEditor();

// Export for global access
window.gamefaceEditor = gamefaceEditor;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GamefaceEditor;
}
