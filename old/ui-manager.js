/**
 * UI Manager System
 * Handles UI interactions and scene hierarchy
 */

class EditorScene {
    constructor() {
        this.objects = new Map();
        this.nextObjectId = 1;
        this.selectedObjects = new Set();
    }

    initialize() {
        this.setupHierarchyTree();
        this.populateDefaultObjects();
    }

    setupHierarchyTree() {
        const hierarchyTree = document.getElementById('hierarchy-tree');
        if (!hierarchyTree) return;

        // Create root scene node
        const sceneRoot = this.createTreeItem('Scene', 'scene', null, true);
        hierarchyTree.appendChild(sceneRoot);
    }

    createTreeItem(name, type, objectId = null, isRoot = false) {
        const item = document.createElement('div');
        item.className = 'tree-item';
        if (objectId) item.dataset.objectId = objectId;

        const toggle = document.createElement('div');
        toggle.className = 'tree-toggle';
        toggle.textContent = isRoot ? '−' : '';

        const icon = document.createElement('div');
        icon.className = 'tree-icon';
        icon.textContent = this.getIconForType(type);

        const label = document.createElement('div');
        label.className = 'tree-label';
        label.textContent = name;

        item.appendChild(toggle);
        item.appendChild(icon);
        item.appendChild(label);

        // Add event listeners
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            if (objectId) {
                window.editorCore.selectObject(objectId);
            }
        });

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleTreeItem(item);
        });

        return item;
    }

    getIconForType(type) {
        const icons = {
            scene: '🌍',
            cube: '📦',
            sphere: '🔵',
            cylinder: '🥫',
            plane: '⬜',
            light: '💡',
            camera: '📷',
            model: '🎯'
        };
        return icons[type] || '📄';
    }

    toggleTreeItem(item) {
        const toggle = item.querySelector('.tree-toggle');
        const children = item.querySelector('.tree-children');
        
        if (children) {
            const isExpanded = children.style.display !== 'none';
            children.style.display = isExpanded ? 'none' : 'block';
            toggle.textContent = isExpanded ? '+' : '−';
        }
    }

    populateDefaultObjects() {
        // Add some default objects to the scene
        const defaultObjects = [
            { name: 'Main Camera', type: 'camera' },
            { name: 'Directional Light', type: 'light' }
        ];

        defaultObjects.forEach(obj => {
            this.addObject(obj);
        });
    }

    addObject(assetData) {
        const objectId = `obj_${this.nextObjectId++}`;
        const object = {
            id: objectId,
            name: assetData.name || `${assetData.type}_${objectId}`,
            type: assetData.type || 'model',
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            material: {
                albedo: '#ffffff',
                metallic: 0,
                roughness: 0.5
            },
            visible: true,
            selected: false
        };

        this.objects.set(objectId, object);

        // Add to hierarchy tree
        this.addToHierarchyTree(object);

        // Add to viewport
        if (window.editorViewport) {
            window.editorViewport.addObject(object);
        }

        return object;
    }

    addToHierarchyTree(object) {
        const hierarchyTree = document.getElementById('hierarchy-tree');
        if (!hierarchyTree) return;

        const sceneRoot = hierarchyTree.querySelector('.tree-item');
        if (!sceneRoot) return;

        // Create or get children container
        let childrenContainer = sceneRoot.querySelector('.tree-children');
        if (!childrenContainer) {
            childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            sceneRoot.appendChild(childrenContainer);
        }

        // Create tree item for object
        const treeItem = this.createTreeItem(object.name, object.type, object.id);
        childrenContainer.appendChild(treeItem);

        // Ensure scene root is expanded
        const toggle = sceneRoot.querySelector('.tree-toggle');
        if (toggle) {
            toggle.textContent = '−';
            childrenContainer.style.display = 'block';
        }
    }

    removeObject(objectId) {
        const object = this.objects.get(objectId);
        if (!object) return;

        // Remove from objects map
        this.objects.delete(objectId);

        // Remove from hierarchy tree
        const treeItem = document.querySelector(`[data-object-id="${objectId}"]`);
        if (treeItem) {
            treeItem.remove();
        }

        // Remove from viewport
        if (window.editorViewport) {
            window.editorViewport.removeObject(objectId);
        }

        // Remove from selection
        this.selectedObjects.delete(objectId);
    }

    duplicateObject(original) {
        const duplicate = {
            ...original,
            id: `obj_${this.nextObjectId++}`,
            name: `${original.name}_copy`,
            position: {
                x: original.position.x + 1,
                y: original.position.y,
                z: original.position.z
            }
        };

        this.objects.set(duplicate.id, duplicate);
        this.addToHierarchyTree(duplicate);

        if (window.editorViewport) {
            window.editorViewport.addObject(duplicate);
        }

        return duplicate;
    }

    selectObject(objectId) {
        // Clear previous selection
        this.selectedObjects.clear();
        
        // Update tree selection
        document.querySelectorAll('.tree-item').forEach(item => {
            item.classList.remove('selected');
        });

        if (objectId) {
            this.selectedObjects.add(objectId);
            
            // Update tree item
            const treeItem = document.querySelector(`[data-object-id="${objectId}"]`);
            if (treeItem) {
                treeItem.classList.add('selected');
            }

            // Update viewport
            if (window.editorViewport) {
                window.editorViewport.selectObject(objectId);
            }
        }
    }

    selectMultipleObjects(objectIds) {
        this.selectedObjects.clear();
        
        // Update tree selection
        document.querySelectorAll('.tree-item').forEach(item => {
            item.classList.remove('selected');
        });

        objectIds.forEach(objectId => {
            this.selectedObjects.add(objectId);
            
            const treeItem = document.querySelector(`[data-object-id="${objectId}"]`);
            if (treeItem) {
                treeItem.classList.add('selected');
            }
        });

        // Update viewport
        if (window.editorViewport) {
            window.editorViewport.selectMultipleObjects(objectIds);
        }
    }

    getObject(objectId) {
        return this.objects.get(objectId);
    }

    getObjectCount() {
        return this.objects.size;
    }

    serialize() {
        const sceneData = {
            objects: Array.from(this.objects.values()),
            metadata: {
                version: '1.0',
                created: new Date().toISOString(),
                objectCount: this.objects.size
            }
        };
        return JSON.stringify(sceneData, null, 2);
    }

    deserialize(sceneDataString) {
        try {
            const sceneData = JSON.parse(sceneDataString);
            
            // Clear current scene
            this.objects.clear();
            const hierarchyTree = document.getElementById('hierarchy-tree');
            if (hierarchyTree) {
                hierarchyTree.innerHTML = '';
            }

            // Rebuild scene
            this.setupHierarchyTree();
            
            if (sceneData.objects) {
                sceneData.objects.forEach(objData => {
                    this.objects.set(objData.id, objData);
                    this.addToHierarchyTree(objData);
                    
                    if (window.editorViewport) {
                        window.editorViewport.addObject(objData);
                    }
                });
            }

            // Update next object ID
            const maxId = Math.max(...Array.from(this.objects.keys()).map(id => 
                parseInt(id.replace('obj_', ''))
            ));
            this.nextObjectId = maxId + 1;

        } catch (error) {
            console.error('Failed to deserialize scene:', error);
            throw new Error('Invalid scene data format');
        }
    }
}

