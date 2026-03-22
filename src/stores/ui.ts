import { writable } from 'svelte/store';

export type EditorTab = 'palette' | 'entries' | 'export';
export type PreviewLang = 'cpp' | 'rust' | 'js' | 'ts' | 'css' | 'html' | 'toml' | 'diff';

export const activeTab = writable<EditorTab>('palette');
export const previewLang = writable<PreviewLang>('cpp');
export const pickerOpenId = writable<string | null>(null); // palette color name or null
