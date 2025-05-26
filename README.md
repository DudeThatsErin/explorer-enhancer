# Explorer Enhancer for Obsidian

A plugin that enhances Obsidian's file explorer with features like hiding files/folders and adding dividers to organize your vault visually.

## Features

- **Hidden Files & Folders**: Hide specific files or folders from the file explorer
- **Explorer Dividers**: Add visual dividers with custom text before files or folders
- **Persistent Settings**: All configurations are saved and restored between sessions

## Installation with BRAT

1. Install the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) from the Obsidian Community Plugins
2. Open BRAT settings
3. Click "Add Beta Plugin"
4. Enter the repository URL: `https://github.com/DudeThatsErin/explorer-enhancer`
5. Click "Add Plugin"
6. Go to Community Plugins in Obsidian settings and enable "Explorer Enhancer"

## Usage

### Hiding Files and Folders

1. Go to Settings > Explorer Enhancer
2. In the "Hidden Files" section, enter the path to a file you want to hide
3. Click "Add" to add it to the hidden files list
4. In the "Hidden Folders" section, enter the path to a folder you want to hide
5. Click "Add" to add it to the hidden folders list
6. Files and folders will be immediately hidden in the file explorer

### Adding Dividers

1. Go to Settings > Explorer Enhancer
2. In the "Explorer Dividers" section:
   - Enter divider text (what will be displayed on the divider)
   - Select divider type (File or Folder)
   - Enter the path to the file/folder before which the divider should appear
3. Click "Add Divider"
4. The divider will appear in the file explorer above the specified file/folder

### Removing Hidden Items or Dividers

1. Go to Settings > Explorer Enhancer
2. Click the trash icon next to any hidden file, hidden folder, or divider you want to remove

## Screenshots

Place screenshots in the `.github` folder of the repository:

```
explorer-enhancer/
├── .github/
│   ├── screenshots/
│   │   ├── settings.png
│   │   ├── hidden-files.png
│   │   ├── dividers.png
│   │   └── file-explorer-view.png
```

## Custom Styling

The plugin generates CSS that matches the styling in the optional `file-explorer-dividers.css` snippet. If you want to customize the appearance of dividers, you can create this snippet in your vault's snippets folder with your preferred styling.

## Support

For issues, feature requests, or contributions, please visit the [GitHub repository](https://github.com/DudeThatsErin/explorer-enhancer).
