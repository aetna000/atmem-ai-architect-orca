// Timed, one-time invitations in the verified Architect tab opened through Orca.
// A link click records the destination visited, never a claimed star.
export const pluginStarPrompt = `(() => {
  const key='atmem-orca-support-prompts-v2',legacyKey='atmem-orca-plugin-star-v1';
  const seen=new Set();let optedOut=false;
  if(window.__atmemOrcaPluginStar)return 'already-scheduled';
  const readKey=name=>{try{const value=JSON.parse(localStorage.getItem(name)||'{}');return value&&typeof value==='object'?value:{}}catch{return {}}};
  const offers=[
    {id:'orca',after:60000,title:'★ Find us on Orca',text:'Visit the plugin’s Orca page and share your support.',label:'Open on Orca ↗',url:'https://orca.dev/plugins/aetna000/atmem-ai-architect-orca'},
    {id:'github',after:120000,title:'★ Star us on GitHub',text:'If this plugin helps, give its GitHub repository a star.',label:'Star on GitHub ↗',url:'https://github.com/aetna000/atmem-ai-architect-orca'}
  ];
  const eligible=offer=>{
    const value=readKey(key),legacy=readKey(legacyKey);
    return !optedOut&&!seen.has(offer.id)&&!value.never&&!value[offer.id]?.shown&&!legacy.never&&!(Number(legacy.until)>Date.now())&&!(legacy.linkOpened&&(legacy.destination||'github')===offer.id);
  };
  if(!offers.some(eligible))return 'snoozed';
  window.__atmemOrcaPluginStar=true;
  let elapsed=0,last=performance.now(),visible=!document.hidden,timer=null,activeDialog=null,notBefore=0,disposed=false;
  const time=()=>{const now=performance.now();if(visible)elapsed+=now-last;last=now;return elapsed};
  const clear=()=>{if(timer!==null)clearTimeout(timer);timer=null};
  const cleanup=()=>{clear();disposed=true;document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',cleanup)};
  const remember=(offer,extra={})=>{seen.add(offer.id);try{const value=readKey(key);value[offer.id]={...value[offer.id],shown:true,...extra};localStorage.setItem(key,JSON.stringify(value))}catch{}};
  function arm(delay){clear();timer=setTimeout(attempt,delay)}
  function schedule(){
    clear();if(disposed||activeDialog)return;
    const offer=offers.find(eligible);if(!offer){cleanup();return}
    if(document.hidden)return;
    arm(Math.max(0,Math.max(offer.after,notBefore)-time()));
  }
  function attempt(){
    timer=null;if(disposed||activeDialog||document.hidden)return;
    const offer=offers.find(eligible);if(!offer){cleanup();return}
    if(time()<Math.max(offer.after,notBefore)){schedule();return}
    const active=document.activeElement;
    if(document.querySelector('dialog[open],[role="dialog"],.backdrop,[aria-busy="true"],.chat-working-status,.turn-state-icon.has-brain')||(active?.matches('textarea,input,[contenteditable="true"]')&&String(active.value||active.textContent||'').trim())){arm(5000);return}
    show(offer);
  }
  function show(offer){
    const style=document.createElement('style');style.textContent='.atmem-plugin-star{width:min(360px,calc(100vw - 32px));box-sizing:border-box;padding:22px;border:1px solid var(--line,#e2deeb);border-radius:16px;background:var(--paper,#fff);color:var(--ink,#17152f);font:14px/1.45 system-ui,sans-serif;box-shadow:0 18px 60px #14122626}.atmem-plugin-star::backdrop{background:#14122666}.atmem-plugin-star h2{font:700 19px/1.3 system-ui,sans-serif;margin:0 28px 10px 0}.atmem-plugin-star p{margin:0 0 18px;font-size:13px;color:var(--ink-2,#5b5873)}.atmem-plugin-star .star-actions{display:flex;gap:8px;flex-wrap:wrap}.atmem-plugin-star .star-primary,.atmem-plugin-star .star-secondary,.atmem-plugin-star .star-later{padding:9px 12px;border:1px solid var(--line,#e2deeb);border-radius:9px;font:600 13px system-ui,sans-serif;cursor:pointer;text-decoration:none}.atmem-plugin-star .star-primary{background:#cf2464;color:#fff;border-color:#cf2464}.atmem-plugin-star .star-secondary,.atmem-plugin-star .star-later{background:transparent;color:inherit}.atmem-plugin-star .star-dismissals{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:12px}.atmem-plugin-star .star-never{display:block;margin:0;background:none;border:0;padding:3px 0;color:var(--ink-2,#5b5873);font:12px system-ui,sans-serif;text-decoration:underline;cursor:pointer}.atmem-plugin-star .star-close{position:absolute;right:12px;top:10px;background:none;border:0;border-radius:7px;padding:5px 8px;color:inherit;font-size:19px;cursor:pointer}.atmem-plugin-star :focus-visible{outline:2px solid #cf2464;outline-offset:3px}';document.head.append(style);
    const dialog=document.createElement('dialog');dialog.className='atmem-plugin-star';dialog.dataset.destination=offer.id;dialog.setAttribute('aria-labelledby','atmem-plugin-star-title');dialog.setAttribute('aria-describedby','atmem-plugin-star-description');
    const title=document.createElement('h2');title.id='atmem-plugin-star-title';title.textContent=offer.title;
    const text=document.createElement('p');text.id='atmem-plugin-star-description';text.textContent=offer.text;
    const close=document.createElement('button');close.type='button';close.className='star-close';close.setAttribute('aria-label','Close support invitation');close.textContent='×';
    const actions=document.createElement('div');actions.className='star-actions';
    const link=document.createElement('a');link.className='star-primary';link.href=offer.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=offer.label;
    const later=document.createElement('button');later.type='button';later.className='star-later';later.textContent='Not now';
    const never=document.createElement('button');never.type='button';never.className='star-never';never.textContent='Don’t ask again';
    const dismiss=extra=>{remember(offer,extra);dialog.close();dialog.remove();style.remove();activeDialog=null;notBefore=time()+60000;schedule()};
    link.addEventListener('click',()=>dismiss({linkOpened:true}));later.addEventListener('click',()=>dismiss({action:'dismissed'}));close.addEventListener('click',()=>dismiss({action:'dismissed'}));
    never.addEventListener('click',()=>{optedOut=true;try{const value=readKey(key);value.never=true;localStorage.setItem(key,JSON.stringify(value))}catch{}dismiss({action:'disabled'})});
    dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss({action:'dismissed'})});
    dialog.addEventListener('click',event=>{const rect=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom))dismiss({action:'dismissed'})});
    const dismissals=document.createElement('div');dismissals.className='star-dismissals';dismissals.append(later,never);
    actions.append(link);dialog.append(close,title,text,actions,dismissals);document.body.append(dialog);activeDialog=dialog;dialog.showModal();remember(offer);later.focus();
  }
  function visibility(){time();visible=!document.hidden;last=performance.now();schedule()}
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',cleanup);schedule();
  return 'scheduled';
})()`
