import {assert,test} from 'orca/testing'
import {mkdtemp,writeFile,mkdir,symlink,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {blankDesign,readDesign,designSources,connectDesign} from './project-bridge'
test('discovers root and delivered designs and refuses broken, linked and oversized files',async()=>{
 const root=await mkdtemp(join(tmpdir(),'architect-design-'))
 try{
  await mkdir(join(root,'design-documents'))
  const file=blankDesign('Delivery example')
  await writeFile(join(root,'design-documents','project.atmem-ai-architect.json'),JSON.stringify(file))
  await writeFile(join(root,'bad.atforma.json'),'{broken')
  assert.equal((await designSources(root)).length,2)
  assert.equal((await readDesign(root,'design-documents/project.atmem-ai-architect.json')).meta.id,file.meta.id)
  await assert.rejects(()=>readDesign(root,'bad.atforma.json'),/invalid JSON/)
  await assert.rejects(()=>readDesign(root,'../secrets.atforma.json'),/listed/)
  await symlink(join(root,'bad.atforma.json'),join(root,'linked.atforma.json'))
  await assert.rejects(()=>readDesign(root,'linked.atforma.json'),/Linked/)
  await writeFile(join(root,'large.atforma.json'),' '.repeat(2_000_001))
  await assert.rejects(()=>readDesign(root,'large.atforma.json'),/2 MB/)
 }finally{await rm(root,{recursive:true,force:true})}
})
test('imports the actual project and reopens saved edits without overwriting them',async()=>{
 const file=blankDesign('Actual project'),saved:unknown[]=[],calls:string[]=[]
 let exists=false
 const fetcher=(async(url:string|URL|Request,init?:RequestInit)=>{
  const path=String(url);calls.push(path)
  if(path.endsWith('/session'))return Response.json({token:'local-test-session'})
  assert.equal((init?.headers as Record<string,string>).Authorization,'Bearer local-test-session')
  if(path.endsWith('/get'))return exists?Response.json(file):Response.json({detail:'missing'},{status:404})
  saved.push(JSON.parse(String(init?.body)));exists=true;return Response.json({saved:true})
 }) as typeof fetch
 assert.equal(await connectDesign('http://127.0.0.1:5174',file,undefined,'Folder',fetcher),file.meta.id)
 assert.deepEqual(saved,[{id:file.meta.id,file}])
 assert.equal(await connectDesign('http://127.0.0.1:5174',file,file.meta.id,'Folder',fetcher),file.meta.id)
 assert.equal(saved.length,1)
})
test('a missing linked design or failed save never silently creates a replacement',async()=>{
 let writes=0
 const fetcher=(async(url:string|URL|Request)=>{
  if(String(url).endsWith('/session'))return Response.json({token:'test'})
  if(String(url).endsWith('/get'))return Response.json({},{status:404})
  writes++;return Response.json({detail:'Remove credentials before saving.'},{status:422})
 }) as typeof fetch
 await assert.rejects(()=>connectDesign('http://127.0.0.1:5174',undefined,'missing-design','Folder',fetcher),/Restore/)
 assert.equal(writes,0)
 await assert.rejects(()=>connectDesign('http://127.0.0.1:5174',undefined,undefined,'Folder',fetcher),/credentials/)
})
