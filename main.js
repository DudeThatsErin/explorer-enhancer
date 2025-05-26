const { Plugin, PluginSettingTab, Setting, Notice, Modal } = require('obsidian');

class ExplorerEnhancerPlugin extends Plugin {
    async onload() {
        console.log('Loading Explorer Enhancer plugin');
        
        // Load settings
        await this.loadSettings();
        
        // Register CSS
        this.registerMarkdownPostProcessor(this.postProcessor.bind(this));
        
        // Register event to modify file explorer
        this.app.workspace.onLayoutReady(() => this.updateFileExplorer());
        
        // Watch for file explorer changes (for when new files are created)
        this.registerEvent(
            this.app.vault.on('create', () => this.updateFileExplorer())
        );
        this.registerEvent(
            this.app.vault.on('delete', () => this.updateFileExplorer())
        );
        this.registerEvent(
            this.app.vault.on('rename', () => this.updateFileExplorer())
        );
        
        // When file explorer is shown
        this.registerEvent(
            this.app.workspace.on('file-menu', () => this.updateFileExplorer())
        );
        
        // Add settings tab
        this.addSettingTab(new ExplorerEnhancerSettingTab(this.app, this));
        
        // Add command to refresh file explorer
        this.addCommand({
            id: 'refresh-file-explorer',
            name: 'Refresh File Explorer Enhancements',
            callback: () => this.updateFileExplorer(),
        });
    }
    
    onunload() {
        console.log('Unloading Explorer Enhancer plugin');
        // Remove our custom styles when plugin unloads
        this.removeStyles();
    }
    
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    
    async saveSettings() {
        await this.saveData(this.settings);
        this.updateFileExplorer();
    }
    
    postProcessor() {
        // This is used to process markdown but we're using it as a hook to ensure
        // our file explorer modifications persist when switching between files
        setTimeout(() => this.updateFileExplorer(), 100);
    }
    
    updateFileExplorer() {
        // First remove all existing styles and elements
        this.removeStyles();
        
        // Add a small delay to ensure the file explorer is fully loaded
        setTimeout(() => {
            // Apply styles for hidden files and folders
            this.addStyles();
            
            // Apply dividers
            this.applyDividers();
            
            console.log('Explorer Enhancer: Updated file explorer');
        }, 300);
    }
    
