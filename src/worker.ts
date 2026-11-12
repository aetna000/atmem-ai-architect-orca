import type {OrcaWorkerApi} from 'orca/worker'
import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
import {createController} from './controller'
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
    openBrowser:async(url,workspaceId)=>{
      try {
        const {stdout}=await run('orca',['tab','create','--environment','local','--worktree',workspaceId.startsWith('identity:')?workspaceId:`id:${workspaceId}`,'--url',url,'--json'],{timeout:20000,maxBuffer:1048576})
        if(!JSON.parse(stdout).ok)throw Error('Orca refused the browser tab.')
      }catch{throw Error('Could not open the Orca browser. Enable Orca CLI, or open the local address manually.')}
    }
  })
  orca.panels.handle('architect.overview',controller.overview)
  orca.panels.handle('architect.start',controller.start)
  orca.panels.handle('architect.stop',controller.stop)
  orca.panels.handle('architect.open',controller.open)
  orca.panels.handle('architect.documents',controller.documents)
  orca.panels.handle('architect.document',controller.document)
}
