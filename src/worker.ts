import type {OrcaWorkerApi} from 'orca/worker'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {createController} from './controller'
import {mkdir, mkdtemp, realpath} from 'node:fs/promises'
import {homedir} from 'node:os'
import {join} from 'node:path'
import {modelSetupReady,openModelSetup} from '../panel/model-onboarding.mjs'
const run=promisify(execFile)
export async function probe(url:string):Promise<'ready'|'offline'|'occupied'> {
  try {
    const response=await fetch(url,{signal:AbortSignal.timeout(1800),redirect:'error'})
    const reader=response.body?.getReader()
    if(!reader)return 'occupied'
    let text='',bytes=0
    try{while(true){const {value,done}=await reader.read();if(done)break;bytes+=value.length;if(bytes>65536)return 'occupied';text+=new TextDecoder().decode(value)}}finally{await reader.cancel()}
    return response.ok&&text.includes('<title>AtMem.ai | AI Architect</title>')?'ready':'occupied'
  }catch(error){return (error as {cause?:{code?:string}}).cause?.code==='ECONNREFUSED'?'offline':'occupied'}
}
export default function activate(orca:OrcaWorkerApi) {
  const controller=createController(orca,{
    probe,
    progress:message=>orca.panels.post('architect.progress',{message}),
    createWorkspace:async name=>{
      const parent=join(homedir(),'.atmem-architect','orca-projects')
      await mkdir(parent,{recursive:true,mode:0o700})
      const path=await realpath(await mkdtemp(join(parent,name.replace(/[^a-zA-Z0-9-]/g,'-').slice(0,50)+'-')))
      await run('orca',['repo','add','--environment','local','--path',path,'--kind','folder','--json'],{timeout:20000,maxBuffer:1048576})
      const {workspaces}=await orca.host.call('workspace.list',{})
      const ws=workspaces.find(w=>w.path===path&&(w.hostId===null||w.hostId==='local'))
      if(!ws)throw Error('Folder created. Refresh folders and select it to continue.')
      return ws.id
    },
    closeTerminal:async terminalId=>{
      const {stdout}=await run('orca',['terminal','list','--environment','local','--json'],{timeout:15000,maxBuffer:2097152})
      const response=JSON.parse(stdout)
      if(!response.ok||response.result.truncated)throw Error('Could not identify the Architect terminal. Close it in Orca.')
      const matches=(response.result.terminals as {ptyId:string;handle:string}[]).filter(t=>t.ptyId===terminalId||t.handle===terminalId)
      if(matches.length===0)return false
      if(matches.length!==1)throw Error('Architect terminal is ambiguous. Close it in Orca.')
      const result=await run('orca',['terminal','close','--environment','local','--terminal',matches[0].handle,'--json'],{timeout:20000,maxBuffer:1048576})
      if(!JSON.parse(result.stdout).ok)throw Error('Could not close the Architect terminal. Try again.')
      return true
    },
    openBrowser:async(url,workspaceId)=>{
      const address=new URL(url);address.hostname='localhost'
      let pageId:string
      try {
        const worktree=workspaceId.startsWith('identity:')?workspaceId:`id:${workspaceId}`
        const {stdout}=await run('orca',['tab','create','--environment','local','--worktree',worktree,'--url',address.href,'--json'],{timeout:20000,maxBuffer:1048576})
        const created=JSON.parse(stdout)
        if(!created.ok||typeof created.result?.browserPageId!=='string')throw Error('Orca refused the browser tab.')
        pageId=created.result.browserPageId
        const focused=await run('orca',['tab','switch','--environment','local','--worktree',worktree,'--page',created.result.browserPageId,'--focus','--json'],{timeout:20000,maxBuffer:1048576})
        if(!JSON.parse(focused.stdout).ok)throw Error('Orca could not focus the browser tab.')
      }catch{throw Error('Could not show Architect in Orca. Enable Orca CLI, then retry.')}
      try {
        const ready=await run('orca',['wait','--environment','local','--page',pageId,'--fn',modelSetupReady,'--timeout','10000','--json'],{timeout:12000,maxBuffer:1048576})
        if(!JSON.parse(ready.stdout).ok)throw Error('Project has not finished loading.')
        const setup=await run('orca',['eval','--environment','local','--page',pageId,'--expect-url',address.href,'--expression',openModelSetup,'--json'],{timeout:10000,maxBuffer:1048576})
        if(!JSON.parse(setup.stdout).ok)throw Error('Model setup could not open.')
      }catch{throw Error('Architect is open. Choose “Connect a model” there; automatic setup could not open.')}
    }
  })
  orca.panels.handle('architect.overview',controller.overview)
  orca.panels.handle('architect.start',controller.start)
  orca.panels.handle('architect.stop',controller.stop)
  orca.panels.handle('architect.open',controller.open)
  orca.panels.handle('architect.documents',controller.documents)
  orca.panels.handle('architect.document',controller.document)
}
