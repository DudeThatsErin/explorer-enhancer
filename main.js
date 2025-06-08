const { Plugin, Setting, ItemView, PluginSettingTab } = require('obsidian');

// Define Obsidian theme variables for use in color schemes
const OBSIDIAN_THEME_VARS = {
    // Background colors
    backgroundPrimary: 'var(--background-primary)',
    backgroundPrimaryAlt: 'var(--background-primary-alt)',
    backgroundSecondary: 'var(--background-secondary)',
    backgroundSecondaryAlt: 'var(--background-secondary-alt)',
    backgroundModifier: 'var(--background-modifier-border)',
    backgroundAccent: 'var(--background-modifier-accent)',
    
    // Text colors
    textNormal: 'var(--text-normal)',
    textMuted: 'var(--text-muted)',
    textFaint: 'var(--text-faint)',
    textAccent: 'var(--text-accent)',
    textOnAccent: 'var(--text-on-accent)',
    textSelection: 'var(--text-selection)',
    
    // Interactive colors
    interactive: 'var(--interactive-normal)',
    interactiveHover: 'var(--interactive-hover)',
    interactiveAccent: 'var(--interactive-accent)',
    interactiveAccentHover: 'var(--interactive-accent-hover)',
    
    // Scrollbar colors
    scrollbarBg: 'var(--scrollbar-bg)',
    scrollbarThumb: 'var(--scrollbar-thumb-bg)',
    scrollbarActiveThumb: 'var(--scrollbar-active-thumb-bg)',
    
    // Additional UI colors
    borderColor: 'var(--border-color)',
    dividerColor: 'var(--divider-color)',
    highlightColor: 'var(--highlight-color)'
};

