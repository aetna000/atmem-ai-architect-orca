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
  style.textContent += '.chat>.composer{padding:6px 8px;border-radius:14px}.chat>.composer textarea{min-height:32px;height:32px;max-height:120px;padding:4px 6px;font-size:14px;line-height:20px;resize:none;overflow-y:auto}.chat>.composer .composer-actions{padding-top:2px}.chat>.composer .composer-actions button{width:32px;height:32px;min-height:32px;padding:6px}';
  style.textContent += '.chat>.chat-head{display:flex;flex-direction:row;align-items:center;justify-content:flex-start;flex-wrap:wrap;gap:4px 6px;padding:4px 8px;min-height:0}.chat-head>.chat-heading-row{display:contents}.chat-head .chat-title{display:none}.chat-head>.model{order:0;max-width:100%;font-size:12px;line-height:18px;min-height:26px;padding:3px 7px;margin:0}.chat-head>.live-toggle{order:1;flex:0 0 auto;width:auto;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;font-size:11px;line-height:18px;padding:0;margin:0}.chat-head .live-toggle input{width:13px;height:13px;margin:0}.chat-head .icon{order:2;width:26px;height:26px;min-height:26px;padding:4px;margin:0}.chat-head .icon svg{width:15px;height:15px}.chat>.skills{display:flex;align-items:center;flex-wrap:nowrap;overflow-x:auto;gap:3px;padding:2px 8px 4px;margin:0;min-height:0;background:transparent;border-radius:0}.chat>.skills .known-bar,.chat>.skills .skill{flex:0 0 auto;width:auto;font-size:11px;line-height:16px;min-height:24px;padding:3px 6px;margin:0;gap:4px;border-radius:7px}.chat>.skills svg{width:13px;height:13px}';
  style.textContent += '.msg.atmem-intro-collapsed>:not(.atmem-intro-toggle){display:none!important}.msg.atmem-intro-collapsed{padding:0 6px!important;margin:0!important;min-height:0!important;border:0!important}.msg .atmem-intro-toggle{display:flex;align-items:center;gap:5px;background:transparent;color:var(--ink-2);font-size:11px;line-height:18px;min-height:26px;padding:3px 0;border:0;border-radius:4px}';
  style.textContent += '@media(max-width:900px){.app:has(>.chat.atmem-chat-idle){grid-template-rows:auto auto minmax(100px,1fr) auto}.app>.chat.atmem-chat-idle{height:auto;min-height:0;}.chat.atmem-chat-idle>.messages{flex:0 0 auto;height:auto;min-height:0;max-height:100px;padding:2px 8px}.chat.atmem-chat-idle .message-list{min-height:0;padding:0;gap:0}.chat.atmem-chat-idle .voice-status:empty{display:none}}';
  const collapseIntroduction=()=>{
    const chat=document.querySelector('.app>.chat');
    const entries=chat?.querySelectorAll('.message-list>.msg');
    const onlyIntroduction=entries?.length===1&&entries[0].parentElement.children.length===1&&entries[0].classList.contains('atmem-intro-collapsed');
    chat?.classList.toggle('atmem-chat-idle',!!onlyIntroduction);
    const message=document.querySelector('.chat .message-list>.msg');
    if(!message?.classList.contains('assistant')||message.querySelector('.atmem-intro-toggle'))return;
    if(!message.textContent.includes('What kinds of documents arrive, and how many a month?')&&!message.textContent.includes('What would you like to build?'))return;
    message.classList.add('atmem-intro-collapsed');
    const toggle=document.createElement('button');toggle.type='button';toggle.className='atmem-intro-toggle';toggle.textContent='▸ Architect introduction';toggle.setAttribute('aria-expanded','false');
    toggle.addEventListener('click',()=>{
      const collapsed=message.classList.toggle('atmem-intro-collapsed');toggle.setAttribute('aria-expanded',String(!collapsed));toggle.textContent=(collapsed?'▸':'▾')+' Architect introduction';chat?.classList.toggle('atmem-chat-idle',collapsed&&chat.querySelectorAll('.message-list>.msg').length===1);
    });message.prepend(toggle);chat?.classList.add('atmem-chat-idle');
  };
  if(!window.__atmemIntroCollapseV2){window.__atmemIntroCollapseV2=true;new MutationObserver(collapseIntroduction).observe(document.body,{childList:true,subtree:true});}
  collapseIntroduction();
  const resize=()=>{
    const input=document.querySelector('.chat>.composer textarea');if(!input)return;
    input.style.height='32px';input.style.height=Math.min(120,Math.max(32,input.scrollHeight))+'px';
  };
  if(!window.__atmemCompactComposer){
    window.__atmemCompactComposer=true;
    let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;resize()})};
    document.addEventListener('input',event=>{if(event.target.matches?.('.chat>.composer textarea'))resize()});
    window.addEventListener('resize',schedule);
    new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  resize();
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
  const label=document.createElement('span');label.className='atmem-example-label';label.textContent='Complete AI example';
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

