# Gameface In-Game Editor

A comprehensive in-game editor built with Gameface UI technology, featuring a modern interface for 3D scene editing, asset management, and real-time game development.

## Features

### Core Editor Functionality
- **Multi-tool System**: Select, Move, Rotate, Scale, Brush, and Eraser tools
- **3D Viewport**: Interactive 3D scene with multiple camera views (Perspective, Top, Front, Side)
- **Scene Hierarchy**: Tree-based object management with drag-and-drop support
- **Properties Panel**: Real-time property editing with data binding
- **Asset Browser**: Categorized asset management (Models, Textures, Materials, Prefabs)

### Gameface Integration
- **Data Binding**: Seamless two-way data binding between UI and game engine
- **Engine Communication**: Direct integration with game engine through Gameface API
- **Custom Components**: Enhanced UI components optimized for game development
- **Performance Optimized**: Built for real-time game environment performance

### User Interface
- **Modern Dark Theme**: Professional editor appearance with customizable panels
- **Responsive Design**: Adaptive layout that works on different screen sizes
- **Keyboard Shortcuts**: Comprehensive hotkey system for efficient workflow
- **Context Menus**: Right-click context actions for quick operations
- **Resizable Panels**: Customizable workspace layout

### Advanced Features
- **Undo/Redo System**: Full history management with 50-step memory
- **Console Integration**: Built-in command console for advanced operations
- **Grid System**: Configurable grid with snap-to-grid functionality
- **Transform Gizmos**: Visual manipulation handles for precise editing
- **Multi-selection**: Select and edit multiple objects simultaneously

## Getting Started

### Prerequisites
- Gameface UI SDK (for game engine integration)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Basic knowledge of HTML, CSS, and JavaScript

### Installation

1. **Clone or download the project files**
2. **Open in Gameface environment** or **browser for development**

### File Structure
```
gameface-editor/
├── index.html              # Main editor interface
├── styles/
│   ├── editor.css          # Core editor styling
│   └── components.css      # Gameface UI components
├── js/
│   ├── gameface-binding.js # Data binding system
│   ├── editor-core.js      # Core editor functionality
│   ├── viewport.js         # 3D viewport management
│   ├── tools.js           # Editor tools implementation
│   ├── ui-manager.js      # UI and scene management
│   └── main.js            # Application entry point
└── README.md              # This file
```

## Usage

### Basic Operations

#### Tool Selection
- **Q** - Select Tool (default)
- **W** - Move Tool
- **E** - Rotate Tool  
- **R** - Scale Tool
- Click toolbar buttons or use keyboard shortcuts

#### Object Management
- **Left Click** - Select object
- **Ctrl+Click** - Multi-select objects
- **Right Click** - Context menu (Copy, Paste, Delete, Duplicate)
- **Delete** - Remove selected objects
- **Ctrl+D** - Duplicate selected objects

#### File Operations
- **Ctrl+N** - New scene
- **Ctrl+O** - Open scene
- **Ctrl+S** - Save scene
- **Ctrl+Shift+S** - Save scene as

#### Viewport Navigation
- **Alt+Left Mouse** - Orbit camera
- **Shift+Left Mouse** - Pan camera
- **Mouse Wheel** - Zoom camera
- **Right Mouse** - Orbit camera (alternative)

### Asset Management

1. **Browse Assets**: Use the asset browser in the left panel
2. **Switch Categories**: Click category buttons (Models, Textures, Materials, Prefabs)
3. **Add to Scene**: Double-click asset or drag to viewport
4. **Select Asset**: Single-click to select for properties

### Properties Editing

1. **Select Object**: Click object in viewport or hierarchy
2. **Edit Transform**: Modify Position, Rotation, Scale in properties panel
3. **Material Properties**: Adjust Albedo, Metallic, Roughness values
4. **Real-time Updates**: Changes apply immediately with data binding

### Console Commands

Access the console in the bottom-right panel:

- `help` - Show available commands
- `select <objectId>` - Select specific object
- `add <assetName>` - Add asset to scene
- `delete` - Delete selected objects
- `clear` - Clear console output

## Gameface Integration

### Data Binding

The editor uses Gameface's data binding system for seamless integration:

```javascript
// Automatic binding with data-binding attributes
<input type="number" data-binding="editorModel.transform.position.x">

// Programmatic binding
gamefaceBinding.updateModel('editorModel.selection.selectedObject', objectId);
```

### Engine Communication

```javascript
// Call game engine functions
gamefaceBinding.callGameFunction('SelectObject', objectId);
gamefaceBinding.callGameFunction('UpdateTransform', transformData);

// Register for engine events
gamefaceBinding.registerGameEvent('objectSelected', callback);
```

### Custom Components

The editor includes enhanced Gameface components:
- Custom sliders with value display
- Enhanced dropdowns with search
- Styled checkboxes and switches
- Tabbed interfaces
- Progress indicators

## Customization

### Themes
Modify CSS custom properties in `styles/editor.css`:
```css
:root {
    --bg-primary: #1e1e1e;
    --accent-blue: #007acc;
    --text-primary: #cccccc;
}
```

### Adding Tools
Extend the tool system by creating new tool classes:
```javascript
class CustomTool extends EditorTool {
    constructor() {
        super('custom');
    }
    
    onActivate() {
        // Tool activation logic
    }
}
```

### Engine Integration
Customize engine communication in `gameface-binding.js`:
```javascript
// Add custom model properties
engine.createJSModel('customModel', {
    myProperty: 'defaultValue'
});
```

## Browser Development Mode

For development without Gameface engine:
1. Open `index.html` in a web browser
2. Mock engine functions will be used
3. Full UI functionality available for testing
4. Console will show mock engine calls

## Performance Considerations

- **Efficient Rendering**: 60 FPS viewport with optimized draw calls
- **Memory Management**: Limited history size and object pooling
- **Data Binding**: Selective updates to minimize overhead
- **Asset Loading**: Lazy loading and caching strategies

## Troubleshooting

### Common Issues

**Editor not loading**
- Check browser console for JavaScript errors
- Ensure all files are properly served (not file:// protocol)

**Gameface integration issues**
- Verify Gameface SDK is properly initialized
- Check engine object availability
- Review data binding model registration

**Performance problems**
- Reduce viewport complexity
- Limit number of objects in scene
- Check for memory leaks in console

## API Reference

### Core Classes

- `GamefaceEditor` - Main application controller
- `EditorCore` - Core editing functionality
- `EditorViewport` - 3D viewport management
- `GamefaceBinding` - Data binding system
- `EditorScene` - Scene and hierarchy management
- `UIManager` - User interface management

### Events

- `objectSelected` - Object selection changed
- `transformChanged` - Object transform updated
- `sceneChanged` - Scene structure modified
- `toolChanged` - Active tool switched

## Contributing

1. Follow the existing code structure and naming conventions
2. Add JSDoc comments for new functions
3. Test in both browser and Gameface environments
4. Update documentation for new features

## License

This project is provided as an example implementation of Gameface UI integration for in-game editors.

## Support

For Gameface-specific questions, refer to the [Gameface Documentation](https://docs.coherent-labs.com/).

---

**Version**: 1.0.0  
**Built with**: Gameface UI, HTML5, CSS3, JavaScript ES6+
