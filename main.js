const { Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf } = require('obsidian');

// View type for the settings tab
const EXPLORER_ENHANCER_SETTINGS_VIEW = 'explorer-enhancer-settings-view';

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
    textColorOption: 'default', // 'default', 'white', 'black', 'grey', 'custom'
    customTextColor: '#FFFFFF', // Used when textColorOption is 'custom'
    selectedTextColor: '#eeeeee', // Color for selected items in dark mode
    customColors: {
        light: [...COLOR_SCHEMES.vibrant],
        dark: [...COLOR_SCHEMES.vibrant]
    },
    // Divider settings
    enableDividers: false,
    dividerItems: [], // List of items with divider settings
    dividerStyle: {
        background: {
            enabled: true,
            colorOption: 'default', // 'default', 'light', 'dark', 'custom'
            customColor: '#E0E0E0' // Used when colorOption is 'custom'
        },
        border: {
            position: 'top', // 'top', 'middle', 'bottom', 'left', 'right', 'all', 'none'
            color: '#888888',
            size: 1.0 // in pixels, from 0.5 to 10
        },
        width: 100, // Width percentage of the divider
        cssPath: '.obsidian/plugins/explorer-enhancer/file-explorer-dividers.css', // Custom CSS path
        customText: '', // Custom text/emoji for dividers
        showBefore: '' // Path to file/folder to show divider before
    }
};

