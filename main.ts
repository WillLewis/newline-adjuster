import { App, Plugin, PluginSettingTab, Setting, Notice, TFile, Modal, MarkdownView } from 'obsidian';

// Interface for Plugin Settings
interface NewlineAdjusterSettings {
    consecutiveLineThreshold: number;
}

const DEFAULT_SETTINGS: NewlineAdjusterSettings = {
    consecutiveLineThreshold: 3
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
            const cleanedContent = fileContent.replace(regex, '\n\n');
            
            doc.setValue(cleanedContent);
            new Notice(`Adjusted ${changeCount} instances of multiple empty lines.`);
        }
    }

    async previewChanges(file: TFile) {
        const fileContent = await this.app.vault.read(file);
        const cleanedContent = fileContent.replace(new RegExp(`(\n\\s*){${this.settings.consecutiveLineThreshold},}`, 'g'), '\n\n');
        new PreviewModal(this.app, cleanedContent).open();
    }
}

// Modal for previewing changes
class PreviewModal extends Modal {
    content: string;

    constructor(app: App, content: string) {
        super(app);
        this.content = content;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.createEl('h2', { text: 'Preview of Changes' });
        contentEl.createEl('pre', { text: this.content.slice(0, 200) + '...' });
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
            .setDesc('Number of consecutive empty lines to replace with a single empty line.')
            .addText(text => text
                .setPlaceholder('Enter number of lines')
                .setValue(this.plugin.settings.consecutiveLineThreshold.toString())
                .onChange(async (value) => {
                    this.plugin.settings.consecutiveLineThreshold = parseInt(value, 10);
                    await this.plugin.saveSettings();
                }));
    }
}
