/**
 * Viewport Management System
 * Handles 3D viewport rendering and interaction
 */

class EditorViewport {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.camera = {
            position: { x: 0, y: 0, z: 5 },
            rotation: { x: 0, y: 0, z: 0 },
            fov: 60,
            near: 0.1,
            far: 1000
        };
        this.grid = {
            size: 1,
            divisions: 20,
            visible: true
        };
        this.objects = [];
        this.isMouseDown = false;
        this.lastMousePos = { x: 0, y: 0 };
        this.viewMode = 'perspective';
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.resize();
        this.startRenderLoop();
        
        // Listen for grid toggle
        const gridToggle = document.getElementById('show-grid');
        if (gridToggle) {
            gridToggle.addEventListener('change', (e) => {
                this.grid.visible = e.target.checked;
            });
        }
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Resize handling
        window.addEventListener('resize', () => this.resize());
        
        // Prevent context menu
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    onMouseDown(e) {
        this.isMouseDown = true;
        this.lastMousePos = { x: e.clientX, y: e.clientY };
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Handle object selection
        const clickedObject = this.getObjectAtPosition(x, y);
        if (clickedObject) {
            window.editorCore.selectObject(clickedObject.id);
        } else if (!e.ctrlKey && !e.metaKey) {
            window.editorCore.selectObject(null);
        }
    }

    onMouseMove(e) {
        if (!this.isMouseDown) return;
        
        const deltaX = e.clientX - this.lastMousePos.x;
        const deltaY = e.clientY - this.lastMousePos.y;
        
        if (e.button === 2 || (e.button === 0 && e.altKey)) {
            // Right mouse or Alt+Left mouse - orbit camera
            this.orbitCamera(deltaX, deltaY);
        } else if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
            // Middle mouse or Shift+Left mouse - pan camera
            this.panCamera(deltaX, deltaY);
        } else if (window.editorCore.activeTool) {
            // Tool interaction
            window.editorCore.activeTool.onMouseMove(deltaX, deltaY);
        }
        
