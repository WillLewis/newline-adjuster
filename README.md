# Newline Adjuster for Obsidian

An Obsidian plugin to replace multiple empty lines with a single empty line, with preview and undo functionality.

## Features

- **Remove Multiple Empty Lines**: Automatically replace multiple consecutive empty lines in a document with a single empty line.
- **Preview Changes**: Preview the changes before applying them.
- **Undo Last Change**: Undo the last change made by the plugin.
- **Configurable Threshold**: Set the number of consecutive empty lines to search for and replace.

## Installation

1. **Download and Build the Plugin**:
    ```bash
    git clone https://github.com/yourusername/newline-adjuster.git
    cd newline-adjuster
    npm install
    npm run build
    ```

2. **Copy to Your Obsidian Vault**:
    ```bash
    cp -r newline-adjuster /path/to/your/vault/.obsidian/plugins/
    ```

3. **Enable the Plugin**:
    - Open Obsidian.
    - Go to `Settings` > `Community plugins`.
    - Disable `Safe mode` if it is enabled.
    - Find `Newline Adjuster` and enable it.

## Usage

### Ribbon Icon
- Click the dice icon in the left sidebar to remove multiple empty lines in the active document.

### Command Palette
- Open the command palette (Ctrl+P or Cmd+P) and run the following commands:
    - **Remove Multiple Empty Lines**: Replace multiple empty lines in the active document.
    - **Preview Changes**: Preview the changes before applying them.
    - **Undo Last Change**: Undo the last change made by the plugin.

### Settings

You can adjust the plugin settings to specify the number of consecutive empty lines to search for and replace.

1. **Open Settings**:
    - Click on the gear icon (⚙️) in the bottom left corner to open the settings menu.
    - Navigate to `Community plugins` and find `Newline Adjuster`.

2. **Adjust Consecutive Line Threshold**:
    - In the settings tab, find the option `Consecutive Line Threshold`.
    - Enter the number of consecutive empty lines you want the plugin to search for and replace. For example, enter `4` to replace any instance of 4 or more consecutive empty lines with a single empty line.

    ![Settings Screenshot](settings-screenshot.png)

## Development

### Building the Plugin
To build the plugin from source, follow these steps:

1. **Install Dependencies**:
    ```bash
    npm install
    ```

2. **Build the Plugin**:
    ```bash
    npm run build
    ```

### Contributing

Contributions are welcome! Please open an issue or submit a pull request with your improvements or bug fixes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Will Lewis - willxemail@gmail.com [Webmocha](https://webmocha.com)

