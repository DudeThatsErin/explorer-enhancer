# Explorer Enhancer for Obsidian

A plugin that enhances Obsidian's file explorer with features like rainbow folders, hiding files/folders, and adding dividers to organize your vault visually.

## Features

If you would like to supply more colors, I always use groups of 10 colors. Please provide me 10 colors as [hex color codes](https://htmlcolorcodes.com/) (like #000000 or #e2e5e5) and I will add them as an option in the drop down! Just open an issue here.

### Rainbow Folders
- **Colorize Folders**: Apply colors to folders in the file explorer for easier visual organization
- **Multiple Color Schemes**: Choose from predefined color schemes or create your own custom colors
- **Light & Dark Mode Support**: Separate color configurations for light and dark themes
- **Sequential Coloring**: Top-level folders always get sequential rainbow colors
- **Cascading Colors Option**: Choose whether nested items inherit parent colors or get their own colors
- **Apply Colors to Files**: Optionally apply colors to files based on their parent folder
- **Color Opacity Control**: Adjust transparency level of applied colors (for background and border styles)
- **Display Variants**: Choose between different display styles:
  - **Text Color**: Changes the text color (default)
  - **Background**: Applies color as a background behind items
  - **Border Options**:
    - **Left Border**: Adds a colored border to the left side of items
    - **Top Border**: Adds a colored border to the top of items
    - **Right Border**: Adds a colored border to the right side of items
    - **Bottom Border**: Adds a colored border to the bottom of items
    - **Left+Right Borders**: Adds colored borders to both left and right sides
    - **Top+Bottom Borders**: Adds colored borders to both top and bottom
    - **All Borders**: Adds borders on all sides of items
  - **Border + Background Combinations**:
    - **Left Border + BG**: Combines left border with a matching background
    - **Top Border + BG**: Combines top border with a matching background
    - **Right Border + BG**: Combines right border with a matching background
    - **Bottom Border + BG**: Combines bottom border with a matching background
    - **Left+Right Borders + BG**: Combines left and right borders with a matching background
    - **Top+Bottom Borders + BG**: Combines top and bottom borders with a matching background
    - **All Borders + BG**: Combines borders on all sides with a matching background
  - **Bullet Point**: Changes text color and places a matching dot on the right side (with text padding)

### Hidden Files & Folders
- **Hide Specific Items**: Hide individual files or folders from the file explorer
- **Path-Based Hiding**: Hide items based on their path in the vault
- **Nested Hiding**: When hiding a folder, all its contents are also hidden

### Additional Features
- **Persistent Settings**: All configurations are saved and restored between sessions
- **Intuitive Settings Interface**: Easy-to-use settings panel with color pickers

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

<img width="816" alt="image" src="https://github.com/user-attachments/assets/18d733f3-31c6-4cc7-a06c-ca6ffd2fc414" />
<img width="796" alt="image" src="https://github.com/user-attachments/assets/8e20fe8f-bacd-47bc-828b-abe54df7d532" />
<img width="1226" alt="image" src="https://github.com/user-attachments/assets/862fe771-e9d1-4857-83b8-f6ff9e95e055" />
<img width="1236" alt="image" src="https://github.com/user-attachments/assets/3ff4f01a-8024-482b-8251-4024fe84a547" />
<img width="1236" alt="image" src="https://github.com/user-attachments/assets/4c930e76-c8fb-4290-9423-3209998b6f0b" />
<img width="1240" alt="image" src="https://github.com/user-attachments/assets/ce9330ec-e006-40be-bc16-f32203ae2807" />
<img width="1231" alt="image" src="https://github.com/user-attachments/assets/7a83290e-3621-4287-9fa8-61618d9f9d48" />
<img width="1244" alt="image" src="https://github.com/user-attachments/assets/61b0c8e1-a3a3-4cfe-981f-2261308efefe" />
<img width="1255" alt="image" src="https://github.com/user-attachments/assets/a6cdfa01-8ebe-4550-b95c-6e274ddc1021" />
<img width="1227" alt="image" src="https://github.com/user-attachments/assets/aed35400-0c66-442a-9d22-3f743a5f0f12" />



## Custom Styling

The plugin generates CSS that matches the styling in the optional `file-explorer-dividers.css` snippet. If you want to customize the appearance of dividers, you can create this snippet in your vault's snippets folder with your preferred styling.

## Support

For issues, feature requests, or contributions, please visit the [GitHub repository](https://github.com/DudeThatsErin/explorer-enhancer).