class ExplorerEnhancer extends Plugin {
    settings = Object.assign({}, DEFAULT_SETTINGS);
    fileExplorerObserver = null;
    
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async onload() {
        console.log('Loading Explorer Enhancer plugin');
        
        // We'll implement settings directly without requiring external modules
        // to avoid module loading issues
        
        // Load settings
        try {
            const data = await this.loadData();
            if (data) {
                // Create a deep merge of default settings and loaded data
                this.settings = this.mergeSettings(DEFAULT_SETTINGS, data);
                
                // Initialize selected text color if not set
                if (!this.settings.selectedTextColor) {
                    this.settings.selectedTextColor = DEFAULT_SETTINGS.selectedTextColor;
                }
                
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
                
                // Ensure divider settings exist
                if (!this.settings.dividerStyle) {
                    this.settings.dividerStyle = DEFAULT_SETTINGS.dividerStyle;
                } else {
                    // Ensure all divider style properties exist
                    if (!this.settings.dividerStyle.background) {
                        this.settings.dividerStyle.background = DEFAULT_SETTINGS.dividerStyle.background;
                    } else {
                        // Ensure all background properties exist
                        this.settings.dividerStyle.background = Object.assign(
                            {}, 
                            DEFAULT_SETTINGS.dividerStyle.background, 
                            this.settings.dividerStyle.background
                        );
                    }
                }
                
                // Handle migration from old divider format to new format
                if ((this.settings.dividerFolders && this.settings.dividerFolders.length > 0) || 
                    (this.settings.dividerFiles && this.settings.dividerFiles.length > 0)) {
                    
                    // Initialize dividerItems if needed
                    if (!this.settings.dividerItems) {
                        this.settings.dividerItems = [];
                    }
                    
                    // Migrate folders
                    if (this.settings.dividerFolders && this.settings.dividerFolders.length > 0) {
                        this.settings.dividerFolders.forEach(folder => {
                            // Check if this folder is already in dividerItems
                            if (!this.settings.dividerItems.some(item => item.path === folder)) {
                                this.settings.dividerItems.push({
                                    path: folder,
                                    text: this.settings.dividerStyle.customText || '',
                                    color: this.settings.dividerStyle.border.color,
                                    position: this.settings.dividerStyle.border.position,
                                    size: this.settings.dividerStyle.border.size,
                                    width: this.settings.dividerStyle.width
                                });
                            }
                        });
                        
                        // Clear the old setting
                        this.settings.dividerFolders = [];
                    }
                    
                    // Migrate files
                    if (this.settings.dividerFiles && this.settings.dividerFiles.length > 0) {
                        this.settings.dividerFiles.forEach(file => {
                            // Check if this file is already in dividerItems
                            if (!this.settings.dividerItems.some(item => item.path === file)) {
                                this.settings.dividerItems.push({
                                    path: file,
                                    text: this.settings.dividerStyle.customText || '',
                                    color: this.settings.dividerStyle.border.color,
                                    position: this.settings.dividerStyle.border.position,
                                    size: this.settings.dividerStyle.border.size,
                                    width: this.settings.dividerStyle.width
                                });
                            }
                        });
                        
                        // Clear the old setting
                        this.settings.dividerFiles = [];
                    }
                    
                    // Save the updated settings
                    await this.saveSettings();
                }
                    
                    if (!this.settings.dividerStyle.border) {
                        this.settings.dividerStyle.border = DEFAULT_SETTINGS.dividerStyle.border;
                    } else {
                        // Ensure all border properties exist
                        this.settings.dividerStyle.border = Object.assign(
                            {}, 
                            DEFAULT_SETTINGS.dividerStyle.border, 
                            this.settings.dividerStyle.border
                        );
                    }
                    
                    // Ensure width property exists
                    if (this.settings.dividerStyle.width === undefined) {
                        this.settings.dividerStyle.width = DEFAULT_SETTINGS.dividerStyle.width;
                    }
                
                
                // Ensure divider arrays exist
                if (!this.settings.dividerFolders) {
                    this.settings.dividerFolders = [];
                }
                if (!this.settings.dividerFiles) {
                    this.settings.dividerFiles = [];
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        
        // Ensure divider settings are initialized and migrated
        this.initializeDividerSettings();
        
        // Initialize plugin styles and features
        this.initialize();
        
        // Register views
        this.registerView(
            EXPLORER_ENHANCER_SETTINGS_VIEW,
            (leaf) => (this.settingsView = new ExplorerEnhancerSettingsView(leaf, this))
        );
        
        // Register settings tab
        this.addSettingTab(new ExplorerEnhancerSettingTab(this.app, this));
        
        // Register commands
        this.addCommand({
            id: 'toggle-rainbow-folders',
            name: 'Toggle Rainbow Folders',
            callback: () => {
                this.settings.enableRainbowFolders = !this.settings.enableRainbowFolders;
                this.saveSettings();
                if (this.settings.enableRainbowFolders) {
                    this.applyRainbowColors();
                } else {
                    this.removeRainbowStyles();
                }
            }
        });
        
        this.addCommand({
            id: 'toggle-hidden-files',
            name: 'Toggle Hidden Files',
            callback: () => {
                this.settings.enableHiddenFiles = !this.settings.enableHiddenFiles;
                this.saveSettings();
                this.updateHiddenElements();
            }
        });
        
        // Apply enhancements when layout is ready
        this.app.workspace.onLayoutReady(() => {
            this.updateFileExplorer();
        });
    }
    
    /**
     * Initialize and migrate divider settings
     * Ensures compatibility between settings tab and settings view
     */
    initializeDividerSettings() {
        // Initialize divider settings if not present
        if (!this.settings.dividerItems) {
            this.settings.dividerItems = [];
        }
        
        if (!this.settings.dividerFolders) {
            this.settings.dividerFolders = [];
        }
        
        if (!this.settings.dividerFiles) {
            this.settings.dividerFiles = [];
        }
        
        // Make sure "1 - Tasks" is in the divider items
        const tasksPath = "1 - Tasks";
        const hasTasksDivider = this.settings.dividerItems.some(item => 
            item.path === tasksPath || item.path.includes(tasksPath));
            
        if (!hasTasksDivider && (this.settings.dividerFolders.includes(tasksPath) || 
            this.settings.dividerFiles.includes(tasksPath) || 
            this.app.vault.getAbstractFileByPath(tasksPath))) {
                
            console.log("Adding 1 - Tasks divider");
            this.settings.dividerItems.push({
                path: tasksPath,
                isFile: false,
                text: "Tasks",  // Set default text
                color: "#c04040",  // Set a distinctive red color
                position: "bottom",
                size: 2,
                width: 100
            });
            
            // Make sure it's in dividerFolders as well
            if (!this.settings.dividerFolders.includes(tasksPath)) {
                this.settings.dividerFolders.push(tasksPath);
            }
            
            this.saveSettings();
        }
        
        // Sync dividerFolders and dividerFiles with dividerItems
        this.syncDividerSettings();
    }
    
    /**
     * Synchronize divider settings between dividerItems, dividerFolders, and dividerFiles
     */
    syncDividerSettings() {
        // Ensure all items in dividerFolders have entries in dividerItems
        if (this.settings.dividerFolders && this.settings.dividerFolders.length > 0) {
            this.settings.dividerFolders.forEach(folderPath => {
                if (!folderPath) return;
                
                const existingIndex = this.settings.dividerItems.findIndex(item => 
                    item.path === folderPath && !item.isFile);
                    
                if (existingIndex === -1) {
                    this.settings.dividerItems.push({
                        path: folderPath,
                        isFile: false,
                        text: this.settings.dividerStyle?.customText || '',
                        color: this.settings.dividerStyle?.border?.color || '#888888',
                        position: this.settings.dividerStyle?.border?.position || 'bottom',
                        size: this.settings.dividerStyle?.border?.size || 2,
                        width: this.settings.dividerStyle?.width || 100
                    });
                }
            });
        }
        
        // Do the same for dividerFiles
        if (this.settings.dividerFiles && this.settings.dividerFiles.length > 0) {
            this.settings.dividerFiles.forEach(filePath => {
                if (!filePath) return;
                
                const existingIndex = this.settings.dividerItems.findIndex(item => 
                    item.path === filePath && item.isFile);
                    
                if (existingIndex === -1) {
                    this.settings.dividerItems.push({
                        path: filePath,
                        isFile: true,
                        text: this.settings.dividerStyle?.customText || '',
                        color: this.settings.dividerStyle?.border?.color || '#888888',
                        position: this.settings.dividerStyle?.border?.position || 'bottom',
                        size: this.settings.dividerStyle?.border?.size || 2,
                        width: this.settings.dividerStyle?.width || 100
                    });
                }
            });
        }
        
        // Save settings
        this.saveSettings();
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
        
        // Apply dividers if enabled
        if (this.settings.enableDividers) {
            this.applyDividerStyles();
        }
        
        // Setup file explorer observer
        this.setupFileExplorerObserver();
        
        // Update hidden elements
        this.updateHiddenElements();
    }
    
    onunload() {
        console.log('Unloading Explorer Enhancer plugin');
        
        // Remove styles
        this.removeStyles();
        this.removeRainbowStyles();
        this.removeColorPickerStyles();
        this.removeDividerStyles();
        
        // Unhide all elements
        document.querySelectorAll('.explorer-enhancer-hidden').forEach(el => {
            el.classList.remove('explorer-enhancer-hidden');
            el.style.display = '';
        });
        
        // Disconnect observer
        if (this.fileExplorerObserver) {
            this.fileExplorerObserver.disconnect();
            this.fileExplorerObserver = null;
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
        console.log('Applying rainbow colors with text color option:', this.settings.textColorOption);
        
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
        
        // Start building CSS
        let css = '';
        
        // Add selected text color for dark mode
        css += `
        body.theme-dark .nav-file-title.is-active,
        body.theme-dark .nav-folder-title.is-active {
            color: ${this.settings.selectedTextColor} !important;
        }
        `;
        
        // Set CSS variable for selected text color to use in styles.css
        document.documentElement.style.setProperty('--selected-text-color', this.settings.selectedTextColor);
        
        // Add special handling for text color options when they are not set to default
        // This ensures text colors work regardless of display variant
        if (this.settings.textColorOption !== 'default') {
            let textColor;
            if (this.settings.textColorOption === 'white') {
                textColor = '#FFFFFF';
            } else if (this.settings.textColorOption === 'black') {
                textColor = '#000000';
            } else if (this.settings.textColorOption === 'grey') {
                textColor = '#888888';
            } else if (this.settings.textColorOption === 'custom') {
                textColor = this.settings.customTextColor;
            }
            
            if (textColor) {
                // Apply to all folder and file titles with high specificity
                css += `
                    .nav-folder-title, .nav-file-title {
                        color: ${textColor} !important;
                    }
                    .theme-dark .nav-folder-title, .theme-dark .nav-file-title,
                    .theme-light .nav-folder-title, .theme-light .nav-file-title {
                        color: ${textColor} !important;
                    }
                `;
            }
        }
        
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
        // Remove existing observer
        if (this.fileExplorerObserver) {
            this.fileExplorerObserver.disconnect();
            this.fileExplorerObserver = null;
        }
        
        // Get the file explorer element
        const fileExplorer = this.app.workspace.getLeavesOfType('file-explorer')[0];
        if (!fileExplorer || !fileExplorer.view) return;
        
        const fileExplorerEl = fileExplorer.view.containerEl.querySelector('.nav-files-container');
        if (!fileExplorerEl) return;
        
        // Create and setup observer
        this.fileExplorerObserver = new MutationObserver(() => {
            if (this.settings.enableRainbowFolders) {
                this.applyRainbowColors();
            }
            
            this.updateHiddenElements();
            
            // Apply divider styles if enabled
            if (this.settings.enableDividers) {
                this.applyDividerStyles();
            }
            
            // Apply divider attributes to specific files and folders
            this.applyDividerAttributes();
        });
        
        this.fileExplorerObserver.observe(fileExplorerEl, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-path']
        });
        
        // Initial application of divider attributes
        this.applyDividerAttributes();
    }
    
    // Apply divider attributes to specific files and folders
    applyDividerAttributes() {
        // Only proceed if dividers are enabled
        if (!this.settings.enableDividers) return;
        
        console.log('Applying divider attributes');
        
        // Reset all existing dividers first to avoid duplicates
        document.querySelectorAll('.explorer-enhancer-divider').forEach(el => {
            el.classList.remove('explorer-enhancer-divider');
            // Remove all data attributes
            el.removeAttribute('data-border-position');
            el.removeAttribute('data-divider-text');
            // Clear all styles
            el.style.cssText = '';
        });
        
        // Remove any existing divider text elements
        document.querySelectorAll('.divider-text').forEach(el => el.remove());
        document.querySelectorAll('.divider-line').forEach(el => el.remove());
        
        // Initialize divider items array if needed
        if (!this.settings.dividerItems) {
            this.settings.dividerItems = [];
        }
        
        // CRITICAL FIX: Sync dividerFolders to dividerItems to ensure consistency
        // This ensures that dividerFolders (shown in the settings UI) are also in dividerItems (used for rendering)
        if (this.settings.dividerFolders && this.settings.dividerFolders.length > 0) {
            // For each folder in dividerFolders, ensure it exists in dividerItems
            this.settings.dividerFolders.forEach(folderPath => {
                if (!folderPath) return;
                
                // Check if this folder already exists in dividerItems
                const existingIndex = this.settings.dividerItems.findIndex(item => 
                    item.path === folderPath && !item.isFile);
                
                if (existingIndex === -1) {
                    // Add to dividerItems if not found
                    this.settings.dividerItems.push({
                        path: folderPath,
                        isFile: false,
                        text: this.settings.dividerStyle?.customText || '',
                        color: this.settings.dividerStyle?.border?.color || '#888888',
                        position: this.settings.dividerStyle?.border?.position || 'bottom',
                        size: this.settings.dividerStyle?.border?.size || 2,
                        width: this.settings.dividerStyle?.width || 100
                    });
                }
            });
        }
        
        // Do the same for dividerFiles
        if (this.settings.dividerFiles && this.settings.dividerFiles.length > 0) {
            this.settings.dividerFiles.forEach(filePath => {
                if (!filePath) return;
                
                // Check if this file already exists in dividerItems
                const existingIndex = this.settings.dividerItems.findIndex(item => 
                    item.path === filePath && item.isFile);
                
                if (existingIndex === -1) {
                    // Add to dividerItems if not found
                    this.settings.dividerItems.push({
                        path: filePath,
                        isFile: true,
                        text: this.settings.dividerStyle?.customText || '',
                        color: this.settings.dividerStyle?.border?.color || '#888888',
                        position: this.settings.dividerStyle?.border?.position || 'bottom',
                        size: this.settings.dividerStyle?.border?.size || 2,
                        width: this.settings.dividerStyle?.width || 100
                    });
                }
            });
        }
        
        // SPECIAL HANDLING: Check specifically for "1 - Tasks" divider
        // This ensures it always appears properly
        const tasksPath = "1 - Tasks";
        const hasTasksDivider = this.settings.dividerItems.some(item => item.path === tasksPath || item.path.includes(tasksPath));
        
        if (!hasTasksDivider && (this.settings.dividerFolders.includes(tasksPath) || this.settings.dividerFiles.includes(tasksPath))) {
            this.settings.dividerItems.push({
                path: tasksPath,
                isFile: false,
                text: "Tasks",  // Set default text
                color: "#c04040",  // Set a distinctive red color
                position: "bottom",
                size: 2,
                width: 100
            });
        }
        
        console.log('Applying dividers to items:', this.settings.dividerItems);
        
        // Process all divider items
        if (this.settings.dividerItems && this.settings.dividerItems.length > 0) {
            this.settings.dividerItems.forEach(item => {
                // Skip if no path
                if (!item.path) return;
                
                // Determine if it's a file or folder
                const isFile = item.isFile !== undefined ? item.isFile : 
                              (item.path.includes('.') && !item.path.endsWith('/'));
                
                // Select all elements that could match
                let selector = isFile ? 
                    `.nav-file > .nav-file-title` : 
                    `.nav-folder > .nav-folder-title`;
                
                const allElements = document.querySelectorAll(selector);
                
                // Normalize for case-insensitive matching
                const itemPathLower = item.path.trim().toLowerCase();
                
                // First try exact path match (case-insensitive)
                let elements = Array.from(allElements).filter(el => {
                    const path = (el.getAttribute('data-path') || '').trim().toLowerCase();
                    return path === itemPathLower;
                });
                
                // If no exact matches, try matching by title or partial path (case-insensitive)
                if (elements.length === 0) {
                    elements = Array.from(allElements).filter(el => {
                        const path = (el.getAttribute('data-path') || '').trim().toLowerCase();
                        const title = (el.textContent || '').trim().toLowerCase();
                        return path.includes(itemPathLower) || title.includes(itemPathLower) || 
                               itemPathLower.includes(title) || itemPathLower.includes(path);
                    });
                }
                
                // Debug logging
                console.log(`[ExplorerEnhancer] Divider matching: item.path="${item.path}" isFile=${isFile}`);
                allElements.forEach(el => {
                    console.log('[ExplorerEnhancer] Candidate:', {
                        dataPath: el.getAttribute('data-path'),
                        title: el.textContent.trim(),
                        element: el
                    });
                });
                console.log(`[ExplorerEnhancer] Found ${elements.length} elements for divider path "${item.path}"`, elements);
                
                // Apply divider styling to each matching element
                elements.forEach(el => {
                    // Get the parent (nav-file or nav-folder)
                    const parent = el.parentElement;
                    if (!parent) return;
                    
                    console.log(`Applying divider to element:`, el, `with path:`, el.getAttribute('data-path'));
                    
                    // Add the divider class
                    parent.classList.add('explorer-enhancer-divider');
                    
                    // Get divider settings with fallbacks
                    const position = item.position || this.settings.dividerStyle?.border?.position || 'bottom';
                    const color = item.color || this.settings.dividerStyle?.border?.color || '#888888';
                    const size = item.size || this.settings.dividerStyle?.border?.size || 2;
                    const width = item.width || this.settings.dividerStyle?.width || 100;
                    const text = item.text || this.settings.dividerStyle?.customText || '';
                    
                    // Set data attributes for CSS styling
                    parent.setAttribute('data-border-position', position);
                    if (text) {
                        parent.setAttribute('data-divider-text', text);
                    }
                    
                    // Set inline styles for custom colors and sizes - use !important
                    parent.style.setProperty('--divider-border-color', color, 'important');
                    parent.style.setProperty('--divider-border-size', `${size}px`, 'important');
                    parent.style.setProperty('--divider-width', `${width}%`, 'important');
                    
                    // Middle divider: set custom attribute on the title row
                    if (position === 'middle') {
                        el.setAttribute('data-divider-middle', 'true');
                    } else {
                        el.removeAttribute('data-divider-middle');
                    }
                    
                    // Apply direct styling for maximum visibility
                    if (position === 'bottom') {
                        parent.style.setProperty('border-bottom', `${size}px solid ${color}`, 'important');
                        parent.style.setProperty('padding-bottom', '6px', 'important');
                    } else if (position === 'top') {
                        parent.style.setProperty('border-top', `${size}px solid ${color}`, 'important');
                        parent.style.setProperty('padding-top', '6px', 'important');
                    } else if (position === 'left') {
                        parent.style.setProperty('border-left', `${size}px solid ${color}`, 'important');
                        parent.style.setProperty('padding-left', '6px', 'important');
                    } else if (position === 'right') {
                        parent.style.setProperty('border-right', `${size}px solid ${color}`, 'important');
                        parent.style.setProperty('padding-right', '6px', 'important');
                    } else if (position === 'all') {
                        parent.style.setProperty('border', `${size}px solid ${color}`, 'important');
                        parent.style.setProperty('padding', '0 6px', 'important');
                        parent.style.setProperty('border-radius', '4px', 'important');
                    }
                });
            });
        }
        
        // Save settings to ensure dividerItems is persisted
        this.saveSettings();
    }
    
    // Apply border styles based on settings
    applyBorderStyle(element, dividerSettings) {
        if (!element || !dividerSettings) return;
        
        const borderSize = (dividerSettings.border && dividerSettings.border.size ? dividerSettings.border.size : 1) + 'px';
        const borderColor = dividerSettings.border && dividerSettings.border.color ? dividerSettings.border.color : '#888888';
        const position = dividerSettings.border && dividerSettings.border.position ? dividerSettings.border.position : 'top';
        
        // Set data attribute for position that CSS can target
        element.setAttribute('data-border-position', position);
        
        // Set custom color through CSS variable if needed
        element.style.setProperty('--divider-border-color', borderColor);
        element.style.setProperty('--divider-border-size', borderSize);
        
        // Set width if specified
        if (dividerSettings.width !== undefined) {
            element.style.setProperty('--divider-width', `${dividerSettings.width}%`);
        }
        
        // Set custom text if specified
        if (dividerSettings.text && dividerSettings.text.trim() !== '') {
            element.setAttribute('data-divider-text', dividerSettings.text.trim());
        }
    }
    
    // Helper method to create a valid ID from a path
    sanitizeId(path) {
        return path.replace(/[^a-zA-Z0-9]/g, '_');
    }
    
    // Helper to escape CSS selectors
    escapeCssSelector(str) {
        return str.replace(/[ !#$%&'()*+,./:;<=>?@\[\]^`{|}~"]/g, '\\$&');
    }
    
    // Helper for deep merging of settings objects
    mergeSettings(defaultSettings, loadedSettings) {
        // Start with a shallow copy of default settings
        const result = Object.assign({}, defaultSettings);
        
        // If no loaded settings, return defaults
        if (!loadedSettings) return result;
        
        // For each property in loaded settings
        for (const key in loadedSettings) {
            // Skip if property doesn't exist in loaded settings
            if (!loadedSettings.hasOwnProperty(key)) continue;
            
            // Get the values from both objects
            const defaultValue = result[key];
            const loadedValue = loadedSettings[key];
            
            // If both values are objects and not arrays, recursively merge
            if (
                defaultValue && loadedValue &&
                typeof defaultValue === 'object' && typeof loadedValue === 'object' &&
                !Array.isArray(defaultValue) && !Array.isArray(loadedValue)
            ) {
                result[key] = this.mergeSettings(defaultValue, loadedValue);
            } else {
                // Otherwise, use the loaded value
                result[key] = loadedValue;
            }
        }
        
        return result;
    }
    
    // Apply divider styles
    applyDividerStyles() {
        // Safety check - ensure settings are properly initialized
        if (!this.settings) return;
        if (!this.settings.dividerStyle) {
            this.settings.dividerStyle = JSON.parse(JSON.stringify(DEFAULT_SETTINGS.dividerStyle));
        }
        
        console.log('Applying divider styles');
        
        // Remove existing divider styles first
        this.removeDividerStyles();
        
        // Add new styles if dividers are enabled
        if (!this.settings.enableDividers) return;
        
        // Create a style element for divider styles
        const styleEl = document.createElement('style');
        styleEl.id = 'explorer-enhancer-divider-styles';
        
        // Set default CSS variables for divider styling at the document level
        document.documentElement.style.setProperty('--divider-border-color', this.settings.dividerStyle.border.color || '#888888');
        document.documentElement.style.setProperty('--divider-border-size', `${this.settings.dividerStyle.border.size || 1}px`);
        document.documentElement.style.setProperty('--divider-width', `${this.settings.dividerStyle.width || 100}%`);
        
        try {
            // Load CSS styles
            styleEl.textContent = this.loadCSS();
            
            // Add the style element to the document
            document.head.appendChild(styleEl);
            
            // Apply divider attributes to the elements in the file explorer
            this.applyDividerAttributes();
        } catch (error) {
            console.error('Error applying divider styles:', error);
        }
    }
    
    // Load CSS for divider styles
    loadCSS() {
        return `
        /* Base styles for dividers */
        .nav-folder.explorer-enhancer-divider,
        .nav-file.explorer-enhancer-divider {
            position: relative;
            margin-top: 10px;
            margin-bottom: 6px;
            padding: 4px 0;
        }
        
        /* Top border */
        .nav-folder.explorer-enhancer-divider[data-border-position="top"],
        .nav-file.explorer-enhancer-divider[data-border-position="top"] {
            border-top: var(--divider-border-size, 1px) solid var(--divider-border-color, #888888);
            padding-top: 6px;
        }
        
        /* Bottom border */
        .nav-folder.explorer-enhancer-divider[data-border-position="bottom"],
        .nav-file.explorer-enhancer-divider[data-border-position="bottom"] {
            border-bottom: var(--divider-border-size, 1px) solid var(--divider-border-color, #888888);
            padding-bottom: 6px;
        }
        
        /* Left border */
        .nav-folder.explorer-enhancer-divider[data-border-position="left"],
        .nav-file.explorer-enhancer-divider[data-border-position="left"] {
            border-left: var(--divider-border-size, 1px) solid var(--divider-border-color, #888888);
            padding-left: 6px;
        }
        
        /* Right border */
        .nav-folder.explorer-enhancer-divider[data-border-position="right"],
        .nav-file.explorer-enhancer-divider[data-border-position="right"] {
            border-right: var(--divider-border-size, 1px) solid var(--divider-border-color, #888888);
            padding-right: 6px;
        }
        
        /* All sides border */
        .nav-folder.explorer-enhancer-divider[data-border-position="all"],
        .nav-file.explorer-enhancer-divider[data-border-position="all"] {
            border: var(--divider-border-size, 1px) solid var(--divider-border-color, #888888);
            padding: 6px;
            border-radius: 4px;
        }
        
        /* Middle border (NEW: line on the title, not parent) */
        .nav-folder.explorer-enhancer-divider[data-border-position="middle"],
        .nav-file.explorer-enhancer-divider[data-border-position="middle"] {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: none !important;
        }
        .nav-folder-title[data-divider-middle],
        .nav-file-title[data-divider-middle] {
            margin: 0 !important;
            padding: 0 !important;
            position: relative;
        }
        .nav-folder.explorer-enhancer-divider[data-border-position="middle"],
        .nav-file.explorer-enhancer-divider[data-border-position="middle"] {
            position: relative;
            --padding-x: 10px;
            padding: 0 var(--padding-x);
            box-sizing: border-box;
        }
        .nav-folder.explorer-enhancer-divider[data-border-position="middle"]::after,
        .nav-file.explorer-enhancer-divider[data-border-position="middle"]::after {
            content: "";
            display: block;
            position: absolute;
            top: calc(0.5em * var(--line-height-tight));
            margin-inline-start: calc(24px - var(--padding-x));
            width: 100%;
            height: 0;
            border-top: 1px solid currentColor;
            z-index: -1;
        }

        }
        
        /* No border */
        .nav-folder.explorer-enhancer-divider[data-border-position="none"],
        .nav-file.explorer-enhancer-divider[data-border-position="none"] {
            border: none;
            padding: 2px 0;
        }
        
        /* Custom text dividers */
        .nav-folder.explorer-enhancer-divider[data-divider-text]::before,
        .nav-file.explorer-enhancer-divider[data-divider-text]::before {
            content: attr(data-divider-text);
            display: block;
            font-size: 0.85em;
            color: var(--divider-border-color, #888888);
            padding-bottom: 4px;
            text-align: center;
            width: var(--divider-width, 100%);
            font-weight: 600;
        }
        
        /* Make dividers more visible */
        .nav-folder.explorer-enhancer-divider > .nav-folder-title,
        .nav-file.explorer-enhancer-divider > .nav-file-title {
            background-color: rgba(var(--background-modifier-hover-rgb), 0.05);
        }
        
        /* Force display of dividers and their children */
        .nav-folder.explorer-enhancer-divider,
        .nav-file.explorer-enhancer-divider,
        .nav-folder.explorer-enhancer-divider > .nav-folder-title,
        .nav-file.explorer-enhancer-divider > .nav-file-title,
        .divider-text,
        .divider-line {
            display: block !important;
        }
        `;
    }
    
    // Apply border styles based on settings
    applyBorderStyle(element, dividerSettings) {
        if (!element || !dividerSettings) return;
        
        const borderSize = (dividerSettings.border && dividerSettings.border.size ? dividerSettings.border.size : 1) + 'px';
        const borderColor = dividerSettings.border && dividerSettings.border.color ? dividerSettings.border.color : '#888888';
        const position = dividerSettings.border && dividerSettings.border.position ? dividerSettings.border.position : 'top';
        
        // Set data attribute for position that CSS can target
        element.setAttribute('data-border-position', position);
        
        // Set custom color through CSS variable if needed
        element.style.setProperty('--divider-border-color', borderColor);
        element.style.setProperty('--divider-border-size', borderSize);
        
        // Set width if specified
        if (dividerSettings.width !== undefined) {
            element.style.setProperty('--divider-width', `${dividerSettings.width}%`);
        }
        
        // Set custom text if specified
        if (dividerSettings.text && dividerSettings.text.trim() !== '') {
            element.setAttribute('data-divider-text', dividerSettings.text.trim());
        }
    }
    // Remove divider styles
    removeDividerStyles() {
        try {
            const styleEl = document.getElementById('explorer-enhancer-divider-styles');
            if (styleEl) {
                styleEl.remove();
            }
            
            // Remove divider attributes from elements
            document.querySelectorAll('.explorer-enhancer-divider').forEach(el => {
                el.classList.remove('explorer-enhancer-divider');
                el.removeAttribute('data-border-position');
                el.removeAttribute('data-divider-text');
                el.style.removeProperty('--divider-border-color');
                el.style.removeProperty('--divider-border-size');
                el.style.removeProperty('--divider-width');
            });
        } catch (error) {
            console.error('Error removing divider styles:', error);
        }
    }
    
    // Helper function to convert hex color to rgba
    hexToRgba(hex, opacity) {
        if (!hex) return 'rgba(0,0,0,0)';
        
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result) return 'rgba(0,0,0,0)';
        
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // Remove divider styles
    removeDividerStyles() {
        try {
            const styleEl = document.getElementById('explorer-enhancer-divider-styles');
            if (styleEl) {
                styleEl.remove();
            }
        } catch (error) {
            console.error('Error removing divider styles:', error);
        }
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
                // Determine text color based on settings
                let textColor = hexColor;
                if (this.settings.textColorOption === 'white') {
                    textColor = '#FFFFFF';
                } else if (this.settings.textColorOption === 'black') {
                    textColor = '#000000';
                } else if (this.settings.textColorOption === 'grey') {
                    textColor = '#888888';
                } else if (this.settings.textColorOption === 'custom') {
                    textColor = this.settings.customTextColor;
                }
                
                // Make sure the color is applied with more specificity
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        color: ${textColor} !important;
                    }
                    .theme-dark ${selector}[data-path="${escapedPath}"],
                    .theme-light ${selector}[data-path="${escapedPath}"] {
                        color: ${textColor} !important;
                    }
                `;
        }
    }
    
    // Create divider settings UI
    createDividerSettings(containerEl) {
        // Enable dividers toggle
        new Setting(containerEl)
            .setName('Enable Dividers')
            .setDesc('Add dividers to the file explorer')
            .addToggle(toggle => toggle
                .setValue(this.settings.enableDividers)
                .onChange(async (value) => {
                    this.settings.enableDividers = value;
                    await this.saveSettings();
                    
                    // Show/hide divider settings based on toggle
                    const dividerSettingsContainer = containerEl.querySelector('.divider-settings-container');
                    if (dividerSettingsContainer) {
                        dividerSettingsContainer.style.display = value ? 'block' : 'none';
                    }
                    
                    if (value) {
                        this.applyDividerStyles();
                    } else {
                        this.removeDividerStyles();
                    }
                }));
        
        // Divider settings container
        const dividerSettingsContainer = containerEl.createEl('div', {
            cls: 'divider-settings-container',
            attr: {
                style: `display: ${this.settings.enableDividers ? 'block' : 'none'};
                       margin-bottom: 1em; padding: 10px; background: var(--background-secondary);`
            }
        });
        
        // Divider background settings
        new Setting(dividerSettingsContainer)
            .setName('Background')
            .setDesc('Enable background for dividers')
            .addToggle(toggle => toggle
                .setValue(this.settings.dividerStyle.background.enabled)
                .onChange(async (value) => {
                    this.settings.dividerStyle.background.enabled = value;
                    await this.saveSettings();
                    
                    // Show/hide background color settings
                    const bgColorContainer = dividerSettingsContainer.querySelector('.background-color-container');
                    if (bgColorContainer) {
                        bgColorContainer.style.display = value ? 'block' : 'none';
                    }
                    
                    if (this.settings.enableDividers) {
                        this.applyDividerStyles();
                    }
                }));
        
        // Background color container
        const bgColorContainer = dividerSettingsContainer.createEl('div', {
            cls: 'background-color-container',
            attr: {
                style: `display: ${this.settings.dividerStyle.background.enabled ? 'block' : 'none'};
                       margin-left: 40px; margin-bottom: 1em;`
            }
        });
        
        // Background color option
        new Setting(bgColorContainer)
            .setName('Background Color')
            .setDesc('Choose the background color for dividers')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('default', 'Default (Theme)')
                    .addOption('light', 'Light')
                    .addOption('dark', 'Dark')
                    .addOption('custom', 'Custom Color')
                    .setValue(this.settings.dividerStyle.background.colorOption)
                    .onChange(async (value) => {
                        this.settings.dividerStyle.background.colorOption = value;
                        await this.saveSettings();
                        
                        // Show/hide custom color picker
                        const customBgColorContainer = bgColorContainer.querySelector('.custom-bg-color-container');
                        if (customBgColorContainer) {
                            customBgColorContainer.style.display = value === 'custom' ? 'block' : 'none';
                        }
                        
                        if (this.settings.enableDividers) {
                            this.applyDividerStyles();
                        }
                    });
            });
        
        // Custom background color picker
        const customBgColorContainer = bgColorContainer.createEl('div', {
            cls: 'custom-bg-color-container',
            attr: {
                style: `display: ${this.settings.dividerStyle.background.colorOption === 'custom' ? 'block' : 'none'};
                       margin-left: 20px; margin-bottom: 1em;`
            }
        });
        
        const bgColorPickerLabel = customBgColorContainer.createEl('div', {
            text: 'Custom Background Color:',
            attr: {
                style: 'margin-bottom: 8px; font-weight: 500;'
            }
        });
        
        const bgColorPicker = customBgColorContainer.createEl('input', {
            type: 'color',
            attr: {
                value: this.settings.dividerStyle.background.customColor,
                style: 'width: 50px; height: 30px; border: none; cursor: pointer;'
            }
        });
        
        bgColorPicker.addEventListener('change', async (e) => {
            this.settings.dividerStyle.background.customColor = e.target.value;
            await this.saveSettings();
            if (this.settings.enableDividers) {
                this.applyDividerStyles();
            }
        });
        
        // Border settings
        new Setting(dividerSettingsContainer)
            .setName('Border Position')
            .setDesc('Choose the position of the border')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('none', 'No Border')
                    .addOption('top', 'Top')
                    .addOption('bottom', 'Bottom')
                    .addOption('left', 'Left')
                    .addOption('right', 'Right')
                    .addOption('middle', 'Middle')
                    .addOption('all', 'All Sides')
                    .setValue(this.settings.dividerStyle.border.position)
                    .onChange(async (value) => {
                        this.settings.dividerStyle.border.position = value;
                        await this.saveSettings();
                        
                        // Show/hide border settings based on selection
                        const borderSettingsContainer = dividerSettingsContainer.querySelector('.border-settings-container');
                        if (borderSettingsContainer) {
                            borderSettingsContainer.style.display = value !== 'none' ? 'block' : 'none';
                        }
                        
                        if (this.settings.enableDividers) {
                            this.applyDividerStyles();
                        }
                    });
            });
        
        // Border settings container
        const borderSettingsContainer = dividerSettingsContainer.createEl('div', {
            cls: 'border-settings-container',
            attr: {
                style: `display: ${this.settings.dividerStyle.border.position !== 'none' ? 'block' : 'none'};
                       margin-left: 40px; margin-bottom: 1em;`
            }
        });
        
        // Border color setting
        const borderColorSetting = new Setting(borderSettingsContainer)
            .setName('Border Color')
            .setDesc('Choose the color for the border');
        
        const borderColorInput = borderColorSetting.controlEl.createEl('input', {
            type: 'color',
            attr: {
                value: this.settings.dividerStyle.border.color,
                style: 'width: 50px; height: 30px; border: none; cursor: pointer;'
            }
        });
        
        borderColorInput.addEventListener('change', async (e) => {
            this.settings.dividerStyle.border.color = e.target.value;
            await this.saveSettings();
            if (this.settings.enableDividers) {
                this.applyDividerStyles();
            }
        });
        
        // Border size slider
        new Setting(borderSettingsContainer)
            .setName('Border Size')
            .setDesc('Adjust the size of the border (0.5px - 10px)')
            .addSlider(slider => slider
                .setLimits(0.5, 10, 0.5)
                .setValue(this.settings.dividerStyle.border.size)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.settings.dividerStyle.border.size = value;
                    await this.saveSettings();
                    if (this.settings.enableDividers) {
                        this.applyDividerStyles();
                    }
                }));
        
        // Width percentage slider
        new Setting(dividerSettingsContainer)
            .setName('Divider Width')
            .setDesc('Adjust the width of the divider as a percentage')
            .addSlider(slider => slider
                .setLimits(20, 100, 5)
                .setValue(this.settings.dividerStyle.width)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.settings.dividerStyle.width = value;
                    await this.saveSettings();
                    if (this.settings.enableDividers) {
                        this.applyDividerStyles();
                    }
                }));
                
        // Custom divider text
        new Setting(dividerSettingsContainer)
            .setName('Custom Divider Text')
            .setDesc('Specify custom text or emoji for the divider (leave empty for default)')
            .addText(text => text
                .setValue(this.settings.dividerStyle.customText || '')
                .setPlaceholder('Divider text or emoji')
                .onChange(async (value) => {
                    this.settings.dividerStyle.customText = value;
                    await this.saveSettings();
                    if (this.settings.enableDividers) {
                        this.applyDividerStyles();
                    }
                }));
        
        // File/folder to show divider before
        new Setting(dividerSettingsContainer)
            .setName('Show Before')
            .setDesc('Specify file/folder path to show divider before')
            .addText(text => text
                .setValue(this.settings.dividerStyle.showBefore || '')
                .setPlaceholder('path/to/file-or-folder')
                .onChange(async (value) => {
                    this.settings.dividerStyle.showBefore = value;
                    await this.saveSettings();
                    if (this.settings.enableDividers) {
                        this.applyDividerStyles();
                    }
                }));
        
        // Divider folders section
        new Setting(dividerSettingsContainer)
            .setName('Divider Folders')
            .setDesc('Folders to add dividers to');
        
        // Display divider folders
        const dividerFoldersContainer = dividerSettingsContainer.createEl('div', {
            cls: 'divider-folders-container'
        });
        
        if (this.settings.dividerFolders && this.settings.dividerFolders.length > 0) {
            this.settings.dividerFolders.forEach((folder, index) => {
                new Setting(dividerFoldersContainer)
                    .setName(folder)
                    .addButton(button => button
                        .setButtonText('Remove')
                        .onClick(async () => {
                            this.settings.dividerFolders.splice(index, 1);
                            await this.saveSettings();
                            if (this.settings.enableDividers) {
                                this.applyDividerStyles();
                            }
                            // Refresh the view
                            const settingsTab = containerEl.closest('.explorer-enhancer-settings-container');
                            if (settingsTab) {
                                // We're in the settings view
                                const view = this.app.workspace.getLeavesOfType(EXPLORER_ENHANCER_SETTINGS_VIEW)[0]?.view;
                                if (view) {
                                    view.renderSettings(containerEl);
                                }
                            } else {
                                // We're in the settings tab
                                const tab = this.app.setting.tabContentEl.querySelector('.explorer-enhancer-settings-tab');
                                if (tab?.plugin) {
                                    tab.plugin.display();
                                }
                            }
                        }));
            });
        }
        
        // Add new divider folder
        let newDividerFolder = '';
        new Setting(dividerSettingsContainer)
            .setName('Add Divider Folder')
            .setDesc('Add a folder to apply a divider to')
            .addText(text => text
                .setPlaceholder('path/to/folder')
                .onChange((value) => {
                    newDividerFolder = value;
                }))
            .addButton(button => button
                .setButtonText('Add')
                .onClick(async () => {
                    if (newDividerFolder) {
                        if (!this.settings.dividerFolders.includes(newDividerFolder)) {
                            this.settings.dividerFolders.push(newDividerFolder);
                            await this.saveSettings();
                            if (this.settings.enableDividers) {
                                this.applyDividerStyles();
                            }
                            // Refresh the view
                            const settingsTab = containerEl.closest('.explorer-enhancer-settings-container');
                            if (settingsTab) {
                                // We're in the settings view
                                const view = this.app.workspace.getLeavesOfType(EXPLORER_ENHANCER_SETTINGS_VIEW)[0]?.view;
                                if (view) {
                                    view.renderSettings(containerEl);
                                }
                            } else {
                                // We're in the settings tab
                                const tab = this.app.setting.tabContentEl.querySelector('.explorer-enhancer-settings-tab');
                                if (tab?.plugin) {
                                    tab.plugin.display();
                                }
                            }
                        }
                    }
                }));
        
        // Divider files section
        new Setting(dividerSettingsContainer)
            .setName('Divider Files')
            .setDesc('Files to add dividers to');
        
        // Display divider files
        const dividerFilesContainer = dividerSettingsContainer.createEl('div', {
            cls: 'divider-files-container'
        });
        
        if (this.settings.dividerFiles && this.settings.dividerFiles.length > 0) {
            this.settings.dividerFiles.forEach((file, index) => {
                new Setting(dividerFilesContainer)
                    .setName(file)
                    .addButton(button => button
                        .setButtonText('Remove')
                        .onClick(async () => {
                            this.settings.dividerFiles.splice(index, 1);
                            await this.saveSettings();
                            if (this.settings.enableDividers) {
                                this.applyDividerStyles();
                            }
                            // Refresh the view
                            const settingsTab = containerEl.closest('.explorer-enhancer-settings-container');
                            if (settingsTab) {
                                // We're in the settings view
                                const view = this.app.workspace.getLeavesOfType(EXPLORER_ENHANCER_SETTINGS_VIEW)[0]?.view;
                                if (view) {
                                    view.renderSettings(containerEl);
                                }
                            } else {
                                // We're in the settings tab
                                const tab = this.app.setting.tabContentEl.querySelector('.explorer-enhancer-settings-tab');
                                if (tab?.plugin) {
                                    tab.plugin.display();
                                }
                            }
                        }));
            });
        }
        
        // Add new divider file
        let newDividerFile = '';
        new Setting(dividerSettingsContainer)
            .setName('Add Divider File')
            .setDesc('Add a file to apply a divider to')
            .addText(text => text
                .setPlaceholder('path/to/file')
                .onChange((value) => {
                    newDividerFile = value;
                }))
            .addButton(button => button
                .setButtonText('Add')
                .onClick(async () => {
                    if (newDividerFile) {
                        if (!this.settings.dividerFiles.includes(newDividerFile)) {
                            this.settings.dividerFiles.push(newDividerFile);
                            await this.saveSettings();
                            if (this.settings.enableDividers) {
                                this.applyDividerStyles();
                            }
                            // Refresh the view
                            const settingsTab = containerEl.closest('.explorer-enhancer-settings-container');
                            if (settingsTab) {
                                // We're in the settings view
                                const view = this.app.workspace.getLeavesOfType(EXPLORER_ENHANCER_SETTINGS_VIEW)[0]?.view;
                                if (view) {
                                    view.renderSettings(containerEl);
                                }
                            } else {
                                // We're in the settings tab
                                const tab = this.app.setting.tabContentEl.querySelector('.explorer-enhancer-settings-tab');
                                if (tab?.plugin) {
                                    tab.plugin.display();
                                }
                            }
                        }
                    }
                }));
    }
    
    // Open settings in a new tab
    async openSettingsTab() {
        // Check if view already exists
        const leaves = this.app.workspace.getLeavesOfType(EXPLORER_ENHANCER_SETTINGS_VIEW);
        
        if (leaves.length > 0) {
            // If the view already exists, reveal it
            this.app.workspace.revealLeaf(leaves[0]);
            return;
        }
        
        // Create a new leaf in the right sidebar
        const leaf = this.app.workspace.getLeaf('tab');
        await leaf.setViewState({
            type: EXPLORER_ENHANCER_SETTINGS_VIEW,
            active: true
        });
        
        // Reveal the leaf
        this.app.workspace.revealLeaf(leaf);
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
            
            if (this.settings.enableDividers) {
                this.applyDividerStyles();
            }
        }, 100);
    }
    
    // Load selected text styles
    loadSelectedTextStyles() {
        // Remove existing style elements
        const existingStyles = document.getElementById('explorer-enhancer-selected-text-styles');
        if (existingStyles) existingStyles.remove();
        
        // Create and add the style element with inline CSS
        const styleEl = document.createElement('style');
        styleEl.id = 'explorer-enhancer-selected-text-styles';
        styleEl.textContent = `
        /* Selected text color for dark mode */
        body.theme-dark .nav-file-title.is-active,
        body.theme-dark .nav-folder-title.is-active {
            color: ${this.settings.selectedTextColor || '#eeeeee'} !important;
        }
        
        /* Custom divider styles */
        .nav-folder.explorer-enhancer-divider,
        .nav-file.explorer-enhancer-divider {
            position: relative;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid var(--background-modifier-border);
        }
        
        /* Apply custom text if available */
        .nav-folder.explorer-enhancer-divider::before,
        .nav-file.explorer-enhancer-divider::before {
            content: attr(data-divider-text);
            font-size: 0.85em;
            color: var(--text-muted);
            font-weight: 600;
            display: block;
            padding-bottom: 4px;
        }
        `;
        document.head.appendChild(styleEl);
        
        // Set CSS variable for selected text color
        document.documentElement.style.setProperty('--selected-text-color', this.settings.selectedTextColor || '#eeeeee');
    }
    
    // This method is replaced by loadSelectedTextStyles
    // Left empty to avoid breaking any existing references
    loadImprovedDividerStyles() {
        this.loadSelectedTextStyles();
    }
    
    /**
     * Add selected text color setting for dark mode
     */
    addSelectedTextColorSetting(containerEl) {
        new Setting(containerEl)
            .setName('Selected Text Color (Dark Mode)')
            .setDesc('Choose the color for selected items in dark mode.')
            .addColorPicker(colorPicker => colorPicker
                .setValue(this.settings.selectedTextColor)
                .onChange(async (value) => {
                    this.settings.selectedTextColor = value;
                    document.documentElement.style.setProperty('--selected-text-color', value);
                    await this.saveSettings();
                    this.applyRainbowColors();
                }));
    }

    /**
     * Add display style settings with all options
     */
    addDisplayStyleSettings(containerEl) {
        // Display Style
        new Setting(containerEl)
            .setName('Display Style')
            .setDesc('Choose how colors are displayed in the file explorer')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('text', 'Text Color')
                    .addOption('background', 'Background Color')
                    .addOption('bordered', 'Left Border')
                    .addOption('dot', 'Color Dot')
                    .setValue(this.settings.displayVariant)
                    .onChange(async (value) => {
                        this.settings.displayVariant = value;
                        await this.saveSettings();
                        
                        if (this.settings.enableRainbowFolders) {
                            this.applyRainbowColors();
                        }
                    });
            });
    }

    /**
     * Add hidden files section
     */
    addHiddenFilesSettings(containerEl) {
        // Hidden Files section
        containerEl.createEl('h2', {text: 'Hidden Files and Folders'});
        
        // Hidden Files List
        new Setting(containerEl)
            .setName('Hidden Files')
            .setDesc('Files to hide in the file explorer');
        
        // Display hidden files
        const hiddenFilesContainer = containerEl.createEl('div', {
            cls: 'hidden-files-container'
        });
        
        if (this.settings.hiddenFiles && this.settings.hiddenFiles.length > 0) {
            this.settings.hiddenFiles.forEach((file, index) => {
                new Setting(hiddenFilesContainer)
                    .setName(file)
                    .addButton(button => button
                        .setButtonText('Remove')
                        .onClick(async () => {
                            this.settings.hiddenFiles.splice(index, 1);
                            await this.saveSettings();
                            this.updateHiddenElements();
                            // Force refresh of the settings view
                            this.addHiddenFilesSettings(containerEl);
                        }));
            });
        }
        
        // Add new hidden file
        let newHiddenFile = '';
        new Setting(containerEl)
            .setName('Add Hidden File')
            .setDesc('Add a file to hide in the explorer')
            .addText(text => text
                .setPlaceholder('path/to/file')
                .onChange((value) => {
                    newHiddenFile = value;
                }))
            .addButton(button => button
                .setButtonText('Add')
                .onClick(async () => {
                    if (newHiddenFile && !this.settings.hiddenFiles.includes(newHiddenFile)) {
                        this.settings.hiddenFiles.push(newHiddenFile);
                        await this.saveSettings();
                        this.updateHiddenElements();
                        // Force refresh
                        this.addHiddenFilesSettings(containerEl);
                    }
                }));
        
        // Hidden Folders List
        new Setting(containerEl)
            .setName('Hidden Folders')
            .setDesc('Folders to hide in the file explorer');
        
        // Display hidden folders
        const hiddenFoldersContainer = containerEl.createEl('div', {
            cls: 'hidden-folders-container'
        });
        
        if (this.settings.hiddenFolders && this.settings.hiddenFolders.length > 0) {
            this.settings.hiddenFolders.forEach((folder, index) => {
                new Setting(hiddenFoldersContainer)
                    .setName(folder)
                    .addButton(button => button
                        .setButtonText('Remove')
                        .onClick(async () => {
                            this.settings.hiddenFolders.splice(index, 1);
                            await this.saveSettings();
                            this.updateHiddenElements();
                            // Force refresh
                            this.addHiddenFilesSettings(containerEl);
                        }));
            });
        }
        
        // Add new hidden folder
        let newHiddenFolder = '';
        new Setting(containerEl)
            .setName('Add Hidden Folder')
            .setDesc('Add a folder to hide in the explorer')
            .addText(text => text
                .setPlaceholder('path/to/folder')
                .onChange((value) => {
                    newHiddenFolder = value;
                }))
            .addButton(button => button
                .setButtonText('Add')
                .onClick(async () => {
                    if (newHiddenFolder && !this.settings.hiddenFolders.includes(newHiddenFolder)) {
                        this.settings.hiddenFolders.push(newHiddenFolder);
                        await this.saveSettings();
                        this.updateHiddenElements();
                        // Force refresh
                        this.addHiddenFilesSettings(containerEl);
                    }
                }));
    }

    /**
     * Add all settings to a container
     */
    addAllSettings(containerEl) {
        // Clear container first
        const settingsSection = containerEl.querySelector('.explorer-enhancer-settings-section') || 
                               containerEl.createEl('div', {cls: 'explorer-enhancer-settings-section'});
        
        settingsSection.empty();
        
        // Add selected text color setting
        this.addSelectedTextColorSetting(settingsSection);
        
        // Add display style settings
        this.addDisplayStyleSettings(settingsSection);
        
        // Add hidden files and folders settings
        this.addHiddenFilesSettings(settingsSection);
        
        // Add enhanced divider settings
        this.createDividerSettings(settingsSection);
        
        return settingsSection;
    }
}

// Class for Settings Tab

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
            .setDesc('Apply rainbow colors to folders in the file explorer.')
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

        // Text Color Options
        new Setting(containerEl)
            .setName('Text Color')
            .setDesc('Choose the text color for folders and files in the explorer.')
            .addDropdown(dropdown => {
                dropdown
                    .addOption('default', 'Default (Rainbow Colors)')
                    .addOption('white', 'White')
                    .addOption('black', 'Black')
                    .addOption('grey', 'Grey')
                    .addOption('custom', 'Custom Color')
                    .setValue(this.plugin.settings.textColorOption)
                    .onChange(async (value) => {
                        this.plugin.settings.textColorOption = value;
                        await this.plugin.saveSettings();
                        
                        // Show or hide custom color picker based on selection
                        const customColorContainer = containerEl.querySelector('.custom-text-color-container');
                        if (customColorContainer) {
                            customColorContainer.style.display = value === 'custom' ? 'block' : 'none';
                        }
                        
                        this.plugin.applyRainbowColors();
                    });
            });

        // Custom Text Color Picker
        const customTextColorContainer = containerEl.createEl('div', {
            cls: 'custom-text-color-container',
            attr: {
                style: `display: ${this.plugin.settings.textColorOption === 'custom' ? 'block' : 'none'}; 
                       margin-bottom: 1em; padding: 10px; background: var(--background-secondary);`
            }
        });

        const colorPickerLabel = customTextColorContainer.createEl('div', {
            text: 'Custom Text Color:',
            attr: {
                style: 'margin-bottom: 8px; font-weight: 500;'
            }
        });

        const colorPicker = customTextColorContainer.createEl('input', {
            type: 'color',
            attr: {
                value: this.plugin.settings.customTextColor,
                style: 'width: 50px; height: 30px; border: none; cursor: pointer;'
            }
        });

        colorPicker.addEventListener('change', async (e) => {
            this.plugin.settings.customTextColor = e.target.value;
            await this.plugin.saveSettings();
            this.plugin.applyRainbowColors();
        });
                
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
                    
                    // Show a note if they're trying to use text color but not using the text display variant
                    if (value !== 'text' && this.plugin.settings.textColorOption !== 'default') {
                        const textColorNote = document.createElement('div');
                        textColorNote.className = 'setting-item-description';
                        textColorNote.style.color = 'var(--text-accent)';
                        textColorNote.textContent = 'Note: Text color options only work when Display Style is set to "Text Color"';
                        
                        const displayVariantSetting = containerEl.querySelector('.setting[data-display-variant-setting]');
                        if (displayVariantSetting) {
                            const existingNote = displayVariantSetting.querySelector('.text-color-note');
                            if (!existingNote) {
                                textColorNote.className += ' text-color-note';
                                displayVariantSetting.appendChild(textColorNote);
                            }
                        }
                    }
                    
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
        
        // Light mode custom colors UI
        // (Insert color picker UI here if needed, or remove if not needed)
        
        // Dark mode custom colors UI
        // (Insert color picker UI here if needed, or remove if not needed)
        
        // Divider settings section
        containerEl.createEl('h2', {text: 'Dividers'});
        
        try {
            // Ensure divider settings are initialized
            if (!this.plugin.settings.dividerItems) {
                this.plugin.settings.dividerItems = [];
            }
            
            // Add divider settings
            this.createDividerSettings(containerEl);
            
        } catch (error) {
            // Add error message
            containerEl.createEl('div', {
                text: 'Error loading divider settings: ' + error.message,
                attr: {
                    style: 'color: red; margin-top: 5px;'
                }
            });
            console.error('Error loading divider settings:', error);
        }
        
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
    
    // Create divider settings UI
    createDividerSettings(containerEl) {
        // Create a simple UI for divider settings that will definitely show up
        // Enable dividers toggle
        new Setting(containerEl)
            .setName('Enable Dividers')
            .setDesc('Add dividers to the file explorer')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableDividers)
                .onChange(async (value) => {
                    this.plugin.settings.enableDividers = value;
                    await this.plugin.saveSettings();
                    
                    if (value) {
                        this.plugin.applyDividerStyles();
                    } else {
                        this.plugin.removeDividerStyles();
                    }
                    
                    // Force refresh of settings
                    this.display();
                }));
                
        // Only show divider settings when enabled
        if (this.plugin.settings.enableDividers) {


            if (this.plugin.settings.dividerItems && this.plugin.settings.dividerItems.length > 0) {
                this.plugin.settings.dividerItems.forEach((item, index) => {
                    // Collapsible section for each divider
                    const details = document.createElement('details');
                    details.className = 'explorer-enhancer-divider-details';
                    containerEl.appendChild(details);
                    const summary = document.createElement('summary');
                    summary.textContent = `${item.text || item.path || 'Divider'} (${item.path})`;
                    summary.style.fontWeight = 'bold';
                    details.appendChild(summary);

                    // Divider style controls inside collapsible
                    const div = document.createElement('div');
                    div.style.marginLeft = '18px';
                    details.appendChild(div);

                    // All per-divider settings must be created after div is defined:
                    // Path editable field
                    new Setting(div)
                        .setName('Path')
                        .setDesc('File or folder path for this divider')
                        .addText(text => text
                            .setValue(item.path || '')
                            .setPlaceholder('e.g. Bugfixes or Folder/Subfolder')
                            .onChange(async (value) => {
                                item.path = value;
                                await this.plugin.saveSettings();
                                this.plugin.applyDividerStyles();
                                summary.textContent = `${item.text || value || 'Divider'} (${value})`;
                            }));

                    // Border Style
                    new Setting(div)
                        .setName('Border Style')
                        .setDesc('Choose border style for this divider')
                        .addDropdown(dropdown => dropdown
                            .addOption('solid', 'Solid')
                            .addOption('dashed', 'Dashed')
                            .addOption('dotted', 'Dotted')
                            .setValue(item.style || 'solid')
                            .onChange(async (value) => {
                                item.style = value;
                                await this.plugin.saveSettings();
                                this.plugin.applyDividerStyles();
                            }));
                    // Border Color
                    new Setting(div)
                        .setName('Border Color')
                        .setDesc('Choose color for this divider')
                        .addColorPicker(color => color
                            .setValue(item.color || '#ff5555')
                            .onChange(async (value) => {
                                item.color = value;
                                await this.plugin.saveSettings();
                                this.plugin.applyDividerStyles();
                            }));
                    // Border Size
                    new Setting(div)
                        .setName('Border Size')
                        .setDesc('Set thickness of border (px)')
                        .addSlider(slider => slider
                            .setLimits(1, 10, 1)
                            .setValue(item.size || 2)
                            .setDynamicTooltip()
                            .onChange(async (value) => {
                                item.size = value;
                                await this.plugin.saveSettings();
                                this.plugin.applyDividerStyles();
                            }));
                    // Border Position
                    new Setting(div)
                        .setName('Border Position')
                        .setDesc('Choose where to display the border')
                        .addDropdown(dropdown => dropdown
                            .addOption('top', 'Top')
                            .addOption('bottom', 'Bottom')
                            .addOption('left', 'Left')
                            .addOption('right', 'Right')
                            .addOption('all', 'All Sides')
                            .addOption('middle', 'Middle')
                            .setValue(item.position || 'middle')
                            .onChange(async (value) => {
                                item.position = value;
                                await this.plugin.saveSettings();
                                this.plugin.applyDividerStyles();
                            }));
                    // Divider Width
                    new Setting(div)
                        .setName('Divider Width')
                        .setDesc('Adjust the width as a percentage')
                        .addSlider(slider => slider
                            .setLimits(20, 100, 5)
                            .setValue(item.width || 100)
                            .setDynamicTooltip()
                            .onChange(async (value) => {
                                item.width = value;
                                await this.plugin.saveSettings();
                                this.plugin.applyDividerStyles();
                            }));
                    // Divider Text
                    new Setting(div)
                        .setName('Divider Label/Text')
                        .setDesc('Text or emoji for this divider')
                        .addText(text => text
                            .setValue(item.text || '')
                            .setPlaceholder('Divider text or emoji')
                            .onChange(async (value) => {
                                item.text = value;
                                await this.plugin.saveSettings();
                                this.plugin.applyDividerStyles();
                                summary.textContent = `${value || item.path || 'Divider'} (${item.path})`;
                            }));
                    // Remove button
                    new Setting(div)
                        .addButton(button => button
                            .setButtonText('Remove')
                            .setWarning()
                            .onClick(async () => {
                                this.plugin.settings.dividerItems.splice(index, 1);
                                await this.plugin.saveSettings();
                                this.plugin.applyDividerStyles();
                                this.display();
                            }));
                });
            } else {
                containerEl.createEl('div', {
                    text: 'No dividers defined. Add one below.',
                    attr: { style: 'margin-bottom: 15px; font-style: italic;' }
                });
            }

            // Add new divider
            const pathSetting = new Setting(containerEl)
                .setName('Add Divider')
                .setDesc('Add a new divider to the file explorer')
                .addText(text => text
                    .setPlaceholder('Folder or file path')
                    .onChange(value => {
                        this.newDividerPath = value;
                    }));
            pathSetting.addButton(button => button
                .setButtonText('Add')
                .onClick(async () => {
                    if (this.newDividerPath) {
                        const dividerItem = {
                            path: this.newDividerPath,
                            isFile: this.newDividerPath.includes('.'),
                            text: '',
                            color: '#ff5555',
                            position: 'bottom',
                            size: 2,
                            width: 100,
                            style: 'solid'
                        };
                        if (!this.plugin.settings.dividerItems) {
                            this.plugin.settings.dividerItems = [];
                        }
                        this.plugin.settings.dividerItems.push(dividerItem);
                        await this.plugin.saveSettings();
                        this.plugin.applyDividerStyles();
                        this.display();
                    }
                }));
            
        }
            
    }
    
    // Open settings in a new tab
    openSettingsTab() {
        // Find any existing views
        const leaves = this.app.workspace.getLeavesOfType(EXPLORER_ENHANCER_SETTINGS_VIEW);
        if (leaves.length > 0) {
            // Activate existing view
            this.app.workspace.revealLeaf(leaves[0]);
        } else {
            // Create new view
            this.app.workspace.getRightLeaf(false).setViewState({
                type: EXPLORER_ENHANCER_SETTINGS_VIEW,
                active: true
            });
        }
    }
    
    // Convert hex color to rgba
    hexToRgba(hex, opacity) {
        // Default opacity if not provided
        opacity = opacity !== undefined ? opacity : 1;
        
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Convert 3-digit hex to 6-digit
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        
        // Parse the hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Return rgba string
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // Update file explorer
    updateFileExplorer() {
        // Force refresh of file explorer by dispatching custom event
        this.app.workspace.trigger('file-explorer:update');
        
        // Reapply styling if needed
        if (this.settings.enableDividers) {
            this.applyDividerStyles();
        }
    }
    
    // This method is replaced by loadSelectedTextStyles
    // Left empty to avoid breaking any existing references
    loadImprovedDividerStyles() {
        // Empty implementation
    }
    
    // Add selected text color setting for dark mode
    addSelectedTextColorSetting(containerEl) {
        new Setting(containerEl)
            .setName('Selected Text Color (Dark Mode)')
            .setDesc('Choose text color for selected files in dark mode')
            .addColorPicker(color => color
                .setValue(this.settings.selectedTextColor?.dark || '#ffffff')
                .onChange(async (value) => {
                    if (!this.settings.selectedTextColor) {
                        this.settings.selectedTextColor = {};
                    }
                    this.settings.selectedTextColor.dark = value;
                    await this.saveSettings();
                    this.loadSelectedTextStyles();
                }));
                
        new Setting(containerEl)
            .setName('Selected Text Color (Light Mode)')
            .setDesc('Choose text color for selected files in light mode')
            .addColorPicker(color => color
                .setValue(this.settings.selectedTextColor?.light || '#000000')
                .onChange(async (value) => {
                    if (!this.settings.selectedTextColor) {
                        this.settings.selectedTextColor = {};
                    }
                    this.settings.selectedTextColor.light = value;
                    await this.saveSettings();
                    this.loadSelectedTextStyles();
                }));
    }
    
    // Add display style settings with all options
    addDisplayStyleSettings(containerEl) {
        // Implementation would go here
    }
    
    // Add hidden files section
    addHiddenFilesSettings(containerEl) {
        // Implementation would go here
    }
    
    // Add all settings to a container
    addAllSettings(containerEl) {
        // Implementation would go here
    }
}

// Class for Settings Tab


// Settings View for displaying settings in a tab
class ExplorerEnhancerSettingsView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return EXPLORER_ENHANCER_SETTINGS_VIEW;
    }

    getDisplayText() {
        return 'Explorer Enhancer Settings';
    }

    getIcon() {
        return 'folder';
    }

    onOpen() {
        this.plugin.addAllSettings(this.containerEl);
        return Promise.resolve();
    }
}

module.exports = ExplorerEnhancer;
