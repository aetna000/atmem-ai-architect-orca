import {assert,mockHost,mountWorker,test} from 'orca/testing'
import {mkdtemp,mkdir,writeFile,rm,realpath} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createController} from './controller'
const capabilities=['workspace:read','workspace:write','terminal:send','storage:own','settings:own']
test('browsing reuses local folders, cancels without changes and validates absolute directories',async()=>{
 const root=await mkdtemp(join(tmpdir(),'architect-browse-')),other=join(root,'New project $data — AI')
 await mkdir(other);await writeFile(join(root,'file.txt'),'not a folder')
 const host=mockHost({capabilities,results:{'workspace.list':{workspaces:[{id:'existing',kind:'folder',name:'Existing',path:root,branch:null,hostId:'local'}],truncated:false}}})
 let c:ReturnType<typeof createController>,choice:string|undefined,registered:string[]=[]
 const worker=await mountWorker({default(orca:any){c=createController(orca,{probe:async()=> 'offline',openBrowser:async()=>{throw Error('Choosing must not open a design')},closeTerminal:async()=>false,chooseFolder:async()=>choice,registerWorkspace:async path=>{registered.push(path);return 'added'}})}},{host})
 try{
  assert.deepEqual(await c!.browse(),{cancelled:true});assert.deepEqual(registered,[])
  assert.deepEqual(await c!.browse({path:root}),{cancelled:false,workspaceId:'existing'})
  choice=other;assert.deepEqual(await c!.browse(),{cancelled:false,workspaceId:'added'});assert.deepEqual(registered,[await realpath(other)])
  for(const path of ['relative/path','https://server/project','',join(root,'missing'),join(root,'file.txt')])await assert.rejects(()=>c!.browse({path}),/absolute folder path|existing folder/)
  assert.equal(registered.length,1);assert.equal(host.callsOf('terminal.create').length,0);assert.equal(host.callsOf('workspace.open').length,0)
 }finally{await worker.deactivate();await rm(root,{recursive:true,force:true})}
})
test('an aborted picker never registers a selected folder',async()=>{
 const root=await mkdtemp(join(tmpdir(),'architect-browse-cancel-'));let c:ReturnType<typeof createController>,registered=false
 const host=mockHost({capabilities});const abort=new AbortController()
 const worker=await mountWorker({default(orca:any){c=createController(orca,{probe:async()=> 'offline',openBrowser:async()=>{},closeTerminal:async()=>false,chooseFolder:async()=>{abort.abort();return root},registerWorkspace:async()=>{registered=true;return 'new'}})}},{host})
 try{await assert.rejects(()=>c!.browse({},abort.signal),/abort/i);assert.equal(registered,false)}finally{await worker.deactivate();await rm(root,{recursive:true,force:true})}
})
