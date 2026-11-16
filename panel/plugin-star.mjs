// Installed only in the verified Architect tab opened by the Orca plugin.
// Uses local preferences; following the link does not claim a star was given.
export const pluginStarPrompt = `(() => {
  const key='atmem-orca-plugin-star-v1';
  if(window.__atmemOrcaPluginStar)return 'already-scheduled';
  const read=()=>{try{return JSON.parse(localStorage.getItem(key)||'{}')||{}}catch{return {}}};
  const eligible=()=>{const value=read();return !value.never&&!value.linkOpened&&!(Number(value.until)>Date.now())};
  if(!eligible())return 'snoozed';
  window.__atmemOrcaPluginStar=true;
  let remaining=60000,started=0,timer=null,shown=false;
  const pause=()=>{if(timer!==null){clearTimeout(timer);timer=null;remaining=Math.max(0,remaining-(performance.now()-started))}};
  const cleanup=()=>{pause();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',cleanup)};
  const remember=value=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
  function show(){
    timer=null;remaining=0;
    if(shown||!eligible()){cleanup();return}
    if(document.hidden)return;
    const active=document.activeElement;
    if(document.querySelector('dialog[open],[role="dialog"],.backdrop,[aria-busy="true"],.chat-working-status,.turn-state-icon.has-brain')||(active?.matches('textarea,input,[contenteditable="true"]')&&String(active.value||active.textContent||'').trim())){
      started=performance.now();timer=setTimeout(show,5000);return;
    }
    shown=true;cleanup();
    const style=document.createElement('style');style.textContent='.atmem-plugin-star{width:min(360px,calc(100vw - 32px));box-sizing:border-box;padding:22px;border:1px solid var(--line,#e2deeb);border-radius:16px;background:var(--paper,#fff);color:var(--ink,#17152f);font:14px/1.45 system-ui,sans-serif;box-shadow:0 18px 60px #14122626}.atmem-plugin-star::backdrop{background:#14122666}.atmem-plugin-star h2{font:700 19px/1.3 system-ui,sans-serif;margin:0 28px 10px 0}.atmem-plugin-star p{margin:0 0 18px;font-size:13px;color:var(--ink-2,#5b5873)}.atmem-plugin-star .star-actions{display:flex;gap:8px;flex-wrap:wrap}.atmem-plugin-star .star-primary,.atmem-plugin-star .star-secondary,.atmem-plugin-star .star-later{padding:9px 12px;border:1px solid var(--line,#e2deeb);border-radius:9px;font:600 13px system-ui,sans-serif;cursor:pointer;text-decoration:none}.atmem-plugin-star .star-primary{background:#cf2464;color:#fff;border-color:#cf2464}.atmem-plugin-star .star-secondary,.atmem-plugin-star .star-later{background:transparent;color:inherit}.atmem-plugin-star .star-dismissals{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px}.atmem-plugin-star .star-never{display:block;margin:0;background:none;border:0;padding:3px 0;color:var(--ink-2,#5b5873);font:12px system-ui,sans-serif;text-decoration:underline;cursor:pointer}.atmem-plugin-star .star-close{position:absolute;right:12px;top:10px;background:none;border:0;border-radius:7px;padding:5px 8px;color:inherit;font-size:19px;cursor:pointer}.atmem-plugin-star :focus-visible{outline:2px solid #cf2464;outline-offset:3px}';document.head.append(style);
    const dialog=document.createElement('dialog');dialog.className='atmem-plugin-star';dialog.setAttribute('aria-labelledby','atmem-plugin-star-title');dialog.setAttribute('aria-describedby','atmem-plugin-star-description');
    const title=document.createElement('h2');title.id='atmem-plugin-star-title';title.textContent='★ Support this plugin';
    const text=document.createElement('p');text.id='atmem-plugin-star-description';text.textContent='Visit our Orca page, or star the plugin on GitHub.';
    const close=document.createElement('button');close.type='button';close.className='star-close';close.setAttribute('aria-label','Close star invitation');close.textContent='×';
    const actions=document.createElement('div');actions.className='star-actions';
    const orcaLink=document.createElement('a');orcaLink.className='star-primary';orcaLink.href='https://orca.dev/plugins/aetna000/atmem-ai-architect-orca';orcaLink.target='_blank';orcaLink.rel='noopener noreferrer';orcaLink.textContent='Open on Orca ↗';
    const link=document.createElement('a');link.className='star-secondary';link.href='https://github.com/aetna000/atmem-ai-architect-orca';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Star on GitHub ↗';
    const later=document.createElement('button');later.type='button';later.className='star-later';later.textContent='Not now';
    const never=document.createElement('button');never.type='button';never.className='star-never';never.textContent='Don’t ask again';
    const dismiss=value=>{remember(value);dialog.close();dialog.remove();style.remove()};
    const snooze=()=>dismiss({until:Date.now()+30*24*60*60*1000});
    orcaLink.addEventListener('click',()=>dismiss({linkOpened:true,destination:'orca'}));link.addEventListener('click',()=>dismiss({linkOpened:true,destination:'github'}));later.addEventListener('click',snooze);close.addEventListener('click',snooze);never.addEventListener('click',()=>dismiss({never:true}));
    dialog.addEventListener('cancel',event=>{event.preventDefault();snooze()});
    dialog.addEventListener('click',event=>{const rect=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))snooze()});
    const dismissals=document.createElement('div');dismissals.className='star-dismissals';dismissals.append(later,never);
    actions.append(orcaLink,link);dialog.append(close,title,text,actions,dismissals);document.body.append(dialog);dialog.showModal();later.focus();
  }
  function resume(){if(shown||!eligible()||document.hidden)return;started=performance.now();timer=setTimeout(show,remaining)}
  function visibility(){pause();if(!document.hidden)resume()}
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',cleanup);resume();
  return 'scheduled';
})()`