// Local authenticated delivery uses the immutable prepared reference, even after a user edits the board.
export function exampleDownload(receipt) {
 return `(() => {
  const host=document.getElementById('atmem-example-actions');if(!host||document.getElementById('atmem-example-download'))return;
  const receipt=${JSON.stringify(receipt)};
  const button=document.createElement('button');button.id='atmem-example-download';button.type='button';button.className='atmem-create-project';button.textContent='Download example ZIP';button.title='Prepared reference: code, infrastructure, cost worksheet and local test evidence';host.prepend(button);
  const mountChecks=()=>{
    const delivery=document.querySelector('[aria-label="Implementation delivery"]');
    if(!delivery||delivery.querySelector('#atmem-reference-checks'))return;
    const section=document.createElement('section');section.id='atmem-reference-checks';section.className='final-checklist';section.setAttribute('aria-label','Prepared example checklist');
    const heading=document.createElement('h3');heading.textContent='Prepared example · ready to download';section.append(heading);
    const note=document.createElement('p');note.textContent='Checks below apply to the bundled reference ZIP. Your current project checks are shown separately.';section.append(note);
    const list=document.createElement('ul');
    for(const [name,status] of [['Requirements','Recorded'],['Cloud','AWS'],['Data country','Australia'],['Cloud region','Sydney'],['Cost worksheet','Complete · USD 7.56/month sample'],['Implementation','Source + built runtime included'],['Application checks','13 local tests passed'],['Terraform checks','Validated · 2 mock plans passed']]){
      const row=document.createElement('li');const mark=document.createElement('span');mark.className='check-complete';mark.textContent='✓';const label=document.createElement('span');label.textContent=name;const value=document.createElement('strong');value.textContent=status;row.style.cssText='display:flex;gap:10px;align-items:center;padding:10px 0';label.style.flex='1';row.append(mark,label,value);list.append(row);
    }
    section.append(list);const download=document.createElement('button');download.className='btn primary';download.textContent='Download complete example';download.onclick=()=>button.click();section.append(download);
    const scope=document.createElement('p');scope.textContent='Local checks use fixtures and mocked AWS. Live deployment and real tenant integration have not run. The cost worksheet includes explicit usage assumptions and price sources.';section.append(scope);delivery.prepend(section);
  };
  mountChecks();const observer=new MutationObserver(mountChecks);observer.observe(document.body,{childList:true,subtree:true});
  const removeObserver=new MutationObserver(()=>{if(!document.getElementById('atmem-example-actions')){observer.disconnect();removeObserver.disconnect();document.getElementById('atmem-reference-checks')?.remove()}});removeObserver.observe(document.body,{childList:true,subtree:true});
  button.addEventListener('click',async()=>{
    button.disabled=true;button.textContent='Preparing download…';
    try{
      const session=await fetch('/api/session').then(r=>{if(!r.ok)throw Error('Local session unavailable');return r.json()});
      const response=await fetch('/api/engineering/download',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.token},body:JSON.stringify({projectId:receipt.projectId,sessionId:receipt.sessionId,artifactId:receipt.artifactId})});
      if(!response.ok)throw Error('Prepared download unavailable. Reopen the example from Orca.');
      const bytes=await response.arrayBuffer();const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
      if(hash!==receipt.sha256)throw Error('Download integrity check failed');
      const url=URL.createObjectURL(new Blob([bytes],{type:'application/zip'}));const link=document.createElement('a');link.href=url;link.download='atmem-ai-complete-example.zip';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);button.textContent='Download example ZIP';
    }catch(error){button.textContent='Retry download';button.title=error.message;alert(error.message)}finally{button.disabled=false}
  });
})()`;
}
