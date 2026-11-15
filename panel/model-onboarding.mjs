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

export const exampleWelcome = `(() => {
  if (document.getElementById('atmem-example-actions')) return 'example-ready';
  const host=document.querySelector('.bar-actions');
  if (!host) throw Error('Project toolbar is unavailable.');
  const style=document.createElement('style');style.id='atmem-example-style';
  style.textContent='.atmem-example-actions{display:flex;align-items:center;gap:8px}.atmem-example-label{font-size:11px;color:var(--ink-2);white-space:nowrap}.atmem-create-project{font:600 12px system-ui,sans-serif;padding:8px 11px;border:1px solid var(--accent);border-radius:9px;color:var(--accent);background:var(--paper);white-space:nowrap}@media(max-width:650px){.atmem-example-label{display:none}.atmem-create-project{font-size:11px;padding:6px}.bar .project-name{max-width:90px!important}}';
  document.head.append(style);
  const actions=document.createElement('div');actions.id='atmem-example-actions';actions.className='atmem-example-actions';
  const label=document.createElement('span');label.className='atmem-example-label';label.textContent='AI example · sample design';
  const button=document.createElement('button');button.type='button';button.className='atmem-create-project';button.textContent='Create new project';
  actions.append(label,button);host.prepend(actions);
  button.addEventListener('click',()=>{
    const more=document.querySelector('button[aria-label="More"]');
    if(!more)return;
    const choose=()=>{
      const action=[...document.querySelectorAll('[role="menuitem"]')].find(e=>e.textContent.trim()==='New project');
      if(!action)return false;
      action.click();return true;
    };
    more.click();
    if(!choose()){
      const menu=new MutationObserver(()=>{if(choose())menu.disconnect()});menu.observe(document.body,{childList:true,subtree:true});
      setTimeout(()=>menu.disconnect(),5000);
    }
    const original=new URL(location.href).searchParams.get('project');
    const leaving=new MutationObserver(()=>requestAnimationFrame(()=>{
      let current;try{current=JSON.parse(localStorage.getItem('atforma-workspace-v3')||'null')}catch{return}
      if(!current?.id||current.id===original)return;
      leaving.disconnect();actions.remove();style.remove();
      const next=new URL(location.href);next.searchParams.delete('example');next.searchParams.delete('project');history.replaceState(null,'',next);
      const model=document.querySelector('button.model');
      if(model?.textContent.trim()==='Connect a model'&&!document.querySelector('[role="dialog"]'))model.click();
      document.querySelector('input[aria-label="Project name"]')?.focus();
    }));leaving.observe(document.body,{childList:true,subtree:true});
  });
  return 'example-ready';
})()`
