import {assert,mockHost,mountWorker,test} from 'orca/testing'
import {mkdtemp,writeFile,mkdir,symlink,rm,utimes} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createController} from './controller'
const capabilities=['workspace:read','workspace:write','terminal:send','storage:own','settings:own']
async function fixture(run:(c:ReturnType<typeof createController>,host:ReturnType<typeof mockHost>,root:string)=>Promise<void>,probe:'ready'|'offline'|'occupied'='offline') {
 const root=await mkdtemp(join(tmpdir(),'architect-orca-'))
 const host=mockHost({capabilities,results:{'workspace.list':{workspaces:[{id:'local-1',kind:'folder',name:'Example',path:root,branch:null,hostId:'local'},{id:'remote',kind:'folder',name:'Remote',path:'/remote',branch:null,hostId:'ssh:other'}],truncated:false},'settings.get':{settings:{port:5174}},'terminal.create':{terminalId:'owned-terminal'},'terminal.sendText':{accepted:true},'workspace.open':{opened:true},'editor.open':{opened:true}}})
 let c:ReturnType<typeof createController>
 const module={default(orca:any){c=createController(orca,{probe:async()=>probe,openBrowser:async url=>{assert.match(url,/\/\?project=linked-project$/)},connectDesign:async(url,file,id,name)=>'linked-project',closeTerminal:async id=>{assert.equal(id,'owned-terminal');return true}})}}
 const worker=await mountWorker(module,{host})
 try{await run(c!,host,root);assert.deepEqual(worker.refusals,[])}finally{await worker.deactivate();await rm(root,{recursive:true,force:true})}
}
test('lists only local projects and starts pinned Architect once under concurrent clicks',()=>fixture(async(c,host)=>{
 assert.equal((await c.overview()).workspaces[0].id,'local-1')
 await Promise.all([c.start({workspaceId:'local-1'}),c.start({workspaceId:'local-1'})])
 assert.equal(host.callsOf('terminal.create').length,1)
 assert.deepEqual(host.callsOf('terminal.create')[0],{workspaceId:'local-1',title:'AtMem AI Architect',command:'npx --yes @atmem/architect@0.2.1 --no-open --port 5174'})
 await assert.rejects(()=>c.start({workspaceId:'local-1'}),/Stop the previous/)
 assert.equal((await c.stop()).message,'Architect terminal closed.')
}))
test('rejects remote workspace, unknown service and injected document path',()=>fixture(async(c,host)=>{
 await assert.rejects(()=>c.start({workspaceId:'remote'}),/Select a local/)
 await assert.rejects(()=>c.start({workspaceId:'local-1'}),/another app/)
 await assert.rejects(()=>c.document({workspaceId:'local-1',path:'../secrets'}),/listed/)
 assert.equal(host.callsOf('terminal.create').length,0)
},'occupied'))
test('reuses a running Architect and opens its browser without another process',()=>fixture(async(c,host)=>{
 assert.match((await c.start({workspaceId:'local-1'})).message,/running/)
 await c.open({workspaceId:'local-1'});assert.equal(host.callsOf('terminal.create').length,0)
 assert.equal(host.callsOf('workspace.open').length,1)
},'ready'))
test('opens only regular handoff documents and rejects symlink escape',()=>fixture(async(c,host,root)=>{
 await writeFile(join(root,'START_HERE.md'),'# Synthetic handoff\n')
 await mkdir(join(root,'spec-kit'))
 await symlink(join(tmpdir(),'not-a-document'),join(root,'spec-kit','spec.md'))
 assert.deepEqual((await c.documents({workspaceId:'local-1'})).documents,[{path:'START_HERE.md',label:'Start here'}])
 await c.document({workspaceId:'local-1',path:'START_HERE.md'})
 await assert.rejects(()=>c.document({workspaceId:'local-1',path:'spec-kit/spec.md'}),/Linked documents/)
 assert.equal(host.callsOf('editor.open').length,1)
}))
test('rejects invalid ports before a terminal command can be built',()=>fixture(async(c,host)=>{
 host.respond('settings.get',{settings:{port:'5174;echo unsafe'}})
 await assert.rejects(()=>c.start({workspaceId:'local-1'}),/Choose a port/)
 assert.equal(host.callsOf('terminal.create').length,0)
}))
test('one Open action starts the service, waits for readiness and links the selected project',async()=>{
 const root=await mkdtemp(join(tmpdir(),'architect-launch-'))
 const file={format:'atmem.ai-architect.project',formatVersion:'2.3.0',meta:{id:'selected-project',name:'Selected design',revision:1},design:{provider:'tools',nodes:[],edges:[]}}
 await writeFile(join(root,'project.atmem-ai-architect.json'),JSON.stringify(file))
 const host=mockHost({capabilities,results:{'workspace.list':{workspaces:[{id:'local-1',kind:'folder',name:'Folder',path:root,branch:null,hostId:'local'}],truncated:false},'settings.get':{settings:{port:5174}},'terminal.create':{terminalId:'test-terminal'},'workspace.open':{opened:true}}})
 let c:ReturnType<typeof createController>,ready=false,waits=0,browser=''
 const worker=await mountWorker({default(orca:any){c=createController(orca,{
  probe:async()=>ready?'ready':'offline',wait:async()=>{waits++;ready=true},closeTerminal:async()=>true,
  connectDesign:async(url,actual)=>{assert.deepEqual(actual,file);return file.meta.id},openBrowser:async url=>{browser=url},
 })}},{host})
 try {
  await c!.open({workspaceId:'local-1'})
  assert.equal(host.callsOf('terminal.create').length,1);assert.equal(waits,1)
  assert.equal(browser,'http://127.0.0.1:5174/?project=selected-project')
  await c!.open({workspaceId:'local-1'})
  assert.equal(host.callsOf('terminal.create').length,1)
 }finally{await worker.deactivate();await rm(root,{recursive:true,force:true})}
})

test('lists newest folders first with dates and remembers the latest successful open',()=>fixture(async(c,host,root)=>{
 const recent=join(root,'recent');await mkdir(recent)
 const older=new Date('2026-01-01T00:00:00Z'),newer=new Date('2026-11-14T00:00:00Z')
 await utimes(root,older,older);await utimes(recent,newer,newer)
 host.respond('workspace.list',{workspaces:[
  {id:'local-1',kind:'folder',name:'Older',path:root,branch:null,hostId:'local'},
  {id:'recent',kind:'folder',name:'Recent',path:recent,branch:null,hostId:'local'},
  {id:'missing',kind:'folder',name:'Unavailable',path:join(root,'missing'),branch:null,hostId:'local'},
 ],truncated:false})
 let list=(await c.overview()).workspaces
 assert.deepEqual(list.map(w=>w.id),['recent','local-1','missing'])
 assert.equal(list[0].updatedAt,newer.getTime());assert.equal(list[2].updatedAt,null)
 await c.open({workspaceId:'local-1'})
 list=(await c.overview()).workspaces
 assert.equal(list[0].id,'local-1');assert.equal(list[0].dateKind,'opened')
 assert.ok((list[0].updatedAt??0)>newer.getTime())
},'ready'))