class UIManager {
    constructor() {
        this.activeModal = null;
        this.contextMenuVisible = false;
        this.draggedElement = null;
        
        this.initialize();
    }

    initialize() {
        this.setupModalHandlers();
        this.setupContextMenuHandlers();
        this.setupDragAndDrop();
        this.setupResizablePanels();
        this.setupAssetCategories();
    }

    setupModalHandlers() {
        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        // Modal action handlers
        document.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'cancel') {
                this.closeModal();
            } else if (e.target.dataset.action === 'apply') {
                this.applyModalSettings();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.closeModal();
            }
        });
    }

    setupContextMenuHandlers() {
        document.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.executeContextAction(action);
                this.hideContextMenu();
            });
        });
    }

    setupDragAndDrop() {
        // Asset drag and drop
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('asset-item')) {
                this.draggedElement = e.target;
                e.dataTransfer.effectAllowed = 'copy';
            }
        });

        const viewport = document.getElementById('main-viewport');
        if (viewport) {
            viewport.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
            });

            viewport.addEventListener('drop', (e) => {
                e.preventDefault();
                if (this.draggedElement) {
                    const assetName = this.draggedElement.querySelector('.asset-name').textContent;
                    const assetType = this.getAssetTypeFromName(assetName);
                    
                    window.editorCore.addAssetToScene({
                        name: assetName,
                        type: assetType
                    });
                    
                    this.draggedElement = null;
                }
            });
        }
    }

    setupResizablePanels() {
        const sidebars = document.querySelectorAll('.sidebar');
        
        sidebars.forEach(sidebar => {
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'resize-handle';
            resizeHandle.style.cssText = `
                position: absolute;
                top: 0;
                width: 4px;
                height: 100%;
                cursor: ew-resize;
                background: transparent;
                z-index: 10;
            `;
            
            if (sidebar.classList.contains('left-sidebar')) {
                resizeHandle.style.right = '-2px';
            } else {
                resizeHandle.style.left = '-2px';
            }
            
            sidebar.appendChild(resizeHandle);
            
            let isResizing = false;
            let startX = 0;
            let startWidth = 0;
            
            resizeHandle.addEventListener('mousedown', (e) => {
                isResizing = true;
                startX = e.clientX;
                startWidth = parseInt(getComputedStyle(sidebar).width);
                document.body.style.cursor = 'ew-resize';
                e.preventDefault();
            });
            
            document.addEventListener('mousemove', (e) => {
                if (!isResizing) return;
                
                const deltaX = e.clientX - startX;
                let newWidth;
                
                if (sidebar.classList.contains('left-sidebar')) {
                    newWidth = startWidth + deltaX;
                } else {
                    newWidth = startWidth - deltaX;
                }
                
                newWidth = Math.max(180, Math.min(500, newWidth));
                sidebar.style.width = `${newWidth}px`;
            });
            
            document.addEventListener('mouseup', () => {
                if (isResizing) {
                    isResizing = false;
                    document.body.style.cursor = 'default';
                }
            });
        });
    }

    setupAssetCategories() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.switchAssetCategory(category);
                
                // Update active state
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }

    switchAssetCategory(category) {
        const assetGrid = document.getElementById('asset-grid');
        if (!assetGrid) return;

        const categoryAssets = {
            models: [
                { name: 'Cube', type: 'cube', icon: '📦' },
                { name: 'Sphere', type: 'sphere', icon: '🔵' },
                { name: 'Cylinder', type: 'cylinder', icon: '🥫' },
                { name: 'Plane', type: 'plane', icon: '⬜' }
            ],
            textures: [
                { name: 'Brick', type: 'texture', icon: '🧱' },
                { name: 'Wood', type: 'texture', icon: '🪵' },
                { name: 'Metal', type: 'texture', icon: '⚙️' },
                { name: 'Grass', type: 'texture', icon: '🌱' }
            ],
            materials: [
                { name: 'Standard', type: 'material', icon: '🎨' },
                { name: 'Metallic', type: 'material', icon: '✨' },
                { name: 'Glass', type: 'material', icon: '💎' },
                { name: 'Emissive', type: 'material', icon: '💡' }
            ],
            prefabs: [
                { name: 'Tree', type: 'prefab', icon: '🌳' },
                { name: 'Building', type: 'prefab', icon: '🏢' },
                { name: 'Vehicle', type: 'prefab', icon: '🚗' },
                { name: 'Character', type: 'prefab', icon: '🚶' }
            ]
        };

        const assets = categoryAssets[category] || [];
        
        assetGrid.innerHTML = '';
        assets.forEach(asset => {
            const assetElement = document.createElement('div');
            assetElement.className = 'asset-item';
            assetElement.draggable = true;
            assetElement.innerHTML = `
                <div class="asset-icon">${asset.icon}</div>
                <div class="asset-name">${asset.name}</div>
            `;
            
            assetElement.addEventListener('click', () => {
                window.editorCore.selectAsset(asset);
            });
            
            assetElement.addEventListener('dblclick', () => {
                window.editorCore.addAssetToScene(asset);
            });
            
            assetGrid.appendChild(assetElement);
        });
    }

    showModal(modalId) {
        const overlay = document.getElementById('modal-overlay');
        const modal = document.getElementById(modalId);
        
        if (overlay && modal) {
            overlay.classList.remove('hidden');
            this.activeModal = modalId;
        }
    }

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            this.activeModal = null;
        }
    }

    applyModalSettings() {
        if (this.activeModal === 'settings-modal') {
            const gridSize = document.getElementById('grid-size')?.value;
            const autoSave = document.getElementById('auto-save')?.checked;
            
            if (gridSize) {
                window.editorViewport.grid.size = parseFloat(gridSize);
            }
            
            // Apply other settings...
            console.log('Applied settings:', { gridSize, autoSave });
        }
        
        this.closeModal();
    }

    executeContextAction(action) {
        switch (action) {
            case 'copy':
                window.editorCore.copySelectedObjects();
                break;
            case 'paste':
                window.editorCore.pasteObjects();
                break;
            case 'duplicate':
                window.editorCore.duplicateSelectedObjects();
                break;
            case 'delete':
                window.editorCore.deleteSelectedObjects();
                break;
        }
    }

    hideContextMenu() {
        const contextMenu = document.getElementById('context-menu');
        if (contextMenu) {
            contextMenu.classList.add('hidden');
            this.contextMenuVisible = false;
        }
    }

    getAssetTypeFromName(name) {
        const typeMap = {
            'Cube': 'cube',
            'Sphere': 'sphere',
            'Cylinder': 'cylinder',
            'Plane': 'plane',
            'Light': 'light',
            'Camera': 'camera'
        };
        return typeMap[name] || 'model';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 12px 16px;
            color: var(--text-primary);
            box-shadow: var(--shadow);
            z-index: 3000;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize UI Manager
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});
