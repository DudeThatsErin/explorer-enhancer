const { Plugin, PluginSettingTab, Setting } = require('obsidian');

// Define color schemes
const COLOR_SCHEMES = {
    default: ['#ff6b6b', '#f9844a', '#fee440', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#ff90e8', '#ffafcc', '#ffcce5'],
    pastel: ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#ffb3c1', '#ffdde1'],
    dark: ['#03071e', '#370617', '#6a040f', '#9d0208', '#d00000', '#dc2f02', '#e85d04', '#f48c06', '#faa307', '#ffba08'],
    vibrant: ['#7400b8', '#6930c3', '#5e60ce', '#5390d9', '#4ea8de', '#48bfe3', '#56cfe1', '#64dfdf', '#72efdd', '#80ffdb'],
    earth: ['#582f0e', '#7f4f24', '#936639', '#a68a64', '#b6ad90', '#c2c5aa', '#a4ac86', '#656d4a', '#414833', '#333d29'],
    grayscale: ['#212529', '#343a40', '#495057', '#6c757d', '#adb5bd', '#ced4da', '#dee2e6', '#e9ecef', '#f8f9fa', '#ffffff'],
    light: ['#c1f5c1', '#c1d9f5', '#c1f5f1', '#f5c1e4', '#e3c1f5', '#f5d8c1', '#f5c1c1', '#c7f9cc', '#a4def5', '#d6c4f5'],
    neon: ['#ff00ff', '#00ffff', '#ff0000', '#00ff00', '#ffff00', '#ff8800', '#00ff88', '#0088ff', '#8800ff', '#ffffff']
};

// Default settings
const DEFAULT_SETTINGS = {
    hiddenFiles: [],
    hiddenFolders: [],
    enableRainbowFolders: true,
    rainbowColorScheme: 'default',
    enableCascadingColors: true,
    applyColorsToFiles: true,
    colorOpacity: 1.0,
    displayVariant: 'text', // 'text', 'background', 'bordered', 'dot'
    customColors: {
        light: [...COLOR_SCHEMES.vibrant],
        dark: [...COLOR_SCHEMES.vibrant]
    }
};

class ExplorerEnhancer extends Plugin {
    settings = Object.assign({}, DEFAULT_SETTINGS);
    fileExplorerObserver = null;
    
    async onload() {
        console.log('Loading Explorer Enhancer plugin');
        
        // Load settings
        try {
            const data = await this.loadData();
            if (data) {
                this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
                
                // Ensure custom colors exist
                if (!this.settings.customColors) {
                    this.settings.customColors = {
                        light: [...COLOR_SCHEMES.vibrant],
                        dark: [...COLOR_SCHEMES.vibrant]
                    };
                }
                if (!this.settings.customColors.light) {
                    this.settings.customColors.light = [...COLOR_SCHEMES.vibrant];
                }
                if (!this.settings.customColors.dark) {
                    this.settings.customColors.dark = [...COLOR_SCHEMES.vibrant];
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
        
        // Register for layout-ready event
        this.app.workspace.onLayoutReady(() => this.initialize());
        
        // Add settings tab
        this.addSettingTab(new ExplorerEnhancerSettingTab(this.app, this));
    }
    
    initialize() {
        // Add styles for hidden elements
        this.addHiddenStyles();
        
        // Add color picker styles
        this.addColorPickerStyles();
        
        // Apply rainbow colors if enabled
        if (this.settings.enableRainbowFolders) {
            this.applyRainbowColors();
        }
        
        // Hide files and folders
        this.updateHiddenElements();
        
        // Set up observer
        this.setupFileExplorerObserver();
    }
    
    onunload() {
        console.log('Unloading Explorer Enhancer plugin');
        
        // Remove styles
        this.removeStyles();
        this.removeRainbowStyles();
        this.removeColorPickerStyles();
        
        // Unhide all elements
        document.querySelectorAll('.explorer-enhancer-hidden').forEach(el => {
            el.classList.remove('explorer-enhancer-hidden');
            el.style.display = '';
        });
        
        // Disconnect observer
        if (this.fileExplorerObserver) {
            this.fileExplorerObserver.disconnect();
        }
    }
    
    async saveSettings() {
        await this.saveData(this.settings);
    }
    
    // Add color picker styles
    addColorPickerStyles() {
        const styleEl = document.createElement('style');
        styleEl.id = 'explorer-enhancer-color-picker-styles';
        styleEl.textContent = `
            .explorer-enhancer-color-swatch {
                width: 24px !important;
                height: 24px !important;
                border-radius: 50% !important;
                margin: 4px !important;
                cursor: pointer !important;
                border: 2px solid transparent !important;
                transition: transform 0.2s ease, border-color 0.2s ease !important;
                position: relative !important;
                display: inline-block !important;
            }
            
            .explorer-enhancer-color-swatch:hover {
                transform: scale(1.1) !important;
                border-color: var(--text-normal) !important;
            }
            
            .explorer-enhancer-color-swatch.active {
                border-color: var(--text-normal) !important;
                transform: scale(1.1) !important;
            }
            
            .explorer-enhancer-color-grid {
                display: flex !important;
                flex-wrap: wrap !important;
                justify-content: center !important;
                background-color: var(--background-primary-alt) !important;
                padding: 15px !important;
                border-radius: 8px !important;
                margin-bottom: 20px !important;
            }
            
            .explorer-enhancer-header-container {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                margin-bottom: 16px !important;
            }
            
            .explorer-enhancer-reset-container {
                margin-left: 15px !important;
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    // Remove color picker styles
    removeColorPickerStyles() {
        const styleEl = document.getElementById('explorer-enhancer-color-picker-styles');
        if (styleEl) styleEl.remove();
    }
    
    // Add styles for hidden elements
    addHiddenStyles() {
        // Remove existing styles
        this.removeStyles();
        
        // Create style element
        const styleEl = document.createElement('style');
        styleEl.id = 'explorer-enhancer-styles';
        styleEl.textContent = `
            .explorer-enhancer-hidden {
                display: none !important;
            }
        `;
        document.head.appendChild(styleEl);
    }
    
    // Remove styles
    removeStyles() {
        const styleEl = document.getElementById('explorer-enhancer-styles');
        if (styleEl) styleEl.remove();
    }
    
    // Apply rainbow colors to the file explorer
    applyRainbowColors() {
        // Remove existing rainbow styles
        this.removeRainbowStyles();
        
        // Get color scheme
        let colors = [];
        if (this.settings.rainbowColorScheme === 'custom') {
            const isDarkMode = document.body.classList.contains('theme-dark');
            colors = isDarkMode ? this.settings.customColors.dark : this.settings.customColors.light;
        } else if (COLOR_SCHEMES[this.settings.rainbowColorScheme]) {
            colors = COLOR_SCHEMES[this.settings.rainbowColorScheme];
        } else {
            colors = COLOR_SCHEMES.default;
        }
        
        // Validate colors array
        if (!colors || !colors.length) {
            console.error('Invalid colors array');
            colors = COLOR_SCHEMES.default;
        }
        
        // Get opacity value (default to 1.0 if not set)
        const opacity = this.settings.colorOpacity !== undefined ? this.settings.colorOpacity : 1.0;
        
        // Create style element
        const styleEl = document.createElement('style');
        styleEl.id = 'explorer-enhancer-rainbow-styles';
        let css = '';
        
        // Get all elements
        const folderElements = document.querySelectorAll('.nav-folder-title');
        const fileElements = this.settings.applyColorsToFiles ? 
            document.querySelectorAll('.nav-file-title') : [];
            
        // Collect all elements into one array for processing
        const allItems = [];
        
        // Add folders to the items array
        folderElements.forEach(el => {
            const path = el.getAttribute('data-path');
            if (path) {
                allItems.push({
                    type: 'folder',
                    path: path,
                    depth: path.split('/').length - 1,
                    element: el
                });
            }
        });
        
        // Add files to the items array if needed
        if (this.settings.applyColorsToFiles) {
            fileElements.forEach(el => {
                const path = el.getAttribute('data-path');
                if (path) {
                    const lastSlash = path.lastIndexOf('/');
                    allItems.push({
                        type: 'file',
                        path: path,
                        depth: path.split('/').length - 1,
                        element: el,
                        parentPath: lastSlash > -1 ? path.substring(0, lastSlash) : null
                    });
                }
            });
        }
        
        // First, sort all items by their visual order in the explorer
        allItems.sort((a, b) => {
            if (a.element && b.element) {
                return a.element.compareDocumentPosition(b.element) & 
                       Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
            }
            return a.path.localeCompare(b.path);
        });
        
        // Identify top-level folders and files for sequential coloring
        const topLevelItems = [];
        allItems.forEach(item => {
            if (item.path.indexOf('/') === -1) {
                topLevelItems.push(item);
            }
        });
        
        // Create a map to store folder colors
        const folderColors = new Map();
        
        // Apply sequential colors to top-level folders and files
        topLevelItems.forEach((item, index) => {
            if (item.type === 'file' && !this.settings.applyColorsToFiles) {
                return; // Skip files if not applying colors to them
            }
            
            const colorIndex = index % colors.length;
            const color = colors[colorIndex];
            
            // Store top-level folder colors for inheritance
            if (item.type === 'folder') {
                folderColors.set(item.path, color);
                css += this.generateVariantCSS('.nav-folder-title', item.path, color, opacity);
            } else if (this.settings.applyColorsToFiles) {
                css += this.generateVariantCSS('.nav-file-title', item.path, color, opacity);
            }
        });
        
        // Handle non-top-level items based on cascading setting
        if (!this.settings.enableCascadingColors) {
            // WITH CASCADING OFF: Each non-top-level item gets a sequential rainbow color
            const nonTopLevelItems = allItems.filter(item => item.path.indexOf('/') !== -1);
            
            nonTopLevelItems.forEach((item, index) => {
                if (item.type === 'file' && !this.settings.applyColorsToFiles) {
                    return; // Skip files if not applying colors to them
                }
                
                const colorIndex = index % colors.length;
                const color = colors[colorIndex];
                
                if (item.type === 'folder') {
                    css += this.generateVariantCSS('.nav-folder-title', item.path, color, opacity);
                } else {
                    css += this.generateVariantCSS('.nav-file-title', item.path, color, opacity);
                }
            });
        } else {
            // WITH CASCADING ON: Subfolders/files inherit their top-level parent's color
            const nonTopLevelItems = allItems.filter(item => item.path.indexOf('/') !== -1);
            
            nonTopLevelItems.forEach(item => {
                if (item.type === 'file' && !this.settings.applyColorsToFiles) {
                    return; // Skip files if not applying colors to them
                }
                
                // Find top-level parent
                const parts = item.path.split('/');
                const topParent = parts[0];
                const parentColor = folderColors.get(topParent) || colors[0];
                
                if (item.type === 'folder') {
                    css += this.generateVariantCSS('.nav-folder-title', item.path, parentColor, opacity);
                } else {
                    css += this.generateVariantCSS('.nav-file-title', item.path, parentColor, opacity);
                }
            });
        }
        
        // Apply the CSS
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }
    
    // Remove rainbow styles
    removeRainbowStyles() {
        const styleEl = document.getElementById('explorer-enhancer-rainbow-styles');
        if (styleEl) styleEl.remove();
    }
    
    // Update hidden elements
    updateHiddenElements() {
        // Unhide all elements first
        document.querySelectorAll('.explorer-enhancer-hidden').forEach(el => {
            el.classList.remove('explorer-enhancer-hidden');
            el.style.display = '';
        });
        
        // Process hidden files
        if (this.settings.hiddenFiles && this.settings.hiddenFiles.length > 0) {
            this.settings.hiddenFiles.forEach(file => {
                // Try exact match
                let elements = document.querySelectorAll(`.nav-file-title[data-path="${this.escapeCssSelector(file)}"]`);
                
                // Try with .md extension if needed
                if (elements.length === 0 && !file.includes('.')) {
                    elements = document.querySelectorAll(`.nav-file-title[data-path="${this.escapeCssSelector(file)}.md"]`);
                }
                
                // Hide all matching elements
                elements.forEach(el => {
                    el.classList.add('explorer-enhancer-hidden');
                    el.style.display = 'none';
                    
                    // Also hide parent nav-file
                    const parent = el.closest('.nav-file');
                    if (parent) {
                        parent.classList.add('explorer-enhancer-hidden');
                        parent.style.display = 'none';
                    }
                });
            });
        }
        
        // Process hidden folders
        if (this.settings.hiddenFolders && this.settings.hiddenFolders.length > 0) {
            this.settings.hiddenFolders.forEach(folder => {
                // Find folder elements
                const folderElements = document.querySelectorAll(`.nav-folder-title[data-path="${this.escapeCssSelector(folder)}"]`);
                
                // Hide folder elements
                folderElements.forEach(el => {
                    el.classList.add('explorer-enhancer-hidden');
                    el.style.display = 'none';
                    
                    // Also hide parent nav-folder
                    const parent = el.closest('.nav-folder');
                    if (parent) {
                        parent.classList.add('explorer-enhancer-hidden');
                        parent.style.display = 'none';
                    }
                });
                
                // Hide folder children
                const prefix = folder + '/';
                document.querySelectorAll('.nav-file-title, .nav-folder-title').forEach(el => {
                    const path = el.getAttribute('data-path');
                    if (path && path.startsWith(prefix)) {
                        el.classList.add('explorer-enhancer-hidden');
                        el.style.display = 'none';
                        
                        // Also hide parent element
                        const parent = el.closest('.nav-file, .nav-folder');
                        if (parent) {
                            parent.classList.add('explorer-enhancer-hidden');
                            parent.style.display = 'none';
                        }
                    }
                });
            });
        }
    }
    
    // Setup observer
    setupFileExplorerObserver() {
        const fileExplorer = this.app.workspace.getLeavesOfType('file-explorer')[0];
        if (!fileExplorer || !fileExplorer.view) {
            setTimeout(() => this.setupFileExplorerObserver(), 2000);
            return;
        }
        
        const container = fileExplorer.view.containerEl.querySelector('.nav-files-container');
        if (!container) {
            setTimeout(() => this.setupFileExplorerObserver(), 2000);
            return;
        }
        
        // Create observer
        this.fileExplorerObserver = new MutationObserver(() => {
            this.updateHiddenElements();
            
            if (this.settings.enableRainbowFolders) {
                this.applyRainbowColors();
            }
        });
        
        // Start observing
        this.fileExplorerObserver.observe(container, {
            childList: true,
            subtree: true
        });
    }
    
    // Helper to escape CSS selectors
    escapeCssSelector(str) {
        return str.replace(/([!"#$%&'()*+,./:;<=>?@[\]^`{|}~])/g, '\\$1');
    }
    
    // Generate CSS based on display variant
    generateVariantCSS(selector, path, color, opacity) {
        const hexColor = color.trim();
        const escapedPath = this.escapeCssSelector(path);
        const rgbaColor = this.hexToRgba(hexColor, opacity);
        
        switch (this.settings.displayVariant) {
            case 'background':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        background-color: ${rgbaColor} !important;
                        border-radius: 4px !important;
                    }
                `;
            case 'bordered':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border-left: 3px solid ${hexColor} !important;
                        padding-left: 4px !important;
                    }
                `;
            case 'top-border':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border-top: 3px solid ${hexColor} !important;
                        padding-top: 2px !important;
                    }
                `;
            case 'right-border':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border-right: 3px solid ${hexColor} !important;
                        padding-right: 4px !important;
                    }
                `;
            case 'bottom-border':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border-bottom: 3px solid ${hexColor} !important;
                        padding-bottom: 2px !important;
                    }
                `;
            case 'left-right-border':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border-left: 2px solid ${hexColor} !important;
                        border-right: 2px solid ${hexColor} !important;
                        padding-left: 4px !important;
                        padding-right: 4px !important;
                    }
                `;
            case 'top-bottom-border':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border-top: 2px solid ${hexColor} !important;
                        border-bottom: 2px solid ${hexColor} !important;
                        padding-top: 2px !important;
                        padding-bottom: 2px !important;
                    }
                `;
            case 'all-border':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border: 2px solid ${hexColor} !important;
                        border-radius: 4px !important;
                        padding: 2px 4px !important;
                    }
                `;
            case 'bordered-bg':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border-left: 3px solid ${hexColor} !important;
                        background-color: ${rgbaColor} !important;
                        border-radius: 0 4px 4px 0 !important;
                        padding-left: 4px !important;
                    }
                `;
            case 'top-border-bg':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border-top: 3px solid ${hexColor} !important;
                        background-color: ${rgbaColor} !important;
                        border-radius: 0 0 4px 4px !important;
                        padding-top: 2px !important;
                    }
                `;
            case 'right-border-bg':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border-right: 3px solid ${hexColor} !important;
                        background-color: ${rgbaColor} !important;
                        border-radius: 4px 0 0 4px !important;
                        padding-right: 4px !important;
                    }
                `;
            case 'bottom-border-bg':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border-bottom: 3px solid ${hexColor} !important;
                        background-color: ${rgbaColor} !important;
                        border-radius: 4px 4px 0 0 !important;
                        padding-bottom: 2px !important;
                    }
                `;
            case 'left-right-border-bg':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border-left: 2px solid ${hexColor} !important;
                        border-right: 2px solid ${hexColor} !important;
                        background-color: ${rgbaColor} !important;
                        padding-left: 4px !important;
                        padding-right: 4px !important;
                    }
                `;
            case 'top-bottom-border-bg':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border-top: 2px solid ${hexColor} !important;
                        border-bottom: 2px solid ${hexColor} !important;
                        background-color: ${rgbaColor} !important;
                        padding-top: 2px !important;
                        padding-bottom: 2px !important;
                    }
                `;
            case 'all-border-bg':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border: 2px solid ${hexColor} !important;
                        background-color: ${rgbaColor} !important;
                        border-radius: 4px !important;
                        padding: 2px 4px !important;
                    }
                `;
            case 'dot':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        color: ${hexColor} !important;
                        position: relative !important;
                        padding-right: 20px !important;
                    }
                    ${selector}[data-path="${escapedPath}"]::after {
                        content: '' !important;
                        position: absolute !important;
                        right: 8px !important;
                        top: 0 !important;
                        bottom: 0 !important;
                        width: 8px !important;
                        height: 8px !important;
                        border-radius: 50% !important;
                        background-color: ${hexColor} !important;
                        margin: auto 0 !important;
                    }
                `;
            case 'text':
            default:
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        color: ${hexColor} !important;
                    }
                `;
        }
    }
    
    // Convert hex color to rgba
    hexToRgba(hex, opacity) {
        // Remove the hash if it exists
        hex = hex.replace('#', '');
        
        // Parse the hex values
        let r, g, b;
        if (hex.length === 3) {
            r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
        } else {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }
        
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // Update file explorer
    updateFileExplorer() {
        // Unhide all elements
        document.querySelectorAll('.explorer-enhancer-hidden').forEach(el => {
            el.classList.remove('explorer-enhancer-hidden');
            el.style.display = '';
        });
        
        // Force refresh file explorer if available
        const fileExplorer = this.app.workspace.getLeavesOfType('file-explorer')[0];
        if (fileExplorer && fileExplorer.view && fileExplorer.view.requestRefresh) {
            fileExplorer.view.requestRefresh();
        }
        
        // Update hidden elements with a slight delay
        setTimeout(() => {
            this.updateHiddenElements();
            
            if (this.settings.enableRainbowFolders) {
                this.applyRainbowColors();
            }
        }, 100);
    }
}

class ExplorerEnhancerSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    
    display() {
        const {containerEl} = this;
        containerEl.empty();
        
        // Rainbow Folders section
        containerEl.createEl('h2', {text: 'Rainbow Folders'});
        
        new Setting(containerEl)
            .setName('Enable Rainbow Folders')
            .setDesc('Colorize folders in the file explorer based on nesting level')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableRainbowFolders)
                .onChange(async (value) => {
                    this.plugin.settings.enableRainbowFolders = value;
                    await this.plugin.saveSettings();
                    
                    if (value) {
                        this.plugin.applyRainbowColors();
                    } else {
                        this.plugin.removeRainbowStyles();
                    }
                }));
                
        // Cascading colors toggle
        new Setting(containerEl)
            .setName('Enable Cascading Colors')
            .setDesc('If enabled, all folders at the same nesting level get the same color. If disabled, each folder gets a unique color in sequence.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableCascadingColors)
                .onChange(async (value) => {
                    this.plugin.settings.enableCascadingColors = value;
                    await this.plugin.saveSettings();
                    
                    if (this.plugin.settings.enableRainbowFolders) {
                        // Force a complete reapplication of colors
                        this.plugin.removeRainbowStyles();
                        
                        // Add a small delay to ensure DOM is updated
                        setTimeout(() => {
                            try {
                                this.plugin.applyRainbowColors();
                                console.log('Colors reapplied with cascading:', value);
                            } catch (error) {
                                console.error('Error applying rainbow colors:', error);
                            }
                        }, 100);
                    }
                }));
        
        // Apply colors to files toggle
        new Setting(containerEl)
            .setName('Apply Colors to Files')
            .setDesc('If enabled, files will inherit the color of their parent folder')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.applyColorsToFiles)
                .onChange(async (value) => {
                    this.plugin.settings.applyColorsToFiles = value;
                    await this.plugin.saveSettings();
                    
                    if (this.plugin.settings.enableRainbowFolders) {
                        this.plugin.applyRainbowColors();
                    }
                }));
        
        // Rainbow color scheme selector
        new Setting(containerEl)
            .setName('Rainbow Color Scheme')
            .setDesc('Choose a color scheme for rainbow folders')
            .addDropdown(dropdown => {
                // Add all available color schemes
                for (const scheme of ['default', 'pastel', 'dark', 'vibrant', 'earth', 'grayscale', 'light', 'neon', 'custom']) {
                    dropdown.addOption(scheme, scheme.charAt(0).toUpperCase() + scheme.slice(1));
                }
                
                dropdown.setValue(this.plugin.settings.rainbowColorScheme);
                dropdown.onChange(async (value) => {
                    this.plugin.settings.rainbowColorScheme = value;
                    await this.plugin.saveSettings();
                    
                    // Show/hide custom color settings based on selection
                    const customSection = containerEl.querySelector('.custom-colors-section');
                    if (customSection) {
                        customSection.style.display = value === 'custom' ? 'block' : 'none';
                    }
                    
                    if (this.plugin.settings.enableRainbowFolders) {
                        this.plugin.applyRainbowColors();
                    }
                });
            });
        
        // Color opacity slider
        new Setting(containerEl)
            .setName('Color Opacity')
            .setDesc('Adjust the opacity/transparency of colors (applies to background and border styles only)')
            .addSlider(slider => slider
                .setLimits(0.1, 1.0, 0.1)
                .setValue(this.plugin.settings.colorOpacity || 1.0)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.colorOpacity = value;
                    await this.plugin.saveSettings();
                    
                    if (this.plugin.settings.enableRainbowFolders) {
                        this.plugin.applyRainbowColors();
                    }
                }));
                
        // Display variant dropdown
        new Setting(containerEl)
            .setName('Display Style')
            .setDesc('Choose how colors are displayed in the file explorer')
            .addDropdown(dropdown => {
                dropdown.addOption('text', 'Text Color');
                dropdown.addOption('background', 'Background');
                // Single borders
                dropdown.addOption('bordered', 'Left Border');
                dropdown.addOption('top-border', 'Top Border');
                dropdown.addOption('right-border', 'Right Border');
                dropdown.addOption('bottom-border', 'Bottom Border');
                dropdown.addOption('left-right-border', 'Left+Right Borders');
                dropdown.addOption('top-bottom-border', 'Top+Bottom Borders');
                dropdown.addOption('all-border', 'All Borders');
                // Borders with backgrounds
                dropdown.addOption('bordered-bg', 'Left Border + BG');
                dropdown.addOption('top-border-bg', 'Top Border + BG');
                dropdown.addOption('right-border-bg', 'Right Border + BG');
                dropdown.addOption('bottom-border-bg', 'Bottom Border + BG');
                dropdown.addOption('left-right-border-bg', 'Left+Right Borders + BG');
                dropdown.addOption('top-bottom-border-bg', 'Top+Bottom Borders + BG');
                dropdown.addOption('all-border-bg', 'All Borders + BG');
                // Bullet point
                dropdown.addOption('dot', 'Bullet Point');
                
                dropdown.setValue(this.plugin.settings.displayVariant || 'text');
                dropdown.onChange(async (value) => {
                    this.plugin.settings.displayVariant = value;
                    await this.plugin.saveSettings();
                    
                    if (this.plugin.settings.enableRainbowFolders) {
                        this.plugin.applyRainbowColors();
                    }
                    
                    // Force update folder colors with slight delay to ensure rendering
                    setTimeout(() => {
                        if (this.plugin.settings.enableRainbowFolders) {
                            this.plugin.applyRainbowColors();
                        }
                    }, 50);
                });
            });
        
        // Custom colors section
        this.customColorsContainer = containerEl.createDiv('custom-colors-container');
        
        // Hide if not using custom colors
        if (this.plugin.settings.rainbowColorScheme !== 'custom') {
            this.customColorsContainer.style.display = 'none';
        }
        
        // Light mode custom colors
        new Setting(this.customColorsContainer)
            .setName('Light Mode Colors')
            .setDesc('Define custom colors for light mode');
        
        this.createColorPicker(this.customColorsContainer, 'light');
        
        // Dark mode custom colors
        new Setting(this.customColorsContainer)
            .setName('Dark Mode Colors')
            .setDesc('Define custom colors for dark mode');
        
        this.createColorPicker(this.customColorsContainer, 'dark');
        
        // Hidden files section
        containerEl.createEl('h2', {text: 'Hidden Files and Folders'});
        
        // Hidden files list
        new Setting(containerEl)
            .setName('Hidden Files')
            .setDesc('Files that will be hidden in the file explorer');
        
        const hiddenFilesContainer = containerEl.createDiv('hidden-files-container');
        
        if (this.plugin.settings.hiddenFiles && this.plugin.settings.hiddenFiles.length > 0) {
            this.plugin.settings.hiddenFiles.forEach((file, index) => {
                new Setting(hiddenFilesContainer)
                    .setName(file)
                    .addButton(button => button
                        .setButtonText('Remove')
                        .onClick(async () => {
                            this.plugin.settings.hiddenFiles.splice(index, 1);
                            await this.plugin.saveSettings();
                            this.plugin.updateFileExplorer();
                            this.display();
                        }));
            });
        }
        
        // Add new hidden file
        new Setting(containerEl)
            .setName('Add Hidden File')
            .setDesc('Add a file to hide in the file explorer')
            .addText(text => text
                .setPlaceholder('path/to/file')
                .onChange((value) => {
                    this.newHiddenFile = value;
                }))
            .addButton(button => button
                .setButtonText('Add')
                .onClick(async () => {
                    if (this.newHiddenFile) {
                        if (!this.plugin.settings.hiddenFiles) {
                            this.plugin.settings.hiddenFiles = [];
                        }
                        this.plugin.settings.hiddenFiles.push(this.newHiddenFile);
                        await this.plugin.saveSettings();
                        this.plugin.updateFileExplorer();
                        this.newHiddenFile = '';
                        this.display();
                    }
                }));
        
        // Hidden folders list
        new Setting(containerEl)
            .setName('Hidden Folders')
            .setDesc('Folders that will be hidden in the file explorer');
        
        const hiddenFoldersContainer = containerEl.createDiv('hidden-folders-container');
        
        if (this.plugin.settings.hiddenFolders && this.plugin.settings.hiddenFolders.length > 0) {
            this.plugin.settings.hiddenFolders.forEach((folder, index) => {
                new Setting(hiddenFoldersContainer)
                    .setName(folder)
                    .addButton(button => button
                        .setButtonText('Remove')
                        .onClick(async () => {
                            this.plugin.settings.hiddenFolders.splice(index, 1);
                            await this.plugin.saveSettings();
                            this.plugin.updateFileExplorer();
                            this.display();
                        }));
            });
        }
        
        // Add new hidden folder
        new Setting(containerEl)
            .setName('Add Hidden Folder')
            .setDesc('Add a folder to hide in the file explorer')
            .addText(text => text
                .setPlaceholder('path/to/folder')
                .onChange((value) => {
                    this.newHiddenFolder = value;
                }))
            .addButton(button => button
                .setButtonText('Add')
                .onClick(async () => {
                    if (this.newHiddenFolder) {
                        if (!this.plugin.settings.hiddenFolders) {
                            this.plugin.settings.hiddenFolders = [];
                        }
                        this.plugin.settings.hiddenFolders.push(this.newHiddenFolder);
                        await this.plugin.saveSettings();
                        this.plugin.updateFileExplorer();
                        this.newHiddenFolder = '';
                        this.display();
                    }
                }));
    }
    
    // Create color picker for custom colors
    createColorPicker(containerEl, mode) {
        // Create header container
        const headerContainer = containerEl.createDiv();
        headerContainer.createEl('span', {text: 'Select colors (click to edit)'});
        
        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset to Default';
        resetButton.style.marginLeft = '10px';
        headerContainer.appendChild(resetButton);
        
        resetButton.onclick = async () => {
            // Reset colors to default
            const defaultColors = mode === 'light' ? COLOR_SCHEMES.default : COLOR_SCHEMES.dark;
            this.plugin.settings.customColors[mode] = [...defaultColors];
            await this.plugin.saveSettings();
            
            // Update the UI
            this.display();
            
            // Update folder colors
            if (this.plugin.settings.enableRainbowFolders) {
                this.plugin.applyRainbowColors();
            }
        };
        
        // Create color grid
        const colorGrid = document.createElement('div');
        colorGrid.style.display = 'flex';
        colorGrid.style.flexWrap = 'wrap';
        colorGrid.style.gap = '10px';
        colorGrid.style.padding = '15px';
        colorGrid.style.backgroundColor = 'var(--background-primary-alt)';
        colorGrid.style.borderRadius = '5px';
        colorGrid.style.marginTop = '10px';
        colorGrid.style.marginBottom = '20px';
        containerEl.appendChild(colorGrid);
        
        // Get colors for current mode
        const colors = this.plugin.settings.customColors[mode];
        
        // Create color swatches
        if (colors && colors.length > 0) {
            for (let i = 0; i < colors.length; i++) {
                // Capture the current index for closure
                const currentIndex = i;
                
                // Create a color swatch element
                const swatch = document.createElement('div');
                swatch.style.width = '30px';
                swatch.style.height = '30px';
                swatch.style.borderRadius = '50%';
                swatch.style.backgroundColor = colors[i];
                swatch.style.cursor = 'pointer';
                swatch.style.border = '2px solid transparent';
                swatch.style.transition = 'transform 0.2s ease';
                
                // Add hover effect
                swatch.onmouseover = () => {
                    swatch.style.transform = 'scale(1.1)';
                    swatch.style.borderColor = 'white';
                };
                swatch.onmouseout = () => {
                    swatch.style.transform = 'scale(1.0)';
                    swatch.style.borderColor = 'transparent';
                };
                
                // Add click handler for color picking
                swatch.onclick = async () => {
                    // Create a color input element
                    const input = document.createElement('input');
                    input.type = 'color';
                    input.value = colors[currentIndex];
                    
                    // Set up the change handler
                    input.onchange = async (e) => {
                        const newColor = e.target.value;
                        
                        // Update the swatch visually
                        swatch.style.backgroundColor = newColor;
                        
                        // Update the stored color
                        this.plugin.settings.customColors[mode][currentIndex] = newColor;
                        await this.plugin.saveSettings();
                        
                        // Apply colors to folders
                        if (this.plugin.settings.enableRainbowFolders) {
                            this.plugin.applyRainbowColors();
                        }
                    };
                    
                    // Open the color picker
                    input.click();
                };
                
                // Add to the color grid
                colorGrid.appendChild(swatch);
            }
        }
    }
}

module.exports = ExplorerEnhancer;
