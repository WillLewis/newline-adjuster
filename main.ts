import { App, Plugin, PluginSettingTab, Setting, Notice, TFile, Modal, MarkdownView } from 'obsidian';

// Interface for Plugin Settings
interface NewlineAdjusterSettings {
    consecutiveLineThreshold: number;
    replacementNewlines: number;
}

const DEFAULT_SETTINGS: NewlineAdjusterSettings = {
    consecutiveLineThreshold: 3,
    replacementNewlines: 2
}

export default class NewlineAdjusterPlugin extends Plugin {
    settings: NewlineAdjusterSettings;
    previousContent: string | null = null;

    async onload() {
        await this.loadSettings();

        // Add Ribbon Icon for Adjusting Newlines
        this.addRibbonIcon('dice', 'Adjust Newlines', async () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (activeFile) {
                await this.adjustNewlines(activeFile);
            }
        });

        // Add Ribbon Icon for Preview Changes
        this.addRibbonIcon('eye', 'Preview Changes', async () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (activeFile) {
                await this.previewChanges(activeFile);
            }
        });

        // Add Ribbon Icon for Undo Last Change
        this.addRibbonIcon('undo', 'Undo Last Change', async () => {
            const activeFile = this.app.workspace.getActiveFile();
            if (activeFile && this.previousContent) {
                await this.app.vault.modify(activeFile, this.previousContent);
                new Notice('Last change undone');
            } else {
                new Notice('No previous change to undo');
            }
        });

        // Add Commands
        this.addCommand({
            id: 'adjust-newlines',
            name: 'Adjust Newlines',
            callback: async () => {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile) {
                    await this.adjustNewlines(activeFile);
                }
            }
        });

        this.addCommand({
            id: 'preview-changes',
            name: 'Preview Changes',
            callback: async () => {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile) {
                    await this.previewChanges(activeFile);
                }
            }
        });

        this.addCommand({
            id: 'undo-last-change',
            name: 'Undo Last Change',
            callback: async () => {
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile && this.previousContent) {
                    await this.app.vault.modify(activeFile, this.previousContent);
                    new Notice('Last change undone');
                } else {
                    new Notice('No previous change to undo');
                }
            }
        });

        // Add Status Bar Item
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('Newline Adjuster Plugin Active');

        this.addSettingTab(new NewlineAdjusterSettingTab(this.app, this));
    }

    onunload() {
        // Perform any cleanup when the plugin is disabled
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async adjustNewlines(file: TFile) {
        const activeLeaf = this.app.workspace.activeLeaf;
        if (activeLeaf) {
            const view = activeLeaf.view as MarkdownView;
            const editor = view.editor;
            const doc = editor.getDoc();
            const fileContent = doc.getValue();
            this.previousContent = fileContent; // Save current content for undo
            
            // Replace multiple newlines and track changes
            const regex = new RegExp(`(\n\\s*){${this.settings.consecutiveLineThreshold},}`, 'g');
            const matches = fileContent.match(regex);
            const changeCount = matches ? matches.length : 0;
            const replacement = '\n'.repeat(this.settings.replacementNewlines);
            const cleanedContent = fileContent.replace(regex, replacement);
            
            doc.setValue(cleanedContent);
            new Notice(`Adjusted ${changeCount} instances of multiple empty lines.`);
        }
    }

    async previewChanges(file: TFile) {
        const fileContent = await this.app.vault.read(file);
        const regex = new RegExp(`(\n\\s*){${this.settings.consecutiveLineThreshold},}`, 'g');
        const replacement = '\n'.repeat(this.settings.replacementNewlines);
        const cleanedContent = fileContent.replace(regex, replacement);
        new PreviewModal(this.app, fileContent, cleanedContent).open();
    }
}

// Modal for previewing changes
class PreviewModal extends Modal {
    originalContent: string;
    adjustedContent: string;

    constructor(app: App, originalContent: string, adjustedContent: string) {
        super(app);
        this.originalContent = originalContent;
        this.adjustedContent = adjustedContent;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h2', { text: 'Preview of Changes' });

        const container = contentEl.createDiv({ cls: 'newline-adjuster-preview-container' });
        const originalDiv = container.createDiv({ cls: 'newline-adjuster-preview-original' });
        const adjustedDiv = container.createDiv({ cls: 'newline-adjuster-preview-adjusted' });

        originalDiv.createEl('h3', { text: 'Original' });
        adjustedDiv.createEl('h3', { text: 'Adjusted' });

        originalDiv.createEl('pre', { text: this.originalContent });
        adjustedDiv.createEl('pre', { text: this.adjustedContent });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}

// Settings Tab
class NewlineAdjusterSettingTab extends PluginSettingTab {
    plugin: NewlineAdjusterPlugin;

    constructor(app: App, plugin: NewlineAdjusterPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();
        new Setting(containerEl)
            .setName('Consecutive line threshold')
            .setDesc('Number of consecutive empty lines to trigger replacement.')
            .addText(text => text
                .setPlaceholder('Enter number of lines')
                .setValue(this.plugin.settings.consecutiveLineThreshold.toString())
                .onChange(async (value) => {
                    this.plugin.settings.consecutiveLineThreshold = parseInt(value, 10);
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Replacement newlines')
            .setDesc('Number of newlines to replace with (1 or 2).')
            .addDropdown(dropdown => dropdown
                .addOption('1', '1 newline')
                .addOption('2', '2 newlines')
                .setValue(this.plugin.settings.replacementNewlines.toString())
                .onChange(async (value) => {
                    this.plugin.settings.replacementNewlines = parseInt(value, 10);
                    await this.plugin.saveSettings();
                }));
    }
}