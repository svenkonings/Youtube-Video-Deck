let editorVisible: boolean = $state(false);

export function isEditorVisible(): boolean {
  return editorVisible;
}

export function showEditor(): void {
  editorVisible = true;
}

export function hideEditor(): void {
  editorVisible = false;
}
