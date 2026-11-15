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

// Keep Architect's composer reachable in narrow embedded Orca panes.
export const embeddedLayout = `(() => {
  const id = 'atmem-orca-embedded-layout';
  let style = document.getElementById(id);
  if (!style) { style = document.createElement('style'); style.id = id; document.head.append(style); }
  style.textContent = '@media(max-width:900px){html,body,#root{height:100%;overflow:hidden}.app{height:100dvh;min-height:0;grid-template-columns:minmax(0,1fr);grid-template-rows:auto auto minmax(100px,1fr) minmax(300px,50dvh);overflow:hidden}.app.chat-closed,.app.build-workspace{grid-template-rows:auto auto minmax(0,1fr)}.app>.canvas{min-height:0;height:auto;overflow:hidden}.app>.chat{height:auto;min-height:0;overflow:hidden}.chat>.messages{min-height:0;flex:1;overflow:auto}.chat>.composer{position:relative;flex-shrink:0;background:var(--paper)}}';
  window.scrollTo(0,0);
  return 'layout-ready';
})()`
