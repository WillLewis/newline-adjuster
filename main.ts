import { App, Plugin, PluginSettingTab, Setting, Notice, TFile, Modal } from 'obsidian';

// Interface for Plugin Settings
interface RemoveMultipleEmptyLinesSettings {
	consecutiveLineThreshold: number;
}

const DEFAULT_SETTINGS: RemoveMultipleEmptyLinesSettings = {
	consecutiveLineThreshold: 3
}

export default class RemoveMultipleEmptyLinesPlugin extends Plugin {
	settings: RemoveMultipleEmptyLinesSettings;
	previousContent: string | null = null;

	async onload() {
		await this.loadSettings();

		// Add Ribbon Icon
		this.addRibbonIcon('dice', 'Remove Multiple Empty Lines', async () => {
			const activeFile = this.app.workspace.getActiveFile();
			if (activeFile) {
				await this.cleanEmptyLines(activeFile);
			}
		});

		// Add Command for Preview Changes
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

		// Add Command for Undo Last Change
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
		statusBarItemEl.setText('Remove Empty Lines Plugin Active');

		this.addSettingTab(new RemoveMultipleEmptyLinesSettingTab(this.app, this));
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

	async cleanEmptyLines(file: TFile) {
		const fileContent = await this.app.vault.read(file);
		this.previousContent = fileContent; // Save current content for undo
		const cleanedContent = fileContent.replace(new RegExp(`(\n\\s*){${this.settings.consecutiveLineThreshold},}`, 'g'), '\n\n');
		await this.app.vault.modify(file, cleanedContent);
		new Notice('Multiple empty lines removed');
	}

	async previewChanges(file: TFile) {
		const fileContent = await this.app.vault.read(file);
		const cleanedContent = fileContent.replace(new RegExp(`\\n\\s*\\n{${this.settings.consecutiveLineThreshold},}`, 'g'), '\n\n');
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
class RemoveMultipleEmptyLinesSettingTab extends PluginSettingTab {
	plugin: RemoveMultipleEmptyLinesPlugin;

	constructor(app: App, plugin: RemoveMultipleEmptyLinesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: 'Settings for Remove Multiple Empty Lines Plugin' });

		new Setting(containerEl)
			.setName('Consecutive Line Threshold')
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
