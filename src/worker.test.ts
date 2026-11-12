import {assert,mockHost,mountWorker,test} from 'orca/testing'
import {mkdtemp,writeFile,mkdir,symlink,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {createController} from './controller'
const capabilities=['workspace:read','workspace:write','terminal:send','storage:own','settings:own']
async function fixture(run:(c:ReturnType<typeof createController>,host:ReturnType<typeof mockHost>,root:string)=>Promise<void>,probe:'ready'|'offline'|'occupied'='offline') {
 const root=await mkdtemp(join(tmpdir(),'architect-orca-'))
 const host=mockHost({capabilities,results:{'workspace.list':{workspaces:[{id:'local-1',kind:'folder',name:'Example',path:root,branch:null,hostId:'local'},{id:'remote',kind:'folder',name:'Remote',path:'/remote',branch:null,hostId:'ssh:other'}],truncated:false},'settings.get':{settings:{port:5174}},'terminal.create':{terminalId:'owned-terminal'},'terminal.sendText':{accepted:true},'workspace.open':{opened:true},'editor.open':{opened:true}}})
 let c:ReturnType<typeof createController>
 const module={default(orca:any){c=createController(orca,{probe:async()=>probe,openBrowser:async()=>{}})}}
 const worker=await mountWorker(module,{host})
 try{await run(c!,host,root);assert.deepEqual(worker.refusals,[])}finally{await worker.deactivate();await rm(root,{recursive:true,force:true})}
}
test('lists only local projects and starts pinned Architect once under concurrent clicks',()=>fixture(async(c,host)=>{
 assert.equal((await c.overview()).workspaces[0].id,'local-1')
 await Promise.all([c.start({workspaceId:'local-1'}),c.start({workspaceId:'local-1'})])
 assert.equal(host.callsOf('terminal.create').length,1)
 assert.deepEqual(host.callsOf('terminal.create')[0],{workspaceId:'local-1',title:'AtMem AI Architect',command:'npx --yes @atmem/architect@0.2.0 --no-open --port 5174'})
 await assert.rejects(()=>c.start({workspaceId:'local-1'}),/Stop the previous/)
 await c.stop();assert.deepEqual(host.callsOf('terminal.sendText')[0],{terminalId:'owned-terminal',text:'\x03',enter:false})
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
