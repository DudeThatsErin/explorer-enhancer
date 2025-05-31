/**
 * Import required modules from Obsidian API
 * - Plugin: Base class for Obsidian plugins
 * - PluginSettingTab: Base class for plugin settings tabs
 * - Setting: UI component for creating setting elements
 * - ItemView: Base class for creating custom views
 * - WorkspaceLeaf: Container for views in the workspace
 */
const { Plugin, PluginSettingTab, Setting, ItemView, WorkspaceLeaf } = require('obsidian');

/**
 * Constant defining the unique view type identifier for the settings tab
 * Used to register and identify the plugin's settings view in the workspace
 */
const EXPLORER_ENHANCER_SETTINGS_VIEW = 'explorer-enhancer-settings-view';

/**
 * Predefined color schemes for folders and files
 * Each scheme is an array of 10 colors that will be used in sequence
 * These provide different visual themes for the rainbow folders feature
 */
const COLOR_SCHEMES = {
    // Bright, bold colors for high contrast
    default: ['#ff6b6b', '#f9844a', '#fee440', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#ff90e8', '#ffafcc', '#ffcce5'],
    
    // Soft, light colors for a subtle effect
    pastel: ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#ffb3c1', '#ffdde1'],
    
    // Dark, rich colors for a more serious theme
    dark: ['#03071e', '#370617', '#6a040f', '#9d0208', '#d00000', '#dc2f02', '#e85d04', '#f48c06', '#faa307', '#ffba08'],
    
    // Saturated colors with a modern feel
    vibrant: ['#7400b8', '#6930c3', '#5e60ce', '#5390d9', '#4ea8de', '#48bfe3', '#56cfe1', '#64dfdf', '#72efdd', '#80ffdb'],
    
    // Natural, earthy tones
    earth: ['#582f0e', '#7f4f24', '#936639', '#a68a64', '#b6ad90', '#c2c5aa', '#a4ac86', '#656d4a', '#414833', '#333d29'],
    
    // Monochromatic grayscale palette
    grayscale: ['#212529', '#343a40', '#495057', '#6c757d', '#adb5bd', '#ced4da', '#dee2e6', '#e9ecef', '#f8f9fa', '#ffffff'],
    
    // Very light, airy colors
    light: ['#c1f5c1', '#c1d9f5', '#c1f5f1', '#f5c1e4', '#e3c1f5', '#f5d8c1', '#f5c1c1', '#c7f9cc', '#a4def5', '#d6c4f5'],
    
    // Bright, glowing colors
    neon: ['#ff00ff', '#00ffff', '#ff0000', '#00ff00', '#ffff00', '#ff8800', '#00ff88', '#0088ff', '#8800ff', '#ffffff']
};

/**
 * Default configuration settings for the plugin
 * These values are used when the plugin is first installed
 * or if any settings are missing from the saved configuration
 */
const DEFAULT_SETTINGS = {
    // Arrays to store files and folders that should be hidden from the explorer
    hiddenFiles: [],           // List of file paths to hide
    hiddenFolders: [],         // List of folder paths to hide
    
    // Rainbow folder settings
    enableRainbowFolders: true,  // Whether to apply colors to folders
    rainbowColorScheme: 'default', // Which color scheme to use
    enableCascadingColors: true,   // Whether children should inherit parent color
    applyColorsToFiles: true,      // Whether files should also be colored
    colorOpacity: 1.0,             // Opacity level for colors (0.0-1.0)
    
    // Display options for how colors are applied
    displayVariant: 'text',        // How colors are displayed: 'text', 'background', 'bordered', 'dot'
    textColorOption: 'default',    // Text color selection: 'default', 'white', 'black', 'grey', 'custom'
    customTextColor: '#FFFFFF',    // Custom text color when textColorOption is 'custom'
    selectedTextColor: '#eeeeee',  // Color for selected items in dark mode
    
    // Custom color schemes that can be edited by the user
    customColors: {
        light: [...COLOR_SCHEMES.vibrant], // Colors for light theme
        dark: [...COLOR_SCHEMES.vibrant]   // Colors for dark theme
    }
};

/**
 * Main plugin class that implements the Explorer Enhancer functionality
 * Extends the Obsidian Plugin class to integrate with the app
 */
class ExplorerEnhancer extends Plugin {
    /**
     * Object to store the plugin's settings
     * Initialized with default settings
     */
    settings = Object.assign({}, DEFAULT_SETTINGS);
    
    /**
     * MutationObserver to watch for changes in the file explorer
     * Used to reapply styles when the explorer content changes
     */
    fileExplorerObserver = null;
    
    /**
     * Loads user settings from Obsidian's data storage
     * Merges saved settings with defaults to ensure all properties exist
     * @returns {Promise<void>} Promise that resolves when settings are loaded
     */
    async loadSettings() {
        // Combine default settings with any saved user settings
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    /**
     * Initializes the plugin when Obsidian loads it
     * Sets up settings, commands, styles, and UI elements
     * @returns {Promise<void>} Promise that resolves when initialization is complete
     */
    async onload() {
        // Log initialization message for debugging
        console.log('Loading Explorer Enhancer plugin');
        
        // We'll implement settings directly without requiring external modules
        // to avoid module loading issues
        
        // Load user settings and perform initialization/migration
        try {
            // Load saved data from Obsidian storage
            const data = await this.loadData();
            if (data) {
                // Create a deep merge of default settings and loaded data
                // This ensures all new settings are properly initialized when upgrading
                this.settings = this.mergeSettings(DEFAULT_SETTINGS, data);
                
                // Initialize selected text color if not set
                // This setting was added later, so might be missing in older installations
                if (!this.settings.selectedTextColor) {
                    this.settings.selectedTextColor = DEFAULT_SETTINGS.selectedTextColor;
                }
                
                // Ensure custom colors exist and are properly initialized
                // This handles the case where the user's settings might be missing these
                if (!this.settings.customColors) {
                    // If customColors is completely missing, initialize with defaults
                    this.settings.customColors = {
                        light: [...COLOR_SCHEMES.vibrant], // Use vibrant scheme for light theme
                        dark: [...COLOR_SCHEMES.vibrant]  // Use vibrant scheme for dark theme
                    };
                }
                // If only the light theme colors are missing, initialize them
                if (!this.settings.customColors.light) {
                    this.settings.customColors.light = [...COLOR_SCHEMES.vibrant];
                }
                // If only the dark theme colors are missing, initialize them
                if (!this.settings.customColors.dark) {
                    this.settings.customColors.dark = [...COLOR_SCHEMES.vibrant];
                }
                
                // All divider-related settings code has been removed
                // No migration or initialization needed as feature is disabled
            }
        } catch (error) {
            // Log any errors during settings loading
            console.error('Error loading settings:', error);
        }
        
        // Initialize plugin styles, observers, and event listeners
        // This is a separate method that handles all the UI setup
        this.initialize();
        
        // Register views and settings tab with Obsidian
        this.registerView(
            EXPLORER_ENHANCER_SETTINGS_VIEW,
            (leaf) => (this.settingsView = new ExplorerEnhancerSettingsView(leaf, this))
        );
        
        // Register settings tab
        this.addSettingTab(new ExplorerEnhancerSettingTab(this.app, this));
        
        // Register commands - for command palette
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
    
    // The initializeDividerSettings and syncDividerSettings methods have been removed
    
    /**
     * Main initialization method that sets up all plugin features
     * Called during plugin loading to apply all visual enhancements
     * @returns {void}
     */
    initialize() {
        // Add CSS for hiding specified files and folders
        this.addHiddenStyles();
        
        // Add CSS for color picker UI in settings
        this.addColorPickerStyles();
        
        // Apply folder/file coloring if enabled in settings
        if (this.settings.enableRainbowFolders) {
            this.applyRainbowColors();
        }
        
        // Set up mutation observer to watch for file explorer changes
        // This ensures styles are reapplied when the explorer content changes
        this.setupFileExplorerObserver();
        
        // Apply hidden elements settings to hide specified files/folders
        this.updateHiddenElements();
    }
    
    /**
     * Cleanup method called when the plugin is disabled or Obsidian is closed
     * Removes all CSS and DOM modifications made by the plugin
     * @returns {void}
     */
    onunload() {
        // Log unloading for debugging purposes
        console.log('Unloading Explorer Enhancer plugin');
        
        // Remove all CSS styles added by the plugin
        this.removeStyles();           // General styles
        this.removeRainbowStyles();    // Rainbow folder colors
        this.removeColorPickerStyles(); // Color picker UI
        // Divider styles removed as feature is disabled
        
        // Unhide any elements that were hidden by the plugin
        // This ensures no files or folders remain hidden when plugin is disabled
        document.querySelectorAll('.explorer-enhancer-hidden').forEach(el => {
            el.classList.remove('explorer-enhancer-hidden'); // Remove marker class
            el.style.display = ''; // Remove inline display:none style
        });
        
        // Disconnect the mutation observer to stop watching file explorer
        if (this.fileExplorerObserver) {
            this.fileExplorerObserver.disconnect();
            this.fileExplorerObserver = null;
        }
    }
    
    /**
     * Saves the current settings to Obsidian's data storage
     * Called whenever settings are changed to persist them
     * @returns {Promise<void>} Promise that resolves when settings are saved
     */
    async saveSettings() {
        await this.saveData(this.settings);
    }
    
    /**
     * Adds CSS styles for the color picker UI used in settings
     * Creates a custom color swatch UI for selecting colors
     * @returns {void}
     */
    addColorPickerStyles() {
        // Create a style element for the color picker CSS
        const styleEl = document.createElement('style');
        styleEl.id = 'explorer-enhancer-color-picker-styles'; // ID for later removal
        
        // Define CSS for color swatches and UI
        styleEl.textContent = `
            /* Individual color swatch styling */
            .explorer-enhancer-color-swatch {
                width: 24px !important;               /* Fixed width for all swatches */
                height: 24px !important;              /* Fixed height for all swatches */
                border-radius: 50% !important;        /* Round shape */
                margin: 4px !important;               /* Spacing between swatches */
                cursor: pointer !important;           /* Show pointer cursor on hover */
                border: 2px solid transparent !important; /* Transparent border by default */
                transition: transform 0.2s ease, border-color 0.2s ease !important; /* Smooth animations */
                position: relative !important;        /* For proper positioning */
                display: inline-block !important;     /* Display in line with other swatches */
            }
            
            /* Hover effect for color swatches */
            .explorer-enhancer-color-swatch:hover {
                transform: scale(1.1) !important;      /* Slightly enlarge on hover */
                border-color: var(--text-normal) !important; /* Show border in theme color */
            }
            
            /* Active/selected swatch styling */
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
    
    /**
     * Removes the color picker's custom styles from the document
     * This method is called during plugin cleanup or when the color picker
     * is no longer needed, ensuring that its styles don't persist
     * and potentially conflict with other elements.
     * 
     * @returns {void}
     */
    removeColorPickerStyles() {
        // Find the style element containing color picker styles by its unique ID
        const styleEl = document.getElementById('explorer-enhancer-color-picker-styles');
        // Remove it from the DOM if it exists
        if (styleEl) styleEl.remove();
    }
    
    /**
     * Adds CSS styles for hiding elements in the file explorer
     * This method creates and injects a style element containing the CSS rules
     * needed to hide files and folders based on the user's settings.
     * It first removes any existing styles to prevent duplication.
     * 
     * @returns {void}
     */
    addHiddenStyles() {
        // First remove any existing styles to avoid conflicts
        // This ensures we don't have duplicate style elements
        this.removeStyles();
        
        // Create a new style element for our CSS rules
        const styleEl = document.createElement('style');
        // Set a unique ID so we can find and remove it later
        styleEl.id = 'explorer-enhancer-styles';
        // Define the CSS rule to hide elements with our marker class
        // The !important flag ensures our rule takes precedence over other styles
        styleEl.textContent = `
            .explorer-enhancer-hidden {
                display: none !important;
            }
        `;
        // Add the style element to the document head to apply the styles
        document.head.appendChild(styleEl);
    }
    
    /**
     * Removes general plugin styles from the document
     * Cleans up the main style element used by the plugin
     * @returns {void}
     */
    removeStyles() {
        // Find the plugin's main style element by its unique ID
        const styleEl = document.getElementById('explorer-enhancer-styles');
        // Remove it from the DOM if it exists
        if (styleEl) styleEl.remove();
    }
    
    /**
     * Applies rainbow colors to folders and optionally files in the file explorer
     * 
     * This is the core visual enhancement feature of the plugin that gives folders and files
     * colorful styling in the file explorer. The method works by:
     * 1. Selecting the appropriate color scheme based on user preferences and theme
     * 2. Collecting all folder and file elements from the DOM
     * 3. Processing items by depth and applying colors sequentially or via inheritance
     * 4. Generating CSS for each element and injecting it into the document
     * 
     * The color application behavior depends on several user settings:
     * - enableCascadingColors: When true, child items inherit their parent's color
     * - applyColorsToFiles: When true, files are also colored, not just folders
     * - rainbowColorScheme: Determines which color palette to use
     * - colorOpacity: Controls the transparency of the applied colors
     * - displayVariant: Controls how colors are applied (background, text, border, etc.)
     * - textColorOption: Determines text color when folders/files are colored
     * 
     * The method first removes any existing rainbow styles before applying new ones
     * to prevent style duplication when settings change.
     * 
     * @returns {void}
     */
    applyRainbowColors() {
        // Log which text color option is being used for debugging
        console.log('Applying rainbow colors with text color option:', this.settings.textColorOption);
        
        // Remove any existing rainbow styles before applying new ones
        // This prevents style duplication when settings change
        this.removeRainbowStyles();
        
        // Get the appropriate color scheme based on settings
        let colors = [];
        if (this.settings.rainbowColorScheme === 'custom') {
            // If custom scheme selected, check if we're in dark or light mode
            const isDarkMode = document.body.classList.contains('theme-dark');
            // Use the appropriate custom color set based on theme
            colors = isDarkMode ? this.settings.customColors.dark : this.settings.customColors.light;
        } else if (COLOR_SCHEMES[this.settings.rainbowColorScheme]) {
            // If a predefined scheme is selected, use it
            colors = COLOR_SCHEMES[this.settings.rainbowColorScheme];
        } else {
            // Fallback to default if the selected scheme doesn't exist
            colors = COLOR_SCHEMES.default;
        }
        
        // Safety check: ensure we have valid colors
        if (!colors || !colors.length) {
            console.error('Invalid colors array');
            // Fallback to default color scheme if the selected one is invalid
            colors = COLOR_SCHEMES.default;
        }
        
        // Get the opacity setting with fallback to full opacity
        const opacity = this.settings.colorOpacity !== undefined ? this.settings.colorOpacity : 1.0;
        
        // Create a new style element for the rainbow styles
        const styleEl = document.createElement('style');
        styleEl.id = 'explorer-enhancer-rainbow-styles'; // Give it a unique ID for later reference
        
        // Initialize the CSS string that will contain all our style rules
        let css = '';
        
        // Add styling for selected items in dark mode
        // This makes selected items more visible when using custom colors
        css += `
        body.theme-dark .nav-file-title.is-active,
        body.theme-dark .nav-folder-title.is-active {
            color: ${this.settings.selectedTextColor} !important;
        }
        `;
        
        // Set a CSS custom property for use in other styles
        document.documentElement.style.setProperty('--selected-text-color', this.settings.selectedTextColor);
        
        // Handle custom text colors that override the default theme colors
        if (this.settings.textColorOption !== 'default') {
            // Determine which text color to use based on the setting
            let textColor;
            if (this.settings.textColorOption === 'white') {
                textColor = '#FFFFFF'; // White text
            } else if (this.settings.textColorOption === 'black') {
                textColor = '#000000'; // Black text
            } else if (this.settings.textColorOption === 'grey') {
                textColor = '#888888'; // Grey text
            } else if (this.settings.textColorOption === 'custom') {
                // Use the user's custom color setting
                textColor = this.settings.customTextColor;
            }
            
            // If we have a valid text color, apply it to all folder and file titles
            if (textColor) {
                // Use high specificity selectors to ensure our rules take precedence
                css += `
                    /* Apply to both light and dark themes */
                    .nav-folder-title, .nav-file-title {
                        color: ${textColor} !important;
                    }
                    /* Override theme-specific styles with even higher specificity */
                    .theme-dark .nav-folder-title, .theme-dark .nav-file-title,
                    .theme-light .nav-folder-title, .theme-light .nav-file-title {
                        color: ${textColor} !important;
                    }
                `;
            }
        }
        
        // Collect all folder elements from the file explorer
        const folderElements = document.querySelectorAll('.nav-folder-title');
        // Collect file elements only if we're coloring files too
        const fileElements = this.settings.applyColorsToFiles ? 
            document.querySelectorAll('.nav-file-title') : [];
            
        // Create an array to store all items for processing
        const allItems = [];
        
        // Process folders and add them to our items array
        folderElements.forEach(el => {
            // Get the folder path from the data-path attribute
            const path = el.getAttribute('data-path');
            if (path) {
                // Add folder info to our array
                allItems.push({
                    type: 'folder',             // Mark as folder
                    path: path,                 // Store full path
                    depth: path.split('/').length - 1,  // Calculate nesting depth
                    element: el                 // Store DOM reference
                });
            }
        });
        
        // Process files if we're applying colors to them
        if (this.settings.applyColorsToFiles) {
            fileElements.forEach(el => {
                // Get the file path from the data-path attribute
                const path = el.getAttribute('data-path');
                if (path) {
                    // Find the parent folder path
                    const lastSlash = path.lastIndexOf('/');
                    // Add file info to our array
                    allItems.push({
                        type: 'file',                // Mark as file
                        path: path,                  // Store full path
                        depth: path.split('/').length - 1,   // Calculate nesting depth
                        element: el,                 // Store DOM reference
                        // Store parent folder path or null if top-level
                        parentPath: lastSlash > -1 ? path.substring(0, lastSlash) : null
                    });
                }
            });
        }
        
        // Sort items based on their visual order in the file explorer
        // This ensures colors are assigned in the order users see them
        allItems.sort((a, b) => {
            if (a.element && b.element) {
                // Use DOM position to determine order
                return a.element.compareDocumentPosition(b.element) & 
                       Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
            }
            // Fallback to alphabetical sorting if DOM comparison fails
            return a.path.localeCompare(b.path);
        });
        
        // Identify top-level items (not in any subfolder)
        const topLevelItems = [];
        allItems.forEach(item => {
            // Check if path has no slashes (indicating top level)
            if (item.path.indexOf('/') === -1) {
                topLevelItems.push(item);
            }
        });
        
        // Create a map to store colors assigned to each folder
        // This is used for the cascading color feature
        const folderColors = new Map();
        
        // Apply colors to top-level items first
        topLevelItems.forEach((item, index) => {
            // Skip files if we're not coloring them
            if (item.type === 'file' && !this.settings.applyColorsToFiles) {
                return; // Skip this iteration
            }
            
            // Select color using modulo to cycle through the color array
            const colorIndex = index % colors.length;
            const color = colors[colorIndex];
            
            // Process based on item type
            if (item.type === 'folder') {
                // Store folder's color for potential inheritance by children
                folderColors.set(item.path, color);
                // Generate CSS for this folder
                css += this.generateVariantCSS('.nav-folder-title', item.path, color, opacity);
            } else if (this.settings.applyColorsToFiles) {
                // Generate CSS for this file
                css += this.generateVariantCSS('.nav-file-title', item.path, color, opacity);
            }
        });
        
        // Handle items in subfolders based on cascading setting
        if (!this.settings.enableCascadingColors) {
            // NON-CASCADING MODE: each item gets its own sequential color
            // Get all items that are not top-level
            const nonTopLevelItems = allItems.filter(item => item.path.indexOf('/') !== -1);
            
            // Process each non-top-level item
            nonTopLevelItems.forEach((item, index) => {
                // Skip files if we're not coloring them
                if (item.type === 'file' && !this.settings.applyColorsToFiles) {
                    return; // Skip this iteration
                }
                
                // Select color using modulo to cycle through the color array
                const colorIndex = index % colors.length;
                const color = colors[colorIndex];
                
                // Generate CSS based on item type
                if (item.type === 'folder') {
                    css += this.generateVariantCSS('.nav-folder-title', item.path, color, opacity);
                } else {
                    css += this.generateVariantCSS('.nav-file-title', item.path, color, opacity);
                }
            });
        } else {
            // CASCADING MODE: items inherit their parent folder's color
            // Get all items that are not top-level
            const nonTopLevelItems = allItems.filter(item => item.path.indexOf('/') !== -1);
            
            // Process each non-top-level item
            nonTopLevelItems.forEach(item => {
                // Skip files if we're not coloring them
                if (item.type === 'file' && !this.settings.applyColorsToFiles) {
                    return; // Skip this iteration
                }
                
                // Extract the top-level parent from the path
                const parts = item.path.split('/');
                const topParent = parts[0];  // First segment is the top-level parent
                // Get parent's color or use first color as fallback
                const parentColor = folderColors.get(topParent) || colors[0];
                
                // Generate CSS based on item type
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
    
    /**
     * Removes all rainbow coloring styles from the document
     * This method cleans up the rainbow color styling when the plugin is disabled or when settings change
     * It identifies the style element by its unique ID and removes it from the DOM
     * @returns {void}
     */
    removeRainbowStyles() {
        // Find the style element with rainbow styles by its unique ID
        const styleEl = document.getElementById('explorer-enhancer-rainbow-styles');
        // Remove the element from the DOM if it exists
        if (styleEl) styleEl.remove();
    }
    
    /**
     * Updates the visibility of files and folders in the file explorer based on user settings
     * This method handles the hiding/showing of elements when settings change or the explorer is refreshed
     * It first resets all previously hidden elements, then applies hiding rules based on current settings
     * @returns {void}
     */
    updateHiddenElements() {
        // First, reset all previously hidden elements to ensure a clean state
        // This is important when settings change to prevent elements from remaining hidden incorrectly
        document.querySelectorAll('.explorer-enhancer-hidden').forEach(el => {
            // Remove the marker class that identifies hidden elements
            el.classList.remove('explorer-enhancer-hidden');
            // Clear the display style to allow the element to show normally
            el.style.display = '';
        });
        
        // Process files that should be hidden according to user settings
        if (this.settings.hiddenFiles && this.settings.hiddenFiles.length > 0) {
            // Iterate through each file path in the hidden files list
            this.settings.hiddenFiles.forEach(file => {
                // First, try an exact match with the file path
                // The escapeCssSelector method handles special characters in paths that would break CSS selectors
                let elements = document.querySelectorAll(`.nav-file-title[data-path="${this.escapeCssSelector(file)}"]`);
                
                // If no match found and the file doesn't have an extension,
                // try again with .md extension (common for Markdown notes in Obsidian)
                if (elements.length === 0 && !file.includes('.')) {
                    elements = document.querySelectorAll(`.nav-file-title[data-path="${this.escapeCssSelector(file)}.md"]`);
                }
                
                // Apply hiding to all matching elements
                elements.forEach(el => {
                    // Mark the element as hidden with our custom class
                    el.classList.add('explorer-enhancer-hidden');
                    // Actually hide it with CSS display:none
                    el.style.display = 'none';
                    
                    // Also hide the parent container element (nav-file)
                    // This prevents empty space where the file would be
                    const parent = el.closest('.nav-file');
                    if (parent) {
                        parent.classList.add('explorer-enhancer-hidden');
                        parent.style.display = 'none';
                    }
                });
            });
        }
        
        // Process folders that should be hidden according to user settings
        if (this.settings.hiddenFolders && this.settings.hiddenFolders.length > 0) {
            // Iterate through each folder path in the hidden folders list
            this.settings.hiddenFolders.forEach(folder => {
                // Find folder title elements matching the path
                // The escapeCssSelector method handles special characters in paths
                const folderElements = document.querySelectorAll(`.nav-folder-title[data-path="${this.escapeCssSelector(folder)}"]`);
                
                // Apply hiding to all matching folder elements
                folderElements.forEach(el => {
                    // Mark the element as hidden with our custom class
                    el.classList.add('explorer-enhancer-hidden');
                    // Actually hide it with CSS display:none
                    el.style.display = 'none';
                    
                    // Also hide the parent folder container (nav-folder)
                    // This hides the entire folder including its collapse arrow
                    const parent = el.closest('.nav-folder');
                    if (parent) {
                        parent.classList.add('explorer-enhancer-hidden');
                        parent.style.display = 'none';
                    }
                });
                
                // Also hide all children of the hidden folder
                // This ensures that if the folder is expanded, its contents won't show
                const prefix = folder + '/';
                document.querySelectorAll('.nav-file-title, .nav-folder-title').forEach(el => {
                    // Get the path attribute to check if it's within the hidden folder
                    const path = el.getAttribute('data-path');
                    // If the path starts with the folder prefix, it's a child of the hidden folder
                    if (path && path.startsWith(prefix)) {
                        // Mark as hidden and hide with CSS
                        el.classList.add('explorer-enhancer-hidden');
                        el.style.display = 'none';
                        
                        // Also hide the parent container element (could be file or subfolder)
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
    
    /**
     * Sets up a MutationObserver to watch for changes in the file explorer
     * 
     * This method creates and configures an observer that monitors the file explorer DOM
     * for changes and automatically reapplies styling when changes occur. It handles:
     * - Disconnecting any existing observer to prevent duplicates
     * - Finding the file explorer container in the DOM
     * - Creating a new MutationObserver that triggers when content changes
     * - Configuring the observer to reapply rainbow colors, hidden elements, and dividers
     * 
     * The observer ensures that visual enhancements persist when the file explorer content
     * changes, such as when files are added/removed or folders are expanded/collapsed.
     * This is essential for maintaining a consistent visual experience in the explorer.
     * 
     * @returns {void}
     */
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
        });
        
        this.fileExplorerObserver.observe(fileExplorerEl, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-path']
        });
    }
    
    // Divider-related methods have been removed
    
    /**
     * Helper method to create a valid HTML/CSS ID from a file or folder path
     * This is necessary because paths often contain characters that are invalid in CSS IDs
     * The method replaces all non-alphanumeric characters with underscores
     * @param {string} path - The file or folder path to sanitize
     * @returns {string} A sanitized string that can be safely used as an HTML ID attribute
     */
    sanitizeId(path) {
        return path.replace(/[^a-zA-Z0-9]/g, '_');
    }
    
    /**
     * Helper method to escape special characters in CSS selectors
     * This is crucial when using file/folder paths in CSS selectors, as paths often contain
     * characters that have special meaning in CSS (like dots, spaces, brackets, etc.)
     * Without proper escaping, these would break the CSS selector syntax
     * @param {string} str - The string to escape for use in CSS selectors
     * @returns {string} The escaped string safe for use in CSS selectors
     */
    escapeCssSelector(str) {
        return str.replace(/[ !#$%&'()*+,./:;<=>?@\[\]^`{|}~"]/g, '\\$&');
    }
    
    /**
     * Performs a deep merge of user settings with default settings
     * This is crucial for handling plugin updates where new settings might be added
     * The method ensures that user's existing settings are preserved while adding
     * any new default settings that might not exist in the user's configuration
     *
     * @param {Object} defaultSettings - The default settings object with all possible settings
     * @param {Object} loadedSettings - The user's saved settings that need to be merged
     * @returns {Object} A new object containing the merged settings
     */
    mergeSettings(defaultSettings, loadedSettings) {
        // Start with a shallow copy of default settings as the base
        // This ensures we always have all default settings as a starting point
        const result = Object.assign({}, defaultSettings);
        
        // If no loaded settings exist, just return the defaults
        // This handles the case of first-time plugin usage
        if (!loadedSettings) return result;
        
        // Iterate through each property in the loaded settings
        for (const key in loadedSettings) {
            // Skip properties that don't exist in loaded settings
            // This uses hasOwnProperty to avoid iterating over prototype properties
            if (!loadedSettings.hasOwnProperty(key)) continue;
            
            // Get the corresponding values from both settings objects
            const defaultValue = result[key];
            const loadedValue = loadedSettings[key];
            
            // Special handling for nested objects (but not arrays)
            // If both values are plain objects, we recursively merge them
            // This allows deep merging of nested configuration objects
            if (
                defaultValue && loadedValue &&
                typeof defaultValue === 'object' && typeof loadedValue === 'object' &&
                !Array.isArray(defaultValue) && !Array.isArray(loadedValue)
            ) {
                // Recursively merge nested objects
                result[key] = this.mergeSettings(defaultValue, loadedValue);
            } else {
                // For non-objects or arrays, use the user's loaded value
                // This preserves user preferences for simple values and arrays
                result[key] = loadedValue;
            }
        }
        
        // Return the fully merged settings object
        return result;
    }
    
    /**
     * DIVIDER FUNCTIONALITY REMOVED
     * All methods related to divider functionality have been removed
     * This includes styles, attributes, and settings
     */
    
    /**
     * Process files that should be hidden according to user settings
     * This method applies the 'hidden' class to files and folders that should be hidden
     * based on the user's configured list of hidden paths
     * 
     * @returns {void}
     */
    processHiddenFiles() {
        if (this.settings.hiddenFiles && this.settings.hiddenFiles.length > 0) {
            // Iterate through each file path in the hidden files list
            this.settings.hiddenFiles.forEach(file => {
                // First, try an exact match with the file path
                // The escapeCssSelector method handles special characters in paths that would break CSS selectors
                let elements = document.querySelectorAll(`.nav-file-title[data-path="${this.escapeCssSelector(file)}"]`);
                
                // If no match found and the file doesn't have an extension,
                // try again with .md extension (common for Markdown notes in Obsidian)
                if (elements.length === 0 && !file.includes('.')) {
                    elements = document.querySelectorAll(`.nav-file-title[data-path="${this.escapeCssSelector(file)}.md"]`);
                }
                
                // Apply hiding to all matching elements
                elements.forEach(el => {
                    // Mark the element as hidden with our custom class
                    el.classList.add('explorer-enhancer-hidden');
                    // Actually hide it with CSS display:none
                    el.style.display = 'none';
                    
                    // Also hide the parent container element (nav-file)
                    // This prevents empty space where the file would be
                    const parent = el.closest('.nav-file');
                    if (parent) {
                        parent.classList.add('explorer-enhancer-hidden');
                        parent.style.display = 'none';
                    }
                });
            });
        }
    }
    
    /**
     * Converts a hexadecimal color code to an RGBA color string
     * This utility method enables opacity/transparency in folder coloring
     * by converting standard hex colors (#RRGGBB) to rgba() format
     * 
     * @param {string} hex - The hexadecimal color code (with or without #)
     * @param {number} opacity - The opacity value between 0 and 1
     * @returns {string} Color in rgba() format (e.g., 'rgba(255, 0, 0, 0.5)')
     */
    hexToRgba(hex, opacity) {
        // Return transparent color if no hex code provided
        if (!hex) return 'rgba(0,0,0,0)';
        
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        // This handles 3-digit hex codes by duplicating each digit
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        
        // Extract the R, G, B components using regex
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        // Return transparent color if the regex didn't match (invalid hex code)
        if (!result) return 'rgba(0,0,0,0)';
        
        // Convert hexadecimal values to decimal (0-255)
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        
        // Return the color in rgba() format
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    /**
     * Simplified version of removeDividerStyles that only removes the global CSS styles
     * 
     * This is a lightweight version of the more comprehensive removeDividerStyles method above.
     * While the full implementation removes both the style element and all element-specific attributes,
     * this simplified version only removes the global style element containing divider CSS rules.
     * 
     * This version is used in contexts where we only need to refresh the styles without
     * removing the individual element attributes and classes, such as when toggling settings
     * or changing theme modes.
     * 
     * @returns {void}
     */
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
    
    /**
     * Generates CSS rules for coloring files and folders based on the selected display variant
     * This method creates the specific CSS rules needed to apply visual styling to elements
     * in the file explorer. It handles different display variants like backgrounds and borders.
     * 
     * @param {string} selector - The CSS selector to target (.nav-folder-title or .nav-file-title)
     * @param {string} path - The file or folder path to apply styling to
     * @param {string} color - The hex color code to use for styling
     * @param {number} opacity - The opacity level (0-1) for background colors
     * @returns {string} CSS rules as a string that can be added to a style element
     */
    generateVariantCSS(selector, path, color, opacity) {
        // Clean up any whitespace from the color string
        const hexColor = color.trim();
        // Escape special characters in the path for use in CSS selectors
        const escapedPath = this.escapeCssSelector(path);
        // Convert the hex color to rgba format for transparency support
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
// Settings View for displaying settings in a tab
// This class should render all settings in a dedicated workspace tab, mirroring the settings page
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
        // Clear the container
        this.containerEl.empty();
        // Create a header for the settings tab
        this.containerEl.createEl('h2', { text: 'Explorer Enhancer Settings (Tab)' });
        // Add all settings to the tab, mirroring the settings page
        if (this.plugin && typeof this.plugin.addAllSettings === 'function') {
            // Use the same method as the settings tab to add all settings
            this.plugin.addAllSettings(this.containerEl);
        } else if (this.plugin && this.plugin.settingTab && typeof this.plugin.settingTab.display === 'function') {
            // Fallback: call display on the plugin's settingTab if available
            this.plugin.settingTab.display();
        } else {
            // If no method is available, show a message
            this.containerEl.createEl('p', { text: 'Settings UI could not be loaded.' });
        }
        
        this.plugin.addAllSettings(this.containerEl);
        return Promise.resolve();
    }
}

module.exports = ExplorerEnhancer;
