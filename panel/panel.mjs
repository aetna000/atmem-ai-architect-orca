const $=id=>document.getElementById(id)
const state={projects:[],selected:'',designs:[],files:[],source:'',mode:'new',opened:false,busy:false,loading:true,owned:false,runtime:'offline',url:''}
let refreshNumber=0
const subscriptions=[]
function notice(text='',error=false){$('failure').hidden=!error||!text;$('failure').textContent=error?text:'';$('progress').hidden=error||!text;$('progress').textContent=error?'':text}
function options(id,items,selected,placeholder){
 const select=$(id);select.replaceChildren(new Option(placeholder,''),...items.map(item=>new Option(item.name,item.id)))
 select.value=selected
}
function render(){
 const existing=state.mode==='folder'
 for(const [id,active]of [['new-tab',!existing],['folder-tab',existing]]){
  $(id).setAttribute('aria-selected',String(active));$(id).tabIndex=active?0:-1;$(id).disabled=state.busy
 }
 $('new-fields').hidden=existing;$('folder-fields').hidden=!existing
 $('project-name').disabled=state.busy||existing;$('project-name').required=!existing
 $('folder').disabled=state.busy||state.loading;options('folder',state.projects,state.selected,state.loading?'Loading folders…':'Choose a folder')
 $('source-field').hidden=state.designs.length<2
 $('source').disabled=state.busy||state.loading;options('source',state.designs.map(d=>({id:d.path,name:d.name})),state.source,'Choose a design')
 $('folder-note').textContent=!state.projects.length?'Open a local folder in Orca, or start a new project here.':!state.selected?'Choose the folder you want to design for.':state.designs.length?'Opens the saved design and keeps your latest Architect edits.':'Starts a blank design. Existing source code is not imported.'
 $('launch').disabled=state.busy||(existing?(state.loading||!state.selected||(state.designs.length>1&&!state.source)):!$('project-name').value.trim())
 $('launch').setAttribute('aria-busy',String(state.busy))
 $('launch-label').textContent=state.busy?'Opening your design…':existing?(state.opened?'Continue in Architect':'Open design in Architect'):'Start designing'
 $('setup-note').hidden=state.opened||state.busy
 $('return-guide').hidden=!state.opened
 $('journey-title').closest('section').hidden=state.opened
 $('headline').replaceChildren(document.createTextNode(state.opened?'Your design ': 'What do you want to '),Object.assign(document.createElement('span'),{textContent:state.opened?'starts here.':'build?'}))
 $('intro').textContent=state.opened?'Continue in the Architect tab. Review your design, then bring the project files back.':'Describe the idea. Architect turns it into a design, requirements and project files.'
 const exported=state.designs.length||state.files.some(f=>f.path==='START_HERE.md'||f.path.startsWith('spec-kit/')||f.path.startsWith('design-documents/'))
 $('documents').hidden=!existing||!state.selected||!exported
 $('file-list').replaceChildren(...state.files.map(file=>{
  const button=document.createElement('button');button.type='button';button.className='file-button';button.textContent=file.label;button.disabled=state.busy
  button.addEventListener('click',()=>act(()=>orca.plugin.request('architect.document',{workspaceId:state.selected,path:file.path})))
  return button
 }))
 $('runtime-label').textContent=state.loading&&!state.url?'Checking runtime…':state.runtime==='ready'?'Running locally':state.runtime==='occupied'?'Port unavailable':'Not running'
 $('runtime-dot').className='dot '+state.runtime
 $('address').textContent=state.url.replace(/^http:\/\//,'')
 $('stop').hidden=!state.owned;$('stop').textContent=state.runtime==='ready'?'Stop':'Reset';$('stop').disabled=state.busy
 $('reload').disabled=state.busy||state.loading
}
async function refresh(){
 const number=++refreshNumber;state.loading=true;render()
 try{
  const data=await orca.plugin.request('architect.overview')
  if(number!==refreshNumber)return
  if(state.opened)for(const added of data.workspaces.filter(w=>!state.projects.some(old=>old.id===w.id))){
   const received=await orca.plugin.request('architect.documents',{workspaceId:added.id})
   if(number!==refreshNumber)return
   if(received.designs.length){state.selected=added.id;notice('Project files received. Review them below.');break}
  }
  Object.assign(state,{projects:data.workspaces,url:data.url,owned:data.owned,runtime:data.runtime})
  if(!state.projects.some(w=>w.id===state.selected))state.selected=state.projects.length===1?state.projects[0].id:''
  if(state.selected){
   const result=await orca.plugin.request('architect.documents',{workspaceId:state.selected})
   if(number!==refreshNumber)return
   state.files=result.documents;state.designs=result.designs
   if(!state.designs.some(d=>d.path===state.source))state.source=state.designs.length===1?state.designs[0].path:''
  }else{state.files=[];state.designs=[];state.source=''}
 }catch(error){if(number===refreshNumber)notice(error.message||'Could not load folders. Reload folders to retry.',true)}
 finally{if(number===refreshNumber){state.loading=false;render()}}
}
async function act(task){
 if(state.busy)return
 state.busy=true;notice();render()
 try{const result=await task();notice(result.message)}catch(error){notice(error.message||'Could not continue. Retry.',true)}
 finally{state.busy=false;render()}
}
function chooseMode(mode){
 state.mode=mode;state.opened=false;notice();render()
 if(mode==='new')$('project-name').focus();else $('folder').focus()
}
$('new-tab').addEventListener('click',()=>chooseMode('new'))
$('folder-tab').addEventListener('click',()=>chooseMode('folder'))
document.querySelector('.switcher').addEventListener('keydown',event=>{
 if(state.busy)return
 if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
  event.preventDefault();const mode=event.key==='Home'?'new':event.key==='End'?'folder':event.target.id==='new-tab'?'folder':'new'
  chooseMode(mode);$(mode==='new'?'new-tab':'folder-tab').focus()
 }
})
$('project-name').addEventListener('input',render)
$('folder').addEventListener('change',()=>{state.selected=$('folder').value;state.source='';state.opened=false;notice();void refresh()})
$('source').addEventListener('change',()=>{state.source=$('source').value;render()})
$('project-form').addEventListener('submit',event=>{
 event.preventDefault();if($('launch').disabled)return
 void act(async()=>{
  notice('Starting Architect… First setup may take a few minutes.')
  const input=state.mode==='folder'?{workspaceId:state.selected,...(state.source?{source:state.source}:{})}:{name:$('project-name').value.trim()}
  const result=await orca.plugin.request('architect.open',input,{timeoutMs:120000})
  state.selected=result.workspaceId||state.selected;state.opened=true;state.mode='folder'
  await refresh();return result
 })
})
$('reload').addEventListener('click',()=>{notice();void refresh()})
$('stop').addEventListener('click',()=>act(async()=>{const result=await orca.plugin.request('architect.stop');await refresh();return result}))
for(const link of document.querySelectorAll('[data-external]'))link.addEventListener('click',event=>{event.preventDefault();void orca.host.call('shell.openExternal',{url:link.href}).catch(error=>notice(error.message,true))})
subscriptions.push(orca.plugin.on('architect.progress',data=>{if(state.busy)notice(data.message)}))
for(const event of ['workspace.changed','workspace.created'])subscriptions.push(orca.on(event,()=>{if(!state.busy)void refresh()}))
window.addEventListener('pagehide',()=>subscriptions.forEach(s=>s.dispose()))
render();void refresh()
