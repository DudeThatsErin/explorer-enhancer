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

// Function to get text colors dynamically, always including custom option
const getTextColors = (settings) => {
  const baseTextColors = {
    default: ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    white:   ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
    black:   ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    grey:    ['#888', '#888', '#888', '#888', '#888', '#888', '#888', '#888', '#888', '#888'],
    custom:  Array(10).fill(settings?.customTextColor || '#fff')
  };
  
  // Text colors for specific color schemes
  const schemeTextColors = {
    default:       ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    pastel:        ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    dark:          ['#fff', '#fff', '#fff', '#fff', '#fff', '#000', '#000', '#000', '#000', '#000'],
    vibrant:       ['#fff', '#fff', '#fff', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    earth:         ['#fff', '#fff', '#fff', '#000', '#000', '#000', '#fff', '#fff', '#fff', '#fff'],
    grayscale:     ['#fff', '#fff', '#fff', '#fff', '#000', '#000', '#000', '#000', '#000', '#000'],
    light:         ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    neon:          ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    oceanBreeze:   ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    sunrisePastels:['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    blush:         ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    mintSorbet:    ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    sandShell:     ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    deepSpace:     ['#fff', '#fff', '#fff', '#fff', '#000', '#fff', '#fff', '#fff', '#fff', '#fff'],
    gothicJewel:   ['#fff', '#fff', '#fff', '#fff', '#000', '#000', '#000', '#000', '#000', '#000'],
    midnightFire:  ['#fff', '#fff', '#fff', '#fff', '#fff', '#000', '#000', '#000', '#000', '#000'],
    emberGlow:     ['#fff', '#fff', '#fff', '#fff', '#000', '#000', '#000', '#000', '#fff', '#000'],
    nightForest:   ['#fff', '#fff', '#fff', '#fff', '#fff', '#000', '#000', '#000', '#000', '#000'],
    
    // New light-mode palettes
    peachDream:    ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#fff', '#fff', '#fff'],
    roseBlush:     ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#fff', '#fff', '#fff'],
    lemonMint:     ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    airyLilac:     ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#fff', '#fff', '#fff'],
    pastelWave:    ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    coralHaze:     ['#000', '#000', '#000', '#000', '#000', '#000', '#fff', '#fff', '#fff', '#fff'],
    softPetals:    ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#fff', '#fff', '#fff'],
    vanillaSky:    ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    morningMist:   ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    calmLagoon:    ['#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
  
    // New dark-mode palettes
    twilightIndigo:['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
    lavaFlow:      ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#000', '#000', '#000'],
    ironStorm:     ['#fff', '#fff', '#fff', '#fff', '#fff', '#000', '#000', '#000', '#000', '#000'],
    shadowBlue:    ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
    toxicGlow:     ['#fff', '#fff', '#fff', '#000', '#000', '#000', '#000', '#000', '#000', '#000'],
    emberAsh:      ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#000', '#000'],
    cosmicPulse:   ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#000', '#000'],
    nightRose:     ['#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff', '#fff'],
    abyssTeal:     ['#fff', '#fff', '#fff', '#fff', '#fff', '#000', '#000', '#000', '#000', '#000'],
    duskCopper:    ['#fff', '#fff', '#fff', '#fff', '#fff', '#000', '#000', '#000', '#000', '#000']
  };
  
  return {...baseTextColors, ...schemeTextColors};
};

// Function to get color schemes dynamically, always including custom option
const getColorSchemes = (settings) => {
  const baseSchemes = {
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
    neon: ['#ff00ff', '#00ffff', '#ff0000', '#00ff00', '#ffff00', '#ff8800', '#00ff88', '#0088ff', '#8800ff', '#ffffff'],

    // Light mode gradient-compatible
    oceanBreeze: ['#d1f0f7', '#a7e9f1', '#b8e0d2', '#c4f1be', '#f7f9b6', '#fef3c7', '#ffe2e2', '#e5d4ed', '#d8e2dc', '#edf6f9'],
    sunrisePastels: ['#fff5e1', '#ffe9cc', '#ffd4b3', '#ffcab1', '#ffc6d0', '#e8dff5', '#e2f0cb', '#cdf0ea', '#f6dfeb', '#d6e2e9'],
    blush: ['#fce1e4', '#f8cdda', '#f5b8c4', '#f3a0bc', '#f6c6d0', '#f9e4ef', '#f3dee7', '#f7d6e0', '#fde2e4', '#ffcfd2'],
    mintSorbet: ['#e0f7f1', '#ccf2e9', '#b3eadf', '#99e2d6', '#80dbcd', '#66d4c4', '#4dcdbc', '#33c5b3', '#1abdaa', '#00b6a0'],
    sandShell: ['#f4e2d8', '#f7f1e1', '#f9e5cf', '#f7f0d9', '#f3eacb', '#e9dbc9', '#d6c8b2', '#d9c5a0', '#dbcbbf', '#f5efe7'],

    // Dark mode gradient-compatible
    deepSpace: ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd', '#14213d', '#233d4d', '#3e5c76', '#6c91bf', '#0f0f0f'],
    gothicJewel: ['#1e1e2e', '#302f4d', '#50366e', '#634488', '#7c5dad', '#945ec3', '#ae72d2', '#c49ddc', '#d3b4e8', '#f1d9ff'],
    midnightFire: ['#1a1a2e', '#16213e', '#0f3460', '#53354a', '#903749', '#e84545', '#ff5722', '#ffc107', '#ff9a76', '#ffd6a5'],
    emberGlow: ['#2d1b14', '#3e2723', '#5d4037', '#795548', '#a1887f', '#bcaaa4', '#d7ccc8', '#8d6e63', '#bf360c', '#ff7043'],
    nightForest: ['#0b3d20', '#14532d', '#1e5631', '#2e7d32', '#388e3c', '#43a047', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9'],

    // New 10 light-mode gradient palettes
    peachDream: ['#fff1e6', '#ffe0cc', '#ffd1b3', '#ffbf99', '#ffad80', '#ff9c66', '#ff8a4d', '#ff7933', '#ff671a', '#ff5500'],
    roseBlush: ['#fff0f3', '#ffe0e9', '#ffcfdc', '#ffbfd0', '#ffafc4', '#ff9fb8', '#ff8fac', '#ff7fa0', '#ff6f94', '#ff5f88'],
    lemonMint: ['#f8fff4', '#eaffdf', '#dcffc9', '#ccffb3', '#baff99', '#a6ff80', '#91ff66', '#7cff4d', '#66ff33', '#51ff1a'],
    airyLilac: ['#f5f0ff', '#e8dfff', '#dbcfff', '#cebfff', '#c1afff', '#b49fff', '#a78fff', '#9a7fff', '#8d6fff', '#805fff'],
    pastelWave: ['#f0ffff', '#d9fafa', '#c2f5f5', '#abf0f0', '#94ebeb', '#7de6e6', '#66e1e1', '#4fdcdc', '#38d7d7', '#21d2d2'],
    coralHaze: ['#fff2f0', '#ffe0db', '#ffccc4', '#ffb7ad', '#ffa398', '#ff8e83', '#ff796e', '#ff6559', '#ff5044', '#ff3b2f'],
    softPetals: ['#fff5fa', '#ffe3f2', '#ffd1e9', '#ffbfdf', '#ffadd6', '#ff9bcc', '#ff89c3', '#ff77b9', '#ff65b0', '#ff53a6'],
    vanillaSky: ['#fffbea', '#fff4d6', '#ffeec2', '#ffe7ae', '#ffe09a', '#ffda86', '#ffd372', '#ffcc5e', '#ffc54a', '#ffbe36'],
    morningMist: ['#edf6f9', '#d8eefe', '#c4e7ff', '#b0dfff', '#9cd8ff', '#88d1ff', '#74caff', '#60c2ff', '#4cbbff', '#38b4ff'],
    calmLagoon: ['#e3f2fd', '#d0e7fa', '#bde0f7', '#aad9f4', '#97d2f1', '#84cbef', '#71c4ec', '#5ebde9', '#4bb6e6', '#38afe3'],

    // New 10 dark-mode gradient palettes
    twilightIndigo: ['#0e0b16', '#1a1325', '#261c34', '#322443', '#3e2d52', '#4a3661', '#563e70', '#62477f', '#6e4f8e', '#7a589d'],
    lavaFlow: ['#330000', '#4d0000', '#660000', '#800000', '#991a1a', '#b23333', '#cc4d4d', '#e66666', '#ff8080', '#ff9999'],
    ironStorm: ['#1b1b1b', '#2c2c2c', '#3d3d3d', '#4e4e4e', '#5f5f5f', '#707070', '#818181', '#929292', '#a3a3a3', '#b4b4b4'],
    shadowBlue: ['#0a0f1e', '#121a32', '#1a2547', '#22305c', '#2a3b71', '#324686', '#3a519b', '#425cb0', '#4a67c5', '#5272da'],
    toxicGlow: ['#141414', '#193c1a', '#1f6430', '#259c46', '#2fc45c', '#4cda7a', '#6af097', '#8dffb3', '#b0ffd0', '#d3ffec'],
    emberAsh: ['#1f0f0f', '#2a1b1b', '#352727', '#403333', '#4b3f3f', '#564b4b', '#615757', '#6c6363', '#777f7f', '#828b8b'],
    cosmicPulse: ['#090031', '#12014f', '#1c0270', '#260390', '#3004b1', '#3a05d1', '#4e23e4', '#6f53ed', '#917df5', '#b3a7fd'],
    nightRose: ['#2a0e1b', '#3c1327', '#4d1833', '#5f1d3f', '#71214b', '#832657', '#952b63', '#a72f6f', '#b9347b', '#cb3987'],
    abyssTeal: ['#001f1f', '#003333', '#004747', '#005b5b', '#007070', '#008484', '#009898', '#00adad', '#00c1c1', '#00d5d5'],
    duskCopper: ['#2d1b0f', '#402b1c', '#533b29', '#664b36', '#795b43', '#8c6b50', '#9f7b5d', '#b28b6a', '#c59b77', '#d8ab84']
  };
  
  // Add custom colors based on settings
  const customSchemes = {
    custom: settings?.customColors ? 
      (settings.app?.isDarkMode ? 
        [...settings.customColors.dark] : 
        [...settings.customColors.light]) : 
      ['#ff6b6b', '#f9844a', '#fee440', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#ff90e8', '#ffafcc', '#ffcce5']
  };
  
  return {...baseSchemes, ...customSchemes};
};

const DIVIDER_STYLES = ['middleLeft', 'middleCenter', 'middleRight', 'top', 'bottom', 'left', 'right', 'all', 'none', 'allBG', 'BG', 'topBG', 'bottomBG', 'leftBG', 'rightBG', 'text-only'];


/**
 * Default configuration settings for the plugin
 * These values are used when the plugin is first installed
 * or if any settings are missing from the saved configuration
 */
const DEFAULT_SETTINGS = {
    hiddenFiles: [],
    hiddenFolders: [],
    enableRainbowFolders: true,
    rainbowColorScheme: 'default',
    enableCascadingColors: true,
    applyColorsToFiles: true,
    colorOpacity: 1.0,
    displayVariant: 'text', // 'text', 'background', 'bordered', 'dot'
    textColor: 'default', // 'default', 'white', 'black', 'grey', 'custom'
    customTextColor: '#FFFFFF', // Used when textColor is 'custom'
    selectedTextColor: '#eeeeee', // Color for selected items in dark mode
    customColors: {
        light: ['#7400b8', '#6930c3', '#5e60ce', '#5390d9', '#4ea8de', '#48bfe3', '#56cfe1', '#64dfdf', '#72efdd', '#80ffdb'],
        dark: ['#7400b8', '#6930c3', '#5e60ce', '#5390d9', '#4ea8de', '#48bfe3', '#56cfe1', '#64dfdf', '#72efdd', '#80ffdb']
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
        text: {
            colorOption: 'default', // 'default', 'custom'
            customColor: '#222222' // Used when colorOption is 'custom'
        },
        border: {
            position: 'top', // 'top', 'middle', 'bottom', 'left', 'right', 'all', 'none'
            color: '#888888',
            size: 1.0 // in pixels, from 0.5 to 10
        },
        width: 100, // Width percentage of the divider
        customText: '', // Custom text/emoji for dividers
        showBefore: '' // Path to file/folder to show divider before
    }
};

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
                    this.settings.customColors.light = [...getColorSchemes(this.settings).vibrant];
                }
                // If only the dark theme colors are missing, initialize them
                if (!this.settings.customColors.dark) {
                    this.settings.customColors.dark = [...getColorSchemes(this.settings).vibrant];
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
        
        // Add ribbon icon for settings tab
        this.addRibbonIcon('settings', 'Explorer Enhancer Settings', () => {
            this.openSettingsTab();
        });
        
        // Add ribbon toggle for Rainbow Folders
        this.addRibbonIcon('palette', 'Toggle Rainbow Folders', async () => {
            this.settings.enableRainbowFolders = !this.settings.enableRainbowFolders;
            await this.saveSettings();
            if (this.settings.enableRainbowFolders) {
                // Use the wrapper method for reliable styling
                this.applyWrapperRainbowStyles();
                
                // Set up the observer to maintain styles
                this.setupRainbowMutationObserver();
            } else {
                this.removeRainbowStyles();
            }
        });
        
        // Add ribbon toggle for Dividers
        this.addRibbonIcon('lines-of-text', 'Toggle Dividers', async () => {
            this.settings.enableDividers = !this.settings.enableDividers;
            await this.saveSettings();
            this.updateFileExplorer();
        });
        
        // Register commands
        this.addCommand({
            id: 'toggle-rainbow-folders',
            name: 'Toggle Rainbow Folders',
            callback: () => {
                this.settings.enableRainbowFolders = !this.settings.enableRainbowFolders;
                this.saveSettings();
                if (this.settings.enableRainbowFolders) {
                    // Use the wrapper method for reliable styling
                this.applyWrapperRainbowStyles();
                
                // Set up the observer to maintain styles
                this.setupRainbowMutationObserver();
                } else {
                    this.removeRainbowStyles();
                }
            }
        });
        
        this.addCommand({
            id: 'toggle-dividers',
            name: 'Toggle Dividers',
            callback: async () => {
                this.settings.enableDividers = !this.settings.enableDividers;
                await this.saveSettings();
                this.updateFileExplorer();
            }
        });
        
        this.addCommand({
            id: 'open-settings',
            name: 'Open Settings Tab',
            callback: () => {
                this.openSettingsTab();
            }
        });
        
        // Add command to reload the plugin
        this.addCommand({
            id: 'reload-plugin',
            name: 'Reload Plugin',
            callback: async () => {
                // Remove all styles
                this.removeStyles();
                this.removeRainbowStyles();
                this.removeColorPickerStyles();
                this.removeDividerStyles();
                
                // Re-initialize everything
                this.initialize();
                
                // Force update the file explorer
                this.updateFileExplorer();
                
                // Show notification
                new Notice('Explorer Enhancer plugin reloaded');
            }
        });
        
        // Add command to force apply rainbow styles
        this.addCommand({
            id: 'force-rainbow',
            name: 'Force Apply Rainbow Styles',
            callback: async () => {
                // Apply direct CSS for rainbow folders
                this.applyDirectRainbowCSS();
                
                // Show notification
                new Notice('Rainbow styles directly applied');
            }
        });
        
        // Apply enhancements when layout is ready
        this.app.workspace.onLayoutReady(() => {
            this.updateFileExplorer();
        });
        
        // We'll handle settings padding in a different way to avoid the error
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
        console.log('Initializing Explorer Enhancer');
        
        // Add styles for hidden elements
        this.addHiddenStyles();
        
        // Add color picker styles
        this.addColorPickerStyles();
        
        // Apply rainbow colors if enabled
        if (this.settings.enableRainbowFolders) {
            // Use the wrapper method for reliable styling
            this.applyWrapperRainbowStyles();
            
            // Set up the observer to maintain styles
            this.setupRainbowMutationObserver();
        }
        
        // Setup file explorer observer
        this.setupFileExplorerObserver();
        
        // Apply dividers if enabled
        if (this.settings.enableDividers) {
            this.applyDividerStyles();
        }
        
        // Update hidden elements
        this.updateHiddenElements();
    }
    
    // Apply wrapper-based rainbow styles
    applyWrapperRainbowStyles() {
        console.log('Applying wrapper-based rainbow styles');
        
        if (!this.settings.enableRainbowFolders) {
            console.log('Rainbow folders disabled, skipping');
            return;
        }
        
        // Get color scheme
        let colors = [];
        if (this.settings.rainbowColorScheme === 'custom') {
            const isDarkMode = document.body.classList.contains('theme-dark');
            colors = isDarkMode ? this.settings.customColors.dark : this.settings.customColors.light;
        } else if (getColorSchemes(this.settings)[this.settings.rainbowColorScheme]) {
            colors = getColorSchemes(this.settings)[this.settings.rainbowColorScheme];
        } else {
            colors = getColorSchemes(this.settings).default;
        }
        
        // Validate colors array
        if (!colors || colors.length === 0) {
            console.error('Invalid colors array');
            colors = getColorSchemes(this.settings).default;
        }
        
        console.log('Using colors:', colors);
        
        // Wait for the file explorer to be fully loaded
        setTimeout(() => {
            // Get all folder elements
            const folderElements = document.querySelectorAll('.nav-folder-title');
            console.log('Found folder elements:', folderElements.length);
            
            if (folderElements.length === 0) {
                console.error('No folder elements found');
                return;
            }
            
            // Apply colors to folders
            let colorIndex = 0;
            folderElements.forEach(folderEl => {
                const path = folderEl.getAttribute('data-path');
                if (!path) return;
                
                const color = colors[colorIndex % colors.length];
                const opacity = this.settings.colorOpacity || 0.5;
                const rgbaColor = this.hexToRgba(color, opacity);
                
                console.log(`Applying style to folder: ${path} with color: ${color}`);
                
                // Create a custom element to wrap the folder title
                const wrapper = document.createElement('div');
                wrapper.className = 'rainbow-folder-wrapper';
                wrapper.style.cssText = `
                    display: inline-block;
                    width: 100%;
                    height: 100%;
                    background-color: ${rgbaColor} !important;
                    border-radius: 4px !important;
                    padding: 2px !important;
                    margin: 2px 0 !important;
                `;
                
                // Clone the folder element's children
                Array.from(folderEl.childNodes).forEach(child => {
                    const clone = child.cloneNode(true);
                    wrapper.appendChild(clone);
                });
                
                // Clear the folder element and add the wrapper
                folderEl.innerHTML = '';
                folderEl.appendChild(wrapper);
                
                // Store the color for files to use
                folderEl.setAttribute('data-rainbow-color', color);
                folderEl.setAttribute('data-rainbow-rgba', rgbaColor);
                
                // Increment color index for next folder
                if (!this.settings.enableCascadingColors) {
                    colorIndex++;
                } else {
                    // For cascading colors, get the depth
                    const depth = (path.match(/\//g) || []).length;
                    if (depth === 0) colorIndex++; // Only increment for root folders
                }
            });
            
            // Apply colors to files if enabled
            if (this.settings.applyColorsToFiles) {
                // Get all file elements
                const fileElements = document.querySelectorAll('.nav-file-title');
                console.log('Found file elements:', fileElements.length);
                
                fileElements.forEach(fileEl => {
                    const path = fileEl.getAttribute('data-path');
                    if (!path) return;
                    
                    // Find parent folder
                    const pathParts = path.split('/');
                    pathParts.pop(); // Remove filename
                    const parentPath = pathParts.join('/');
                    
                    // Find parent folder element
                    const parentFolderEl = document.querySelector(`.nav-folder-title[data-path="${parentPath}"]`);
                    if (!parentFolderEl) return;
                    
                    // Get parent folder color from data attribute
                    const color = parentFolderEl.getAttribute('data-rainbow-color');
                    const rgbaColor = parentFolderEl.getAttribute('data-rainbow-rgba');
                    
                    if (!color || !rgbaColor) return;
                    
                    console.log(`Applying style to file: ${path} with parent color: ${color}`);
                    
                    // Create a custom element to wrap the file title
                    const wrapper = document.createElement('div');
                    wrapper.className = 'rainbow-file-wrapper';
                    wrapper.style.cssText = `
                        display: inline-block;
                        width: 100%;
                        height: 100%;
                        background-color: ${rgbaColor} !important;
                        border-radius: 4px !important;
                        padding: 2px !important;
                        margin: 2px 0 !important;
                    `;
                    
                    // Clone the file element's children
                    Array.from(fileEl.childNodes).forEach(child => {
                        const clone = child.cloneNode(true);
                        wrapper.appendChild(clone);
                    });
                    
                    // Clear the file element and add the wrapper
                    fileEl.innerHTML = '';
                    fileEl.appendChild(wrapper);
                });
            }
            
            console.log('Wrapper-based rainbow styles applied successfully');
        }, 500); // Wait for elements to be fully loaded
    }
    
    // Extreme method to force apply rainbow styles
    forceApplyRainbowStylesExtreme() {
        console.log('Applying rainbow styles with extreme method');
        
        // Force enable rainbow folders temporarily for this operation
        const wasEnabled = this.settings.enableRainbowFolders;
        this.settings.enableRainbowFolders = true;
        
        console.log('Forcing rainbow folders enabled for this operation');
        
        // Get color scheme
        let colors = [];
        if (this.settings.rainbowColorScheme === 'custom') {
            const isDarkMode = document.body.classList.contains('theme-dark');
            colors = isDarkMode ? this.settings.customColors.dark : this.settings.customColors.light;
        } else if (getColorSchemes(this.settings)[this.settings.rainbowColorScheme]) {
            colors = getColorSchemes(this.settings)[this.settings.rainbowColorScheme];
        } else {
            colors = getColorSchemes(this.settings).default;
        }
        
        // Validate colors array
        if (!colors || colors.length === 0) {
            console.error('Invalid colors array');
            colors = getColorSchemes(this.settings).default;
        }
        
        console.log('Using colors:', colors);
        
        // Wait for the file explorer to be fully loaded
        setTimeout(() => {
            // Get all folder elements
            const folderElements = document.querySelectorAll('.nav-folder-title');
            console.log('Found folder elements:', folderElements.length);
            
            if (folderElements.length === 0) {
                console.error('No folder elements found');
                return;
            }
            
            // Apply colors to folders
            let colorIndex = 0;
            folderElements.forEach(folderEl => {
                const path = folderEl.getAttribute('data-path');
                if (!path) return;
                
                const color = colors[colorIndex % colors.length];
                const opacity = this.settings.colorOpacity || 0.5;
                const rgbaColor = this.hexToRgba(color, opacity);
                
                console.log(`Applying style to folder: ${path} with color: ${color}`);
                
                // Create a custom element to wrap the folder title
                const wrapper = document.createElement('div');
                wrapper.className = 'rainbow-folder-wrapper';
                wrapper.style.cssText = `
                    display: inline-block;
                    width: 100%;
                    height: 100%;
                    background-color: ${rgbaColor} !important;
                    border-radius: 4px !important;
                    padding: 2px !important;
                    margin: 2px 0 !important;
                `;
                
                // Clone the folder element's children
                Array.from(folderEl.childNodes).forEach(child => {
                    const clone = child.cloneNode(true);
                    wrapper.appendChild(clone);
                });
                
                // Clear the folder element and add the wrapper
                folderEl.innerHTML = '';
                folderEl.appendChild(wrapper);
                
                // Store the color for files to use
                folderEl.setAttribute('data-rainbow-color', color);
                folderEl.setAttribute('data-rainbow-rgba', rgbaColor);
                
                // Increment color index for next folder
                if (!this.settings.enableCascadingColors) {
                    colorIndex++;
                } else {
                    // For cascading colors, get the depth
                    const depth = (path.match(/\//g) || []).length;
                    if (depth === 0) colorIndex++; // Only increment for root folders
                }
            });
            
            // Apply colors to files if enabled
            if (this.settings.applyColorsToFiles) {
                // Get all file elements
                const fileElements = document.querySelectorAll('.nav-file-title');
                console.log('Found file elements:', fileElements.length);
                
                fileElements.forEach(fileEl => {
                    const path = fileEl.getAttribute('data-path');
                    if (!path) return;
                    
                    // Find parent folder
                    const pathParts = path.split('/');
                    pathParts.pop(); // Remove filename
                    const parentPath = pathParts.join('/');
                    
                    // Find parent folder element
                    const parentFolderEl = document.querySelector(`.nav-folder-title[data-path="${parentPath}"]`);
                    if (!parentFolderEl) return;
                    
                    // Get parent folder color from data attribute
                    const color = parentFolderEl.getAttribute('data-rainbow-color');
                    const rgbaColor = parentFolderEl.getAttribute('data-rainbow-rgba');
                    
                    if (!color || !rgbaColor) return;
                    
                    console.log(`Applying style to file: ${path} with parent color: ${color}`);
                    
                    // Create a custom element to wrap the file title
                    const wrapper = document.createElement('div');
                    wrapper.className = 'rainbow-file-wrapper';
                    wrapper.style.cssText = `
                        display: inline-block;
                        width: 100%;
                        height: 100%;
                        background-color: ${rgbaColor} !important;
                        border-radius: 4px !important;
                        padding: 2px !important;
                        margin: 2px 0 !important;
                    `;
                    
                    // Clone the file element's children
                    Array.from(fileEl.childNodes).forEach(child => {
                        const clone = child.cloneNode(true);
                        wrapper.appendChild(clone);
                    });
                    
                    // Clear the file element and add the wrapper
                    fileEl.innerHTML = '';
                    fileEl.appendChild(wrapper);
                });
            }
            
            console.log('Extreme rainbow styles applied successfully');
            
            // Set up a MutationObserver to keep applying styles when the file explorer changes
            this.setupRainbowMutationObserver();
            
            // Restore the previous state
            setTimeout(() => {
                this.settings.enableRainbowFolders = wasEnabled;
                console.log(`Restored rainbow folders enabled state to: ${wasEnabled}`);
            }, 1000);
        }, 500); // Wait for elements to be fully loaded
    }
    
    // Set up a MutationObserver to keep applying rainbow styles
    setupRainbowMutationObserver() {
        console.log('Setting up rainbow mutation observer');
        
        // Remove any existing observer
        if (this.rainbowObserver) {
            this.rainbowObserver.disconnect();
            this.rainbowObserver = null;
        }
        
        // Get the file explorer element
        const fileExplorer = document.querySelector('.workspace-leaf-content[data-type="file-explorer"] .nav-files-container');
        if (!fileExplorer) {
            console.error('File explorer not found for observer');
            return;
        }
        
        console.log('Found file explorer for observer:', fileExplorer);
        
        // Create a new observer
        this.rainbowObserver = new MutationObserver((mutations) => {
            console.log('File explorer mutated, reapplying styles');
            // Use the wrapper method for reliable styling
            this.applyWrapperRainbowStyles();
        });
        
        // Start observing
        this.rainbowObserver.observe(fileExplorer, {
            childList: true,
            subtree: true,
            attributes: false,
            characterData: false
        });
        
        console.log('Rainbow mutation observer set up successfully');
    }
    
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
        
        // Reapply styles after saving settings
        if (this.settings.enableRainbowFolders) {
            // Force remove and reapply rainbow styles
            this.removeRainbowStyles();
            setTimeout(() => {
                // Use the wrapper method for reliable styling
                this.applyWrapperRainbowStyles();
                
                // Set up the observer to maintain styles
                this.setupRainbowMutationObserver();
            }, 50);
        }
    }
    
    // Add color picker styles
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
    
    // Force reload all styles
    forceReloadStyles() {
        console.log('Force reloading all styles');
        
        // Remove all styles
        this.removeStyles();
        this.removeRainbowStyles();
        this.removeColorPickerStyles();
        this.removeDividerStyles();
        
        // Add styles for hidden elements
        this.addHiddenStyles();
        
        // Add color picker styles
        this.addColorPickerStyles();
        
        // Apply rainbow colors if enabled
        if (this.settings.enableRainbowFolders) {
            // Use the wrapper method for reliable styling
            this.applyWrapperRainbowStyles();
            
            // Set up the observer to maintain styles
            this.setupRainbowMutationObserver();
        }
        
        // Setup file explorer observer
        this.setupFileExplorerObserver();
        
        // Apply dividers if enabled
        if (this.settings.enableDividers) {
            this.applyDividerStyles();
        }
        
        // Update hidden elements
        this.updateHiddenElements();
        
        // Debug rainbow styles
        this.debugRainbowStyles();
        
        // Show notification
        new Notice('Styles reloaded with wrapper-based approach. Check console for debug info.');
}

// Apply rainbow styles directly as inline styles
applyInlineRainbowStyles() {
    console.log('Applying rainbow styles as inline styles');
    
    if (!this.settings.enableRainbowFolders) {
        console.log('Rainbow folders disabled, skipping');
        return;
    }
    
    // Get color scheme
    let colors = [];
    if (this.settings.rainbowColorScheme === 'custom') {
        const isDarkMode = document.body.classList.contains('theme-dark');
        colors = isDarkMode ? this.settings.customColors.dark : this.settings.customColors.light;
    } else if (getColorSchemes(this.settings)[this.settings.rainbowColorScheme]) {
        colors = getColorSchemes(this.settings)[this.settings.rainbowColorScheme];
    } else {
        colors = getColorSchemes(this.settings).default;
    }
    
    // Validate colors array
    if (!colors || colors.length === 0) {
        console.error('Invalid colors array');
        colors = getColorSchemes(this.settings).default;
    }
    
    console.log('Using colors:', colors);
    
    // Get all folder elements
    const folderElements = document.querySelectorAll('.nav-folder-title');
    console.log('Found folder elements:', folderElements.length);
    
    // Apply colors to folders
    let colorIndex = 0;
    folderElements.forEach(folderEl => {
        const path = folderEl.getAttribute('data-path');
        if (!path) return;
        
        if (!this.settings.enableRainbowFolders) {
            console.log('Rainbow folders disabled, skipping');
            return;
        }
        
        // Get color scheme
        let colors = [];
        if (this.settings.rainbowColorScheme === 'custom') {
            const isDarkMode = document.body.classList.contains('theme-dark');
            colors = isDarkMode ? this.settings.customColors.dark : this.settings.customColors.light;
        } else if (getColorSchemes(this.settings)[this.settings.rainbowColorScheme]) {
            colors = getColorSchemes(this.settings)[this.settings.rainbowColorScheme];
        } else {
            colors = getColorSchemes(this.settings).default;
        }
        
        // Validate colors array
        if (!colors || colors.length === 0) {
            console.error('Invalid colors array');
            colors = getColorSchemes(this.settings).default;
        }
        
        console.log('Using colors:', colors);
        
        // Get all folder elements
        const folderElements = document.querySelectorAll('.nav-folder-title');
        console.log('Found folder elements:', folderElements.length);
        
        // Apply colors to folders
        let colorIndex = 0;
        folderElements.forEach(folderEl => {
            const path = folderEl.getAttribute('data-path');
            if (!path) return;
            
            const color = colors[colorIndex % colors.length];
            const opacity = this.settings.colorOpacity || 0.5;
            const rgbaColor = this.hexToRgba(color, opacity);
            
            console.log(`Applying style to folder: ${path} with color: ${color}`);
            
            // Apply style based on display variant
            switch (this.settings.displayVariant) {
                case 'background':
                    folderEl.setAttribute('style', `background-color: ${rgbaColor} !important; border-radius: 4px !important;`);
                    break;
                case 'bordered':
                    folderEl.setAttribute('style', `border-left: 3px solid ${color} !important; padding-left: 4px !important;`);
                    break;
                case 'dot':
                    folderEl.setAttribute('style', `position: relative !important; padding-right: 20px !important;`);
                    
                    // Create dot element if it doesn't exist
                    let dotEl = folderEl.querySelector('.rainbow-dot');
                    if (!dotEl) {
                        dotEl = document.createElement('span');
                        dotEl.className = 'rainbow-dot';
                        dotEl.setAttribute('style', `
                            position: absolute !important;
                            right: 8px !important;
                            top: 0 !important;
                            bottom: 0 !important;
                            width: 8px !important;
                            height: 8px !important;
                            border-radius: 50% !important;
                            margin: auto 0 !important;
                            background-color: ${color} !important;
                        `);
                        folderEl.appendChild(dotEl);
                    } else {
                        dotEl.setAttribute('style', `
                            position: absolute !important;
                            right: 8px !important;
                            top: 0 !important;
                            bottom: 0 !important;
                            width: 8px !important;
                            height: 8px !important;
                            border-radius: 50% !important;
                            margin: auto 0 !important;
                            background-color: ${color} !important;
                        `);
                    }
                    break;
                case 'text':
                    folderEl.setAttribute('style', `color: ${color} !important;`);
                    break;
                case 'top-bottom-border-bg':
                    folderEl.setAttribute('style', `
                        border-top: 2px solid ${color} !important;
                        border-bottom: 2px solid ${color} !important;
                        background-color: ${rgbaColor} !important;
                        padding-top: 2px !important;
                        padding-bottom: 2px !important;
                    `);
                    break;
                case 'all-border-bg':
                    folderEl.setAttribute('style', `
                        border: 2px solid ${color} !important;
                        background-color: ${rgbaColor} !important;
                        border-radius: 4px !important;
                        padding: 2px 4px !important;
                    `);
                    break;
                default:
                    // Default to background
                    folderEl.setAttribute('style', `background-color: ${rgbaColor} !important; border-radius: 4px !important;`);
            }
            
            // Store the color for files to use
            folderEl.setAttribute('data-rainbow-color', color);
            folderEl.setAttribute('data-rainbow-rgba', rgbaColor);
            
            // Increment color index for next folder
            if (!this.settings.enableCascadingColors) {
                colorIndex++;
            } else {
                // For cascading colors, get the depth
                const depth = (path.match(/\//g) || []).length;
                if (depth === 0) colorIndex++; // Only increment for root folders
            }
        });
        
        // Apply colors to files if enabled
        if (this.settings.applyColorsToFiles) {
            // Get all file elements
            const fileElements = document.querySelectorAll('.nav-file-title');
            console.log('Found file elements:', fileElements.length);
            
            fileElements.forEach(fileEl => {
                const path = fileEl.getAttribute('data-path');
                if (!path) return;
                
                // Find parent folder
                const pathParts = path.split('/');
                pathParts.pop(); // Remove filename
                const parentPath = pathParts.join('/');
                
                // Find parent folder element
                const parentFolderEl = document.querySelector(`.nav-folder-title[data-path="${parentPath}"]`);
                if (!parentFolderEl) return;
                
                // Get parent folder color from data attribute
                const color = parentFolderEl.getAttribute('data-rainbow-color');
                const rgbaColor = parentFolderEl.getAttribute('data-rainbow-rgba');
                
                if (!color || !rgbaColor) return;
                
                console.log(`Applying style to file: ${path} with parent color: ${color}`);
                
                // Apply style based on display variant
                switch (this.settings.displayVariant) {
                    case 'background':
                        fileEl.setAttribute('style', `background-color: ${rgbaColor} !important; border-radius: 4px !important;`);
                        break;
                    case 'bordered':
                        fileEl.setAttribute('style', `border-left: 3px solid ${color} !important; padding-left: 4px !important;`);
                        break;
                    case 'text':
                        fileEl.setAttribute('style', `color: ${color} !important;`);
                        break;
                    case 'top-bottom-border-bg':
                        fileEl.setAttribute('style', `border-top: 2px solid ${color} !important; border-bottom: 2px solid ${color} !important; background-color: ${rgbaColor} !important; padding-top: 2px !important; padding-bottom: 2px !important;`);
                        break;
                    case 'all-border-bg':
                        fileEl.setAttribute('style', `border: 2px solid ${color} !important; background-color: ${rgbaColor} !important; border-radius: 4px !important; padding: 2px 4px !important;`);
                        break;
                    default:
                        // Default to background
                        fileEl.setAttribute('style', `background-color: ${rgbaColor} !important; border-radius: 4px !important;`);
                }
            });
        }
        
        // Apply text color if not default
        if (this.settings.textColor !== 'default') {
            const textColors = getTextColors(this.settings),
                  textColor = textColors[this.settings.textColor] || this.settings.customTextColor;
            
            // If we have a valid text color, apply it to all folder and file titles
            if (textColor) {
                // Apply to all folder and file titles
                const elements = document.querySelectorAll('.nav-folder-title, .nav-file-title');
                
                elements.forEach(function(el) {
                    // Get existing style
                    const existingStyle = el.getAttribute('style') || '';
                    
                    // Add text color
                    el.setAttribute('style', existingStyle + '; color: ' + textColor + ' !important;');
                });
            }
        }
    },
)}
    
    // Debug rainbow styles
    debugRainbowStyles() {
        console.log('=== RAINBOW STYLES DEBUG ===');
        console.log('Settings:', JSON.stringify(this.settings, null, 2));
        console.log('Rainbow enabled:', this.settings.enableRainbowFolders);
        console.log('Display variant:', this.settings.displayVariant);
        console.log('Text color:', this.settings.textColor);
        console.log('Cascading colors:', this.settings.enableCascadingColors);
        
        // Check if the style element exists
        const styleEl = document.getElementById('explorer-enhancer-rainbow-styles');
        console.log('Style element exists:', !!styleEl);
        if (styleEl) {
            console.log('Style element content:', styleEl.textContent);
        }
        
        // Check if any styles are being applied
        const folderElements = document.querySelectorAll('.nav-folder-title');
        console.log('Number of folder elements:', folderElements.length);
        if (folderElements.length > 0) {
            console.log('First folder element:', folderElements[0]);
            console.log('First folder computed style:', window.getComputedStyle(folderElements[0]));
        }
        
        // Comprehensive DOM inspection
        this.inspectFileExplorerDOM();
    }
    
    // Inspect the file explorer DOM structure in detail
    inspectFileExplorerDOM() {
        console.log('=== FILE EXPLORER DOM INSPECTION ===');
        
        // Find the file explorer container
        const fileExplorer = document.querySelector('.workspace-leaf-content[data-type="file-explorer"]');
        if (!fileExplorer) {
            console.error('File explorer container not found');
            return;
        }
        console.log('File explorer container:', fileExplorer);
        
        // Find the file explorer view
        const fileExplorerView = fileExplorer.querySelector('.nav-files-container');
        if (!fileExplorerView) {
            console.error('File explorer view not found');
            return;
        }
        console.log('File explorer view:', fileExplorerView);
        
        // Get all folder elements
        const folderElements = fileExplorer.querySelectorAll('.nav-folder');
        console.log('Total folder elements:', folderElements.length);
        
        // Get all folder title elements
        const folderTitleElements = fileExplorer.querySelectorAll('.nav-folder-title');
        console.log('Total folder title elements:', folderTitleElements.length);
        
        // Get all file elements
        const fileElements = fileExplorer.querySelectorAll('.nav-file');
        console.log('Total file elements:', fileElements.length);
        
        // Get all file title elements
        const fileTitleElements = fileExplorer.querySelectorAll('.nav-file-title');
        console.log('Total file title elements:', fileTitleElements.length);
        
        // Inspect the first folder element in detail
        if (folderTitleElements.length > 0) {
            const firstFolder = folderTitleElements[0];
            console.log('First folder element:', firstFolder);
            console.log('First folder classes:', firstFolder.className);
            console.log('First folder attributes:', this.getElementAttributes(firstFolder));
            console.log('First folder computed style:', window.getComputedStyle(firstFolder));
            console.log('First folder parent:', firstFolder.parentElement);
            console.log('First folder children:', firstFolder.children);
            
            // Try to apply a direct style to test if styling works at all
            try {
                const originalBackground = firstFolder.style.backgroundColor;
                firstFolder.style.backgroundColor = 'red';
                console.log('Applied direct red background to first folder');
                console.log('First folder style after direct change:', firstFolder.style.backgroundColor);
                
                // Reset after 2 seconds
                setTimeout(() => {
                    firstFolder.style.backgroundColor = originalBackground;
                    console.log('Reset first folder background');
                }, 2000);
            } catch (e) {
                console.error('Error applying direct style:', e);
            }
        }
        
        // Check for any CSS that might be overriding our styles
        this.checkForStyleOverrides();
    }
    
    // Get all attributes of an element
    getElementAttributes(element) {
        const attributes = {};
        for (let i = 0; i < element.attributes.length; i++) {
            const attr = element.attributes[i];
            attributes[attr.name] = attr.value;
        }
        return attributes;
    }
    
    // Check for any CSS that might be overriding our styles
    checkForStyleOverrides() {
        console.log('=== CHECKING FOR STYLE OVERRIDES ===');
        
        // Get all style elements in the document
        const styleElements = document.querySelectorAll('style');
        console.log('Total style elements:', styleElements.length);
        
        // Look for styles that might be targeting the file explorer
        const relevantStyles = [];
        styleElements.forEach((style, index) => {
            const content = style.textContent;
            if (content.includes('.nav-folder') || 
                content.includes('.nav-file') || 
                content.includes('file-explorer')) {
                relevantStyles.push({
                    index,
                    id: style.id,
                    content: content.substring(0, 200) + '...' // First 200 chars for brevity
                });
            }
        });
        
        console.log('Styles potentially affecting file explorer:', relevantStyles);
        
        // Check for !important declarations that might override our styles
        const importantDeclarations = [];
        styleElements.forEach((style) => {
            const content = style.textContent;
            if (content.includes('!important')) {
                const lines = content.split('\n');
                lines.forEach(line => {
                    if (line.includes('!important') && 
                        (line.includes('.nav-folder') || 
                         line.includes('.nav-file') || 
                         line.includes('file-explorer'))) {
                        importantDeclarations.push(line.trim());
                    }
                });
            }
        });
        
        console.log('Important declarations affecting file explorer:', importantDeclarations);
    }
    
    // Apply direct CSS for rainbow folders with maximum specificity
    applyDirectRainbowCSS() {
        console.log('Applying direct rainbow CSS with maximum specificity');
        
        // Remove existing rainbow styles
        this.removeRainbowStyles();
        
        // Remove any existing observer
        if (this.rainbowObserver) {
            this.rainbowObserver.disconnect();
            this.rainbowObserver = null;
        }
        
        // Get color scheme
        let colors = [];
        if (this.settings.rainbowColorScheme === 'custom') {
            const isDarkMode = document.body.classList.contains('theme-dark');
            colors = isDarkMode ? this.settings.customColors.dark : this.settings.customColors.light;
        } else if (getColorSchemes(this.settings)[this.settings.rainbowColorScheme]) {
            colors = getColorSchemes(this.settings)[this.settings.rainbowColorScheme];
        } else {
            colors = getColorSchemes(this.settings).default;
        }
        
        // Validate colors array
        if (!colors || colors.length === 0) {
            console.error('Invalid colors array');
            colors = getColorSchemes(this.settings).default;
        }
        
        console.log('Using colors:', colors);
        
        // Function to apply styles to a folder element
        const applyFolderStyle = (folderEl, colorIndex) => {
            const path = folderEl.getAttribute('data-path');
            if (!path) return colorIndex;
            
            const color = colors[colorIndex % colors.length];
            const opacity = this.settings.colorOpacity || 0.5;
            const rgbaColor = this.hexToRgba(color, opacity);
            
            console.log(`Applying style to folder: ${path} with color: ${color}`);
            
            // Store the color in a data attribute for later reference
            folderEl.setAttribute('data-rainbow-color', color);
            folderEl.setAttribute('data-rainbow-rgba', rgbaColor);
            
            // Apply style based on display variant
            switch (this.settings.displayVariant) {
                case 'background':
                    folderEl.style.setProperty('background-color', rgbaColor, 'important');
                    folderEl.style.setProperty('border-radius', '4px', 'important');
                    break;
                case 'bordered':
                    folderEl.style.setProperty('border-left', `3px solid ${color}`, 'important');
                    folderEl.style.setProperty('padding-left', '4px', 'important');
                    break;
                case 'dot':
                    // Add a dot indicator
                    folderEl.style.setProperty('position', 'relative', 'important');
                    folderEl.style.setProperty('padding-right', '20px', 'important');
                    
                    // Create dot element if it doesn't exist
                    let dotEl = folderEl.querySelector('.rainbow-dot');
                    if (!dotEl) {
                        dotEl = document.createElement('span');
                        dotEl.className = 'rainbow-dot';
                        dotEl.style.setProperty('position', 'absolute', 'important');
                        dotEl.style.setProperty('right', '8px', 'important');
                        dotEl.style.setProperty('top', '0', 'important');
                        dotEl.style.setProperty('bottom', '0', 'important');
                        dotEl.style.setProperty('width', '8px', 'important');
                        dotEl.style.setProperty('height', '8px', 'important');
                        dotEl.style.setProperty('border-radius', '50%', 'important');
                        dotEl.style.setProperty('margin', 'auto 0', 'important');
                        folderEl.appendChild(dotEl);
                    }
                    dotEl.style.setProperty('background-color', color, 'important');
                    break;
                case 'text':
                    folderEl.style.setProperty('color', color, 'important');
                    break;
                case 'top-bottom-border-bg':
                    folderEl.style.setProperty('border-top', `2px solid ${color}`, 'important');
                    folderEl.style.setProperty('border-bottom', `2px solid ${color}`, 'important');
                    folderEl.style.setProperty('background-color', rgbaColor, 'important');
                    folderEl.style.setProperty('padding-top', '2px', 'important');
                    folderEl.style.setProperty('padding-bottom', '2px', 'important');
                    break;
                case 'all-border-bg':
                    folderEl.style.setProperty('border', `2px solid ${color}`, 'important');
                    folderEl.style.setProperty('background-color', rgbaColor, 'important');
                    folderEl.style.setProperty('border-radius', '4px', 'important');
                    folderEl.style.setProperty('padding', '2px 4px', 'important');
                    break;
                default:
                    // Default to background
                    folderEl.style.setProperty('background-color', rgbaColor, 'important');
                    folderEl.style.setProperty('border-radius', '4px', 'important');
            }
            
            // Increment color index for next folder
            if (!this.settings.enableCascadingColors) {
                return colorIndex + 1;
            } else {
                // For cascading colors, get the depth
                const depth = (path.match(/\//g) || []).length;
                if (depth === 0) return colorIndex + 1; // Only increment for root folders
                return colorIndex;
            }
        };
        
        // Function to apply styles to a file element
        const applyFileStyle = (fileEl) => {
            if (!this.settings.applyColorsToFiles) return;
            
            const path = fileEl.getAttribute('data-path');
            if (!path) return;
            
            // Find parent folder
            const pathParts = path.split('/');
            pathParts.pop(); // Remove filename
            const parentPath = pathParts.join('/');
            
            // Find parent folder element
            const parentFolderEl = document.querySelector(`.nav-folder-title[data-path="${parentPath}"]`);
            if (!parentFolderEl) return;
            
            // Get parent folder color from data attribute
            const color = parentFolderEl.getAttribute('data-rainbow-color');
            const rgbaColor = parentFolderEl.getAttribute('data-rainbow-rgba');
            
            if (!color || !rgbaColor) return;
            
            console.log(`Applying style to file: ${path} with parent color: ${color}`);
            
            // Apply style based on display variant
            switch (this.settings.displayVariant) {
                case 'background':
                    fileEl.style.setProperty('background-color', rgbaColor, 'important');
                    fileEl.style.setProperty('border-radius', '4px', 'important');
                    break;
                case 'bordered':
                    fileEl.style.setProperty('border-left', `3px solid ${color}`, 'important');
                    fileEl.style.setProperty('padding-left', '4px', 'important');
                    break;
                case 'text':
                    fileEl.style.setProperty('color', color, 'important');
                    break;
                case 'top-bottom-border-bg':
                    fileEl.style.setProperty('border-top', `2px solid ${color}`, 'important');
                    fileEl.style.setProperty('border-bottom', `2px solid ${color}`, 'important');
                    fileEl.style.setProperty('background-color', rgbaColor, 'important');
                    fileEl.style.setProperty('padding-top', '2px', 'important');
                    fileEl.style.setProperty('padding-bottom', '2px', 'important');
                    break;
                case 'all-border-bg':
                    fileEl.style.setProperty('border', `2px solid ${color}`, 'important');
                    fileEl.style.setProperty('background-color', rgbaColor, 'important');
                    fileEl.style.setProperty('border-radius', '4px', 'important');
                    fileEl.style.setProperty('padding', '2px 4px', 'important');
                    break;
                default:
                    // Default to background
                    fileEl.style.setProperty('background-color', rgbaColor, 'important');
                    fileEl.style.setProperty('border-radius', '4px', 'important');
            }
        };
        
        // Apply text color if not default
        if (this.settings.textColor !== 'default') {
            const textColors = getTextColors(this.settings);
            let textColor = textColors[this.settings.textColor] || this.settings.customTextColor;
            if (textColor) {
                // Apply to all folder and file titles
                document.querySelectorAll('.nav-folder-title, .nav-file-title').forEach(el => {
                    el.style.setProperty('color', textColor, 'important');
                });
            }
        }
        
        // Initial application of styles
        const applyAllStyles = () => {
            console.log('Applying styles to all elements');
            
            // Get all folder elements
            const folderElements = document.querySelectorAll('.nav-folder-title');
            console.log('Found folder elements:', folderElements.length);
            
            // Apply colors to folders
            let colorIndex = 0;
            folderElements.forEach(folderEl => {
                colorIndex = applyFolderStyle(folderEl, colorIndex);
            });
            
            // Get all file elements
            const fileElements = document.querySelectorAll('.nav-file-title');
            console.log('Found file elements:', fileElements.length);
            
            // Apply colors to files
            fileElements.forEach(fileEl => {
                applyFileStyle(fileEl);
            });
        };
        
        // Apply styles initially
        applyAllStyles();
        
        // Set up a MutationObserver to watch for changes in the file explorer
        const fileExplorer = document.querySelector('.workspace-leaf-content[data-type="file-explorer"]');
        if (fileExplorer) {
            this.rainbowObserver = new MutationObserver((mutations) => {
                let needsUpdate = false;
                
                mutations.forEach(mutation => {
                    // Check if nodes were added
                    if (mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(node => {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Check if it's a folder or file element, or contains them
                                if (node.classList?.contains('nav-folder-title') || 
                                    node.classList?.contains('nav-file-title')) {
                                    needsUpdate = true;
                                } else if (node.querySelectorAll) {
                                    const hasRelevantChildren = 
                                        node.querySelectorAll('.nav-folder-title, .nav-file-title').length > 0;
                                    if (hasRelevantChildren) {
                                        needsUpdate = true;
                                    }
                                }
                            }
                        });
                    }
                    
                    // Check if attributes changed on relevant elements
                    if (mutation.type === 'attributes' && 
                        (mutation.target.classList?.contains('nav-folder-title') || 
                         mutation.target.classList?.contains('nav-file-title'))) {
                        needsUpdate = true;
                    }
                });
                
                // If we need to update, reapply all styles
                if (needsUpdate) {
                    console.log('File explorer changed, reapplying styles');
                    applyAllStyles();
                }
            });
            
            // Start observing
            this.rainbowObserver.observe(fileExplorer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class', 'data-path']
            });
            
            console.log('Rainbow observer started');
        }
        
        console.log('Direct rainbow CSS applied successfully with observer');
    }
    
    // Apply rainbow colors to the file explorer
    applyRainbowColors() {
        console.log('Redirecting to wrapper-based rainbow styling method');
        
        // Use the wrapper method for reliable styling
        this.applyWrapperRainbowStyles();
        
        // Set up the observer to maintain styles
        this.setupRainbowMutationObserver();
        
        // Log that we've redirected
        console.log('Successfully redirected to wrapper-based styling');
    }
    
    /**
     * Removes all rainbow coloring styles from the document
     * This method cleans up the rainbow color styling when the plugin is disabled or when settings change
     * It identifies the style element by its unique ID and removes it from the DOM
     * @returns {void}
     */
    removeRainbowStyles() {
        console.log('Removing rainbow styles');
        
        // Remove any style element
        const styleEl = document.getElementById('explorer-enhancer-rainbow-styles');
        // Remove the element from the DOM if it exists
        if (styleEl) styleEl.remove();
        
        // Remove wrapper-based styles
        document.querySelectorAll('.rainbow-folder-wrapper, .rainbow-file-wrapper').forEach(wrapper => {
            // Get the parent element
            const parent = wrapper.parentElement;
            if (!parent) return;
            
            // Move all children from wrapper back to parent
            while (wrapper.firstChild) {
                parent.appendChild(wrapper.firstChild);
            }
            
            // Remove the wrapper
            wrapper.remove();
            
            // Remove color data attributes
            parent.removeAttribute('data-rainbow-color');
            parent.removeAttribute('data-rainbow-rgba');
        });
        
        // Disconnect any existing observer
        if (this.rainbowObserver) {
            this.rainbowObserver.disconnect();
            this.rainbowObserver = null;
        }
        
        console.log('Rainbow styles removed successfully');
    }
    
    // Update hidden elements
    updateHiddenElements() {
        // Always unhide all elements first
        document.querySelectorAll('.explorer-enhancer-hidden').forEach(el => {
            // Remove the marker class that identifies hidden elements
            el.classList.remove('explorer-enhancer-hidden');
            // Clear the display style to allow the element to show normally
            el.style.display = '';
        });
        
        // Only process hidden files/folders if the feature is enabled
        if (!this.settings.enableHiddenFiles) {
            console.log('Hidden files feature is disabled, not hiding any files/folders');
            return;
        }
        
        console.log('Processing hidden files and folders');
        
        // Process hidden items from the new hiddenItems array (with pattern support)
        if (this.settings.hiddenItems && this.settings.hiddenItems.length > 0) {
            console.log('Processing hidden items with patterns:', this.settings.hiddenItems);
            
            // Get all file and folder elements
            const allElements = document.querySelectorAll('.nav-file-title, .nav-folder-title');
            
            // Process each element against all patterns
            allElements.forEach(el => {
                const path = el.getAttribute('data-path');
                if (!path) return;
                
                // Check if this path matches any of our patterns
                const shouldHide = this.settings.hiddenItems.some(pattern => {
                    // Convert glob pattern to regex
                    // Replace * with regex wildcard
                    const regexPattern = pattern
                        .replace(/\./g, '\\.')
                        .replace(/\*/g, '.*');
                    
                    const regex = new RegExp(`^${regexPattern}$`);
                    return regex.test(path);
                });
                
                if (shouldHide) {
                    // Hide this element
                    el.classList.add('explorer-enhancer-hidden');
                    el.style.display = 'none';
                    
                    // Also hide parent container
                    const parent = el.closest('.nav-file, .nav-folder');
                    if (parent) {
                        parent.classList.add('explorer-enhancer-hidden');
                        parent.style.display = 'none';
                    }
                    
                    // If this is a folder, hide all its children
                    if (el.classList.contains('nav-folder-title')) {
                        const prefix = path + '/';
                        document.querySelectorAll('.nav-file-title, .nav-folder-title').forEach(child => {
                            const childPath = child.getAttribute('data-path');
                            if (childPath && childPath.startsWith(prefix)) {
                                child.classList.add('explorer-enhancer-hidden');
                                child.style.display = 'none';
                                
                                // Also hide parent element
                                const childParent = child.closest('.nav-file, .nav-folder');
                                if (childParent) {
                                    childParent.classList.add('explorer-enhancer-hidden');
                                    childParent.style.display = 'none';
                                }
                            }
                        });
                    }
                }
            });
        }
        
        // For backward compatibility, still process hiddenFiles and hiddenFolders
        // Process hidden files
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
                // Use the wrapper method for reliable styling
                this.applyWrapperRainbowStyles();
                
                // Set up the observer to maintain styles
                this.setupRainbowMutationObserver();
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
    }
    
    // Apply divider attributes to specific files and folders
    applyDividerAttributes() {
        // Only proceed if dividers are enabled
        if (!this.settings.enableDividers) return;
        
        console.log('Applying divider attributes');
        
        // Reset all existing dividers first to avoid duplicates
        document.querySelectorAll('.explorer-enhancer-divider').forEach(el => {
            el.classList.remove('explorer-enhancer-divider');
            el.style.cssText = '';
            el.removeAttribute('data-divider-color');
            el.removeAttribute('data-divider-background-color');
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
                        width: this.settings.dividerStyle?.width || 100,
                        background: this.settings.dividerStyle?.background?.color || '--background-secondary',
                        textColor: this.settings.dividerStyle?.text?.color || '#888888'
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
                        width: this.settings.dividerStyle?.width || 100,
                        background: this.settings.dividerStyle?.background?.color || '--background-secondary',
                        textColor: this.settings.dividerStyle?.text?.color || '#888888'
                    });
                }
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
                    const backgroundColor = item.background || this.settings.dividerStyle?.background?.color || '--background-secondary';
                    const textColor = item.textColor || this.settings.dividerStyle?.text?.color || '#888888';
                    
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
        const backgroundColor = dividerSettings.background && dividerSettings.background.color ? dividerSettings.background.color : '--background-secondary';
        const textColor = dividerSettings.text && dividerSettings.text.color ? dividerSettings.text.color : '#888888';
        
        // Set data attribute for position that CSS can target
        element.setAttribute('data-border-position', position);
        
        // Set custom color through CSS variable if needed
        element.style.setProperty('--divider-border-color', borderColor);
        element.style.setProperty('--divider-border-size', borderSize);
        element.style.setProperty('--divider-text-color', dividerSettings.text && dividerSettings.text.color ? dividerSettings.text.color : '#888888');
        element.style.setProperty('--divider-background-color', backgroundColor);
        
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
        document.documentElement.style.setProperty('--divider-text-color', this.settings.dividerStyle.text.color || '#888888');
        document.documentElement.style.setProperty('--divider-background-color', this.settings.dividerStyle.background.color || '--background-secondary');
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

        /* Middle border Right Text */
        .nav-folder.explorer-enhancer-divider[data-border-position="middleRight"],
        .nav-file.explorer-enhancer-divider[data-border-position="middleRight"] {
	position: relative;

	&::before {
		content: "";
		--padding-x: 10px;
		margin-inline-start: calc(215px - var(--padding-x));
		padding: 0 var(--padding-x);
		background-color: var(--divider-background-color);
	}

	&::after {
		content: "";
		display: block;
		position: absolute;
		top: calc(0.5em * var(--line-height-tight));
		width: 100%; /* change for something smaller if you don't want the divider to span full length */
		height: 0;
		border-top: 1px solid var(--divider-border-color);
		z-index: -1;
	}
}
        /* Middle border Center Text */
        .nav-folder.explorer-enhancer-divider[data-border-position="middleCenter"],
        .nav-file.explorer-enhancer-divider[data-border-position="middleCenter"] {
	position: relative;

	&::before {
		content: "";
		--padding-x: 10px;
		margin-inline-start: calc(100px - var(--padding-x));
		padding: 0 var(--padding-x);
		background-color: var(--divider-background-color);
	}

	&::after {
		content: "";
		display: block;
		position: absolute;
		top: calc(0.5em * var(--line-height-tight));
		width: 100%; /* change for something smaller if you don't want the divider to span full length */
		height: 0;
		border-top: 1px solid var(--divider-border-color);
		z-index: -1;
	}
}
        
        /* Middle border Left Text - Default */
        .nav-folder.explorer-enhancer-divider[data-border-position="middleLeft"],
        .nav-file.explorer-enhancer-divider[data-border-position="middleLeft"] {
	position: relative;

	&::before {
		content: "";
		--padding-x: 10px;
		margin-inline-start: calc(24px - var(--padding-x));
		padding: 0 var(--padding-x);
		background-color: var(--divider-background-color);
	}

	&::after {
		content: "";
		display: block;
		position: absolute;
		top: calc(0.5em * var(--line-height-tight));
		width: 100%; /* change for something smaller if you don't want the divider to span full length */
		height: 0;
		border-top: 1px solid var(--divider-border-color);
		z-index: -1;
	}
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
        
        // Debug the current display variant
        console.log('Current display variant:', this.settings.displayVariant);
        console.log('Current text color option:', this.settings.textColor);
        console.log('Generating CSS for path:', path, 'with color:', hexColor);
        
        // Use more specific selectors for better specificity
        const specificSelector = `body .workspace-leaf-content[data-type="file-explorer"] ${selector}[data-path="${escapedPath}"]`;
        
        switch (this.settings.displayVariant) {
            case 'background':
                return `
                    ${specificSelector} {
                        background-color: ${rgbaColor} !important;
                        border-radius: 4px !important;
                    }
                `;
            case 'bordered':
                return `
                    ${specificSelector} {
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
                    ${specificSelector} {
                        border-top: 2px solid ${hexColor} !important;
                        border-bottom: 2px solid ${hexColor} !important;
                        background-color: ${rgbaColor} !important;
                        padding-top: 2px !important;
                        padding-bottom: 2px !important;
                    }
                `;
            case 'all-border-bg':
                return `
                    ${specificSelector} {
                        border: 2px solid ${hexColor} !important;
                        background-color: ${rgbaColor} !important;
                        border-radius: 4px !important;
                        padding: 2px 4px !important;
                    }
                `;
            case 'dot':
                return `
                    ${specificSelector} {
                        color: ${hexColor} !important;
                        position: relative !important;
                        padding-right: 20px !important;
                    }
                    ${specificSelector}::after {
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
                // For text variant, we need to apply the color directly
                // Determine text color based on settings
                let textColor = hexColor;
                
                // If textColor is set, use that instead of the folder color
                if (this.settings.textColor !== 'default') {
                    if (this.settings.textColor === 'white') {
                        textColor = '#FFFFFF';
                    } else if (this.settings.textColor === 'black') {
                        textColor = '#000000';
                    } else if (this.settings.textColor === 'grey') {
                        textColor = '#888888';
                    } else if (this.settings.textColor === 'custom') {
                        textColor = this.settings.customTextColor || '#FFFFFF';
                    }
                }
                
                console.log('Applying text color:', textColor, 'for path:', path);
                
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
                // Use the wrapper method for reliable styling
                this.applyWrapperRainbowStyles();
                
                // Set up the observer to maintain styles
                this.setupRainbowMutationObserver();
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
                    // Use the wrapper method for reliable styling
                this.applyWrapperRainbowStyles();
                
                // Set up the observer to maintain styles
                this.setupRainbowMutationObserver();
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
                            // Use the wrapper method for reliable styling
                this.applyWrapperRainbowStyles();
                
                // Set up the observer to maintain styles
                this.setupRainbowMutationObserver();
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
    // Helper to add divider color settings
    addDividerColorSettings(containerEl) {
        containerEl.createEl('h3', {text: 'Divider Colors'});

        // Divider Text Color Option
        new Setting(containerEl)
            .setName('Divider Text Color')
            .setDesc('Color of the divider label/text')
            .addDropdown(dropdown => {
                dropdown.addOption('default', 'Default');
                dropdown.addOption('custom', 'Custom');
                dropdown.setValue(this.plugin.settings.dividerStyle.text.colorOption);
                dropdown.onChange(async (value) => {
                    this.plugin.settings.dividerStyle.text.colorOption = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateFileExplorer();
                });
            });

        // Custom Text Color Picker
        new Setting(containerEl)
            .setName('Custom Divider Text Color')
            .setDesc('Custom color for divider text (when custom is selected)')
            .addText(text => text
                .setPlaceholder('#222222')
                .setValue(this.plugin.settings.dividerStyle.text.customColor)
                .onChange(async (value) => {
                    this.plugin.settings.dividerStyle.text.customColor = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateFileExplorer();
                })
            );

        // Divider Background Color Option
        new Setting(containerEl)
            .setName('Divider Background Color')
            .setDesc('Background color for divider (when background is enabled)')
            .addDropdown(dropdown => {
                dropdown.addOption('default', 'Default');
                dropdown.addOption('light', 'Light');
                dropdown.addOption('dark', 'Dark');
                dropdown.addOption('custom', 'Custom');
                dropdown.setValue(this.plugin.settings.dividerStyle.background.colorOption);
                dropdown.onChange(async (value) => {
                    this.plugin.settings.dividerStyle.background.colorOption = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateFileExplorer();
                });
            });

        // Custom Background Color Picker
        new Setting(containerEl)
            .setName('Custom Divider Background Color')
            .setDesc('Custom color for divider background (when custom is selected)')
            .addText(text => text
                .setPlaceholder('#E0E0E0')
                .setValue(this.plugin.settings.dividerStyle.background.customColor)
                .onChange(async (value) => {
                    this.plugin.settings.dividerStyle.background.customColor = value;
                    await this.plugin.saveSettings();
                    this.plugin.updateFileExplorer();
                })
            );
    }

    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    
    display() {
        const {containerEl} = this;
        containerEl.empty();
        
        // Make sure the container is scrollable
        containerEl.addClass('explorer-enhancer-settings');
        containerEl.style.overflowY = 'auto';
        containerEl.style.height = '100%';
        containerEl.style.boxSizing = 'border-box';
        
        // Create a padded container for all settings
        this.paddedContainer = containerEl.createDiv('padded-container');
        this.paddedContainer.style.padding = '20px';
        
        // Selected Text Color section
        this.paddedContainer.createEl('h2', {text: 'Selected Text Color'});
        
        // Dark mode selected text color
        new Setting(this.paddedContainer)
            .setName('Selected Text Color (Dark Mode)')
            .setDesc('Choose the color for selected items in dark mode.')
            .addColorPicker(color => color
                .setValue(this.plugin.settings.selectedTextColor?.dark || '#ffffff')
                .onChange(async (value) => {
                    if (!this.plugin.settings.selectedTextColor) {
                        this.plugin.settings.selectedTextColor = {};
                    }
                    this.plugin.settings.selectedTextColor.dark = value;
                    await this.plugin.saveSettings();
                    this.plugin.loadSelectedTextStyles();
                }));

        // Light mode selected text color
        new Setting(this.paddedContainer)
            .setName('Selected Text Color (Light Mode)')
            .setDesc('Choose the color for selected items in light mode.')
            .addColorPicker(color => color
                .setValue(this.plugin.settings.selectedTextColor?.light || '#000000')
                .onChange(async (value) => {
                    if (!this.plugin.settings.selectedTextColor) {
                        this.plugin.settings.selectedTextColor = {};
                    }
                    this.plugin.settings.selectedTextColor.light = value;
                    await this.plugin.saveSettings();
                    this.plugin.loadSelectedTextStyles();
                }));
        
        // Display Style section
        this.paddedContainer.createEl('h2', {text: 'Display Style'});
        
        // Display style dropdown
        new Setting(this.paddedContainer)
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
                
                dropdown.setValue(this.plugin.settings.displayVariant || 'text')
                    .onChange(async (value) => {
                        this.plugin.settings.displayVariant = value;
                        await this.plugin.saveSettings();
                        
                        if (this.plugin.settings.enableRainbowFolders) {
                            // Use the wrapper method for reliable styling
                            this.plugin.applyWrapperRainbowStyles();
                            
                            // Set up the observer to maintain styles
                            this.plugin.setupRainbowMutationObserver();
                        }
                    });
            });
        
        // Rainbow Folders section
        this.paddedContainer.createEl('h2', {text: 'Rainbow Folders'});
        
        new Setting(this.paddedContainer)
            .setName('Enable Rainbow Folders')
            .setDesc('Apply rainbow colors to folders in the file explorer.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableRainbowFolders)
                .onChange(async (value) => {
                    this.plugin.settings.enableRainbowFolders = value;
                    await this.plugin.saveSettings();
                    
                    if (value) {
                        // Use the wrapper method for reliable styling
                        this.plugin.applyWrapperRainbowStyles();
                        
                        // Set up the observer to maintain styles
                        this.plugin.setupRainbowMutationObserver();
                    } else {
                        // Remove any existing observer
                        if (this.plugin.rainbowObserver) {
                            this.plugin.rainbowObserver.disconnect();
                            this.plugin.rainbowObserver = null;
                        }
                        
                        // Remove styles
                        this.plugin.removeRainbowStyles();
                    }
                    
                    // Force refresh of settings
                    this.display();
                }));
        
        // Only show rainbow folder settings when enabled
        if (this.plugin.settings.enableRainbowFolders) {
            // Cascading colors toggle
            new Setting(this.paddedContainer)
                .setName('Enable Cascading Colors')
                .setDesc('When enabled, folders at the same level get the same color. When disabled, each folder gets a unique sequential color.')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.enableCascadingColors)
                    .onChange(async (value) => {
                        this.plugin.settings.enableCascadingColors = value;
                        await this.plugin.saveSettings();
                        // Use the wrapper method for reliable styling
                        this.plugin.applyWrapperRainbowStyles();
                        
                        // Set up the observer to maintain styles
                        this.plugin.setupRainbowMutationObserver();
                    }));
            
            // Apply colors to files toggle
            new Setting(this.paddedContainer)
                .setName('Apply Colors to Files')
                .setDesc('Apply parent folder\'s color to files inside it.')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.applyColorsToFiles)
                    .onChange(async (value) => {
                        this.plugin.settings.applyColorsToFiles = value;
                        await this.plugin.saveSettings();
                        // Use the wrapper method for reliable styling
                        this.plugin.applyWrapperRainbowStyles();
                        
                        // Set up the observer to maintain styles
                        this.plugin.setupRainbowMutationObserver();
                    }));
            
            // Rainbow Color Scheme
            new Setting(this.paddedContainer)
                .setName('Rainbow Color Scheme')
                .setDesc('Choose the color scheme for rainbow folders.')
                .addDropdown(dropdown => {
                    // Get available color schemes from our dynamic getter
                    const colorSchemes = getColorSchemes(this.plugin.settings);
                    
                    // Add all color scheme options
                    Object.keys(colorSchemes).forEach(schemeKey => {
                        dropdown.addOption(schemeKey, schemeKey.charAt(0).toUpperCase() + schemeKey.slice(1));
                    });
                    
                    dropdown.setValue(this.plugin.settings.rainbowColorScheme)
                        .onChange(async (value) => {
                            this.plugin.settings.rainbowColorScheme = value;
                            await this.plugin.saveSettings();
                            
                            if (this.plugin.settings.enableRainbowFolders) {
                                // Use the wrapper method for reliable styling
                                this.plugin.applyWrapperRainbowStyles();
                                
                                // Set up the observer to maintain styles
                                this.plugin.setupRainbowMutationObserver();
                            }
                            
                            // Refresh display to show/hide custom color pickers
                            this.display();
                        });
                });
            
            // Text Color Options
            new Setting(this.paddedContainer)
                .setName('Text Color')
                .setDesc('Choose the text color for folders and files in the explorer.')
                .addDropdown(dropdown => {
                    // Get available text colors from our dynamic getter
                    const textColors = getTextColors(this.plugin.settings);
                    
                    // Add default option
                    dropdown.addOption('default', 'Default (Rainbow Colors)');
                    
                    // Add all text color options from our dynamic getter
                    Object.keys(textColors).forEach(colorKey => {
                        if (colorKey !== 'default' && colorKey !== 'custom') {
                            dropdown.addOption(colorKey, colorKey.charAt(0).toUpperCase() + colorKey.slice(1));
                        }
                    });
                    
                    // Always add custom option
                    dropdown.addOption('custom', 'Custom Color')
                        .setValue(this.plugin.settings.textColorOption)
                        .onChange(async (value) => {
                            this.plugin.settings.textColorOption = value;
                            await this.plugin.saveSettings();
                            
                            // Show or hide custom color picker based on selection
                            const customColorSetting = this.paddedContainer.querySelector('.setting-item[data-custom-text-color]');
                            if (customColorSetting) {
                                customColorSetting.style.display = value === 'custom' ? 'flex' : 'none';
                            }
                            
                            if (this.plugin.settings.enableRainbowFolders) {
                                // Use the wrapper method for reliable styling
                                this.plugin.applyWrapperRainbowStyles();
                                
                                // Set up the observer to maintain styles
                                this.plugin.setupRainbowMutationObserver();
                            }
                        });
                });
                
            // Custom text color
            const customTextColorSetting = new Setting(this.paddedContainer)
                .setName('Custom Text Color')
                .setDesc('Custom color for folder and file text (when custom is selected)')
                .addColorPicker(color => color
                    .setValue(this.plugin.settings.customTextColor || '#ffffff')
                    .onChange(async (value) => {
                        this.plugin.settings.customTextColor = value;
                        await this.plugin.saveSettings();
                        if (this.plugin.settings.enableRainbowFolders && 
                            this.plugin.settings.textColorOption === 'custom') {
                            // Use the wrapper method for reliable styling
                            this.plugin.applyWrapperRainbowStyles();
                            
                            // Set up the observer to maintain styles
                            this.plugin.setupRainbowMutationObserver();
                        }
                    }));
                    
            // Add data attribute for targeting
            customTextColorSetting.settingEl.setAttribute('data-custom-text-color', 'true');
            
            // Hide if not using custom color
            if (this.plugin.settings.textColorOption !== 'custom') {
                customTextColorSetting.settingEl.style.display = 'none';
            }
            
            // Custom color pickers for light and dark mode
            if (this.plugin.settings.rainbowColorScheme === 'custom') {
                // Custom colors section for light mode
                this.paddedContainer.createEl('h3', {text: 'Custom Colors (Light Mode)'});
                
                // Create color pickers for light mode
                if (!this.plugin.settings.customColors || !this.plugin.settings.customColors.light) {
                    if (!this.plugin.settings.customColors) {
                        this.plugin.settings.customColors = {};
                    }
                    this.plugin.settings.customColors.light = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2'];
                }
                
                const lightColorContainer = this.paddedContainer.createDiv('custom-color-container');
                
                this.plugin.settings.customColors.light.forEach((color, index) => {
                    const colorPickerWrapper = lightColorContainer.createDiv('color-picker-wrapper');
                    colorPickerWrapper.style.display = 'flex';
                    colorPickerWrapper.style.flexDirection = 'column';
                    colorPickerWrapper.style.alignItems = 'center';
                    
                    const label = colorPickerWrapper.createEl('small', { text: `Color ${index + 1}` });
                    
                    const colorPicker = colorPickerWrapper.createEl('input', {
                        type: 'color',
                        attr: {
                            value: color,
                            style: 'width: 40px; height: 40px; border: none; cursor: pointer;'
                        }
                    });
                    
                    colorPicker.addEventListener('change', async (e) => {
                        this.plugin.settings.customColors.light[index] = e.target.value;
                        await this.plugin.saveSettings();
                        if (this.plugin.settings.enableRainbowFolders && 
                            this.plugin.settings.rainbowColorScheme === 'custom' && 
                            !document.body.classList.contains('theme-dark')) {
                            // Use the wrapper method for reliable styling
                            this.plugin.applyWrapperRainbowStyles();
                            
                            // Set up the observer to maintain styles
                            this.plugin.setupRainbowMutationObserver();
                        }
                    });
                });
                
                // Custom colors section for dark mode
                this.paddedContainer.createEl('h3', {text: 'Custom Colors (Dark Mode)'});
                
                // Create color pickers for dark mode
                if (!this.plugin.settings.customColors || !this.plugin.settings.customColors.dark) {
                    if (!this.plugin.settings.customColors) {
                        this.plugin.settings.customColors = {};
                    }
                    this.plugin.settings.customColors.dark = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2'];
                }
                
                const darkColorContainer = this.paddedContainer.createDiv('custom-color-container');
                
                this.plugin.settings.customColors.dark.forEach((color, index) => {
                    const colorPickerWrapper = darkColorContainer.createDiv('color-picker-wrapper');
                    colorPickerWrapper.style.display = 'flex';
                    colorPickerWrapper.style.flexDirection = 'column';
                    colorPickerWrapper.style.alignItems = 'center';
                    
                    const label = colorPickerWrapper.createEl('small', { text: `Color ${index + 1}` });
                    
                    const colorPicker = colorPickerWrapper.createEl('input', {
                        type: 'color',
                        attr: {
                            value: color,
                            style: 'width: 40px; height: 40px; border: none; cursor: pointer;'
                        }
                    });
                    
                    colorPicker.addEventListener('change', async (e) => {
                        this.plugin.settings.customColors.dark[index] = e.target.value;
                        await this.plugin.saveSettings();
                        if (this.plugin.settings.enableRainbowFolders && 
                            this.plugin.settings.rainbowColorScheme === 'custom' && 
                            document.body.classList.contains('theme-dark')) {
                            // Use the wrapper method for reliable styling
                            this.plugin.applyWrapperRainbowStyles();
                            
                            // Set up the observer to maintain styles
                            this.plugin.setupRainbowMutationObserver();
                        }
                    });
                });
            }
        }
        
        // Dividers section
        this.paddedContainer.createEl('h2', {text: 'Dividers'});
        
        // Create divider settings
        this.createDividerSettings(this.paddedContainer);
        
        // Hidden files section
        this.paddedContainer.createEl('h2', {text: 'Hidden Files and Folders'});
        
        // Hidden files toggle
        new Setting(this.paddedContainer)
            .setName('Enable Hidden Files')
            .setDesc('Hide specific files and folders in the file explorer.')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableHiddenItems || false)
                .onChange(async (value) => {
                    this.plugin.settings.enableHiddenItems = value;
                    await this.plugin.saveSettings();
                    
                    if (value) {
                        this.plugin.updateHiddenElements();
                    } else {
                        // Remove hidden styles
                        this.plugin.removeStyles();
                    }
                    
                    // Force refresh of settings
                    this.display();
                }));
                
        // Only show hidden files settings when enabled
        if (this.plugin.settings.enableHiddenItems) {
            // Hidden files patterns
            new Setting(this.paddedContainer)
                .setName('Hidden Files Patterns')
                .setDesc('Enter patterns for files to hide, one per line. Use * as wildcard.')
                .addTextArea(text => {
                    text.inputEl.style.minHeight = '100px';
                    text.setValue(this.plugin.settings.hiddenItems?.join('\n') || '');
                    text.onChange(async (value) => {
                        const patterns = value.split('\n').filter(p => p.trim() !== '');
                        this.plugin.settings.hiddenItems = patterns;
                        await this.plugin.saveSettings();
                        this.plugin.updateHiddenElements();
                    });
                });
                
            // Create hidden folders settings
            this.createHiddenFoldersSettings(this.paddedContainer);
        }
        
    }
        
    // Method to create divider settings
    createDividerSettings(containerEl) {
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
                    
                    this.display();
                }));
        
        // Only show divider settings when enabled
        if (this.plugin.settings.enableDividers) {
            // Ensure divider settings are initialized
            if (!this.plugin.settings.dividerItems) {
                this.plugin.settings.dividerItems = [];
            }
            
            // Create a container for divider items
            const dividerItemsContainer = containerEl.createDiv('divider-items-container');
            
            // Add existing dividers
            this.plugin.settings.dividerItems.forEach((divider, index) => {
                const dividerEl = dividerItemsContainer.createEl('details', {
                    cls: 'divider-item',
                    attr: {
                        open: true
                    }
                });
                
                const summary = dividerEl.createEl('summary', {
                    text: divider.path || `Divider ${index + 1}`,
                    cls: 'divider-summary'
                });
                
                // Path setting
                new Setting(dividerEl)
                    .setName('Path')
                    .setDesc('Path to add divider before (e.g., "folder" or "folder/subfolder")')
                    .addText(text => text
                        .setValue(divider.path || '')
                        .onChange(async (value) => {
                            divider.path = value;
                            summary.textContent = value || `Divider ${index + 1}`;
                            await this.plugin.saveSettings();
                            this.plugin.applyDividerStyles();
                        }));
                
                // Border style
                new Setting(dividerEl)
                    .setName('Border Style')
                    .setDesc('Style of the divider border')
                    .addDropdown(dropdown => dropdown
                        .addOption('solid', 'Solid')
                        .addOption('dashed', 'Dashed')
                        .addOption('dotted', 'Dotted')
                        .addOption('double', 'Double')
                        .setValue(divider.borderStyle || 'solid')
                        .onChange(async (value) => {
                            divider.borderStyle = value;
                            await this.plugin.saveSettings();
                            this.plugin.applyDividerStyles();
                        }));
                
                // Color picker
                new Setting(dividerEl)
                    .setName('Color')
                    .setDesc('Color of the divider')
                    .addColorPicker(color => color
                        .setValue(divider.color || '#5e81ac')
                        .onChange(async (value) => {
                            divider.color = value;
                            await this.plugin.saveSettings();
                            this.plugin.applyDividerStyles();
                        }));
                
                // Size slider
                new Setting(dividerEl)
                    .setName('Size')
                    .setDesc('Size of the divider')
                    .addSlider(slider => slider
                        .setLimits(1, 10, 1)
                        .setValue(divider.size || 2)
                        .setDynamicTooltip()
                        .onChange(async (value) => {
                            divider.size = value;
                            await this.plugin.saveSettings();
                            this.plugin.applyDividerStyles();
                        }));
                
                // Position
                new Setting(dividerEl)
                    .setName('Position')
                    .setDesc('Position of the divider relative to the folder')
                    .addDropdown(dropdown => {
                        // Add all position styles from DIVIDER_STYLES
                        DIVIDER_STYLES.forEach(style => {
                            let displayName = style;
                            // Format the display name to be more readable
                            if (style === 'middleLeft') displayName = 'Middle Left';
                            else if (style === 'middleCenter') displayName = 'Middle Center';
                            else if (style === 'middleRight') displayName = 'Middle Right';
                            else if (style === 'topBG') displayName = 'Top with Background';
                            else if (style === 'bottomBG') displayName = 'Bottom with Background';
                            else if (style === 'leftBG') displayName = 'Left with Background';
                            else if (style === 'rightBG') displayName = 'Right with Background';
                            else if (style === 'allBG') displayName = 'All Sides with Background';
                            else if (style === 'BG') displayName = 'Background Only';
                            else if (style === 'text-only') displayName = 'Text Only';
                            else displayName = style.charAt(0).toUpperCase() + style.slice(1);
                            
                            dropdown.addOption(style, displayName);
                        });
                        
                        return dropdown
                            .setValue(divider.position || 'middleCenter')
                            .onChange(async (value) => {
                                divider.position = value;
                                await this.plugin.saveSettings();
                                this.plugin.applyDividerStyles();
                            });
                    });
                
                // Label
                new Setting(dividerEl)
                    .setName('Label')
                    .setDesc('Label to display on the divider (optional)')
                    .addText(text => text
                        .setValue(divider.label || '')
                        .onChange(async (value) => {
                            divider.label = value;
                            await this.plugin.saveSettings();
                            this.plugin.applyDividerStyles();
                        }));
                
                // Remove button
                new Setting(dividerEl)
                    .setName('Remove Divider')
                    .setDesc('Remove this divider')
                    .addButton(button => button
                        .setButtonText('Remove')
                        .onClick(async () => {
                            this.plugin.settings.dividerItems.splice(index, 1);
                            await this.plugin.saveSettings();
                            this.plugin.applyDividerStyles();
                            this.display();
                        }));
            });
            
            // Add new divider
            const newDividerSetting = new Setting(dividerItemsContainer)
                .setName('Add New Divider')
                .setDesc('Add a new divider to the file explorer')
                .addText(text => text
                    .setPlaceholder('Path (e.g., "folder")')
                    .setValue(''))
                .addButton(button => button
                    .setButtonText('Add')
                    .onClick(async () => {
                        const textInput = newDividerSetting.components[0].inputEl;
                        const path = textInput.value.trim();
                        
                        if (path) {
                            this.plugin.settings.dividerItems.push({
                                path: path,
                                borderStyle: 'solid',
                                color: '#5e81ac',
                                size: 2,
                                position: 'before',
                                label: ''
                            });
                            
                            textInput.value = '';
                            await this.plugin.saveSettings();
                            this.plugin.applyDividerStyles();
                            this.display();
                        }
                    }));
        }
    }

    // Method to display the settings tab
    display() {
        const {containerEl} = this;
        containerEl.empty();
        
        containerEl.addClass('explorer-enhancer-settings');
        containerEl.style.overflowY = 'auto';
        containerEl.style.height = '100%';
        containerEl.style.boxSizing = 'border-box';
        
        // Create a padded container for all settings
        this.paddedContainer = containerEl.createDiv('padded-container');
        this.paddedContainer.style.padding = '0 20px';
        
        // Rainbow Folders section
        const rainbowHeader = this.paddedContainer.createDiv();
        rainbowHeader.style.display = 'flex';
        rainbowHeader.style.justifyContent = 'space-between';
        rainbowHeader.style.alignItems = 'center';
        rainbowHeader.style.marginBottom = '10px';
        
        rainbowHeader.createEl('h2', {text: 'Rainbow Folders'});
        
        // Add Force Reload Styles button
        const reloadButton = document.createElement('button');
        reloadButton.textContent = 'Force Reload Styles';
        reloadButton.className = 'mod-cta';
        rainbowHeader.appendChild(reloadButton);
        reloadButton.addEventListener('click', () => {
            // Force reload all styles
            this.plugin.forceReloadStyles();
        });
        
        // Only show rainbow folder settings when enabled
        if (this.plugin.settings.enableRainbowFolders) {
            // Cascading colors
            new Setting(this.paddedContainer)
                .setName('Enable Cascading Colors')
                .setDesc('When enabled, folders at the same level get the same color. When disabled, each folder gets a unique sequential color.')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.enableCascadingColors)
                    .onChange(async (value) => {
                        this.plugin.settings.enableCascadingColors = value;
                        await this.plugin.saveSettings();
                        // Use the wrapper method for reliable styling
                        this.plugin.applyWrapperRainbowStyles();
                        
                        // Set up the observer to maintain styles
                        this.plugin.setupRainbowMutationObserver();
                    }));
            
            // Apply colors to files
            new Setting(this.paddedContainer)
                .setName('Apply Colors to Files')
                .setDesc('Apply parent folder\'s color to files inside it')
                .addToggle(toggle => toggle
                    .setValue(this.plugin.settings.applyColorsToFiles)
                    .onChange(async (value) => {
                        this.plugin.settings.applyColorsToFiles = value;
                        await this.plugin.saveSettings();
                        // Use the wrapper method for reliable styling
                        this.plugin.applyWrapperRainbowStyles();
                        
                        // Set up the observer to maintain styles
                        this.plugin.setupRainbowMutationObserver();
                    }));
            
            // Rainbow color scheme
            new Setting(this.paddedContainer)
                .setName('Rainbow Color Scheme')
                .setDesc('Choose a color scheme for rainbow folders')
                .addDropdown(dropdown => {
                    // Get all color schemes dynamically
                    const colorSchemes = getColorSchemes(this.plugin.settings);
                    
                    // Add all color schemes to dropdown
                    Object.keys(colorSchemes).forEach(scheme => {
                        dropdown.addOption(scheme, scheme);
                    });
                    
                    dropdown.setValue(this.plugin.settings.rainbowColorScheme || 'default')
                        .onChange(async (value) => {
                            this.plugin.settings.rainbowColorScheme = value;
                            await this.plugin.saveSettings();
                            
                            // Show/hide custom color pickers based on selection
                            if (value === 'custom') {
                                this.customColorsContainer.style.display = 'block';
                            } else {
                                this.customColorsContainer.style.display = 'none';
                            }
                            
                            // Use the wrapper method for reliable styling
                            this.plugin.applyWrapperRainbowStyles();
                            
                            // Set up the observer to maintain styles
                            this.plugin.setupRainbowMutationObserver();
                        });
                });
            
            // Display style
            new Setting(this.paddedContainer)
                .setName('Display Style')
                .setDesc('How to display the rainbow colors')
                .addDropdown(dropdown => {
                    // Add all display variants
                    dropdown.addOption('text', 'Text Color');
                    dropdown.addOption('background', 'Background');
                    dropdown.addOption('bordered', 'Left Border');
                    dropdown.addOption('top-border', 'Top Border');
                    dropdown.addOption('right-border', 'Right Border');
                    dropdown.addOption('bottom-border', 'Bottom Border');
                    dropdown.addOption('left-right-border', 'Left & Right Border');
                    dropdown.addOption('top-bottom-border', 'Top & Bottom Border');
                    dropdown.addOption('all-border', 'All Borders');
                    dropdown.addOption('bordered-bg', 'Left Border with Background');
                    dropdown.addOption('top-border-bg', 'Top Border with Background');
                    dropdown.addOption('right-border-bg', 'Right Border with Background');
                    dropdown.addOption('bottom-border-bg', 'Bottom Border with Background');
                    dropdown.addOption('left-right-border-bg', 'Left & Right Border with Background');
                    dropdown.addOption('top-bottom-border-bg', 'Top & Bottom Border with Background');
                    dropdown.addOption('all-border-bg', 'All Borders with Background');
                    dropdown.addOption('dot', 'Dot Indicator');
                    
                    return dropdown
                        .setValue(this.plugin.settings.displayVariant || 'text')
                        .onChange(async (value) => {
                            this.plugin.settings.displayVariant = value;
                            await this.plugin.saveSettings();
                            // Use the wrapper method for reliable styling
                            this.plugin.applyWrapperRainbowStyles();
                            
                            // Set up the observer to maintain styles
                            this.plugin.setupRainbowMutationObserver();
                        });
                });
            
            // Text color (for background display style)
            new Setting(this.paddedContainer)
                .setName('Text Color')
                .setDesc('Choose text color when using background display style')
                .addDropdown(dropdown => {
                    // Get all text colors dynamically
                    const textColors = getTextColors(this.plugin.settings);
                    
                    // Add all text colors to dropdown
                    Object.keys(textColors).forEach(color => {
                        dropdown.addOption(color, color);
                    });
                    
                    dropdown.setValue(this.plugin.settings.textColor || 'default')
                        .onChange(async (value) => {
                            this.plugin.settings.textColor = value;
                            await this.plugin.saveSettings();
                            // Use the wrapper method for reliable styling
                            this.plugin.applyWrapperRainbowStyles();
                            
                            // Set up the observer to maintain styles
                            this.plugin.setupRainbowMutationObserver();
                        });
                });
            
            // Custom colors container
            this.customColorsContainer = this.paddedContainer.createDiv('custom-colors-container');
            this.customColorsContainer.style.display = this.plugin.settings.rainbowColorScheme === 'custom' ? 'block' : 'none';
            this.customColorsContainer.style.marginTop = '20px';
            this.customColorsContainer.style.padding = '10px';
            this.customColorsContainer.style.border = '1px solid var(--background-modifier-border)';
            this.customColorsContainer.style.borderRadius = '5px';
            
            // Light mode custom colors
            new Setting(this.customColorsContainer)
                .setName('Light Mode Custom Colors')
                .setDesc('Define custom colors for light mode');
                
            // Create color picker container for light mode
            const lightModeColorContainer = this.customColorsContainer.createDiv('color-picker-container');
            lightModeColorContainer.style.display = 'flex';
            lightModeColorContainer.style.flexWrap = 'wrap';
            lightModeColorContainer.style.gap = '10px';
            lightModeColorContainer.style.marginBottom = '20px';
            
            // Create color pickers for light mode
            if (!this.plugin.settings.customColors || !this.plugin.settings.customColors.light) {
                if (!this.plugin.settings.customColors) {
                    this.plugin.settings.customColors = {};
                }
                this.plugin.settings.customColors.light = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2'];
            }
            
            if (this.plugin.settings.customColors.light) {
                this.plugin.settings.customColors.light.forEach((color, index) => {
                    const colorPickerWrapper = lightModeColorContainer.createDiv('color-picker-wrapper');
                    colorPickerWrapper.style.display = 'flex';
                    colorPickerWrapper.style.flexDirection = 'column';
                    colorPickerWrapper.style.alignItems = 'center';
                    
                    const label = colorPickerWrapper.createEl('small', { text: `Color ${index + 1}` });
                    
                    const colorPicker = colorPickerWrapper.createEl('input', {
                        type: 'color',
                        attr: {
                            value: color,
                            style: 'width: 40px; height: 40px; border: none; cursor: pointer;'
                        }
                    });
                    
                    colorPicker.addEventListener('change', async (e) => {
                        this.plugin.settings.customColors.light[index] = e.target.value;
                        await this.plugin.saveSettings();
                        if (this.plugin.settings.enableRainbowFolders && 
                            this.plugin.settings.rainbowColorScheme === 'custom' && 
                            !document.body.classList.contains('theme-dark')) {
                            // Use the wrapper method for reliable styling
                            this.plugin.applyWrapperRainbowStyles();
                            
                            // Set up the observer to maintain styles
                            this.plugin.setupRainbowMutationObserver();
                        }
                    });
                });
            }
            
            // Dark mode custom colors
            new Setting(this.customColorsContainer)
                .setName('Dark Mode Custom Colors')
                .setDesc('Define custom colors for dark mode');
                
            // Create color picker container for dark mode
            const darkModeColorContainer = this.customColorsContainer.createDiv('color-picker-container');
            darkModeColorContainer.style.display = 'flex';
            darkModeColorContainer.style.flexWrap = 'wrap';
            darkModeColorContainer.style.gap = '10px';
            darkModeColorContainer.style.marginBottom = '20px';
            
            // Create color pickers for dark mode
            if (!this.plugin.settings.customColors || !this.plugin.settings.customColors.dark) {
                if (!this.plugin.settings.customColors) {
                    this.plugin.settings.customColors = {};
                }
                this.plugin.settings.customColors.dark = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2'];
            }
            
            if (this.plugin.settings.customColors.dark) {
                this.plugin.settings.customColors.dark.forEach((color, index) => {
                    const colorPickerWrapper = darkModeColorContainer.createDiv('color-picker-wrapper');
                    colorPickerWrapper.style.display = 'flex';
                    colorPickerWrapper.style.flexDirection = 'column';
                    colorPickerWrapper.style.alignItems = 'center';
                    
                    const label = colorPickerWrapper.createEl('small', { text: `Color ${index + 1}` });
                    
                    const colorPicker = colorPickerWrapper.createEl('input', {
                        type: 'color',
                        attr: {
                            value: color,
                            style: 'width: 40px; height: 40px; border: none; cursor: pointer;'
                        }
                    });
                    
                    colorPicker.addEventListener('change', async (e) => {
                        this.plugin.settings.customColors.dark[index] = e.target.value;
                        await this.plugin.saveSettings();
                        if (this.plugin.settings.enableRainbowFolders && 
                            this.plugin.settings.rainbowColorScheme === 'custom' && 
                            document.body.classList.contains('theme-dark')) {
                            // Use the wrapper method for reliable styling
                            this.plugin.applyWrapperRainbowStyles();
                            
                            // Set up the observer to maintain styles
                            this.plugin.setupRainbowMutationObserver();
                        }
                    });
                });
            }
        }
        
        // Divider settings section
        this.paddedContainer.createEl('h2', {text: 'Dividers'});
        this.createDividerSettings(this.paddedContainer);
        
        // Hidden files section
        this.paddedContainer.createEl('h2', {text: 'Hidden Files & Folders'});
        
        // Enable hidden files toggle
        new Setting(this.paddedContainer)
            .setName('Enable Hidden Files')
            .setDesc('Hide files and folders in the file explorer')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableHiddenFiles || false)
                .onChange(async (value) => {
                    this.plugin.settings.enableHiddenFiles = value;
                    await this.plugin.saveSettings();
                    
                    if (value) {
                        this.plugin.updateHiddenElements();
                    } else {
                        // Show all hidden elements
                        this.plugin.removeStyles();
                    }
                }));
        
        // Only show hidden files settings when enabled
        if (this.plugin.settings.enableHiddenFiles) {
            // Hidden items patterns
            new Setting(this.paddedContainer)
                .setName('Hidden Items')
                .setDesc('Enter patterns for files and folders to hide, one per line. Use * as wildcard.')
                .addTextArea(text => {
                    text.inputEl.style.minHeight = '100px';
                    text.setValue(this.plugin.settings.hiddenItems?.join('\n') || '');
                    text.onChange(async (value) => {
                        const patterns = value.split('\n').filter(p => p.trim() !== '');
                        this.plugin.settings.hiddenItems = patterns;
                        await this.plugin.saveSettings();
                        this.plugin.updateHiddenElements();
                    });
                });
        }
    }

    // Hidden folders list
    createHiddenFoldersSettings(containerEl) {
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
                            this.plugin.updateHiddenElements();
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
                        this.plugin.updateHiddenElements();
                        this.newHiddenFolder = '';
                        this.display();
                    }
                }));
    }
    
    // End of createHiddenFoldersSettings method
    
    // Open settings tab
    openSettingsTab() {
        // Open the settings tab
        this.app.setting.open();
        
        // Navigate to the plugin's tab
        const settingTabs = this.app.setting.settingTabs;
        const pluginTab = settingTabs.find(tab => tab instanceof ExplorerEnhancerSettingTab);
        
        if (pluginTab) {
            this.app.setting.openTab(pluginTab);
            
            // Add padding directly to the settings tab after a small delay
            setTimeout(() => {
                // Target the settings tab content with a more specific selector
                const tabContent = document.querySelector('.vertical-tab-content[data-type="plugin"][data-plugin-id="explorer-enhancer"]');
                if (tabContent) {
                    // Add a special class for our CSS to target
                    tabContent.classList.add('explorer-enhancer-settings-content');
                    
                    // Also add inline styles as a fallback
                    tabContent.style.padding = '0 25px';
                    tabContent.style.boxSizing = 'border-box';
                }
            }, 50);
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
