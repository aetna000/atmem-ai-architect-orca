import type {OrcaWorkerApi} from 'orca/worker'
import {lstat, realpath} from 'node:fs/promises'
import {resolve, relative, sep} from 'node:path'
import type {Document} from './protocol'

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
  probe: (url:string)=>Promise<'ready'|'offline'|'occupied'>
  openBrowser:(url:string,workspaceId:string)=>Promise<void>
  closeTerminal:(terminalId:string)=>Promise<boolean>
}
export function createController(orca:OrcaWorkerApi, deps:Dependencies) {
  let starting:Promise<{message:string}>|undefined
  async function configuration() {
    const {settings}=await orca.host.call('settings.get',{})
    const port=settings.port ?? 5174
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
  const overview=async()=>({workspaces:(await workspaces()).map(({id,name,project,path})=>{const label=project||path.split(/[\\/]/).filter(Boolean).at(-1);return {id,name:label===name?name:`${label} · ${name}`}}),url:(await configuration()).url})
  const start=async(input:{workspaceId:string})=>{
    if(starting)return starting
    starting=(async()=>{
      const ws=await workspace(input.workspaceId),config=await configuration()
      const state=await deps.probe(config.url)
      if(state==='ready')return {message:'Architect is running. Open Architect.'}
      if(state==='occupied')throw Error('That port serves another app. Change the Architect port in plugin settings.')
      if(await orca.storage.get('session'))throw Error('Stop the previous Architect terminal before restarting.')
      const {terminalId}=await orca.host.call('terminal.create',{workspaceId:ws.id,title:'AtMem AI Architect',command:`npx --yes @atmem/architect@0.2.1 --no-open --port ${config.port}`})
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
  const open=async(input:{workspaceId:string})=>{
    const ws=await workspace(input.workspaceId),{url}=await configuration()
    const state=await deps.probe(url)
    if(state!=='ready')throw Error(state==='occupied'?'That port serves another app. Change the Architect port.':'Architect is not ready. Check its terminal, then try again.')
    await orca.host.call('workspace.open',{workspaceId:ws.id})
    await deps.openBrowser(url,ws.id)
    return {message:'Opened Architect in Orca. Delivery → Open in Orca returns the project files.'}
  }
  const documents=async(input:{workspaceId:string})=>{
    await workspace(input.workspaceId)
    const documents:Document[]=[]
    for(const doc of DOCUMENTS){try{await safeDocument(input.workspaceId,doc.path);documents.push(doc)}catch(error){if((error as {code?:string}).code==='EACCES')throw error}}
    return {documents}
  }
  const document=async(input:{workspaceId:string;path:string})=>{
    const {ws,path}=await safeDocument(input.workspaceId,input.path)
    await orca.host.call('workspace.open',{workspaceId:ws.id})
    await orca.host.call('editor.open',{workspaceId:ws.id,path})
    return {message:'Opened project document.'}
  }
  return {overview,start,stop,open,documents,document}
}