    removeStyles() {
        // Remove existing style element if it exists
        const existingStyle = document.getElementById('explorer-enhancer-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
    }
    
    // Check if a path is hidden (directly or as a subfolder of a hidden folder)
    isPathHidden(path) {
        // Check if the exact path is in hidden files
        if (this.settings.hiddenFiles.includes(path)) {
            console.log(`Path ${path} is hidden as file`);
            return true;
        }
        
        // Check if the exact path is in hidden folders
        if (this.settings.hiddenFolders.includes(path)) {
            console.log(`Path ${path} is hidden as folder`);
            return true;
        }
        
        // Check if this is a subfolder of a hidden folder
        for (const hiddenFolder of this.settings.hiddenFolders) {
            if (path.startsWith(hiddenFolder + '/')) {
                console.log(`Path ${path} is hidden as subfolder of ${hiddenFolder}`);
                return true;
            }
        }
        
        return false;
    }
    
    // Check if a folder contains any dividers that would be affected by hiding it
    checkForDividersInFolder(folderPath) {
        const affectedDividers = [];
        
        // Find dividers that reference this folder or any subpath
        for (const divider of this.settings.dividers) {
            if (divider.beforePath === folderPath || divider.beforePath.startsWith(folderPath + '/')) {
                affectedDividers.push(divider);
            }
        }
        
        return affectedDividers;
    }
    
    addStyles() {
        // Remove any existing style elements first
        this.removeStyles();
        
        // Only proceed if we have files or folders to hide
        if (this.settings.hiddenFiles.length === 0 && this.settings.hiddenFolders.length === 0) {
            return;
        }
        
        // Create a style element for our CSS
        const styleElement = document.createElement('style');
        styleElement.id = 'explorer-enhancer-styles';
        
        // Simple selector format for immediate hiding
        const selectors = [];
        
        // Add selectors for hidden files
        for (const filePath of this.settings.hiddenFiles) {
            const escapedPath = CSS.escape(filePath);
            selectors.push(`.nav-file-title[data-path="${escapedPath}"]`);
            selectors.push(`.nav-file[data-path="${escapedPath}"]`);
        }
        
        // Add selectors for hidden folders and their subfolders/files
        for (const folderPath of this.settings.hiddenFolders) {
            const escapedPath = CSS.escape(folderPath);
            
            // Hide the folder itself
            selectors.push(`.nav-folder-title[data-path="${escapedPath}"]`);
            selectors.push(`.nav-folder[data-path="${escapedPath}"]`);
            
            // Hide all subfolders and files (anything that starts with folderPath/)
            selectors.push(`[data-path^="${escapedPath}/"]`);
        }
        
        // Combine all selectors with the display:none rule
        if (selectors.length > 0) {
            const css = `
                /* Hidden files and folders */
                ${selectors.join(',\n')} {
                    display: none !important;
                }
            `;
            
            styleElement.textContent = css;
            document.head.appendChild(styleElement);
            console.log(`Added styles to hide ${this.settings.hiddenFiles.length} files and ${this.settings.hiddenFolders.length} folders`);
        }
    }
    
    applyDividers() {
        // Remove any existing divider styles
        const styleEl = document.getElementById('explorer-enhancer-divider-styles');
        if (styleEl) styleEl.remove();
        
        // Only proceed if we have dividers to apply
        if (this.settings.dividers.length === 0) return;
        
        // Create a new style element for our divider CSS
        const styleElement = document.createElement('style');
        styleElement.id = 'explorer-enhancer-divider-styles';
        
        // Exactly match the CSS from the user's file-explorer-dividers.css snippet
        let css = `
            /* Base styles for dividers - matches file-explorer-dividers.css */
            .explorer-enhancer-divider-container {
                position: relative;
            }
            
            .explorer-enhancer-divider-container::before {
                content: attr(data-divider-text);
                --padding-x: 10px;
                margin-inline-start: calc(24px - var(--padding-x));
                padding: 0 var(--padding-x);
                background-color: var(--background-secondary);
            }
            
            .explorer-enhancer-divider-container::after {
                content: "";
                display: block;
                position: absolute;
                top: calc(0.5em * var(--line-height-tight));
                width: 100%; /* full width line */
                height: 0;
                border-top: 1px solid currentColor;
                z-index: -1;
            }
        `;
        
        // Add the style element to the document
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
        
        // Apply the dividers by directly modifying the DOM
        // Use MutationObserver to ensure dividers are maintained when the file explorer is updated
        const fileExplorer = document.querySelector('.nav-files-container');
        if (!fileExplorer) return;
        
        // Remove any existing divider containers first
        document.querySelectorAll('.explorer-enhancer-divider-container').forEach(el => {
            el.classList.remove('explorer-enhancer-divider-container');
            el.removeAttribute('data-divider-text');
        });
        
        // Function to apply dividers to elements
        const applyDividersToElements = () => {
            console.log('Applying dividers to file explorer elements');
            
            // First, remove any existing divider containers
            document.querySelectorAll('.explorer-enhancer-divider-container').forEach(el => {
                el.classList.remove('explorer-enhancer-divider-container');
                el.removeAttribute('data-divider-text');
                el.removeAttribute('data-divider-type');
            });
            
            // Use a more robust method to find file explorer elements
            const allFileItems = document.querySelectorAll('.nav-file-title, .nav-folder-title');
            const pathToElementMap = {};
            
            // Create a map of all paths to their elements
            allFileItems.forEach(el => {
                const path = el.getAttribute('data-path');
                if (path) {
                    pathToElementMap[path] = el;
                }
            });
            
            // Process each divider configuration
            for (const divider of this.settings.dividers) {
                const { text, beforePath, type } = divider;
                if (!text || !beforePath) continue;
                
                // Skip dividers for hidden files/folders
                if (this.isPathHidden(beforePath)) {
                    console.log(`Skipping divider for hidden path: ${beforePath}`);
                    continue;
                }
                
                // Find the element using our map
                const titleElement = pathToElementMap[beforePath];
                if (!titleElement) {
                    console.log(`Could not find element for path: ${beforePath}`);
                    continue;
                }
                
                // Determine the container element based on type
                const containerElement = type === 'folder' ? 
                    titleElement.closest('.nav-folder') : 
                    titleElement.closest('.nav-file');
                
                if (!containerElement) {
                    console.log(`Could not find container for: ${beforePath}`);
                    continue;
                }
                
                // Apply the divider styling
                containerElement.classList.add('explorer-enhancer-divider-container');
                containerElement.setAttribute('data-divider-text', text);
                containerElement.setAttribute('data-divider-type', type);
                
                console.log(`Applied divider '${text}' to ${beforePath} (${type})`);
            }
        };
        
        // Apply dividers immediately
        applyDividersToElements();
        
        // Set up a MutationObserver to reapply dividers when the file explorer changes
        if (!this.dividerObserver) {
            this.dividerObserver = new MutationObserver((mutations) => {
                // Check if any of the mutations affect the file explorer
                for (const mutation of mutations) {
                    if (mutation.type === 'childList' || mutation.type === 'attributes') {
                        // Reapply dividers if the file explorer has changed
                        applyDividersToElements();
                        break;
                    }
                }
            });
            
            // Start observing the file explorer for changes
            this.dividerObserver.observe(fileExplorer, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-path', 'class']
            });
        }
    }
}

