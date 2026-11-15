import {atom,read,set,Stack,Row,Heading,Text,Button,Select,Link,Box,Image,Input,Collapsible,Callout,Spinner,plugin,on,type PanelContext} from 'orca'
import type {Workspace,Document,Action} from './protocol'
const projects=atom<Workspace[]>([]),selected=atom('project',''),url=atom(''),owned=atom(false)
const message=atom(''),failure=atom(''),busy=atom(false),loading=atom(true),files=atom<Document[]>([])
const designs=atom<{path:string;name:string}[]>([]),source=atom(''),name=atom(''),mode=atom<'new'|'folder'>('new'),opened=atom(false)
async function refresh() {
  const previous=read(projects),data=await plugin.request('architect.overview')
  if(read(opened))for(const added of data.workspaces.filter(w=>!previous.some(old=>old.id===w.id))) {
    const received=await plugin.request('architect.documents',{workspaceId:added.id})
    if(received.designs.length) {
      set(selected,added.id);set(message,'Project files received. Review them below.');break
    }
  }
  set(projects,data.workspaces);set(url,data.url);set(owned,data.owned)
  if(!data.workspaces.some(w=>w.id===read(selected)))set(selected,data.workspaces.length===1?data.workspaces[0].id:'')
  if(read(selected)) {
    const result=await plugin.request('architect.documents',{workspaceId:read(selected)})
    set(files,result.documents);set(designs,result.designs)
    if(!result.designs.some(d=>d.path===read(source)))set(source,result.designs.length===1?result.designs[0].path:'')
  }else{set(files,[]);set(designs,[]);set(source,'')}
}
async function load() {
  set(loading,true);set(failure,'')
  try{await refresh()}catch(error){set(failure,error instanceof Error?error.message:'Could not load folders. Retry.')}
  finally{set(loading,false)}
}
async function act(task:()=>Promise<Action>) {
  if(read(busy))return
  set(busy,true);set(failure,'');set(message,'')
  try{set(message,(await task()).message)}catch(error){set(failure,error instanceof Error?error.message:'Action failed. Retry.')}
  finally{set(busy,false)}
}
async function launch() {
  await act(async()=>{
    const existing=read(mode)==='folder'
    const result=await plugin.request('architect.open',existing?{workspaceId:read(selected),source:read(source)||undefined}:{name:read(name)}, {timeoutMs:120000})
    if(result.workspaceId)set(selected,result.workspaceId)
    set(opened,true);set(mode,'folder');await refresh()
    return result
  })
}
export function setup(ctx:PanelContext){
  ctx.subscriptions.push(plugin.on('architect.progress',data=>{if(read(busy))set(message,data.message)}))
  ctx.subscriptions.push(on('workspace.changed',()=>{if(!read(busy))void load()}))
  ctx.subscriptions.push(on('workspace.created',()=>{if(!read(busy))void load()}))
  void load()
}
export default function Panel(){
  const id=read(selected),working=read(busy),waiting=read(loading),existing=read(mode)==='folder',done=read(opened)
  const exported=read(designs).length>0||read(files).some(f=>f.path==='START_HERE.md'||f.path.startsWith('spec-kit/')||f.path.startsWith('design-documents/'))
  return <Stack gap="md">
    <Image src="assets/atmem-header.png" alt="AtMem AI Architect. Design. Build. Deliver." size="full" fit="contain" rounded/>
    <Stack gap="xs">
      <Heading level={2}>{done?'Your design workspace':'What do you want to build?'}</Heading>
      <Text muted>{done?'Continue designing in the Architect tab beside your code.':'Describe your idea. Architect helps shape the design, requirements, and project files.'}</Text>
    </Stack>
    {!done&&<Box padding="md" radius="lg" background="muted"><Stack gap="sm">
      <Text weight="semibold">From idea to project</Text>
      <Text size="sm">1. Describe your goal in Architect.</Text>
      <Text size="sm">2. Review the proposed architecture and requirements.</Text>
      <Text size="sm">3. Bring the project files back into Orca.</Text>
    </Stack></Box>}
    <Box padding="md" radius="lg" background="card" border><Stack gap="sm">
      {!done&&<Row gap="xs" wrap><Button variant={existing?'ghost':'solid'} disabled={working} onPress={()=>{set(mode,'new');set(failure,'');set(message,'')}}>New project</Button><Button variant={existing?'solid':'ghost'} disabled={working} onPress={()=>{set(mode,'folder');set(failure,'');set(message,'')}}>Existing folder</Button></Row>}
      {existing?<Stack gap="sm">
        {waiting?<Spinner label="Loading folders…"/>:read(projects).length?<Select label="Orca folder" placeholder="Choose a folder" value={id} disabled={working} options={read(projects).map(w=>({value:w.id,label:w.name}))} onChange={value=>{set(selected,value);set(opened,false);set(message,'');set(source,'');void load()}}/>:<Callout title="No local folders yet"><Text>Create a new project here, or open a local folder in Orca and reload folders.</Text></Callout>}
        {id&&read(designs).length>1&&<Select label="Saved design" placeholder="Choose a design" value={read(source)} disabled={working||waiting} options={read(designs).map(d=>({value:d.path,label:d.name}))} onChange={value=>set(source,value)}/>}
        {id&&!done&&<Text muted size="sm">{read(designs).length?'Opens the saved design and keeps your latest Architect edits.':'Starts a blank design for this folder. Existing code is not imported.'}</Text>}
      </Stack>:<Input label="Project name" placeholder="e.g. Customer support assistant" value={read(name)} maxLength={100} disabled={working} onChange={value=>set(name,value)} onSubmit={()=>{if(read(name).trim())void launch()}}/>}
      <Button icon="open-external" disabled={working||waiting||(existing?(!id||(read(designs).length>1&&!read(source))):!read(name).trim())} onPress={launch}>{working?'Opening your design…':done?'Continue in Architect':existing?'Open design in Architect':'Start designing'}</Button>
      {working&&<Spinner label={read(message)||'Preparing your workspace…'}/>}
      {!working&&read(message)&&<Callout tone="success"><Text>{read(message)}</Text></Callout>}
      {read(failure)&&<Callout tone="danger" title="Could not continue"><Text>{read(failure)}</Text></Callout>}
      {!done&&!working&&<Text muted size="xs">First use installs Architect locally. Choose a model connection inside Architect when you’re ready.</Text>}
    </Stack></Box>
    {done&&<Box padding="md" radius="lg" background="muted"><Stack gap="sm">
      <Heading level={3}>Bring your work back</Heading>
      <Text size="sm">In Architect, choose Delivery → Open in Orca. Delivered files appear here when the folder is detected.</Text>
      <Button variant="outline" disabled={working||waiting} onPress={load}>Reload folders and files</Button>
    </Stack></Box>}
    {done&&<Button variant="ghost" icon="add" disabled={working} onPress={()=>{set(opened,false);set(mode,'new');set(name,'');set(message,'');set(failure,'')}}>New project</Button>}
    {existing&&id&&exported&&<Stack gap="sm"><Heading level={3}>Review project files</Heading>{read(files).map(file=><Button key={file.path} icon="file-text" variant="ghost" disabled={working} onPress={()=>act(()=>plugin.request('architect.document',{workspaceId:id,path:file.path}))}>{file.label}</Button>)}</Stack>}
    <Collapsible title="Help and runtime" defaultOpen={false}><Stack gap="sm">
      <Text size="sm">Architect opens in an Orca browser tab. Your design is saved locally.</Text>
      <Link href="https://atmem.ai/ai-architect/install/">Getting started guide</Link>
      <Button variant="ghost" disabled={working||waiting} onPress={load}>Reload folders</Button>
      {read(url)&&<Text muted size="xs">{read(url)}</Text>}
      {read(owned)&&<Button variant="outline" disabled={working} onPress={()=>act(async()=>{const result=await plugin.request('architect.stop');set(owned,false);return result})}>Stop local Architect</Button>}
    </Stack></Collapsible>
  </Stack>
}