// Define color schemes with mode labels (light, dark, or both)
const COLOR_SCHEMES = {
    // Universal schemes (work well in both light and dark mode)
    default: { 
        colors: ['#ff6b6b', '#f9844a', '#fee440', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#ff90e8', '#ffafcc', '#ffcce5'],
        mode: 'both',
        label: 'Default'
    },
    pastel: { 
        colors: ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#ffb3c1', '#ffdde1'],
        mode: 'both',
        label: 'Pastel'
    },
    vibrant: { 
        colors: ['#7400b8', '#6930c3', '#5e60ce', '#5390d9', '#4ea8de', '#48bfe3', '#56cfe1', '#64dfdf', '#72efdd', '#80ffdb'],
        mode: 'both',
        label: 'Vibrant'
    },
    neon: { 
        colors: ['#ff00ff', '#00ffff', '#ff0000', '#00ff00', '#ffff00', '#ff8800', '#00ff88', '#0088ff', '#8800ff', '#ffffff'],
        mode: 'both',
        label: 'Neon'
    },
    rainbow: { 
        colors: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'],
        mode: 'both',
        label: 'Rainbow'
    },
    sunset: { 
        colors: ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#277da1', '#9c6644', '#e09f3e'],
        mode: 'both',
        label: 'Sunset'
    },
    ocean: { 
        colors: ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600', '#83c5be', '#006d77'],
        mode: 'both',
        label: 'Ocean'
    },
    forest: { 
        colors: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc', '#081c15', '#1b4332', '#2d6a4f'],
        mode: 'both',
        label: 'Forest'
    },
    candy: { 
        colors: ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff', '#ff477e', '#ff5c8a', '#ff7096', '#ff85a1', '#ff99ac'],
        mode: 'both',
        label: 'Candy'
    },
    
    // Light mode optimized schemes
    light: { 
        colors: ['#c1f5c1', '#c1d9f5', '#c1f5f1', '#f5c1e4', '#e3c1f5', '#f5d8c1', '#f5c1c1', '#c7f9cc', '#a4def5', '#d6c4f5',
                '#e0fbfc', '#d4e09b', '#f6f4d2', '#cbdfbd', '#f19c79', '#a44a3f', '#f2cc8f', '#f4f1de', '#e9c46a', '#d4a373',
                '#e8e9f3', '#cecece', '#a6a6a8', '#e3e1e1', '#fbfbfb', '#f0efeb', '#d8e2dc', '#ece4db', '#ffe8d6', '#ddbea9',
                '#ffd6ff', '#e7c6ff', '#c8b6ff', '#b8c0ff', '#bbd0ff'],
        mode: 'light',
        label: 'Pastels (Light)'
    },
    softLight: { 
        colors: ['#e9f5db', '#cfe1b9', '#b5c99a', '#97a97c', '#87986a', '#718355', '#4e5c45', '#31572c', '#1b4332', '#081c15',
                '#dad7cd', '#a3b18a', '#588157', '#3a5a40', '#344e41', '#f1faee', '#a8dadc', '#457b9d', '#1d3557', '#e63946',
                '#edede9', '#d6ccc2', '#f5ebe0', '#e3d5ca', '#d5bdaf', '#ccd5ae', '#e9edc9', '#fefae0', '#faedcd', '#d4a373',
                '#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25', '#eae2b7', '#fcbf49', '#f77f00', '#d62828', '#003049'],
        mode: 'light',
        label: 'Soft Green (Light)'
    },
    warmLight: { 
        colors: ['#ffcdb2', '#ffb4a2', '#e5989b', '#b5838d', '#6d6875', '#ffb5a7', '#fcd5ce', '#f8edeb', '#f9dcc4', '#fec89a',
                '#f8ad9d', '#f4978e', '#f08080', '#f28482', '#e5989b', '#fec5bb', '#fcd5ce', '#fae1dd', '#f8edeb', '#e8e8e4',
                '#eddcd2', '#fff1e6', '#fde2e4', '#fad2e1', '#c9ada7', '#f7ede2', '#f6bd60', '#f7ede2', '#f5cac3', '#84a59d',
                '#f28482', '#f5cac3', '#f7ede2', '#84a59d', '#f6bd60'],
        mode: 'light',
        label: 'Warm Tones (Light)'
    },
    coolLight: { 
        colors: ['#caf0f8', '#ade8f4', '#90e0ef', '#48cae4', '#00b4d8', '#0096c7', '#0077b6', '#023e8a', '#03045e', '#0a1128'],
        mode: 'light',
        label: 'Cool Blues (Light)'
    },
    springLight: { 
        colors: ['#e0fbfc', '#c2dfe3', '#9db4c0', '#5c6b73', '#253237', '#a8dadc', '#457b9d', '#1d3557', '#f1faee', '#e63946'],
        mode: 'light',
        label: 'Spring (Light)'
    },
    autumnLight: { 
        colors: ['#ffedd8', '#f3d5b5', '#e7bc91', '#d4a276', '#bc8a5f', '#a47148', '#8b5e34', '#6f4518', '#603808', '#583101'],
        mode: 'light',
        label: 'Autumn (Light)'
    },
    lavenderLight: { 
        colors: ['#e6e6fa', '#d8bfd8', '#dda0dd', '#da70d6', '#ba55d3', '#9370db', '#8a2be2', '#9400d3', '#8b008b', '#4b0082'],
        mode: 'light',
        label: 'Lavender (Light)'
    },
    mintLight: { 
        colors: ['#f1faee', '#a8dadc', '#457b9d', '#1d3557', '#e63946', '#d8f3dc', '#b7e4c7', '#95d5b2', '#74c69d', '#52b788'],
        mode: 'light',
        label: 'Mint (Light)'
    },
    
    // Dark mode optimized schemes
    dark: { 
        colors: ['#03071e', '#370617', '#6a040f', '#9d0208', '#d00000', '#dc2f02', '#e85d04', '#f48c06', '#faa307', '#ffba08',
                '#001219', '#005f73', '#0a9396', '#94d2bd', '#e9d8a6', '#ee9b00', '#ca6702', '#bb3e03', '#ae2012', '#9b2226',
                '#10002b', '#240046', '#3c096c', '#5a189a', '#7b2cbf', '#9d4edd', '#c77dff', '#e0aaff', '#590d22', '#800f2f',
                '#a4133c', '#c9184a', '#ff4d6d', '#ff758f', '#ff8fa3'],
        mode: 'dark',
        label: 'Dark Reds'
    },
    earth: { 
        colors: ['#582f0e', '#7f4f24', '#936639', '#a68a64', '#b6ad90', '#c2c5aa', '#a4ac86', '#656d4a', '#414833', '#333d29',
                '#2b2d42', '#8d99ae', '#edf2f4', '#ef233c', '#d90429', '#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51',
                '#22223b', '#4a4e69', '#9a8c98', '#c9ada7', '#f2e9e4', '#0b090a', '#161a1d', '#660708', '#a4161a', '#ba181b',
                '#e5383b', '#b1a7a6', '#d3d3d3', '#f5f3f4', '#ffffff'],
        mode: 'dark',
        label: 'Earth Tones'
    },
    grayscale: { 
        colors: ['#212529', '#343a40', '#495057', '#6c757d', '#adb5bd', '#ced4da', '#dee2e6', '#e9ecef', '#f8f9fa', '#ffffff',
                '#000000', '#080808', '#101010', '#181818', '#202020', '#282828', '#303030', '#383838', '#404040', '#484848',
                '#505050', '#585858', '#606060', '#686868', '#707070', '#787878', '#808080', '#888888', '#909090', '#989898',
                '#a0a0a0', '#a8a8a8', '#b0b0b0', '#b8b8b8', '#c0c0c0'],
        mode: 'dark',
        label: 'Grayscale'
    },
    darkBlues: { 
        colors: ['#012a4a', '#013a63', '#01497c', '#014f86', '#2a6f97', '#2c7da0', '#468faf', '#61a5c2', '#89c2d9', '#a9d6e5'],
        mode: 'dark',
        label: 'Ocean Blues (Dark)'
    },
    darkPurples: { 
        colors: ['#10002b', '#240046', '#3c096c', '#5a189a', '#7b2cbf', '#9d4edd', '#c77dff', '#e0aaff', '#e6c8fe', '#f3e7ff'],
        mode: 'dark',
        label: 'Royal Purples (Dark)'
    },
    cyberpunk: { 
        colors: ['#0d0221', '#0f084b', '#26408b', '#0a81ab', '#0ef6cc', '#ff206e', '#fbff12', '#41ead4', '#f15bb5', '#00f5d4'],
        mode: 'dark',
        label: 'Cyberpunk'
    },
    volcanic: { 
        colors: ['#0b090a', '#161a1d', '#660708', '#a4161a', '#ba181b', '#e5383b', '#b1a7a6', '#d3d3d3', '#f5f3f4', '#ffffff'],
        mode: 'dark',
        label: 'Volcanic'
    },
    emerald: { 
        colors: ['#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'],
        mode: 'dark',
        label: 'Emerald'
    },
    midnight: { 
        colors: ['#0a0908', '#22333b', '#5e503f', '#a9927d', '#f2f4f3', '#2b2d42', '#8d99ae', '#edf2f4', '#ef233c', '#d90429'],
        mode: 'dark',
        label: 'Midnight'
    },
    galaxy: { 
        colors: ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd', '#7209b7', '#560bad', '#480ca8', '#3a0ca3', '#3f37c9'],
        mode: 'dark',
        label: 'Galaxy'
    },
    nordDark: { 
        colors: ['#2e3440', '#3b4252', '#434c5e', '#4c566a', '#d8dee9', '#e5e9f0', '#eceff4', '#8fbcbb', '#88c0d0', '#81a1c1'],
        mode: 'dark',
        label: 'Nord Dark'
    }
};

// Define text color options
const TEXT_COLORS = {
    default: { 
        colors: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff',
                '#880000', '#008800', '#000088', '#888800', '#880088', '#008888', '#aa5500', '#55aa00', '#0055aa', '#aa00aa',
                '#00aaaa', '#aaaa00', '#555555', '#aaaaaa', '#123456', '#654321', '#abcdef', '#fedcba', '#a1b2c3', '#c3b2a1',
                '#112233', '#332211', '#778899', '#998877', '#336699'],
        mode: 'both',
        label: 'Default'
    },
    obsidian: {
        colors: [OBSIDIAN_THEME_VARS.textNormal, OBSIDIAN_THEME_VARS.textMuted],
        mode: 'both',
        label: 'Obsidian Theme'
    },
    red: {
        colors: ['#ff5555', '#ff6b6b'],
        mode: 'both',
        label: 'Red'
    },
    orange: {
        colors: ['#ff9944', '#ffb366'],
        mode: 'both',
        label: 'Orange'
    },
    yellow: {
        colors: ['#ffcc00', '#ffdd33'],
        mode: 'both',
        label: 'Yellow'
    },
    green: {
        colors: ['#00aa00', '#33cc33'],
        mode: 'both',
        label: 'Green'
    },
    blue: {
        colors: ['#0066ff', '#3399ff'],
        mode: 'both',
        label: 'Blue'
    },
    purple: {
        colors: ['#aa00ff', '#cc33ff'],
        mode: 'both',
        label: 'Purple'
    },
    pink: {
        colors: ['#ff55aa', '#ff77bb'],
        mode: 'both',
        label: 'Pink'
    },
    // Fixed problematic colors with better contrast values
    magenta: {
        colors: ['#cc00cc', '#ff00ff'],
        mode: 'both',
        label: 'Magenta'
    },
    lime: {
        colors: ['#99cc00', '#ccff00'],
        mode: 'both',
        label: 'Lime'
    },
    teal: {
        colors: ['#008888', '#00cccc'],
        mode: 'both',
        label: 'Teal'
    },
    indigo: {
        colors: ['#4400aa', '#6600cc'],
        mode: 'both',
        label: 'Indigo'
    },
    gold: {
        colors: ['#cc9900', '#ffcc00'],
        mode: 'both',
        label: 'Gold'
    },
    coral: {
        colors: ['#e25822', '#ff7f50'],
        mode: 'both',
        label: 'Coral'
    },
    turquoise: {
        colors: ['#00ced1', '#40e0d0'],
        mode: 'both',
        label: 'Turquoise'
    },
    grayscale: { 
        colors: ['#000000', '#212529', '#343a40', '#495057', '#6c757d', '#adb5bd', '#ced4da', '#dee2e6', '#f8f9fa', '#ffffff'],
        mode: 'both',
        label: 'Grayscale'
    },
    vibrant: { 
        colors: ['#7400b8', '#6930c3', '#5e60ce', '#5390d9', '#4ea8de', '#48bfe3', '#56cfe1', '#64dfdf', '#72efdd', '#80ffdb'],
        mode: 'both',
        label: 'Vibrant'
    },
    warm: { 
        colors: ['#ff6b6b', '#f9844a', '#fee440', '#ff7b00', '#ff9500', '#ffb700', '#ffd000', '#ffea00', '#9e2a2b', '#540b0e'],
        mode: 'both',
        label: 'Warm'
    },
    cool: { 
        colors: ['#0077b6', '#00b4d8', '#90e0ef', '#caf0f8', '#012a4a', '#013a63', '#01497c', '#014f86', '#2a6f97', '#2c7da0'],
        mode: 'both',
        label: 'Cool'
    },
    earth: { 
        colors: ['#582f0e', '#7f4f24', '#936639', '#a68a64', '#b6ad90', '#c2c5aa', '#a4ac86', '#656d4a', '#414833', '#333d29'],
        mode: 'both',
        label: 'Earth'
    },
    pastel: { 
        colors: ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#ffb3c1', '#ffdde1'],
        mode: 'both',
        label: 'Pastel'
    },
    neon: { 
        colors: ['#ff00ff', '#00ffff', '#ff0000', '#00ff00', '#ffff00', '#ff8800', '#00ff88', '#0088ff', '#8800ff', '#ffffff'],
        mode: 'both',
        label: 'Neon'
    },
    dark: { 
        colors: ['#03071e', '#370617', '#6a040f', '#9d0208', '#d00000', '#dc2f02', '#e85d04', '#f48c06', '#faa307', '#ffba08'],
        mode: 'dark',
        label: 'Dark'
    },
    light: { 
        colors: ['#c1f5c1', '#c1d9f5', '#c1f5f1', '#f5c1e4', '#e3c1f5', '#f5d8c1', '#f5c1c1', '#c7f9cc', '#a4def5', '#d6c4f5'],
        mode: 'light',
        label: 'Light'
    },
    rainbow: { 
        colors: ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'],
        mode: 'both',
        label: 'Rainbow'
    },
    sunset: { 
        colors: ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#277da1', '#9c6644', '#e09f3e'],
        mode: 'both',
        label: 'Sunset'
    },
    ocean: { 
        colors: ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600', '#83c5be', '#006d77'],
        label: 'Ocean'
    },
    forest: { 
        colors: ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc', '#081c15', '#1b4332', '#2d6a4f'],
        label: 'Forest'
    },
    candy: { 
        colors: ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff', '#ff477e', '#ff5c8a', '#ff7096', '#ff85a1', '#ff99ac'],
        label: 'Candy'
    },
    cyberpunk: { 
        colors: ['#0d0221', '#0f084b', '#26408b', '#0a81ab', '#0ef6cc', '#ff206e', '#fbff12', '#41ead4', '#f15bb5', '#00f5d4'],
        label: 'Cyberpunk'
    },
    volcanic: { 
        colors: ['#0b090a', '#161a1d', '#660708', '#a4161a', '#ba181b', '#e5383b', '#b1a7a6', '#d3d3d3', '#f5f3f4', '#ffffff'],
        label: 'Volcanic'
    },
    emerald: { 
        colors: ['#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5', '#ecfdf5'],
        label: 'Emerald'
    },
    midnight: { 
        colors: ['#0a0908', '#22333b', '#5e503f', '#a9927d', '#f2f4f3', '#2b2d42', '#8d99ae', '#edf2f4', '#ef233c', '#d90429'],
        label: 'Midnight'
    },
    galaxy: { 
        colors: ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd', '#7209b7', '#560bad', '#480ca8', '#3a0ca3', '#3f37c9'],
        label: 'Galaxy'
    },
    nordDark: { 
        colors: ['#2e3440', '#3b4252', '#434c5e', '#4c566a', '#5e81ac', '#81a1c1', '#88c0d0', '#8fbcbb', '#a3be8c', '#b48ead'],
        mode: 'dark',
        label: 'Nord Dark'
    },
    monochrome: { 
        colors: ['#000000', '#0d0d0d', '#1a1a1a', '#262626', '#333333', '#404040', '#4d4d4d', '#595959', '#666666', '#ffffff'],
        label: 'Monochrome'
    },
    sepia: { 
        colors: ['#704214', '#8d6542', '#9c7a5b', '#aa8f74', '#b9a48d', '#c7b9a6', '#d6cebf', '#e4e3d8', '#f3f8f1', '#fffbff'],
        label: 'Sepia'
    },
    jewel: { 
        colors: ['#9b1d20', '#3d2645', '#832161', '#da4167', '#4d7ea8', '#287271', '#1e4d2b', '#854d27', '#a44200', '#d58936'],
        mode: 'both',
        label: 'Jewel Tones'
    },
    // Single color variants - Light
    allPurpleLight: {
        colors: ['#9370DB', '#9370DB', '#9370DB', '#9370DB', '#9370DB', '#9370DB', '#9370DB', '#9370DB', '#9370DB', '#9370DB'],
        mode: 'light',
        label: 'All Purple'
    },
    allVioletLight: {
        colors: ['#8A2BE2', '#8A2BE2', '#8A2BE2', '#8A2BE2', '#8A2BE2', '#8A2BE2', '#8A2BE2', '#8A2BE2', '#8A2BE2', '#8A2BE2'],
        mode: 'light',
        label: 'All Violet'
    },
    allPinkLight: {
        colors: ['#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4', '#FF69B4'],
        mode: 'light',
        label: 'All Pink'
    },
    allWhite: {
        colors: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
        mode: 'light',
        label: 'All White'
    },
    allBlack: {
        colors: ['#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000', '#000000'],
        mode: 'dark',
        label: 'All Black'
    },
    allGrayLight: {
        colors: ['#A9A9A9', '#A9A9A9', '#A9A9A9', '#A9A9A9', '#A9A9A9', '#A9A9A9', '#A9A9A9', '#A9A9A9', '#A9A9A9', '#A9A9A9'],
        mode: 'light',
        label: 'All Gray'
    },
    allBrownLight: {
        colors: ['#A52A2A', '#A52A2A', '#A52A2A', '#A52A2A', '#A52A2A', '#A52A2A', '#A52A2A', '#A52A2A', '#A52A2A', '#A52A2A'],
        mode: 'light',
        label: 'All Brown'
    },
    allTanLight: {
        colors: ['#D2B48C', '#D2B48C', '#D2B48C', '#D2B48C', '#D2B48C', '#D2B48C', '#D2B48C', '#D2B48C', '#D2B48C', '#D2B48C'],
        mode: 'light',
        label: 'All Tan'
    },
    allOrangeLight: {
        colors: ['#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500', '#FFA500'],
        mode: 'light',
        label: 'All Orange'
    },
    allCyanLight: {
        colors: ['#00FFFF', '#00FFFF', '#00FFFF', '#00FFFF', '#00FFFF', '#00FFFF', '#00FFFF', '#00FFFF', '#00FFFF', '#00FFFF'],
        mode: 'light',
        label: 'All Cyan'
    },
    allTealLight: {
        colors: ['#008080', '#008080', '#008080', '#008080', '#008080', '#008080', '#008080', '#008080', '#008080', '#008080'],
        mode: 'light',
        label: 'All Teal'
    },
    allGreenLight: {
        colors: ['#00FF00', '#00FF00', '#00FF00', '#00FF00', '#00FF00', '#00FF00', '#00FF00', '#00FF00', '#00FF00', '#00FF00'],
        mode: 'light',
        label: 'All Green'
    },
    allBlueLight: {
        colors: ['#0000FF', '#0000FF', '#0000FF', '#0000FF', '#0000FF', '#0000FF', '#0000FF', '#0000FF', '#0000FF', '#0000FF'],
        mode: 'light',
        label: 'All Blue'
    },
    allRedLight: {
        colors: ['#FF0000', '#FF0000', '#FF0000', '#FF0000', '#FF0000', '#FF0000', '#FF0000', '#FF0000', '#FF0000', '#FF0000'],
        mode: 'light',
        label: 'All Red'
    },
    allYellowLight: {
        colors: ['#FFFF00', '#FFFF00', '#FFFF00', '#FFFF00', '#FFFF00', '#FFFF00', '#FFFF00', '#FFFF00', '#FFFF00', '#FFFF00'],
        mode: 'light',
        label: 'All Yellow'
    },
    // Single color variants - Dark
    allPurpleDark: {
        colors: ['#4B0082', '#4B0082', '#4B0082', '#4B0082', '#4B0082', '#4B0082', '#4B0082', '#4B0082', '#4B0082', '#4B0082'],
        mode: 'dark',
        label: 'All Purple'
    },
    allVioletDark: {
        colors: ['#7F00FF', '#7F00FF', '#7F00FF', '#7F00FF', '#7F00FF', '#7F00FF', '#7F00FF', '#7F00FF', '#7F00FF', '#7F00FF'],
        mode: 'dark',
        label: 'All Violet'
    },
    allPinkDark: {
        colors: ['#FF1493', '#FF1493', '#FF1493', '#FF1493', '#FF1493', '#FF1493', '#FF1493', '#FF1493', '#FF1493', '#FF1493'],
        mode: 'dark',
        label: 'All Pink'
    },
    allGrayDark: {
        colors: ['#696969', '#696969', '#696969', '#696969', '#696969', '#696969', '#696969', '#696969', '#696969', '#696969'],
        mode: 'dark',
        label: 'All Gray'
    },
    allBrownDark: {
        colors: ['#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513', '#8B4513'],
        mode: 'dark',
        label: 'All Brown'
    },
    allTanDark: {
        colors: ['#BC8F8F', '#BC8F8F', '#BC8F8F', '#BC8F8F', '#BC8F8F', '#BC8F8F', '#BC8F8F', '#BC8F8F', '#BC8F8F', '#BC8F8F'],
        mode: 'dark',
        label: 'All Tan'
    },
    allOrangeDark: {
        colors: ['#FF8C00', '#FF8C00', '#FF8C00', '#FF8C00', '#FF8C00', '#FF8C00', '#FF8C00', '#FF8C00', '#FF8C00', '#FF8C00'],
        mode: 'dark',
        label: 'All Orange'
    },
    allCyanDark: {
        colors: ['#008B8B', '#008B8B', '#008B8B', '#008B8B', '#008B8B', '#008B8B', '#008B8B', '#008B8B', '#008B8B', '#008B8B'],
        mode: 'dark',
        label: 'All Cyan'
    },
    allTealDark: {
        colors: ['#006666', '#006666', '#006666', '#006666', '#006666', '#006666', '#006666', '#006666', '#006666', '#006666'],
        mode: 'dark',
        label: 'All Teal'
    },
    allGreenDark: {
        colors: ['#006400', '#006400', '#006400', '#006400', '#006400', '#006400', '#006400', '#006400', '#006400', '#006400'],
        mode: 'dark',
        label: 'All Green'
    },
    allBlueDark: {
        colors: ['#00008B', '#00008B', '#00008B', '#00008B', '#00008B', '#00008B', '#00008B', '#00008B', '#00008B', '#00008B'],
        mode: 'dark',
        label: 'All Blue'
    },
    allRedDark: {
        colors: ['#8B0000', '#8B0000', '#8B0000', '#8B0000', '#8B0000', '#8B0000', '#8B0000', '#8B0000', '#8B0000', '#8B0000'],
        mode: 'dark',
        label: 'All Red'
    },
    allYellowDark: {
        colors: ['#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700', '#FFD700'],
        mode: 'dark',
        label: 'All Yellow'
    },
    // Shade variants - Light
    purpleShadesLight: {
        colors: ['#E6E6FA', '#D8BFD8', '#DDA0DD', '#DA70D6', '#BA55D3', '#9370DB', '#8A2BE2', '#9400D3', '#8B008B', '#4B0082'],
        mode: 'light',
        label: 'Purple Shades'
    },
    pinkShadesLight: {
        colors: ['#FFF0F5', '#FFDDF4', '#FFBBDD', '#FF9EC9', '#FF69B4', '#FF1493', '#DB7093', '#C71585', '#FF007F', '#FF0054'],
        mode: 'light',
        label: 'Pink Shades'
    },
    grayShadesLight: {
        colors: ['#F8F9FA', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529', '#000000'],
        mode: 'light',
        label: 'Gray Shades'
    },
    brownShadesLight: {
        colors: ['#FFEFD5', '#FFE4B5', '#DEB887', '#D2B48C', '#BC8F8F', '#A0522D', '#8B4513', '#7B3F00', '#5C2E00', '#3D1C00'],
        mode: 'light',
        label: 'Brown Shades'
    },
    orangeShadesLight: {
        colors: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00', '#F57C00', '#EF6C00', '#E65100'],
        mode: 'light',
        label: 'Orange Shades'
    },
    blueShadesLight: {
        colors: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1'],
        mode: 'light',
        label: 'Blue Shades'
    },
    greenShadesLight: {
        colors: ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20'],
        mode: 'light',
        label: 'Green Shades'
    },
    redShadesLight: {
        colors: ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C'],
        mode: 'light',
        label: 'Red Shades'
    },
    yellowShadesLight: {
        colors: ['#FFFDE7', '#FFF9C4', '#FFF59D', '#FFF176', '#FFEE58', '#FFEB3B', '#FDD835', '#FBC02D', '#F9A825', '#F57F17'],
        mode: 'light',
        label: 'Yellow Shades'
    },
    // Obsidian theme variables
    obsidianTheme: {
        colors: [
            OBSIDIAN_THEME_VARS.textNormal,
            OBSIDIAN_THEME_VARS.textMuted,
            OBSIDIAN_THEME_VARS.textFaint,
            OBSIDIAN_THEME_VARS.textAccent,
            OBSIDIAN_THEME_VARS.textOnAccent,
            OBSIDIAN_THEME_VARS.interactiveAccent,
            OBSIDIAN_THEME_VARS.interactiveAccentHover,
            OBSIDIAN_THEME_VARS.highlightColor,
            OBSIDIAN_THEME_VARS.dividerColor,
            OBSIDIAN_THEME_VARS.borderColor
        ],
        mode: 'both',
        label: 'Obsidian Theme Variables'
    },
    // Shade variants - Dark
    purpleShadesDark: {
        colors: ['#4B0082', '#5D1A9C', '#6F34B6', '#814ED0', '#9368EA', '#A582FF', '#B79CFF', '#C9B6FF', '#DBD0FF', '#EDEAFF'],
        mode: 'dark',
        label: 'Purple Shades'
    },
    pinkShadesDark: {
        colors: ['#8B0046', '#A3005C', '#BB0072', '#D30088', '#EB009E', '#FF00B4', '#FF33C3', '#FF66D1', '#FF99E0', '#FFCCEE'],
        mode: 'dark',
        label: 'Pink Shades'
    },
    grayShadesDark: {
        colors: ['#000000', '#121212', '#242424', '#363636', '#484848', '#5A5A5A', '#6C6C6C', '#7E7E7E', '#909090', '#A2A2A2'],
        mode: 'dark',
        label: 'Gray Shades'
    },
    brownShadesDark: {
        colors: ['#3D1C00', '#4E2800', '#5F3400', '#704000', '#814C00', '#925800', '#A36400', '#B47000', '#C57C00', '#D68800'],
        mode: 'dark',
        label: 'Brown Shades'
    },
    orangeShadesDark: {
        colors: ['#E65100', '#F57C00', '#FB8C00', '#FF9800', '#FFA726', '#FFB74D', '#FFCC80', '#FFD8A8', '#FFE0B2', '#FFF3E0'],
        mode: 'dark',
        label: 'Orange Shades'
    },
    blueShadesDark: {
        colors: ['#0D47A1', '#1565C0', '#1976D2', '#1E88E5', '#2196F3', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB', '#E3F2FD'],
        mode: 'dark',
        label: 'Blue Shades'
    },
    greenShadesDark: {
        colors: ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E9'],
        mode: 'dark',
        label: 'Green Shades'
    },
    redShadesDark: {
        colors: ['#B71C1C', '#C62828', '#D32F2F', '#E53935', '#F44336', '#EF5350', '#E57373', '#EF9A9A', '#FFCDD2', '#FFEBEE'],
        mode: 'dark',
        label: 'Red Shades'
    },
    yellowShadesDark: {
        colors: ['#F57F17', '#F9A825', '#FBC02D', '#FDD835', '#FFEB3B', '#FFEE58', '#FFF176', '#FFF59D', '#FFF9C4', '#FFFDE7'],
        mode: 'dark',
        label: 'Yellow Shades'
    },
    // Obsidian theme variables
    obsidianTheme: {
        colors: [
            OBSIDIAN_THEME_VARS.backgroundPrimary,
            OBSIDIAN_THEME_VARS.backgroundSecondary,
            OBSIDIAN_THEME_VARS.backgroundSecondaryAlt,
            OBSIDIAN_THEME_VARS.textNormal,
            OBSIDIAN_THEME_VARS.textAccent,
            OBSIDIAN_THEME_VARS.interactiveAccent,
            OBSIDIAN_THEME_VARS.highlightColor,
            OBSIDIAN_THEME_VARS.dividerColor,
            OBSIDIAN_THEME_VARS.borderColor,
            OBSIDIAN_THEME_VARS.backgroundModifier
        ],
        mode: 'both',
        label: 'Obsidian Theme Variables'
    },
    // Add previously problematic colors with proper light/dark mode support
    magenta: {
        colors: ['#cc00cc', '#ff00ff'],
        mode: 'both',
        label: 'Magenta'
    },
    lime: {
        colors: ['#99cc00', '#ccff00'],
        mode: 'both',
        label: 'Lime'
    },
    teal: {
        colors: ['#008888', '#00cccc'],
        mode: 'both',
        label: 'Teal'
    },
    indigo: {
        colors: ['#4400aa', '#6600cc'],
        mode: 'both',
        label: 'Indigo'
    },
    gold: {
        colors: ['#cc9900', '#ffcc00'],
        mode: 'both',
        label: 'Gold'
    },
    coral: {
        colors: ['#e25822', '#ff7f50'],
        mode: 'both',
        label: 'Coral'
    },
    turquoise: {
        colors: ['#00ced1', '#40e0d0'],
        mode: 'both',
        label: 'Turquoise'
    }
};

// Define standard color map for backward compatibility
const STANDARD_COLOR_MAP = {
    'currentColor': 'currentColor',
    'red': isDarkMode => isDarkMode ? '#ff6b6b' : '#ff5555',
    'orange': isDarkMode => isDarkMode ? '#ffb366' : '#ff9944',
    'yellow': isDarkMode => isDarkMode ? '#ffdd33' : '#ffcc00',
    'green': isDarkMode => isDarkMode ? '#33cc33' : '#00aa00',
    'blue': isDarkMode => isDarkMode ? '#3399ff' : '#0066ff',
    'purple': isDarkMode => isDarkMode ? '#cc33ff' : '#aa00ff',
    'pink': isDarkMode => isDarkMode ? '#ff77bb' : '#ff55aa',
    'brown': isDarkMode => isDarkMode ? '#cc7733' : '#aa5500',
    'gray': isDarkMode => isDarkMode ? '#aaaaaa' : '#888888',
    'black': isDarkMode => isDarkMode ? '#333333' : '#000000',
    'white': isDarkMode => isDarkMode ? '#ffffff' : '#ffffff',
    'violet': isDarkMode => isDarkMode ? '#aa33ff' : '#8800ff',
    'cyan': isDarkMode => isDarkMode ? '#33cccc' : '#00aaaa',
    // Fixed problematic colors with better contrast values
    'magenta': isDarkMode => isDarkMode ? '#ff00ff' : '#cc00cc',
    'lime': isDarkMode => isDarkMode ? '#ccff00' : '#99cc00',
    'teal': isDarkMode => isDarkMode ? '#00cccc' : '#008888',
    'indigo': isDarkMode => isDarkMode ? '#6600cc' : '#4400aa',
    'gold': isDarkMode => isDarkMode ? '#ffcc00' : '#cc9900',
    'coral': isDarkMode => isDarkMode ? '#ff7f50' : '#e25822',
    'turquoise': isDarkMode => isDarkMode ? '#40e0d0' : '#00ced1'
};

// Define divider color options
const DIVIDER_COLORS = {
    default: { 
        colors: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'],
        mode: 'both',
        label: 'Default'
    },
    grayscale: { 
        colors: ['#000000', '#212529', '#343a40', '#495057', '#6c757d', '#adb5bd', '#ced4da', '#dee2e6', '#f8f9fa', '#ffffff'],
        mode: 'both',
        label: 'Grayscale'
    },
    // Add previously problematic colors with proper light/dark mode support
    magenta: {
        colors: ['#cc00cc', '#ff00ff'],
        mode: 'both',
        label: 'Magenta'
    },
    lime: {
        colors: ['#99cc00', '#ccff00'],
        mode: 'both',
        label: 'Lime'
    },
    teal: {
        colors: ['#008888', '#00cccc'],
        mode: 'both',
        label: 'Teal'
    },
    indigo: {
        colors: ['#4400aa', '#6600cc'],
        mode: 'both',
        label: 'Indigo'
    },
    gold: {
        colors: ['#cc9900', '#ffcc00'],
        mode: 'both',
        label: 'Gold'
    },
    coral: {
        colors: ['#e25822', '#ff7f50'],
        mode: 'both',
        label: 'Coral'
    },
    turquoise: {
        colors: ['#00ced1', '#40e0d0'],
        mode: 'both',
        label: 'Turquoise'
    }
};

// TEXT_COLORS is already defined at the top of the file

// Default settings
const DEFAULT_SETTINGS = {
    hiddenFiles: [],
    hiddenFolders: [],
    enableRainbowFolders: true,
    rainbowColorScheme: 'default',
    textColorScheme: 'default',  // New setting for text color scheme
    enableCascadingColors: true,
    applyColorsToFiles: true,
    colorOpacity: 1.0,
    displayVariant: 'text', // 'text', 'background', 'bordered', 'dot'
    customColors: {
        light: [...COLOR_SCHEMES.default.colors],
        dark: [...COLOR_SCHEMES.default.colors]
    },
    customTextColors: {
        light: [...TEXT_COLORS.default.colors],
        dark: [...TEXT_COLORS.default.colors]
    },
    // Divider settings
    enableDividers: false,
    dividers: [],  // Array of {path: string, label: string, type: 'file'|'folder'}
    dividerStyle: {
        backgroundColor: 'var(--background-secondary)',
        lineColor: 'currentColor',
        paddingX: '10',
        textAlign: 'left', // 'left', 'center', 'right'
        displayVariant: 'border', // 'border', 'background', 'text-only'
        lineColorScheme: 'default',
        textColorScheme: 'default',
        textSize: '14', // Default text size in pixels
        customLineColors: {
            light: '#888888',
            dark: '#888888'
        },
        customTextColors: {
            light: '#000000',
            dark: '#ffffff'
        }
    },
    // Settings UI state
    openSections: {
        'rainbow': false,
        'hiddenFiles': false,
        'dividers': false
    }
};

class ExplorerEnhancerSettingsTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
        this.cleanupCallbacks = [];
        
        // Properties needed for settings display
        this.newHiddenFile = '';
        this.newHiddenFolder = '';
        this.newDivider = '';
        this.customColorsContainer = null;
        this.customTextColorsContainer = null;
    }
    
    hide() {
        // Clean up when the settings tab is hidden
        if (this.cleanupCallbacks) {
            this.cleanupCallbacks.forEach(callback => callback());
        }
        super.hide();
    }

    display() {
        const {containerEl} = this;
        containerEl.empty();
        
        // Clean up any previous callbacks
        if (this.cleanupCallbacks) {
            this.cleanupCallbacks.forEach(callback => callback());
            this.cleanupCallbacks = [];
        }
        
        // Add a settings container with proper styling
        containerEl.addClass("explorer-enhancer-settings-container");
        
        // Add title
        containerEl.createEl("h2", { text: "Explorer Enhancer Settings", cls: "settings-header" });
        
        // Display settings
        this.displaySettings(containerEl);
        
        // Add CSS to ensure proper styling
        const css = `
            .explorer-enhancer-settings-container {
                padding: 0 20px;
            }
            .explorer-enhancer-settings-container .setting-item {
                border-top: 1px solid var(--background-modifier-border);
            }
            .explorer-enhancer-settings-container .collapsible-header {
                cursor: pointer;
                display: flex;
                align-items: center;
                padding: 10px 0;
                font-weight: bold;
                font-size: 16px;
                border-bottom: 1px solid var(--background-modifier-border);
                margin-bottom: 10px;
            }
            .explorer-enhancer-settings-container .collapse-icon {
                margin-right: 8px;
            }
            .explorer-enhancer-settings-container .collapsible-content {
                padding-left: 10px;
            }
            
            /* Improve dropdown styling */
            .explorer-enhancer-settings-container .dropdown {
                background-color: var(--background-primary);
                border: 1px solid var(--background-modifier-border);
                border-radius: 4px;
                padding: 4px 8px;
                min-width: 150px;
            }
            
            /* Fix dropdown option display */
            .explorer-enhancer-settings-container select {
                width: 100%;
                background-color: var(--background-primary);
                color: var(--text-normal);
                border: none;
                padding: 4px;
                border-radius: 4px;
                outline: none;
            }
        `;
        
        // Add the CSS to the document
        const styleEl = document.createElement('style');
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
        
        // Remove style element when the view is closed
        // Use registerDomEvent instead of register for cleanup
        this.plugin.registerDomEvent(window, 'beforeunload', () => styleEl.remove());
        
        // Also store a reference to remove it when the settings tab is closed
        if (!this.cleanupCallbacks) this.cleanupCallbacks = [];
        this.cleanupCallbacks.push(() => styleEl.remove());
    }
    
    // Helper function to create collapsible sections
    createCollapsibleSection(containerEl, title, id) {
        const sectionEl = containerEl.createDiv(`settings-section ${id}-section`);
        
        // Create header with toggle
        const header = sectionEl.createDiv('collapsible-header');
        const caret = header.createSpan('collapse-icon');
        caret.innerHTML = this.plugin.settings.openSections?.[id] !== false ? '▼' : '►';
        header.createSpan('section-title').setText(title);
        
        // Create content container
        const content = sectionEl.createDiv('collapsible-content');
        if (this.plugin.settings.openSections?.[id] === false) {
            content.style.display = 'none';
        }
        
        // Toggle functionality
        header.addEventListener('click', () => {
            const isOpen = content.style.display !== 'none';
            content.style.display = isOpen ? 'none' : 'block';
            caret.innerHTML = isOpen ? '►' : '▼';
            
            // Save state
            if (!this.plugin.settings.openSections) {
                this.plugin.settings.openSections = {};
            }
            this.plugin.settings.openSections[id] = !isOpen;
            this.plugin.saveSettings();
        });
        
        return content;
    }
    
    // This is the main settings display function
    displaySettings(containerEl) {
        containerEl.empty();
        
        // Create Rainbow Folders section
        const rainbowSection = this.createCollapsibleSection(containerEl, 'Rainbow Folders', 'rainbowFolders');
        this.addRainbowFoldersSettings(rainbowSection);
        
        // Create Hidden Files section
        const hiddenFilesSection = this.createCollapsibleSection(containerEl, 'Hidden Files and Folders', 'hiddenFiles');
        this.addHiddenFilesSettings(hiddenFilesSection);
        
        // Create Dividers section
        const dividersSection = this.createCollapsibleSection(containerEl, 'File Explorer Dividers', 'dividers');
        this.addDividersSettings(dividersSection);
    }
        
    // Add Rainbow Folders settings to the container
    addRainbowFoldersSettings(container) {
        // Rainbow Folders Section - we're already in a collapsible section
        
        new Setting(container)
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
                
        // Cascade colors toggle
        new Setting(container)
            .setName('Cascade Colors')
            .setDesc('If enabled, each subfolder will inherit the color of its parent folder')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.cascadeColors)
                .onChange(async (value) => {
                    this.plugin.settings.cascadeColors = value;
                    await this.plugin.saveSettings();
                    
                    if (this.plugin.settings.enableRainbowFolders) {
                        this.plugin.applyRainbowColors();
                    }
                }));
                
        // Apply colors to files toggle
        new Setting(container)
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
        new Setting(container)
            .setName('Rainbow Color Scheme')
            .setDesc('Choose a color scheme for rainbow folders')
            .addDropdown(dropdown => {
                // Add all available color schemes dynamically
                const schemes = this.plugin.getColorSchemes();
                for (const [key, label] of Object.entries(schemes)) {
                    dropdown.addOption(key, label);
                }
                
                dropdown.setValue(this.plugin.settings.rainbowColorScheme || 'default');
                dropdown.onChange(async (value) => {
                    this.plugin.settings.rainbowColorScheme = value;
                    await this.plugin.saveSettings();
                    
                    // Show/hide custom color settings based on selection
                    if (this.customColorsContainer) {
                        this.customColorsContainer.style.display = value === 'custom' ? 'block' : 'none';
                    }
                    
                    if (this.plugin.settings.enableRainbowFolders) {
                        this.plugin.applyRainbowColors();
                    }
                });
            });
            
        // Custom colors container (only shown when custom color scheme is selected)
        this.customColorsContainer = container.createDiv({ cls: 'custom-colors-container' });
        if (this.plugin.settings.rainbowColorScheme !== 'custom') {
            this.customColorsContainer.style.display = 'none';
        }
        
        // Light mode custom colors
        new Setting(this.customColorsContainer)
            .setName('Light Mode Colors')
            .setDesc('Define custom colors for light mode');
            
        // Create color picker for light mode
        if (typeof this.plugin.createColorPicker === 'function') {
            this.plugin.createColorPicker(this.customColorsContainer, 'light');
        }
        
        // Dark mode custom colors
        new Setting(this.customColorsContainer)
            .setName('Dark Mode Colors')
            .setDesc('Define custom colors for dark mode');
            
        // Create color picker for dark mode
        if (typeof this.plugin.createColorPicker === 'function') {
            this.plugin.createColorPicker(this.customColorsContainer, 'dark');
        }
            
        // Color opacity slider
        new Setting(container)
            .setName('Color Opacity')
            .setDesc('Adjust the opacity/transparency of colors (applies to background and border styles only)')
            .addSlider(slider => slider
                .setLimits(0.1, 1, 0.05)
                .setValue(this.plugin.settings.colorOpacity || 0.5)
                .setDynamicTooltip()
                .onChange(async (value) => {
                    this.plugin.settings.colorOpacity = value;
                    await this.plugin.saveSettings();
                    
                    if (this.plugin.settings.enableRainbowFolders) {
                        this.plugin.applyRainbowColors();
                    }
                }));
                
        // Display style selector
        new Setting(container)
            .setName('Display Style')
            .setDesc('Choose how rainbow colors are displayed')
            .addDropdown(dropdown => {
                dropdown.addOption('background', 'Background Color');
                dropdown.addOption('border', 'Border');
                dropdown.addOption('text', 'Text Color');
                dropdown.addOption('dot', 'Colored Dot');
                dropdown.addOption('left-border-bg', 'Left Border + Background');
                dropdown.addOption('right-border-bg', 'Right Border + Background');
                dropdown.addOption('bottom-border-bg', 'Bottom Border + Background');
                dropdown.addOption('left-right-border-bg', 'Left+Right Border + Background');
                dropdown.addOption('top-bottom-border-bg', 'Top+Bottom Border + Background');
                dropdown.addOption('all-border-bg', 'All Borders + Background');
                
                dropdown.setValue(this.plugin.settings.displayStyle || 'background');
                dropdown.onChange(async (value) => {
                    this.plugin.settings.displayStyle = value;
                    await this.plugin.saveSettings();
                    
                    // Show/hide text color settings based on selection
                    if (this.customTextColorsContainer) {
                        this.customTextColorsContainer.style.display = value === 'text' ? 'block' : 'none';
                    }
                    
                    if (this.plugin.settings.enableRainbowFolders) {
                        this.plugin.applyRainbowColors();
                    }
                });
            });
        
        // Custom text colors container (only shown when text display style is selected)
        this.customTextColorsContainer = container.createDiv({ cls: 'text-color-container' });
        if (this.plugin.settings.displayStyle !== 'text') {
            this.customTextColorsContainer.style.display = 'none';
        }
        
        // Text color scheme selector
        const textColorSchemeSetting = new Setting(this.customTextColorsContainer)
            .setName('Text Color Scheme')
            .setDesc('Choose a color scheme for text colors')
            .addDropdown(dropdown => {
                // Add all available text color schemes dynamically
                const schemes = this.plugin.getTextColors();
                for (const [key, label] of Object.entries(schemes)) {
                    dropdown.addOption(key, label);
                }
                
                dropdown.setValue(this.plugin.settings.textColorScheme || 'default');
                dropdown.onChange(async (value) => {
                    this.plugin.settings.textColorScheme = value;
                    await this.plugin.saveSettings();
                    
                    // Show/hide custom text color settings based on selection
                    const customTextColorsContainer = this.customTextColorsContainer.querySelector('.custom-text-colors-container');
                    if (customTextColorsContainer) {
                        customTextColorsContainer.style.display = value === 'custom' ? 'block' : 'none';
                    }
                    
                    if (this.plugin.settings.enableRainbowFolders && this.plugin.settings.displayStyle === 'text') {
                        this.plugin.applyRainbowColors();
                    }
                });
            });
            
        // Light mode custom text colors
        new Setting(this.customTextColorsContainer)
            .setName('Light Mode Text Colors')
            .setDesc('Define custom text colors for light mode');
            
        // Create color picker for light mode text colors
        if (typeof this.plugin.createColorPicker === 'function') {
            this.plugin.createColorPicker(this.customTextColorsContainer, 'light', true);
        }
        
        // Dark mode custom text colors
        new Setting(this.customTextColorsContainer)
            .setName('Dark Mode Text Colors')
            .setDesc('Define custom text colors for dark mode');
            
        // Create color picker for dark mode text colors
        if (typeof this.plugin.createColorPicker === 'function') {
            this.plugin.createColorPicker(this.customTextColorsContainer, 'dark', true);
        }

    // Cascading colors toggle
    new Setting(container)
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
                            } catch (error) {
                                console.error('Error applying rainbow colors:', error);
                            }
                        }, 100);
                    }
                }));
                
        // Apply colors to files toggle
        new Setting(container)
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
        
        // This Rainbow Color Scheme setting is removed to avoid duplication
            
        // Create container for custom colors
        this.customColorsContainer = container.createDiv('custom-colors-container');
        this.customColorsContainer.style.display = 
            this.plugin.settings.rainbowColorScheme === 'custom' ? 'block' : 'none';
        
        // Light mode custom colors
        new Setting(this.customColorsContainer)
            .setName('Light Mode Colors')
            .setDesc('Define custom colors for light mode');
        
        // Create color picker for light mode
        if (typeof this.plugin.createColorPicker === 'function') {
            this.plugin.createColorPicker(this.customColorsContainer, 'light');
        }
        
        // Dark mode custom colors
        new Setting(this.customColorsContainer)
            .setName('Dark Mode Colors')
            .setDesc('Define custom colors for dark mode');
        
        // Create color picker for dark mode
        if (typeof this.plugin.createColorPicker === 'function') {
            this.plugin.createColorPicker(this.customColorsContainer, 'dark');
        }
        
        // Display variant selector
        new Setting(container)
            .setName('Display Style')
            .setDesc('Choose how rainbow colors are displayed in the file explorer')
            .addDropdown(dropdown => {
                dropdown.addOption('text', 'Text Color');
                dropdown.addOption('background', 'Background Color');
                dropdown.addOption('left-border', 'Left Border');
                dropdown.addOption('right-border', 'Right Border');
                dropdown.addOption('bottom-border', 'Bottom Border');
                dropdown.addOption('top-border', 'Top Border');
                dropdown.addOption('left-border-bg', 'Left Border + Background');
                dropdown.addOption('right-border-bg', 'Right Border + Background');
                dropdown.addOption('bottom-border-bg', 'Bottom Border + Background');
                dropdown.addOption('top-border-bg', 'Top Border + Background');
                dropdown.addOption('left-right-border', 'Left + Right Border');
                dropdown.addOption('top-bottom-border', 'Top + Bottom Border');
                dropdown.addOption('left-right-border-bg', 'Left + Right Border + Background');
                dropdown.addOption('top-bottom-border-bg', 'Top + Bottom Border + Background');
                dropdown.addOption('full-border', 'Full Border');
                dropdown.addOption('full-border-bg', 'Full Border + Background');
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
                    
                    // Show/hide text color scheme setting based on display variant
                    const textColorSetting = container.querySelector('.text-color-scheme-setting');
                    const customTextColorsContainer = container.querySelector('.custom-text-colors-container');
                    if (textColorSetting) {
                        const showTextColors = value !== 'text';
                        textColorSetting.style.display = showTextColors ? 'flex' : 'none';
                        if (customTextColorsContainer) {
                            customTextColorsContainer.style.display = 
                                (showTextColors && this.plugin.settings.textColorScheme === 'custom') ? 'block' : 'none';
                        }
                    }
                });
            });

            
        // Only show text color scheme setting if display variant is not 'text'
        textColorSchemeSetting.settingEl.style.display = 
            this.plugin.settings.displayVariant !== 'text' ? 'flex' : 'none';
        
        // Create container for custom text colors
        this.customTextColorsContainer = container.createDiv('custom-text-colors-container');
        this.customTextColorsContainer.style.display = 
            (this.plugin.settings.displayVariant !== 'text' && 
             this.plugin.settings.textColorScheme === 'custom') ? 'block' : 'none';
        
        // Light mode custom text colors
        new Setting(this.customTextColorsContainer)
            .setName('Light Mode Text Colors')
            .setDesc('Define custom text colors for light mode');
        
        // Create color picker for light mode text colors
        if (typeof this.plugin.createColorPicker === 'function') {
            this.plugin.createColorPicker(this.customTextColorsContainer, 'light', true);
        }
        
        // Dark mode custom text colors
        new Setting(this.customTextColorsContainer)
            .setName('Dark Mode Text Colors')
            .setDesc('Define custom text colors for dark mode');
        
        // Create color picker for dark mode text colors
        if (typeof this.plugin.createColorPicker === 'function') {
            this.plugin.createColorPicker(this.customTextColorsContainer, 'dark', true);
        }
    }
    
    // Add Hidden Files settings to the container
    addHiddenFilesSettings(container) {
        // Hidden files list
        new Setting(container)
            .setName('Hidden Files')
            .setDesc('Files that will be hidden in the file explorer. Full path with file extension is required (e.g., path/to/file.md, assets/image.png, notes/data.base).');
            
        // Create a list of hidden files
        const hiddenFilesList = container.createEl('div', { cls: 'hidden-files-list' });
        
        // Add each hidden file to the list
        this.plugin.settings.hiddenFiles.forEach((file, index) => {
            const fileItem = hiddenFilesList.createEl('div', { cls: 'hidden-item' });
            fileItem.createEl('span', { text: file });
            
            // Add remove button
            const removeButton = fileItem.createEl('button', { cls: 'remove-hidden-item' });
            removeButton.innerHTML = '❌';
            removeButton.addEventListener('click', async () => {
                this.plugin.settings.hiddenFiles.splice(index, 1);
                await this.plugin.saveSettings();
                this.plugin.refreshExplorer();
                this.display(this.containerEl.children[1]);
            });
        });
        
        // Add input for new hidden file
        const newFileContainer = container.createEl('div', { cls: 'new-hidden-item-container' });
        const newFileInput = newFileContainer.createEl('input', { 
            type: 'text',
            placeholder: 'Add a file to hide...',
            value: this.newHiddenFile
        });
        
        newFileInput.addEventListener('input', (e) => {
            this.newHiddenFile = e.target.value;
        });
        
        // Add button
        const addFileButton = newFileContainer.createEl('button', { cls: 'add-hidden-item', text: 'Add' });
        addFileButton.addEventListener('click', async () => {
            if (this.newHiddenFile && !this.plugin.settings.hiddenFiles.includes(this.newHiddenFile)) {
                this.plugin.settings.hiddenFiles.push(this.newHiddenFile);
                await this.plugin.saveSettings();
                this.newHiddenFile = '';
                this.plugin.refreshExplorer();
                this.display(this.containerEl.children[1]);
            }
        });
        
        // Hidden folders list
        new Setting(container)
            .setName('Hidden Folders')
            .setDesc('Folders that will be hidden in the file explorer. Full path is required (e.g., path/to/folder, assets/images).');
            
        // Create a list of hidden folders
        const hiddenFoldersList = container.createEl('div', { cls: 'hidden-folders-list' });
        
        // Add each hidden folder to the list
        this.plugin.settings.hiddenFolders.forEach((folder, index) => {
            const folderItem = hiddenFoldersList.createEl('div', { cls: 'hidden-item' });
            folderItem.createEl('span', { text: folder });
            
            // Add remove button
            const removeButton = folderItem.createEl('button', { cls: 'remove-hidden-item' });
            removeButton.innerHTML = '❌';
            removeButton.addEventListener('click', async () => {
                this.plugin.settings.hiddenFolders.splice(index, 1);
                await this.plugin.saveSettings();
                this.plugin.refreshExplorer();
                this.display(this.containerEl.children[1]);
            });
        });
        
        // Add input for new hidden folder
        const newFolderContainer = container.createEl('div', { cls: 'new-hidden-item-container' });
        const newFolderInput = newFolderContainer.createEl('input', { 
            type: 'text',
            placeholder: 'Add a folder to hide...',
            value: this.newHiddenFolder
        });
        
        newFolderInput.addEventListener('input', (e) => {
            this.newHiddenFolder = e.target.value;
        });
        
        // Add button
        let addFolderButton = newFolderContainer.createEl('button', { cls: 'add-hidden-item', text: 'Add' });
        addFolderButton.addEventListener('click', async () => {
            if (this.newHiddenFolder && !this.plugin.settings.hiddenFolders.includes(this.newHiddenFolder)) {
                this.plugin.settings.hiddenFolders.push(this.newHiddenFolder);
                await this.plugin.saveSettings();
                this.newHiddenFolder = '';
                this.plugin.refreshExplorer();
                this.display(this.containerEl.children[1]);
            }
        });
        
        // Toggle for enabling hidden files feature
        new Setting(container)
            .setName('Enable Hidden Files')
            .setDesc('Hide specified files and folders in the file explorer')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableHiddenFiles)
                .onChange(async (value) => {
                    this.plugin.settings.enableHiddenFiles = value;
                    await this.plugin.saveSettings();
                    this.plugin.refreshExplorer();
                }));
    }
    
    // Add Dividers settings to the container
    addDividersSettings(container) {
        // File Explorer Dividers Section
        const dividersSection = this.createCollapsibleSection(container, 'File Explorer Dividers', 'dividers');
        
        // Enable dividers toggle
        new Setting(dividersSection)
            .setName('Enable Dividers')
            .setDesc('Add dividers to the file explorer')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableDividers)
                .onChange(async (value) => {
                    this.plugin.settings.enableDividers = value;
                    await this.plugin.saveSettings();
                    this.plugin.refreshExplorer();
                }));
                
        // Add more divider settings here
    
    // Enable hidden files toggle
    new Setting(hiddenSection)
        .setName('Enable Hidden Files')
        .setDesc('Hide specific files in the file explorer')
        .addToggle(toggle => toggle
            .setValue(this.plugin.settings.enableHiddenFiles)
            .onChange(async (value) => {
                this.plugin.settings.enableHiddenFiles = value;
                await this.plugin.saveSettings();
                
                if (value) {
                    this.plugin.applyHiddenFiles();
                } else {
                    this.plugin.removeHiddenFilesStyles();
                }
            }));
                
        // Display variant dropdown
        new Setting(hiddenSection)
            .setName('Display Style')
            .setDesc('Choose how to display hidden files')
            .addDropdown(dropdown => {
                dropdown.addOption('bottom-border', 'Bottom Border');
                dropdown.addOption('left-right-border', 'Left+Right Borders');
                dropdown.addOption('top-bottom-border', 'Top+Bottom Borders');
                dropdown.addOption('all-border', 'All Borders');
                dropdown.addOption('background-left-border', 'BG + Left Border');
                dropdown.addOption('background-top-border', 'BG + Top Border');
                dropdown.addOption('background-right-border', 'BG + Right Border');
                dropdown.addOption('background-bottom-border', 'BG + Bottom Border');
                dropdown.addOption('background-left-right-border', 'BG + Left+Right Borders');
                dropdown.addOption('background-top-bottom-border', 'BG + Top+Bottom Borders');
                dropdown.addOption('background-all-border', 'BG + All Borders');
                dropdown.addOption('dot', 'Bullet Point');
                
                dropdown.setValue(this.plugin.settings.displayVariant || 'text');
                dropdown.onChange(async (value) => {
                    this.plugin.settings.displayVariant = value;
                    await this.plugin.saveSettings();
                    
                    if (this.plugin.settings.enableRainbowFolders) {
                        this.plugin.applyRainbowColors();
                    }
                    
                    // Show/hide text color scheme setting based on display variant
                    const textColorSetting = rainbowSection.querySelector('.text-color-scheme-setting');
                    const customTextColorsContainer = rainbowSection.querySelector('.custom-text-colors-container');
                    if (textColorSetting) {
                        const showTextColors = value !== 'text';
                        textColorSetting.style.display = showTextColors ? 'flex' : 'none';
                        if (customTextColorsContainer) {
                            customTextColorsContainer.style.display = 
                                (showTextColors && this.plugin.settings.textColorScheme === 'custom') ? 'block' : 'none';
                        }
                    }
                });
            });
        
        // Text color scheme selector (only visible when display variant is not 'text')
        const textColorSchemeSetting = new Setting(rainbowSection)
            .setName('Text Color Scheme')
            .setDesc('Choose a color scheme for text when using background or border display styles')
            .setClass('text-color-scheme-setting')
            .addDropdown(dropdown => {
                // Add all available text color schemes dynamically
                const textSchemes = this.plugin.getTextColors();
                for (const [key, label] of Object.entries(textSchemes)) {
                    dropdown.addOption(key, label);
                }
                
                dropdown.setValue(this.plugin.settings.textColorScheme || 'default');
                dropdown.onChange(async (value) => {
                    this.plugin.settings.textColorScheme = value;
                    await this.plugin.saveSettings();
                    
                    // Show/hide custom text color settings based on selection
                    const customTextSection = rainbowSection.querySelector('.custom-text-colors-container');
                    if (customTextSection) {
                        customTextSection.style.display = value === 'custom' ? 'block' : 'none';
                    }
                    
                    if (this.plugin.settings.enableRainbowFolders) {
                        this.plugin.applyRainbowColors();
                    }
                });
            });
        
        // Hide text color scheme if display variant is 'text'
        if (this.plugin.settings.displayVariant === 'text') {
            textColorSchemeSetting.settingEl.style.display = 'none';
        }
    }
    
    // Add Hidden Files and Folders settings to the container
    addHiddenFilesSettings(container) {
        // Hidden Files and Folders Section
        const hiddenSection = this.createCollapsibleSection(container, 'Hidden Files and Folders', 'hiddenFiles');
        
        new Setting(hiddenSection)
            .setName('Enable Hidden Files')
            .setDesc('Hide specific files and folders in the file explorer')
            .addToggle(toggle => toggle
                .setValue(this.plugin.settings.enableHiddenFiles)
                .onChange(async (value) => {
                    this.plugin.settings.enableHiddenFiles = value;
                    await this.plugin.saveSettings();
                    
                    if (value) {
                        this.plugin.applyHiddenFiles();
                    } else {
                        this.plugin.removeHiddenFilesStyles();
                    }
                }));
    
    // Hidden files list
    new Setting(hiddenSection)
        .setName('Hidden Files')
        .setDesc('Files that will be hidden in the file explorer. Full path with file extension is required (e.g., path/to/file.md, assets/image.png, notes/data.base).');
    
    const hiddenFilesContainer = hiddenSection.createDiv('hidden-files-container');
    
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
                        
                        // Refresh the view
                        this.onOpen();
                    }));
        });
    }
    
    // Add hidden file input
    new Setting(hiddenSection)
        .setName('Add Hidden File')
        .setDesc('Add a file to hide in the file explorer (include file extension)')
        .addText(text => text
            .setPlaceholder('path/to/file.extension')
            .setValue('')
            .onChange(() => {}))
        .addButton(button => {
            button.setButtonText('Add');
            button.onClick(async () => {
                const inputEl = button.buttonEl.parentElement.querySelector('input');
                const filePath = inputEl.value.trim();
                
                if (filePath) {
                    if (!this.plugin.settings.hiddenFiles) {
                        this.plugin.settings.hiddenFiles = [];
                    }
                    
                    this.plugin.settings.hiddenFiles.push(filePath);
                    await this.plugin.saveSettings();
                    this.plugin.updateFileExplorer();
                    
                    // Clear the input
                    inputEl.value = '';
                    
                    // Refresh the view
                    this.onOpen();
                }
            });
        });
    
    // Hidden folders list
    new Setting(hiddenSection)
        .setName('Hidden Folders')
        .setDesc('Folders that will be hidden in the file explorer');
    
    const hiddenFoldersContainer = hiddenSection.createDiv('hidden-folders-container');
    
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
                        
                        // Refresh the view
                        this.onOpen();
                    }));
        });
    }
    
    // Add hidden folder input
    new Setting(hiddenSection)
        .setName('Add Hidden Folder')
        .setDesc('Add a folder to hide in the file explorer')
        .addText(text => text
            .setPlaceholder('path/to/folder')
            .setValue('')
            .onChange(() => {}))
        .addButton(button => {
            button.setButtonText('Add');
            button.onClick(async () => {
                const inputEl = button.buttonEl.parentElement.querySelector('input');
                const folderPath = inputEl.value.trim();
                
                if (folderPath) {
                    if (!this.plugin.settings.hiddenFolders) {
                        this.plugin.settings.hiddenFolders = [];
                    }
                    
                    this.plugin.settings.hiddenFolders.push(folderPath);
                    await this.plugin.saveSettings();
                    this.plugin.updateFileExplorer();
                    
                    // Clear the input
                    inputEl.value = '';
                    
                    // Refresh the view
                    this.onOpen();
                }
            });
        });
    }
    
    addDividersSettings(container) {
        // File Explorer Dividers Section
        const dividersSection = this.createCollapsibleSection(container, 'File Explorer Dividers', 'dividers');
        
        // Enable dividers toggle
        new Setting(dividersSection)
        .setName('Enable Dividers')
        .setDesc('Add dividers with labels above specific files and folders in the file explorer')
        .addToggle(toggle => toggle
            .setValue(this.plugin.settings.enableDividers)
            .onChange(async (value) => {
                this.plugin.settings.enableDividers = value;
                await this.plugin.saveSettings();
                
                if (value) {
                    this.plugin.applyDividers();
                } else {
                    this.plugin.removeDividerStyles();
                }
            }));
    
    // Divider display variant selector
    new Setting(dividersSection)
        .setName('Divider Display Style')
        .setDesc('Choose how dividers are displayed in the file explorer')
        .addDropdown(dropdown => {
            dropdown.addOption('line-with-text', 'Line with Text');
            dropdown.addOption('text-only', 'Text Only');
            dropdown.addOption('background-color', 'Background Color');
            
            dropdown.setValue(this.plugin.settings.dividerStyle?.displayVariant || 'line-with-text');
            dropdown.onChange(async (value) => {
                if (!this.plugin.settings.dividerStyle) {
                    this.plugin.settings.dividerStyle = {};
                }
                this.plugin.settings.dividerStyle.displayVariant = value;
                await this.plugin.saveSettings();
                
                // Show/hide line color setting based on display variant
                const lineColorSetting = dividersSection.querySelector('.divider-line-color-setting');
                if (lineColorSetting) {
                    lineColorSetting.style.display = value === 'background-color' ? 'none' : 'flex';
                }
                
                if (this.plugin.settings.enableDividers) {
                    this.plugin.applyDividers();
                }
            });
        });
    
    // Divider text alignment
    new Setting(dividersSection)
        .setName('Text Alignment')
        .setDesc('Choose the alignment of divider text')
        .addDropdown(dropdown => {
            dropdown.addOption('left', 'Left');
            dropdown.addOption('center', 'Center');
            dropdown.addOption('right', 'Right');
            
            dropdown.setValue(this.plugin.settings.dividerStyle?.textAlign || 'left');
            dropdown.onChange(async (value) => {
                if (!this.plugin.settings.dividerStyle) {
                    this.plugin.settings.dividerStyle = {};
                }
                this.plugin.settings.dividerStyle.textAlign = value;
                await this.plugin.saveSettings();
                
                if (this.plugin.settings.enableDividers) {
                    this.plugin.applyDividers();
                }
            });
        });
    
    // Text size setting
    new Setting(dividersSection)
        .setName('Text Size')
        .setDesc('Adjust the text size of divider labels')
        .addSlider(slider => slider
            .setLimits(10, 20, 1)
            .setValue(parseFloat(this.plugin.settings.dividerStyle?.textSize) || 14)
            .setDynamicTooltip()
            .onChange(async (value) => {
                if (!this.plugin.settings.dividerStyle) {
                    this.plugin.settings.dividerStyle = {};
                }
                this.plugin.settings.dividerStyle.textSize = value;
                await this.plugin.saveSettings();
                
                if (this.plugin.settings.enableDividers) {
                    this.plugin.applyDividers();
                }
            }));
    
    // Text color scheme selector
    new Setting(dividersSection)
        .setName('Text Color')
        .setDesc('Choose a color scheme for divider text')
        .addDropdown(dropdown => {
            // Add all available text color schemes dynamically
            const textSchemes = this.plugin.getTextColors();
            for (const [key, label] of Object.entries(textSchemes)) {
                dropdown.addOption(key, label);
            }
            
            dropdown.setValue(this.plugin.settings.dividerStyle?.textColorScheme || 'default');
            dropdown.onChange(async (value) => {
                if (!this.plugin.settings.dividerStyle) {
                    this.plugin.settings.dividerStyle = {};
                }
                this.plugin.settings.dividerStyle.textColorScheme = value;
                await this.plugin.saveSettings();
                
                // Show/hide custom text color settings based on selection
                const customTextSection = dividersSection.querySelector('.custom-divider-text-colors-container');
                if (customTextSection) {
                    customTextSection.style.display = value === 'custom' ? 'block' : 'none';
                }
                
                if (this.plugin.settings.enableDividers) {
                    this.plugin.applyDividers();
                }
            });
        });
    
    // Line color scheme selector (hidden when background-color variant is selected)
    const lineColorSetting = new Setting(dividersSection)
        .setName('Divider Line Color')
        .setDesc('Choose a color scheme for divider lines')
        .setClass('divider-line-color-setting')
        .addDropdown(dropdown => {
            // Add all available color schemes dynamically
            const colorSchemes = this.plugin.getDividerColors();
            for (const [key, label] of Object.entries(colorSchemes)) {
                dropdown.addOption(key, label);
            }
            
            dropdown.setValue(this.plugin.settings.dividerStyle?.lineColorScheme || 'default');
            dropdown.onChange(async (value) => {
                if (!this.plugin.settings.dividerStyle) {
                    this.plugin.settings.dividerStyle = {};
                }
                this.plugin.settings.dividerStyle.lineColorScheme = value;
                await this.plugin.saveSettings();
                
                // Show/hide custom line color settings based on selection
                const customLineSection = dividersSection.querySelector('.custom-divider-line-colors-container');
                if (customLineSection) {
                    customLineSection.style.display = value === 'custom' ? 'block' : 'none';
                }
                
                if (this.plugin.settings.enableDividers) {
                    this.plugin.applyDividers();
                }
            });
        });
    
    // Hide line color setting if background-color variant is selected
    if (this.plugin.settings.dividerStyle?.displayVariant === 'background-color') {
        lineColorSetting.settingEl.style.display = 'none';
    };
    
    // Dividers list
    new Setting(dividersSection)
        .setName('Dividers')
        .setDesc('Dividers that will be shown in the file explorer');
    
    const dividersContainer = dividersSection.createDiv('dividers-container');
    
    if (this.plugin.settings.dividers && this.plugin.settings.dividers.length > 0) {
        this.plugin.settings.dividers.forEach((divider, index) => {
            const dividerSetting = new Setting(dividersContainer)
                .setName(divider.path)
                .addText(text => text
                    .setPlaceholder('Divider label')
                    .setValue(divider.label || '')
                    .onChange(async (value) => {
                        this.plugin.settings.dividers[index].label = value;
                        await this.plugin.saveSettings();
                        
                        if (this.plugin.settings.enableDividers) {
                            this.plugin.applyDividers();
                        }
                    }))
                .addButton(button => button
                    .setButtonText('Remove')
                    .onClick(async () => {
                        this.plugin.settings.dividers.splice(index, 1);
                        await this.plugin.saveSettings();
                        
                        if (this.plugin.settings.enableDividers) {
                            this.plugin.applyDividers();
                        }
                        
                        // Refresh the view
                        this.onOpen();
                    }));
        });
    }
    
    // Add divider input
    new Setting(dividersSection)
        .setName('Add Divider')
        .setDesc('Add a divider above a specific file or folder in the file explorer')
        .addText(text => text
            .setPlaceholder('path/to/file-or-folder')
            .setValue('')
            .onChange(() => {}))
        .addText(text => text
            .setPlaceholder('Divider label')
            .setValue('')
            .onChange(() => {}))
        .addButton(button => {
            button.setButtonText('Add');
            button.onClick(async () => {
                const inputs = button.buttonEl.parentElement.querySelectorAll('input');
                const path = inputs[0].value.trim();
                const label = inputs[1].value.trim();
                
                if (path && label) {
                    if (!this.plugin.settings.dividers) {
                        this.plugin.settings.dividers = [];
                    }
                    
                    this.plugin.settings.dividers.push({ path, label });
                    await this.plugin.saveSettings();
                    
                    if (this.plugin.settings.enableDividers) {
                        this.plugin.applyDividers();
                    }
                    
                    // Clear the inputs
                    inputs[0].value = '';
                    inputs[1].value = '';
                    
                    // Refresh the view
                    this.onOpen();
                }
            });
        });
    }
}

