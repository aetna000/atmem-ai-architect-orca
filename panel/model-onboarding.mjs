// Executed only in the verified Architect tab opened by this plugin.
export const modelSetupReady = `(() => {
  try {
    const project = new URL(location.href).searchParams.get('project');
    const saved = JSON.parse(localStorage.getItem('atforma-workspace-v3') || 'null');
    return !!project && saved?.id === project && !!document.querySelector('button.model') && !document.querySelector('[role="dialog"][aria-label="welcome"]');
  } catch { return false; }
})()`
export const openModelSetup = `(() => {
  const button = document.querySelector('button.model');
  if (!button) throw Error('Model connection control is unavailable.');
  if (button.textContent.trim() !== 'Connect a model') return 'already-connected';
  if (document.querySelector('[role="dialog"]')) return 'dialog-already-open';
  button.click();
  return 'opened';
})()`