const DEFAULT_SETTINGS = {
    hiddenFiles: [],
    hiddenFolders: [],
    dividers: [] // Each divider should have: {text, beforePath, type (file/folder)}
};

class ExplorerEnhancerSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    
    display() {
        const { containerEl } = this;
        containerEl.empty();
        
        containerEl.createEl('h2', { text: 'Explorer Enhancer Settings' });
        
        // Hidden Files Section
        containerEl.createEl('h3', { text: 'Hidden Files' });
        
        // Display current hidden files
        const hiddenFilesContainer = containerEl.createDiv('hidden-files-container');
        
        if (this.plugin.settings.hiddenFiles.length === 0) {
            hiddenFilesContainer.createEl('p', { 
                text: 'No files are currently hidden.',
                cls: 'setting-item-description' 
            });
        } else {
            for (let i = 0; i < this.plugin.settings.hiddenFiles.length; i++) {
                const file = this.plugin.settings.hiddenFiles[i];
                const fileSetting = new Setting(hiddenFilesContainer)
                    .setDesc(file)
                    .addButton(button => button
                        .setIcon('trash')
                        .setTooltip('Remove')
                        .onClick(async () => {
                            this.plugin.settings.hiddenFiles.splice(i, 1);
                            await this.plugin.saveSettings();
                            this.display();
                        })
                    );
            }
        }
        
        // Add new hidden file
        let filePathToHide = '';
        new Setting(containerEl)
            .setName('Add Hidden File')
            .setDesc('Enter the path to a file you want to hide from the file explorer')
            .addText(text => text
                .setPlaceholder('path/to/file.md')
                .setValue('')
                .onChange((value) => {
                    filePathToHide = value;
                })
            )
            .addButton(button => button
                .setButtonText('Add')
                .setCta()
                .onClick(async () => {
                    const filePath = filePathToHide.trim();
                    
                    if (filePath && !this.plugin.settings.hiddenFiles.includes(filePath)) {
                        this.plugin.settings.hiddenFiles.push(filePath);
                        await this.plugin.saveSettings();
                        filePathToHide = '';
                        this.display();
                        new Notice(`File path "${filePath}" added to hidden files`);
                    } else if (!filePath) {
                        new Notice('Please enter a file path');
                    } else {
                        new Notice('This file path is already hidden');
                    }
                })
            );
        
        // Hidden Folders Section
        containerEl.createEl('h3', { text: 'Hidden Folders' });
        
        // Display current hidden folders
        const hiddenFoldersContainer = containerEl.createDiv('hidden-folders-container');
        
        if (this.plugin.settings.hiddenFolders.length === 0) {
            hiddenFoldersContainer.createEl('p', { 
                text: 'No folders are currently hidden.',
                cls: 'setting-item-description' 
            });
        } else {
            for (let i = 0; i < this.plugin.settings.hiddenFolders.length; i++) {
                const folder = this.plugin.settings.hiddenFolders[i];
                const folderSetting = new Setting(hiddenFoldersContainer)
                    .setDesc(folder)
                    .addButton(button => button
                        .setIcon('trash')
                        .setTooltip('Remove')
                        .onClick(async () => {
                            this.plugin.settings.hiddenFolders.splice(i, 1);
                            await this.plugin.saveSettings();
                            this.display();
                        })
                    );
            }
        }
        
        // Add new hidden folder
        let folderPathToHide = '';
        new Setting(containerEl)
            .setName('Add Hidden Folder')
            .setDesc('Enter the path to a folder you want to hide from the file explorer')
            .addText(text => text
                .setPlaceholder('path/to/folder')
                .setValue('')
                .onChange((value) => {
                    folderPathToHide = value;
                })
            )
            .addButton(button => button
                .setButtonText('Add')
                .setCta()
                .onClick(async () => {
                    const folderPath = folderPathToHide.trim();
                    
                    if (folderPath && !this.plugin.settings.hiddenFolders.includes(folderPath)) {
                        // Check if there are dividers that would be affected
                        const affectedDividers = this.plugin.checkForDividersInFolder(folderPath);
                        
                        const proceedWithHiding = async () => {
                            // Remove affected dividers if any
                            if (affectedDividers.length > 0) {
                                // Filter out the affected dividers
                                this.plugin.settings.dividers = this.plugin.settings.dividers.filter(divider => 
                                    !affectedDividers.includes(divider));
                            }
                            
                            // Add the folder to hidden folders
                            this.plugin.settings.hiddenFolders.push(folderPath);
                            await this.plugin.saveSettings();
                            folderPathToHide = '';
                            this.display();
                            
                            if (affectedDividers.length > 0) {
                                new Notice(`Folder "${folderPath}" hidden. ${affectedDividers.length} dividers were removed.`);
                            } else {
                                new Notice(`Folder path "${folderPath}" added to hidden folders`);
                            }
                        };
                        
                        if (affectedDividers.length > 0) {
                            // Create a modal to confirm deletion of dividers
                            const modal = new DividerWarningModal(
                                this.app, 
                                folderPath, 
                                affectedDividers,
                                proceedWithHiding
                            );
                            modal.open();
                        } else {
                            // No dividers affected, proceed normally
                            await proceedWithHiding();
                        }
                    } else if (!folderPath) {
                        new Notice('Please enter a folder path');
                    } else {
                        new Notice('This folder path is already hidden');
                    }
                })
            );
        
        // Dividers Section
        containerEl.createEl('h3', { text: 'Explorer Dividers' });
        
        // Display current dividers
        const dividersContainer = containerEl.createDiv('dividers-container');
        
        if (this.plugin.settings.dividers.length === 0) {
            dividersContainer.createEl('p', { 
                text: 'No dividers have been added.',
                cls: 'setting-item-description' 
            });
        } else {
            for (let i = 0; i < this.plugin.settings.dividers.length; i++) {
                const divider = this.plugin.settings.dividers[i];
                const typeText = divider.type ? ` (${divider.type})` : '';
                const dividerSetting = new Setting(dividersContainer)
                    .setName(divider.text)
                    .setDesc(`Before: ${divider.beforePath}${typeText}`)
                    .addButton(button => button
                        .setIcon('trash')
                        .setTooltip('Remove')
                        .onClick(async () => {
                            this.plugin.settings.dividers.splice(i, 1);
                            await this.plugin.saveSettings();
                            this.display();
                        })
                    );
            }
        }
        
        // Add new divider - collect inputs in variables
        let dividerText = '';
        let dividerBeforePath = '';
        let dividerType = 'file'; // Default to file type
        
        const dividerTextSetting = new Setting(containerEl)
            .setName('Divider Text')
            .setDesc('Enter the text to display in the divider (can include emoji)')
            .addText(text => text
                .setPlaceholder('📝 Notes')
                .setValue('')
                .onChange((value) => {
                    dividerText = value;
                })
            );
        
        new Setting(containerEl)
            .setName('Divider Type')
            .setDesc('Select whether this divider appears before a file or folder')
            .addDropdown(dropdown => dropdown
                .addOption('file', 'File')
                .addOption('folder', 'Folder')
                .setValue(dividerType)
                .onChange((value) => {
                    dividerType = value;
                })
            );
        
        const dividerBeforeSetting = new Setting(containerEl)
            .setName('Insert Before')
            .setDesc('Enter the path to the file/folder before which this divider should appear')
            .addText(text => text
                .setPlaceholder('path/to/file-or-folder')
                .setValue('')
                .onChange((value) => {
                    dividerBeforePath = value;
                })
            );
        
        new Setting(containerEl)
            .addButton(button => button
                .setButtonText('Add Divider')
                .setCta()
                .onClick(async () => {
                    const text = dividerText.trim();
                    const beforePath = dividerBeforePath.trim();
                    
                    if (text && beforePath) {
                        this.plugin.settings.dividers.push({ 
                            text, 
                            beforePath,
                            type: dividerType
                        });
                        await this.plugin.saveSettings();
                        dividerText = '';
                        dividerBeforePath = '';
                        this.display();
                        new Notice(`Divider "${text}" added before ${dividerType} ${beforePath}`);
                    } else {
                        new Notice('Both divider text and path are required.');
                    }
                })
            );
    }
}