module.exports = class ExplorerEnhancer extends Plugin {
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
                        light: [...COLOR_SCHEMES.default.colors],
                        dark: [...COLOR_SCHEMES.default.colors]
                    };
                }
                if (!this.settings.customColors.light) {
                    this.settings.customColors.light = [...COLOR_SCHEMES.default.colors];
                }
                if (!this.settings.customColors.dark) {
                    this.settings.customColors.dark = [...COLOR_SCHEMES.default.colors];
                }
                
                // Ensure custom text colors exist
                if (!this.settings.customTextColors) {
                    this.settings.customTextColors = {
                        light: [...TEXT_COLORS.default.colors],
                        dark: [...TEXT_COLORS.default.colors]
                    };
                }
                if (!this.settings.customTextColors.light) {
                    this.settings.customTextColors.light = [...TEXT_COLORS.default.colors];
                }
                if (!this.settings.customTextColors.dark) {
                    this.settings.customTextColors.dark = [...TEXT_COLORS.default.colors];
                }
                
                // Ensure text color scheme exists
                if (!this.settings.textColorScheme) {
                    this.settings.textColorScheme = 'default';
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
        
        // Register settings tab
        this.addSettingTab(new ExplorerEnhancerSettingsTab(this.app, this));
        
        // Register for layout-ready event
        this.app.workspace.onLayoutReady(() => this.initialize());
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
            this.applyDividers();
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
        this.removeDividerStyles();
        
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
    
    // Helper method to activate the settings view
    async activateView() {
        const { workspace } = this.app;
        
        // Check if view is already open
        let leaf = workspace.getLeavesOfType("explorer-enhancer-settings-view")[0];
        
        if (!leaf) {
            // Create new leaf for settings view
            leaf = workspace.getRightLeaf(false);
            await leaf.setViewState({
                type: "explorer-enhancer-settings-view",
                active: true
            });
        }
        
        // Reveal the leaf
        workspace.revealLeaf(leaf);
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
    
    // Helper function to get color schemes
    getColorSchemes() {
        // Return all color schemes and always include custom
        const schemes = {};
        for (const key in COLOR_SCHEMES) {
            const scheme = COLOR_SCHEMES[key];
            // Include all schemes regardless of mode for the dropdown
            schemes[key] = scheme.label || key;
        }
        schemes['custom'] = 'Custom';
        return schemes;
    }

    // Helper function to get text colors
    getTextColors() {
        // Return all text colors and always include custom
        const colors = {};
        for (const key in TEXT_COLORS) {
            const scheme = TEXT_COLORS[key];
            // Only include schemes that match the current mode or are mode: 'both'
            const isDarkMode = document.body.classList.contains('theme-dark');
            const currentMode = isDarkMode ? 'dark' : 'light';
            if (!scheme.mode || scheme.mode === 'both' || scheme.mode === currentMode) {
                colors[key] = scheme.label || key;
            }
        }
        colors['custom'] = 'Custom';
        return colors;
    }

    // Helper function to get divider colors
    getDividerColors() {
        // Return all divider colors and always include custom
        const colors = {};
        for (const key in DIVIDER_COLORS) {
            const scheme = DIVIDER_COLORS[key];
            // Only include schemes that match the current mode or are mode: 'both'
            const isDarkMode = document.body.classList.contains('theme-dark');
            const currentMode = isDarkMode ? 'dark' : 'light';
            if (!scheme.mode || scheme.mode === 'both' || scheme.mode === currentMode) {
                colors[key] = scheme.label || key;
            }
        }
        colors['custom'] = 'Custom';
        return colors;
    }
    
    // Helper function to get divider line colors
    getDividerLineColors() {
        // Return all color schemes for divider lines/backgrounds and always include custom
        const colors = {
            'default': 'Default',
            'currentColor': 'Current Color',
            'transparent': 'Transparent',
            'red': 'Red',
            'orange': 'Orange',
            'yellow': 'Yellow',
            'green': 'Green',
            'blue': 'Blue',
            'purple': 'Purple',
            'pink': 'Pink',
            'brown': 'Brown',
            'gray': 'Gray',
            'black': 'Black',
            'white': 'White',
            'teal': 'Teal',
            'navy': 'Navy',
            'maroon': 'Maroon',
            'olive': 'Olive',
            'lime': 'Lime',
            'aqua': 'Aqua',
            'fuchsia': 'Fuchsia',
            'silver': 'Silver',
            'gold': 'Gold',
            'indigo': 'Indigo',
            'violet': 'Violet',
            // Additional 50 colors
            'aliceblue': 'Alice Blue',
            'antiquewhite': 'Antique White',
            'aquamarine': 'Aquamarine',
            'azure': 'Azure',
            'beige': 'Beige',
            'bisque': 'Bisque',
            'blanchedalmond': 'Blanched Almond',
            'blueviolet': 'Blue Violet',
            'burlywood': 'Burlywood',
            'cadetblue': 'Cadet Blue',
            'chartreuse': 'Chartreuse',
            'chocolate': 'Chocolate',
            'coral': 'Coral',
            'cornflowerblue': 'Cornflower Blue',
            'cornsilk': 'Cornsilk',
            'crimson': 'Crimson',
            'darkblue': 'Dark Blue',
            'darkcyan': 'Dark Cyan',
            'darkgoldenrod': 'Dark Goldenrod',
            'darkgray': 'Dark Gray',
            'darkgreen': 'Dark Green',
            'darkkhaki': 'Dark Khaki',
            'darkmagenta': 'Dark Magenta',
            'darkolivegreen': 'Dark Olive Green',
            'darkorange': 'Dark Orange',
            'darkorchid': 'Dark Orchid',
            'darkred': 'Dark Red',
            'darksalmon': 'Dark Salmon',
            'darkseagreen': 'Dark Sea Green',
            'darkslateblue': 'Dark Slate Blue',
            'darkslategray': 'Dark Slate Gray',
            'darkturquoise': 'Dark Turquoise',
            'darkviolet': 'Dark Violet',
            'deeppink': 'Deep Pink',
            'deepskyblue': 'Deep Sky Blue',
            'dimgray': 'Dim Gray',
            'dodgerblue': 'Dodger Blue',
            'firebrick': 'Firebrick',
            'floralwhite': 'Floral White',
            'forestgreen': 'Forest Green',
            'gainsboro': 'Gainsboro',
            'ghostwhite': 'Ghost White',
            'goldenrod': 'Goldenrod',
            'greenyellow': 'Green Yellow',
            'honeydew': 'Honeydew',
            'hotpink': 'Hot Pink',
            'indianred': 'Indian Red',
            'ivory': 'Ivory',
            'khaki': 'Khaki',
            'lavender': 'Lavender',
            'lavenderblush': 'Lavender Blush',
            'custom': 'Custom'
        };
        return colors;
    }
    
    // Helper function to get divider text colors
    getDividerTextColors() {
        // Return all color schemes for divider text and always include custom
        const colors = {
            'default': 'Default (Theme)',
            'red': 'Red',
            'orange': 'Orange',
            'yellow': 'Yellow',
            'lime': 'Lime',
            'green': 'Green',
            'teal': 'Teal',
            'cyan': 'Cyan',
            'blue': 'Blue',
            'indigo': 'Indigo',
            'violet': 'Violet',
            'purple': 'Purple',
            'magenta': 'Magenta',
            'pink': 'Pink',
            'brown': 'Brown',
            'gray': 'Gray',
            'silver': 'Silver',
            'gold': 'Gold',
            'coral': 'Coral',
            'turquoise': 'Turquoise',
            'lavender': 'Lavender',
            'salmon': 'Salmon',
            'mint': 'Mint',
            'navy': 'Navy',
            'maroon': 'Maroon',
            // Additional 50 colors
            'aliceblue': 'Alice Blue',
            'antiquewhite': 'Antique White',
            'aquamarine': 'Aquamarine',
            'azure': 'Azure',
            'beige': 'Beige',
            'bisque': 'Bisque',
            'blanchedalmond': 'Blanched Almond',
            'blueviolet': 'Blue Violet',
            'burlywood': 'Burlywood',
            'cadetblue': 'Cadet Blue',
            'chartreuse': 'Chartreuse',
            'chocolate': 'Chocolate',
            'cornflowerblue': 'Cornflower Blue',
            'cornsilk': 'Cornsilk',
            'crimson': 'Crimson',
            'darkblue': 'Dark Blue',
            'darkcyan': 'Dark Cyan',
            'darkgoldenrod': 'Dark Goldenrod',
            'darkgray': 'Dark Gray',
            'darkgreen': 'Dark Green',
            'darkkhaki': 'Dark Khaki',
            'darkmagenta': 'Dark Magenta',
            'darkolivegreen': 'Dark Olive Green',
            'darkorange': 'Dark Orange',
            'darkorchid': 'Dark Orchid',
            'darkred': 'Dark Red',
            'darksalmon': 'Dark Salmon',
            'darkseagreen': 'Dark Sea Green',
            'darkslateblue': 'Dark Slate Blue',
            'darkslategray': 'Dark Slate Gray',
            'darkturquoise': 'Dark Turquoise',
            'darkviolet': 'Dark Violet',
            'deeppink': 'Deep Pink',
            'deepskyblue': 'Deep Sky Blue',
            'dimgray': 'Dim Gray',
            'dodgerblue': 'Dodger Blue',
            'firebrick': 'Firebrick',
            'floralwhite': 'Floral White',
            'forestgreen': 'Forest Green',
            'gainsboro': 'Gainsboro',
            'ghostwhite': 'Ghost White',
            'goldenrod': 'Goldenrod',
            'greenyellow': 'Green Yellow',
            'honeydew': 'Honeydew',
            'hotpink': 'Hot Pink',
            'indianred': 'Indian Red',
            'ivory': 'Ivory',
            'khaki': 'Khaki',
            'lawngreen': 'Lawn Green',
            'lemonchiffon': 'Lemon Chiffon',
            'lightblue': 'Light Blue',
            'custom': 'Custom'
        };
        return colors;
    }
    
    // Helper function to get divider line/background colors
    getDividerLineColors() {
        // Create 25 preset colors for divider lines
        const colors = {
            'default': 'Default (Theme)',
            'red': 'Red',
            'orange': 'Orange',
            'yellow': 'Yellow',
            'lime': 'Lime',
            'green': 'Green',
            'teal': 'Teal',
            'cyan': 'Cyan',
            'blue': 'Blue',
            'indigo': 'Indigo',
            'violet': 'Violet',
            'purple': 'Purple',
            'magenta': 'Magenta',
            'pink': 'Pink',
            'brown': 'Brown',
            'gray': 'Gray',
            'silver': 'Silver',
            'gold': 'Gold',
            'coral': 'Coral',
            'turquoise': 'Turquoise',
            'lavender': 'Lavender',
            'salmon': 'Salmon',
            'mint': 'Mint',
            'navy': 'Navy',
            'maroon': 'Maroon',
            'custom': 'Custom'
        };
        return colors;
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
            // Get all colors from the selected color scheme
            colors = [...COLOR_SCHEMES[this.settings.rainbowColorScheme].colors];
            
            // Log the number of colors for debugging
            console.log('Using ' + colors.length + ' colors from scheme: ' + this.settings.rainbowColorScheme);
        } else {
            colors = [...COLOR_SCHEMES.default.colors];
        }
        
        // Get text color scheme if not using text display variant
        let textColors = [];
        let useTextColors = this.settings.displayStyle !== 'text' && this.settings.textColorScheme !== 'default';
        if (useTextColors) {
            if (this.settings.textColorScheme === 'custom') {
                const isDarkMode = document.body.classList.contains('theme-dark');
                textColors = isDarkMode ? this.settings.customTextColors.dark : this.settings.customTextColors.light;
            } else if (TEXT_COLORS[this.settings.textColorScheme]) {
                // Get all colors from the selected text color scheme
                textColors = [...TEXT_COLORS[this.settings.textColorScheme].colors];
                
                // Log the number of text colors for debugging
                console.log('Using ' + textColors.length + ' text colors from scheme: ' + this.settings.textColorScheme);
            } else {
                // Fallback to empty array if no valid scheme is found
                textColors = [];
                useTextColors = false;
            }
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
            
            // Ensure we're using all available colors by using modulo
            const colorIndex = index % colors.length;
            const color = colors[colorIndex];
            
            // Store top-level folder colors for inheritance
            if (item.type === 'folder') {
                folderColors.set(item.path, color);
                // Get text color if display variant is not 'text'
                const textColorIndex = index % textColors.length;
                const textColor = this.settings.displayStyle !== 'text' && textColors.length > 0 ? textColors[textColorIndex] : null;
                css += this.generateVariantCSS('.nav-folder-title', item.path, color, opacity, textColor);
            } else if (this.settings.applyColorsToFiles) {
                const textColorIndex = index % textColors.length;
                const textColor = this.settings.displayStyle !== 'text' && textColors.length > 0 ? textColors[textColorIndex] : null;
                css += this.generateVariantCSS('.nav-file-title', item.path, color, opacity, textColor);
            }
        });
        
        // Handle non-top-level items based on cascading setting
        if (!this.settings.enableCascadingColors) {
            // WITH CASCADING OFF: Each non-top-level item gets a sequential rainbow color
            const nonTopLevelItems = allItems.filter(item => item.path.indexOf('/') !== -1);
            
            // Calculate starting index to continue the color sequence from top-level items
            const startingIndex = topLevelItems.length;
            
            nonTopLevelItems.forEach((item, index) => {
                if (item.type === 'file' && !this.settings.applyColorsToFiles) {
                    return; // Skip files if not applying colors to them
                }
                
                // Continue the color sequence from where top-level items left off
                const colorIndex = (startingIndex + index) % colors.length;
                const color = colors[colorIndex];
                
                // Get text color if display variant is not 'text'
                const textColorIndex = (startingIndex + index) % textColors.length;
                const textColor = this.settings.displayStyle !== 'text' && textColors.length > 0 ? textColors[textColorIndex] : null;
                
                if (item.type === 'folder') {
                    css += this.generateVariantCSS('.nav-folder-title', item.path, color, opacity, textColor);
                } else {
                    css += this.generateVariantCSS('.nav-file-title', item.path, color, opacity, textColor);
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
                
                // Get text color if display variant is not 'text'
                // Use the same index as the parent folder to maintain consistency
                const parentIndex = Array.from(topLevelItems).findIndex(i => i.path === topParent);
                const textColorIndex = parentIndex !== -1 ? parentIndex % textColors.length : 0;
                const textColor = this.settings.displayStyle !== 'text' ? textColors[textColorIndex] : null;
                
                if (item.type === 'folder') {
                    css += this.generateVariantCSS('.nav-folder-title', item.path, parentColor, opacity, textColor);
                } else {
                    css += this.generateVariantCSS('.nav-file-title', item.path, parentColor, opacity, textColor);
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
    
    // Remove divider styles
    removeDividerStyles() {
        const styleEl = document.getElementById('explorer-enhancer-divider-styles');
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
                // Only use exact match with file extension
                const elements = document.querySelectorAll(`.nav-file-title[data-path="${this.escapeCssSelector(file)}"]`);
                
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
                // Exact folder match
                const folderElements = document.querySelectorAll(`.nav-folder-title[data-path="${this.escapeCssSelector(folder)}"]`);
                
                // Hide all matching folder elements
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
                
                // Also hide all children of this folder
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
    
    // Apply dividers to the file explorer
    applyDividers() {
        // Remove existing divider styles
        this.removeDividerStyles();
        
        // If dividers are not enabled or no dividers defined, exit
        if (!this.settings.enableDividers || !this.settings.dividers || this.settings.dividers.length === 0) {
            return;
        }
        
        // Create style element
        const styleEl = document.createElement('style');
        styleEl.id = 'explorer-enhancer-divider-styles';
        
        // Start building CSS
        let css = `
            /* Explorer Enhancer Dividers */
            
            /* Fix for file icons positioning */
            .nav-file-title-content:before,
            .nav-folder-title-content:before {
                position: static !important;
                z-index: 3 !important;
            }
        `;
        
        // Build selector for all dividers
        let fileSelectors = [];
        let folderSelectors = [];
        
        this.settings.dividers.forEach(divider => {
            const escapedPath = this.escapeCssSelector(divider.path);
            if (divider.type === 'file') {
                fileSelectors.push(`[data-path="${escapedPath}"]`);
            } else {
                folderSelectors.push(`[data-path="${escapedPath}"]`);
            }
        });
        
        // Create combined selectors
        let combinedFileSelector = fileSelectors.length > 0 ? 
            `.nav-file:has(> :is(${fileSelectors.join(',')}))` : '';
            
        let combinedFolderSelector = folderSelectors.length > 0 ? 
            `.nav-folder:has(> :is(${folderSelectors.join(',')}))` : '';
        
        // Combine file and folder selectors
        let combinedSelectors = [];
        if (combinedFileSelector) combinedSelectors.push(combinedFileSelector);
        if (combinedFolderSelector) combinedSelectors.push(combinedFolderSelector);
        
        if (combinedSelectors.length === 0) return; // No valid selectors
        
        // Get the theme mode for color selection
        const isDarkMode = document.body.classList.contains('theme-dark');
        const colorMode = isDarkMode ? 'dark' : 'light';
        
        // Get display variant, text alignment, padding, and text size
        const displayVariant = this.settings.dividerStyle.displayVariant || 'border';
        const textAlign = this.settings.dividerStyle.textAlign || 'left';
        const paddingX = parseFloat(this.settings.dividerStyle.paddingX) || 10;
        const textSize = parseFloat(this.settings.dividerStyle.textSize) || 14;
        
        // Determine text color based on settings
        let textColor = 'var(--text-normal)'; // Default text color
        if (this.settings.dividerStyle.textColorScheme === 'custom') {
            textColor = this.settings.dividerStyle.customTextColors?.[colorMode] || textColor;
        } else if (this.settings.dividerStyle.textColorScheme !== 'default') {
            // Handle direct color names for backward compatibility
            const colorName = this.settings.dividerStyle.textColorScheme;
            
            // Get divider style settings
            const displayVariant = this.settings.dividerStyle?.displayVariant || 'line-with-text';
            const textAlign = this.settings.dividerStyle?.textAlign || 'left';
            const textSize = this.settings.dividerStyle?.textSize || 14;
            
            // Get color settings
            const textColorScheme = this.settings.dividerStyle?.textColorScheme || 'default';
            const lineColorScheme = this.settings.dividerStyle?.lineColorScheme || 'default';
            
            // Get text color based on scheme
            let textColor = '#000000';
            if (textColorScheme === 'default') {
                textColor = document.body.classList.contains('theme-dark') ? '#ffffff' : '#000000';
            } else if (textColorScheme === 'custom') {
                // Use custom text colors if available
                const mode = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
                const customTextColors = this.settings.customDividerTextColors?.[mode] || [];
                if (customTextColors.length > 0) {
                    // Use first color in the list
                    textColor = customTextColors[0];
                }
            } else {
                // Use color from scheme
                const colorScheme = TEXT_COLORS[textColorScheme] || TEXT_COLORS.default;
                const mode = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
                const colors = colorScheme.colors || [];
                if (colors.length > 0) {
                    textColor = colors[0];
                }
            }
            
            // Get line color based on scheme
            let lineColor = '#cccccc';
            if (lineColorScheme === 'default') {
                lineColor = document.body.classList.contains('theme-dark') ? '#555555' : '#cccccc';
            } else if (lineColorScheme === 'custom') {
                // Use custom line colors if available
                const mode = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
                const customLineColors = this.settings.customDividerLineColors?.[mode] || [];
                if (customLineColors.length > 0) {
                    // Use first color in the list
                    lineColor = customLineColors[0];
                }
            } else {
                // Use color from scheme
                const colorScheme = COLOR_SCHEMES[lineColorScheme] || COLOR_SCHEMES.default;
                const mode = document.body.classList.contains('theme-dark') ? 'dark' : 'light';
                const colors = colorScheme.colors || [];
                if (colors.length > 0) {
                    lineColor = colors[0];
                }
            }
            
            // Generate CSS based on display variant
            let css = '';
            
            // Add ::before pseudo-element for the divider
            css += `${selector}::before {
                content: "${label}";
                display: block;
                font-size: ${textSize}px;
                color: ${textColor};
                padding: 5px 0;
                font-weight: bold;
                position: relative;
                padding-left: 10px;
                padding-right: 10px;
            `;
            
            // Add text alignment with specific margin-inline-start values
            if (textAlign === 'center') {
                css += `
                    text-align: center;
                    margin-inline-start: calc(24px - -70px);
                `;
            } else if (textAlign === 'right') {
                css += `
                    text-align: right;
                    margin-inline-start: calc(24px - -175px);
                `;
            } else {
                css += `
                    text-align: left;
                `;
            }
            
            // Add variant-specific styles
            if (displayVariant === 'line-with-text') {
                // Create border lines that appear both before AND after the text
                css += `
                    border-bottom: none;
                    margin-bottom: 5px;
                `;
                
                // Add border lines before and after text with proper background break
                css += `
                    &::after {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 0;
                        right: 0;
                        height: 1px;
                        background-color: ${lineColor};
                        z-index: 0;
                    }
                    
                    & span {
                        position: relative;
                        z-index: 1;
                        background-color: var(--background-primary);
                        padding: 0 10px;
                    }
                `;
            } else if (displayVariant === 'text-only') {
                css += `
                    margin-bottom: 5px;
                `;
            } else if (displayVariant === 'background-color') {
                css += `
                    background-color: ${lineColor};
                    margin-bottom: 5px;
                    border-radius: 4px;
                    font-size: ${textSize}px;
                }
            `;
        }
        // No additional styles needed for text-only variant
        
        // Add specific content for each divider
        this.settings.dividers.forEach(divider => {
            const escapedPath = this.escapeCssSelector(divider.path);
            const dividerSelector = divider.type === 'file' ? 
                `.nav-file:has(> [data-path="${escapedPath}"])` : 
                `.nav-folder:has(> [data-path="${escapedPath}"])`;
            
            // Create the divider style with text in the middle of the line
            if (displayVariant === 'border') {
                css += `
                ${dividerSelector} {
                    position: relative;
                }

                /* Line that appears behind the text */
                ${dividerSelector}::after {
                    content: "";
                    display: block;
                    position: absolute;
                    top: calc(0.5em * var(--line-height-tight)); /* Decreased top padding */
                    left: 0;
                    width: 100%; /* Full width border */
                    height: 0;
                    border-top: 1px solid ${lineColor} !important; /* Force line color */
                    z-index: 0; /* Put the line behind everything */
                }

                /* Text with background that creates the break in the line */
                ${dividerSelector}::before { 
                    content: "${divider.label.replace(/"/g, '\"')}"; 
                    font-size: ${textSize}px;
                    background-color: var(--background-secondary);
                    padding: 0 10px; /* Fixed padding value of 10px */
                    position: relative;
                    z-index: 1; /* Above the line but below icons */
                    color: ${textColor} !important; /* Force text color */
                    /* Adjust margin based on text alignment */
                    margin-inline-start: ${textAlign === 'center' ? 'calc(24px - -70px)' : 
                                          textAlign === 'right' ? 'calc(24px - -175px)' : 
                                          'calc(24px - 10px)'};
                    text-align: ${textAlign};
                }
                `;
            } else {
                css += `
                ${dividerSelector}::before { 
                    content: "${divider.label.replace(/"/g, '\"')}"; 
                    font-size: ${textSize}px;
                    color: ${textColor} !important; /* Force text color */
                    text-align: ${textAlign};
                    /* Adjust margin based on text alignment */
                    margin-inline-start: ${textAlign === 'center' ? 'calc(24px - -70px)' : 
                                          textAlign === 'right' ? 'calc(24px - -175px)' : 
                                          'calc(24px - 10px)'};
                }
                `;
            }
        });
        
        // Add the CSS to the style element and append to document
        styleEl.textContent = css;
        document.head.appendChild(styleEl);
    }
    
    // Process hidden files
        if (this.settings.hiddenFiles && this.settings.hiddenFiles.length > 0) {
            this.settings.hiddenFiles.forEach(file => {
                // Only use exact match with file extension
                const elements = document.querySelectorAll(`.nav-file-title[data-path="${this.escapeCssSelector(file)}"]`);
                
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
                // Exact folder match
                const folderElements = document.querySelectorAll(`.nav-folder-title[data-path="${this.escapeCssSelector(folder)}"]`);
                
                // Hide all matching folder elements
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
                
                // Also hide all children of this folder
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
            
            if (this.settings.enableDividers) {
                this.applyDividers();
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
        return str.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~]/g, '\\$&');
    }
    
    // Generate CSS for a specific variant
    generateVariantCSS(selector, path, color, opacity, textColor) {
        const escapedPath = this.escapeCssSelector(path);
        const hexColor = color;
        const rgbaColor = this.hexToRgba(color, opacity);
        
        // If textColor is provided, display variant is not 'text', and text color scheme is not 'default'
        if (textColor && this.settings.displayStyle !== 'text' && this.settings.textColorScheme !== 'default') {
            // Apply both background/border and text color
            const baseCSS = this.generateVariantBaseCSS(selector, escapedPath, hexColor, rgbaColor);
            return baseCSS + `
                ${selector}[data-path="${escapedPath}"] {
                    color: ${textColor} !important;
                }
            `;
        } else {
            // Just apply the base variant CSS
            return this.generateVariantBaseCSS(selector, escapedPath, hexColor, rgbaColor);
        }
    }
    
    // Generate the base CSS for a variant
    generateVariantBaseCSS(selector, escapedPath, hexColor, rgbaColor) {
        switch (this.settings.displayStyle) {
            case 'background':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        background-color: ${rgbaColor} !important;
                        border-radius: 4px !important;
                        padding: 0 4px !important;
                    }
                `;
            case 'border':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border: 2px solid ${hexColor} !important;
                        border-radius: 4px !important;
                        padding: 0 4px !important;
                    }
                `;
            case 'left-border-bg':
                return `
                    ${selector}[data-path="${escapedPath}"] {
                        border-left: 3px solid ${hexColor} !important;
                        background-color: ${rgbaColor} !important;
                        border-radius: 0 4px 4px 0 !important;
                        padding-left: 4px !important;
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
                        z-index: 1 !important; /* Ensure dot is above other elements but below icons */
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
        
        // Return rgba color
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // Create color pickers for custom colors
    createColorPicker(containerEl, mode, isTextColor) {
        var colorCount = 10; // We want 10 color pickers
        var settingsKey = isTextColor ? 'customTextColors' : 'customColors';
        var modeKey = mode + 'Mode';
        
        // Initialize settings if needed
        if (!this.settings[settingsKey]) {
            this.settings[settingsKey] = {};
        }
        if (!this.settings[settingsKey][modeKey]) {
            this.settings[settingsKey][modeKey] = Array(colorCount).fill('#ffffff');
        }
        
        // Ensure we have exactly 10 colors
        while (this.settings[settingsKey][modeKey].length < colorCount) {
            this.settings[settingsKey][modeKey].push('#ffffff');
        }
        if (this.settings[settingsKey][modeKey].length > colorCount) {
            this.settings[settingsKey][modeKey] = this.settings[settingsKey][modeKey].slice(0, colorCount);
        }
        
        // Create container for color pickers
        var colorPickersContainer = containerEl.createDiv({ cls: 'color-pickers-container' });
        colorPickersContainer.style.display = 'grid';
        colorPickersContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
        colorPickersContainer.style.gap = '10px';
        colorPickersContainer.style.marginTop = '10px';
        colorPickersContainer.style.marginBottom = '20px';
        
        // Create color pickers
        for (var i = 0; i < colorCount; i++) {
            var colorPicker = colorPickersContainer.createEl('input', {
                type: 'color',
                value: this.settings[settingsKey][modeKey][i] || '#ffffff'
            });
            colorPicker.style.width = '100%';
            colorPicker.style.height = '30px';
            colorPicker.style.padding = '0';
            colorPicker.style.border = '1px solid var(--background-modifier-border)';
            colorPicker.style.borderRadius = '4px';
            
            // Add event listener
            var index = i; // Capture the current index
            colorPicker.addEventListener('change', function(e) {
                var self = this;
                self.settings[settingsKey][modeKey][index] = e.target.value;
                self.saveSettings().then(function() {
                    if (self.settings.enableRainbowFolders) {
                        self.applyRainbowColors();
                    }
                });
            }.bind(this));
        }
    }
    
    // Update file explorer
    updateFileExplorer() {
        // Unhide all elements
        document.querySelectorAll('.explorer-enhancer-hidden').forEach(function(el) {
            el.classList.remove('explorer-enhancer-hidden');
            el.style.display = '';
        });
        
        // Force refresh file explorer if available
        var fileExplorer = this.app.workspace.getLeavesOfType('file-explorer')[0];
        if (fileExplorer && fileExplorer.view && fileExplorer.view.requestRefresh) {
            fileExplorer.view.requestRefresh();
        }
        
        // Update hidden elements with a slight delay
        var self = this;
        setTimeout(function() {
            self.updateHiddenElements();
            
            if (self.settings.enableRainbowFolders) {
                self.applyRainbowColors();
            }
        }, 100);
    }
}