        this.lastMousePos = { x: e.clientX, y: e.clientY };
    }

    onMouseUp(e) {
        this.isMouseDown = false;
    }

    onWheel(e) {
        e.preventDefault();
        const zoomSpeed = 0.1;
        const zoomDirection = e.deltaY > 0 ? 1 : -1;
        this.zoomCamera(zoomDirection * zoomSpeed);
    }

    onTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY, button: 0 });
        }
    }

    onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY, button: 0 });
        }
    }

    onTouchEnd(e) {
        e.preventDefault();
        this.onMouseUp(e);
    }

    orbitCamera(deltaX, deltaY) {
        const sensitivity = 0.01;
        this.camera.rotation.y += deltaX * sensitivity;
        this.camera.rotation.x += deltaY * sensitivity;
        
        // Clamp vertical rotation
        this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
    }

    panCamera(deltaX, deltaY) {
        const sensitivity = 0.01;
        const distance = this.getCameraDistance();
        
        // Calculate camera right and up vectors
        const right = {
            x: Math.cos(this.camera.rotation.y),
            y: 0,
            z: Math.sin(this.camera.rotation.y)
        };
        
        const up = { x: 0, y: 1, z: 0 };
        
        // Apply pan movement
        this.camera.position.x -= right.x * deltaX * sensitivity * distance;
        this.camera.position.z -= right.z * deltaX * sensitivity * distance;
        this.camera.position.y += up.y * deltaY * sensitivity * distance;
    }

    zoomCamera(delta) {
        const zoomSpeed = 0.5;
        const forward = {
            x: Math.sin(this.camera.rotation.y) * Math.cos(this.camera.rotation.x),
            y: -Math.sin(this.camera.rotation.x),
            z: Math.cos(this.camera.rotation.y) * Math.cos(this.camera.rotation.x)
        };
        
        this.camera.position.x += forward.x * delta * zoomSpeed;
        this.camera.position.y += forward.y * delta * zoomSpeed;
        this.camera.position.z += forward.z * delta * zoomSpeed;
    }

    getCameraDistance() {
        return Math.sqrt(
            this.camera.position.x * this.camera.position.x +
            this.camera.position.y * this.camera.position.y +
            this.camera.position.z * this.camera.position.z
        );
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    setViewMode(mode) {
        this.viewMode = mode;
        
        switch (mode) {
            case 'perspective':
                this.camera.position = { x: 5, y: 5, z: 5 };
                this.camera.rotation = { x: -0.3, y: 0.8, z: 0 };
                break;
            case 'top':
                this.camera.position = { x: 0, y: 10, z: 0 };
                this.camera.rotation = { x: -Math.PI / 2, y: 0, z: 0 };
                break;
            case 'front':
                this.camera.position = { x: 0, y: 0, z: 10 };
                this.camera.rotation = { x: 0, y: 0, z: 0 };
                break;
            case 'side':
                this.camera.position = { x: 10, y: 0, z: 0 };
                this.camera.rotation = { x: 0, y: Math.PI / 2, z: 0 };
                break;
        }
    }

    getObjectAtPosition(x, y) {
        // Simple 2D hit testing - in a real 3D engine this would be more complex
        for (const obj of this.objects) {
            const screenPos = this.worldToScreen(obj.position);
            const distance = Math.sqrt(
                (x - screenPos.x) * (x - screenPos.x) +
                (y - screenPos.y) * (y - screenPos.y)
            );
            
            if (distance < 20) { // 20px hit radius
                return obj;
            }
        }
        return null;
    }

    worldToScreen(worldPos) {
        // Simple orthographic projection for demo
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = 50;
        
        return {
            x: centerX + worldPos.x * scale,
            y: centerY - worldPos.y * scale
        };
    }

    screenToWorld(screenX, screenY) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = 50;
        
        return {
            x: (screenX - centerX) / scale,
            y: (centerY - screenY) / scale,
            z: 0
        };
    }

    startRenderLoop() {
        const render = () => {
            this.render();
            requestAnimationFrame(render);
        };
        render();
    }

    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        if (this.grid.visible) {
            this.drawGrid();
        }
        
        // Draw objects
        this.drawObjects();
        
        // Draw gizmos for selected objects
        this.drawGizmos();
        
        // Update FPS
        this.updateFPS();
    }

    drawGrid() {
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 1;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const scale = 50;
        const gridSize = this.grid.size * scale;
        const divisions = this.grid.divisions;
        
        // Draw grid lines
        for (let i = -divisions; i <= divisions; i++) {
            const offset = i * gridSize;
            
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + offset, 0);
            this.ctx.lineTo(centerX + offset, this.canvas.height);
            this.ctx.stroke();
            
            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, centerY + offset);
            this.ctx.lineTo(this.canvas.width, centerY + offset);
            this.ctx.stroke();
        }
        
        // Draw axes
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 2;
        
        // X axis (red)
        this.ctx.strokeStyle = '#ff4444';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX + gridSize * 2, centerY);
        this.ctx.stroke();
        
        // Y axis (green)
        this.ctx.strokeStyle = '#44ff44';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX, centerY - gridSize * 2);
        this.ctx.stroke();
    }

    drawObjects() {
        for (const obj of this.objects) {
            this.drawObject(obj);
        }
    }

    drawObject(obj) {
        const screenPos = this.worldToScreen(obj.position);
        const size = 20;
        
        // Draw object based on type
        this.ctx.fillStyle = obj.selected ? '#007acc' : '#cccccc';
        
        switch (obj.type) {
            case 'cube':
                this.ctx.fillRect(screenPos.x - size/2, screenPos.y - size/2, size, size);
                break;
            case 'sphere':
                this.ctx.beginPath();
                this.ctx.arc(screenPos.x, screenPos.y, size/2, 0, Math.PI * 2);
                this.ctx.fill();
                break;
            default:
                this.ctx.fillRect(screenPos.x - size/2, screenPos.y - size/2, size, size);
        }
        
        // Draw object name
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(obj.name, screenPos.x, screenPos.y + size + 15);
    }

    drawGizmos() {
        const selectedObjects = window.editorCore ? window.editorCore.selectedObjects : [];
        
        for (const objectId of selectedObjects) {
            const obj = this.objects.find(o => o.id === objectId);
            if (!obj) continue;
            
            const screenPos = this.worldToScreen(obj.position);
            const gizmoSize = 30;
            
            // Draw transform gizmo based on active tool
            const activeTool = window.editorCore ? window.editorCore.activeTool : null;
            if (activeTool) {
                this.drawTransformGizmo(screenPos, gizmoSize, activeTool.constructor.name);
            }
        }
    }

    drawTransformGizmo(pos, size, toolType) {
        const halfSize = size / 2;
        
        switch (toolType) {
            case 'MoveTool':
                // Draw move arrows
                this.drawArrow(pos, { x: pos.x + halfSize, y: pos.y }, '#ff4444'); // X
                this.drawArrow(pos, { x: pos.x, y: pos.y - halfSize }, '#44ff44'); // Y
                break;
                
            case 'RotateTool':
                // Draw rotation circles
                this.ctx.strokeStyle = '#ffff44';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(pos.x, pos.y, halfSize, 0, Math.PI * 2);
                this.ctx.stroke();
                break;
                
            case 'ScaleTool':
                // Draw scale handles
                this.ctx.fillStyle = '#44ffff';
                const handleSize = 6;
                this.ctx.fillRect(pos.x + halfSize - handleSize/2, pos.y - handleSize/2, handleSize, handleSize);
                this.ctx.fillRect(pos.x - handleSize/2, pos.y + halfSize - handleSize/2, handleSize, handleSize);
                this.ctx.fillRect(pos.x + halfSize - handleSize/2, pos.y + halfSize - handleSize/2, handleSize, handleSize);
                break;
        }
    }

    drawArrow(from, to, color) {
        this.ctx.strokeStyle = color;
        this.ctx.fillStyle = color;
        this.ctx.lineWidth = 3;
        
        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
        
        // Draw arrowhead
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
        const arrowSize = 8;
        
        this.ctx.beginPath();
        this.ctx.moveTo(to.x, to.y);
        this.ctx.lineTo(
            to.x - arrowSize * Math.cos(angle - Math.PI / 6),
            to.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            to.x - arrowSize * Math.cos(angle + Math.PI / 6),
            to.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();
    }

    updateFPS() {
        // Simple FPS counter
        if (!this.lastFrameTime) {
            this.lastFrameTime = performance.now();
            this.frameCount = 0;
            return;
        }
        
        this.frameCount++;
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        
        if (deltaTime >= 1000) {
            const fps = Math.round((this.frameCount * 1000) / deltaTime);
            const fpsElement = document.getElementById('viewport-fps');
            if (fpsElement) {
                fpsElement.textContent = `FPS: ${fps}`;
            }
            
            this.lastFrameTime = currentTime;
            this.frameCount = 0;
        }
    }

    addObject(obj) {
        this.objects.push(obj);
    }

    removeObject(objectId) {
        this.objects = this.objects.filter(obj => obj.id !== objectId);
    }

    selectObject(objectId) {
        this.objects.forEach(obj => {
            obj.selected = obj.id === objectId;
        });
    }

    selectMultipleObjects(objectIds) {
        this.objects.forEach(obj => {
            obj.selected = objectIds.includes(obj.id);
        });
    }

    getObject(objectId) {
        return this.objects.find(obj => obj.id === objectId);
    }

    clear() {
        this.objects = [];
    }
}

// Initialize viewport when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.editorViewport = new EditorViewport('editor-canvas');
});