// Modal to warn about dividers that would be affected by hiding a folder
class DividerWarningModal extends Modal {
    constructor(app, folderPath, affectedDividers, onConfirm) {
        super(app);
        this.folderPath = folderPath;
        this.affectedDividers = affectedDividers;
        this.onConfirm = onConfirm;
    }
    
    onOpen() {
        const {contentEl} = this;
        
        contentEl.createEl('h2', {text: 'Warning: Dividers Will Be Removed'});
        contentEl.createEl('p', {
            text: `Hiding folder "${this.folderPath}" will affect ${this.affectedDividers.length} divider${this.affectedDividers.length > 1 ? 's' : ''}.`
        });
        
        // Show the affected dividers
        const dividersList = contentEl.createEl('div', {cls: 'affected-dividers-list'});
        
        contentEl.createEl('p', {
            text: 'The following dividers will be removed:',
            cls: 'warning-text'
        });
        
        for (const divider of this.affectedDividers) {
            const dividerItem = dividersList.createEl('div', {cls: 'divider-item'});
            dividerItem.createEl('span', {
                text: `"${divider.text}" before ${divider.beforePath}`,
                cls: 'divider-info'
            });
        }
        
        const buttonContainer = contentEl.createEl('div', {cls: 'button-container'});
        
        buttonContainer.createEl('button', {text: 'Cancel'})
            .addEventListener('click', () => {
                this.close();
            });
        
        buttonContainer.createEl('button', {text: 'Proceed Anyway', cls: 'mod-warning'})
            .addEventListener('click', () => {
                this.close();
                this.onConfirm();
            });
    }
    
    onClose() {
        const {contentEl} = this;
        contentEl.empty();
    }
}

module.exports = ExplorerEnhancerPlugin;
