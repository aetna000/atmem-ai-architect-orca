// Use Architect's native new-project transition so requirements, chat and memory get a new project scope.
export const boardReset = `(() => {
  if(window.__atmemBoardReset)return 'reset-ready';
  window.__atmemBoardReset=true;
  const style=document.createElement('style');
  style.textContent='.toolbar .atmem-reset-board{display:inline-flex;align-items:center;gap:7px;min-width:0;height:36px;padding:7px 11px;border:1px solid #e7b6c7;border-radius:10px;background:var(--paper);color:#b22b59;font:600 12px system-ui,sans-serif}.atmem-reset-board svg{width:16px;height:16px;flex:none}.toolbar button[aria-label="Clear board"],.chat-head button[aria-label="Clear chat view"]{display:none!important}.atmem-reset-board:disabled{opacity:.5;cursor:not-allowed}';
  document.head.append(style);
  const bin=()=>{
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('fill','none');svg.setAttribute('stroke','currentColor');svg.setAttribute('stroke-width','1.8');svg.setAttribute('aria-hidden','true');
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d','M3 6h18M9 6V4h6v2M5 6l1 14h12l1-14M10 10v6m4-6v6');svg.append(path);return svg;
  };
  const install=()=>{
    const tools=document.querySelector('.toolbar[aria-label="Tools"]');
    if(!tools)return;
    let button=tools.querySelector('.atmem-reset-board');
    if(!button){
      button=document.createElement('button');button.type='button';button.className='atmem-reset-board';button.setAttribute('aria-label','Reset board and context');button.title='Start a fresh board and conversation. Saved projects remain available.';
      const label=document.createElement('span');label.textContent='Reset board';button.append(bin(),label);tools.prepend(button);
      button.addEventListener('click',()=>{
        if(button.disabled||document.querySelector('[role="dialog"]'))return;
        let original;try{original=JSON.parse(localStorage.getItem('atforma-workspace-v3')||'null')?.id}catch{}
        const more=document.querySelector('button[aria-label="More"]');if(!more)return;
        let chose=false;
        const transition=new MutationObserver(()=>requestAnimationFrame(()=>{
          if(!chose){
            const item=[...document.querySelectorAll('[role="menuitem"]')].find(e=>e.textContent.trim()==='New project');
            if(item){if(item.disabled){transition.disconnect();return}chose=true;item.click()}
          }
          const dialog=document.querySelector('[role="dialog"][aria-label="start-over"]');
          if(dialog&&!dialog.dataset.atmemReset){
            dialog.dataset.atmemReset='true';
            dialog.querySelector('h2').textContent='Reset board and context?';
            dialog.querySelector('p').textContent='Start fresh with an empty board, conversation, requirements and decisions. Your model connection stays.';
            const confirm=dialog.querySelector('button[aria-label="Start over without download"]');
            if(confirm){confirm.setAttribute('aria-label','Confirm reset board and context');confirm.replaceChildren(bin(),document.createTextNode(' Reset board'));}
            const fine=dialog.querySelector('.modal-fine');if(fine)fine.textContent='Previous saved projects remain available in Projects.';
          }
          let current;try{current=JSON.parse(localStorage.getItem('atforma-workspace-v3')||'null')}catch{return}
          if(original&&current?.id&&current.id!==original){
            transition.disconnect();
            document.getElementById('atmem-example-actions')?.remove();document.getElementById('atmem-example-style')?.remove();
            const url=new URL(location.href);url.searchParams.delete('example');url.searchParams.delete('project');history.replaceState(null,'',url);
            document.querySelector('textarea[aria-label="Your message"]')?.focus();
          }else if(chose&&!dialog&&!document.querySelector('[role="menu"]')){
            // The user cancelled; no project state is changed by this helper.
            transition.disconnect();
          }
        }));
        transition.observe(document.body,{childList:true,subtree:true});more.click();
      });
    }
    const original=document.querySelector('button[aria-label="Clear board"]');
    const active=!!document.querySelector('.chat-working-status,.intake-status')||(document.querySelectorAll('.react-flow__node').length>0&&!!original?.disabled);
    if(button.disabled!==active)button.disabled=active;
  };
  install();new MutationObserver(install).observe(document.body,{childList:true,subtree:true});
  return 'reset-ready';
})()`
