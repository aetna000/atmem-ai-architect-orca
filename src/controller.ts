import type {OrcaWorkerApi} from 'orca/worker'
import {lstat, realpath} from 'node:fs/promises'
import {resolve, relative, sep, isAbsolute} from 'node:path'
import type {Document} from './protocol'
import {createHash} from 'node:crypto'
import {designSources, readDesign, connectDesign} from './project-bridge'
import type {ProjectFile} from './project-bridge'
import {templateProject,readyExampleProject} from './templates'

export const DOCUMENTS: Document[] = [
  {path:'START_HERE.md',label:'Start here'},
  {path:'design-documents/spec-kit/implementation-spec.md',label:'Implementation specification'},
  {path:'design-documents/spec-kit/spec.md',label:'Specification'},
  {path:'design-documents/spec-kit/plan.md',label:'Plan'},
  {path:'design-documents/spec-kit/tasks.json',label:'Tasks'},
  {path:'spec-kit/implementation-spec.md',label:'Implementation specification'},
  {path:'specification.md',label:'Requirements and design'},
  {path:'spec-kit/spec.md',label:'Specification'},
  {path:'spec-kit/plan.md',label:'Plan'},
  {path:'spec-kit/tasks.json',label:'Tasks'},
  {path:'implementation/README.md',label:'Run instructions'},
  {path:'README.md',label:'README'},
]
export type Dependencies = {
  probe: (url:string)=>Promise<'ready'|'offline'|'occupied'|'outdated'>
  openBrowser:(url:string,workspaceId:string)=>Promise<void>
  closeTerminal:(terminalId:string)=>Promise<boolean>
  connectDesign?:(url:string,file:ProjectFile|undefined,id:string|undefined,name:string)=>Promise<string>
  chooseFolder?:(signal?:AbortSignal)=>Promise<string|undefined>
  registerWorkspace?:(path:string,signal?:AbortSignal)=>Promise<string>
  createWorkspace?:(name:string)=>Promise<string>
  progress?:(message:string)=>void
  wait?:()=>Promise<void>
}
export function createController(orca:OrcaWorkerApi, deps:Dependencies) {
  let starting:Promise<{message:string}>|undefined
  let opening:Promise<{message:string;workspaceId:string;projectId:string}>|undefined
  async function configuration() {
    const {settings}=await orca.host.call('settings.get',{})
    const port=settings.port ?? 5176
    if(!Number.isInteger(port)||Number(port)<1024||Number(port)>65535)throw Error('Choose a port between 1024 and 65535 in plugin settings.')
    return {port:Number(port),url:`http://127.0.0.1:${port}`}
  }
  async function workspaces() {
    const result=await orca.host.call('workspace.list',{})
    if(result.truncated)throw Error('Workspace list is incomplete. Reduce the workspace count and refresh.')
    return result.workspaces.filter(w=>w.hostId===null||w.hostId==='local')
  }
  async function workspace(id:string) {
    if(typeof id!=='string')throw Error('Select a local project.')
    const found=(await workspaces()).find(w=>w.id===id)
    if(!found)throw Error('Select a local project and refresh.')
    return found
  }
  async function safeDocument(workspaceId:string,path:string) {
    if(!DOCUMENTS.some(d=>d.path===path))throw Error('Choose a listed project document.')
    const ws=await workspace(workspaceId),root=await realpath(ws.path)
    let current=root
    for(const part of path.split('/')) {
      current=resolve(current,part)
      if((await lstat(current)).isSymbolicLink())throw Error('Linked documents cannot be opened by this plugin.')
    }
    const target=await realpath(current),rel=relative(root,target)
    if(rel==='..'||rel.startsWith('..'+sep)||!(await lstat(target)).isFile())throw Error('Choose a regular project document.')
    return {ws,path}
  }
  let browsing=false
  const browse=async(input:{path?:string}|null={},signal?:AbortSignal)=>{
    if(browsing||opening)throw Error('Finish the current folder action first.')
    browsing=true
    try{
      const path=input?.path===undefined?await deps.chooseFolder?.(signal):input.path
      if(path===undefined)return {cancelled:true as const}
      if(typeof path!=='string'||!isAbsolute(path))throw Error('Enter an absolute folder path.')
      let root:string
      try{root=await realpath(path);if(!(await lstat(root)).isDirectory())throw Error('not-directory')}
      catch{throw Error('Choose an existing folder you can access.')}
      signal?.throwIfAborted()
      for(const ws of await workspaces()){
        try{if(await realpath(ws.path)===root)return {cancelled:false as const,workspaceId:ws.id}}catch{/* Ignore unavailable existing folders. */}
      }
      signal?.throwIfAborted()
      if(!deps.registerWorkspace)throw Error('Add this folder to Orca, then refresh folders.')
      return {cancelled:false as const,workspaceId:await deps.registerWorkspace(root,signal)}
    }finally{browsing=false}
  }
  const overview=async()=>{
    const {url}=await configuration()
    const entries=await Promise.all((await workspaces()).map(async({id,name,project,path})=>{
      const label=project||path.split(/[\\/]/).filter(Boolean).at(-1)
      const key='workspace-meta-'+createHash('sha256').update(resolve(path)).digest('hex')
      const saved=await orca.storage.get(key) as {openedAt?:number;name?:string}|null
      let modified:number|null=null
      try{const stat=await lstat(path);modified=stat.mtimeMs}catch{/* Keep unavailable folders visible. */}
      const opened=typeof saved?.openedAt==='number'&&Number.isFinite(saved.openedAt)?saved.openedAt:null
      return {id,path:resolve(path),name:saved?.name||(label===name?name:`${label} · ${name}`),updatedAt:opened??modified,dateKind:opened?'opened' as const:'folder' as const}
    }))
    entries.sort((a,b)=>(b.updatedAt??0)-(a.updatedAt??0)||a.name.localeCompare(b.name)||a.id.localeCompare(b.id))
    return {workspaces:entries,url,owned:!!(await orca.storage.get('session')),runtime:await deps.probe(url)}
  }
  const start=async(input:{workspaceId:string})=>{
    if(starting)return starting
    starting=(async()=>{
      const ws=await workspace(input.workspaceId),config=await configuration()
      const state=await deps.probe(config.url)
      if(state==='ready')return {message:'Architect is running. Open Architect.'}
      if(state==='outdated')throw Error('Stop the older Architect runtime, then reopen to update to 0.2.5.')
      if(state==='occupied')throw Error('That port serves another app. Change the Architect port in plugin settings.')
      if(await orca.storage.get('session'))throw Error('Stop the previous Architect terminal before restarting.')
      const {terminalId}=await orca.host.call('terminal.create',{workspaceId:ws.id,title:'AtMem AI Architect',command:`npx --yes @atmem/architect@0.2.5 --no-open --port ${config.port}`})
      await orca.storage.set('session',{terminalId})
      return {message:'Starting in its terminal. When ready, open Architect.'}
    })()
    try{return await starting}finally{starting=undefined}
  }
  const stop=async()=>{
    const session=await orca.storage.get('session') as {terminalId?:string}|null
    if(!session?.terminalId)return {message:'No Architect terminal was started by this plugin.'}
    const closed=await deps.closeTerminal(session.terminalId)
    await orca.storage.delete('session')
    return {message:closed?'Architect terminal closed.':'Architect terminal is already closed.'}
  }
  const open=async(input:{workspaceId?:string;name?:string;source?:string;template?:string;example?:boolean})=>{
    if(opening)throw Error('A design is already opening. Wait for it to finish.')
    opening=(async()=>{
      if(input.example&&input.template!=='knowledge-assistant')throw Error('Choose the ready AI example.')
      if(input.template&&input.workspaceId)throw Error('Start a template as a new project.')
      const template=input.example?await readyExampleProject():input.template?await templateProject(input.template):undefined
      let workspaceId=input.workspaceId
      if(!workspaceId) {
        const name=input.name?.trim()
        if(!name||name.length>100)throw Error('Name your project using 1–100 characters.')
        if(!deps.createWorkspace)throw Error('Open a local folder in Orca first.')
        const draftKey='new-'+createHash('sha256').update(input.template?name+'\n'+input.template:name).digest('hex')
        const previous=await orca.storage.get(draftKey)
        const available=await workspaces()
        workspaceId=typeof previous==='string'&&available.some(w=>w.id===previous)?previous:await deps.createWorkspace(name)
        await orca.storage.set(draftKey,workspaceId)
      }
      const ws=await workspace(workspaceId),{url}=await configuration(),sources=await designSources(ws.path)
      const source=input.source||(sources.length===1?sources[0].path:undefined)
      if(!source&&sources.length>1)throw Error('Choose which saved design to open.')
      if(source&&!sources.some(s=>s.path===source))throw Error('Design file is no longer available. Refresh folders.')
      // Validate the selected file before starting or opening anything.
      const file=template||(source?await readDesign(ws.path,source):undefined)
      if(template&&!input.example&&input.name?.trim())template.meta.name=input.name.trim()
      const key='design-'+createHash('sha256').update(url+'\n'+await realpath(ws.path)+'\n'+(source||(input.template?'template:'+input.template:'blank'))).digest('hex')
      const linked=await orca.storage.get(key)
      const name=input.name?.trim()||ws.project||ws.name
      deps.progress?.('Starting Architect… First setup may take a few minutes.')
      if(await deps.probe(url)==='outdated') {
        if(!await orca.storage.get('session'))throw Error('Stop the older Architect runtime on this port, then retry to update to 0.2.5.')
        deps.progress?.('Updating Architect… Your saved projects stay in place.')
        await stop()
        const closing=Date.now()+15000
        while(await deps.probe(url)!=='offline'){
          if(Date.now()>=closing)throw Error('The older runtime is still closing. Retry in a moment.')
          await (deps.wait?.()||new Promise(r=>setTimeout(r,500)))
        }
      }
      if(await deps.probe(url)!=='ready'&&!await orca.storage.get('session'))await start({workspaceId:ws.id})
      const deadline=Date.now()+65000
      while(true) {
        const state=await deps.probe(url)
        if(state==='ready')break
        if(state==='outdated')throw Error('Stop the older Architect runtime, then retry to update to 0.2.5.')
        if(state==='occupied')throw Error('Another app uses this port. Change Architect port under plugin settings, then retry.')
        if(Date.now()>=deadline)throw Error('Setup is still running. Wait, then retry. Open the Architect terminal if setup failed.')
        await (deps.wait?.()||new Promise(r=>setTimeout(r,1000)))
      }
      deps.progress?.('Loading your design…')
      const projectId=await (deps.connectDesign||connectDesign)(url,file,!input.example&&typeof linked==='string'?linked:undefined,name)
      await orca.storage.set(key,projectId)
      await orca.host.call('workspace.open',{workspaceId:ws.id})
      await deps.openBrowser(url+'/?project='+encodeURIComponent(projectId)+(input.example?'&example=1':''),ws.id)
      const metadataKey='workspace-meta-'+createHash('sha256').update(resolve(ws.path)).digest('hex')
      const metadata=await orca.storage.get(metadataKey) as {name?:string}|null
      const displayName=input.name?.trim()||file?.meta.name||metadata?.name
      await orca.storage.set(metadataKey,{openedAt:Date.now(),...(displayName?{name:displayName}:{})})
      return {message:file||linked?'Your design is open. Continue in the Architect tab.':'Your blank design is open. Describe what you want to build.',workspaceId:ws.id,projectId}
    })()
    try{return await opening}finally{opening=undefined}
  }
  const documents=async(input:{workspaceId:string})=>{
    await workspace(input.workspaceId)
    const documents:Document[]=[]
    for(const doc of DOCUMENTS){try{await safeDocument(input.workspaceId,doc.path);documents.push(doc)}catch(error){if((error as {code?:string}).code==='EACCES')throw error}}
    return {documents,designs:await designSources((await workspace(input.workspaceId)).path)}
  }
  const document=async(input:{workspaceId:string;path:string})=>{
    const {ws,path}=await safeDocument(input.workspaceId,input.path)
    await orca.host.call('workspace.open',{workspaceId:ws.id})
    await orca.host.call('editor.open',{workspaceId:ws.id,path})
    return {message:'Opened project document.'}
  }
  return {overview,start,stop,open,documents,document,browse}
}
