import {atom,read,set,Stack,Row,Heading,Text,Button,Select,Link,Box,Image,plugin,type PanelContext} from 'orca'
import type {Workspace,Document,Action} from './protocol'
const projects=atom<Workspace[]>([]),selected=atom('project',''),url=atom('http://127.0.0.1:5174')
const message=atom('Select a local project.'),busy=atom(false),files=atom<Document[]>([])
async function act(task:()=>Promise<Action>) {
  set(busy,true)
  try{set(message,(await task()).message)}catch(error){set(message,error instanceof Error?error.message:'Action failed. Try again.')}
  finally{set(busy,false)}
}
async function refresh() {
  set(busy,true)
  try {
    const data=await plugin.request('architect.overview');set(projects,data.workspaces);set(url,data.url)
    if(!data.workspaces.some(w=>w.id===read(selected)))set(selected,data.workspaces.length===1?data.workspaces[0].id:'')
    if(read(selected)){const result=await plugin.request('architect.documents',{workspaceId:read(selected)});set(files,result.documents)}else set(files,[])
  }catch(error){set(message,error instanceof Error?error.message:'Refresh failed.')}
  finally{set(busy,false)}
}
export function setup(_ctx:PanelContext){void refresh()}
export default function Panel(){
  const id=read(selected),working=read(busy)
  return <Stack gap="md">
    <Image src="assets/atmem-header.png" alt="AtMem AI Architect. Design. Build. Deliver." size="full" fit="contain" rounded/>
    <Box padding="md" radius="lg" background="card" border><Stack gap="sm">
    <Select label="Local project" placeholder="Select project" value={id} disabled={working} options={read(projects).map(w=>({value:w.id,label:w.name}))} onChange={value=>{set(selected,value);set(files,[]);void refresh()}} />
    <Row gap="xs"><Button disabled={working||!id} onPress={()=>act(()=>plugin.request('architect.start',{workspaceId:id}))}>Start Architect</Button><Button variant="outline" disabled={working||!id} onPress={()=>act(()=>plugin.request('architect.open',{workspaceId:id}))}>Open Architect</Button></Row>
    <Text muted size="xs">{read(url)}</Text>
    <Text>{read(message)}</Text>
    <Row gap="xs"><Button variant="ghost" disabled={working} onPress={refresh}>Refresh</Button><Button variant="ghost" disabled={working} onPress={()=>act(()=>plugin.request('architect.stop'))}>Stop Architect</Button></Row>
    </Stack></Box>
    <Heading level={2}>Project files</Heading>
    {read(files).length?read(files).map(file=><Button key={file.path} variant="ghost" disabled={working} onPress={()=>act(()=>plugin.request('architect.document',{workspaceId:id,path:file.path}))}>{file.label}</Button>):<Text muted>No exported specs here. In Architect, choose Delivery → Open in Orca, then refresh projects.</Text>}
    <Link href="https://atmem.ai/ai-architect/install/">Installation guide</Link>
  </Stack>
}
