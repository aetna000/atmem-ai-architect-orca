import {assert,test} from 'orca/testing'
import {templateProject,readyExampleProject} from './templates'
import {templates} from '../panel/templates.mjs'
test('templates create independent design copies and refuse unknown template paths',async()=>{
 for(const template of templates){
  const first=await templateProject(template.id),second=await templateProject(template.id)
  assert.notEqual(first.meta.id,second.meta.id)
  assert.equal(first.meta.name,template.title)
  assert.equal(first.design.nodes.length,template.components)
  assert.equal(first.meta.revision,1)
  first.design.nodes.length=0
  assert.equal(second.design.nodes.length,template.components)
 }
 await assert.rejects(()=>templateProject('../private'),/listed template/)
})

test('prepared example includes selected region, complete cost and downloadable reference',async()=>{
 const ready=await readyExampleProject()
 assert.equal(ready.meta.id,'atmem-ai-ready-example-v1')
 const {readFile}=await import('node:fs/promises')
 const preparation=JSON.parse(await readFile(new URL('../assets/ready-example/preparation.json',import.meta.url),'utf8'))
 assert.equal(preparation.cost.complete,true)
 assert.equal(preparation.cost.monthly,7.56)
 const delivery=JSON.parse(await readFile(new URL('../assets/ready-example/delivery.json',import.meta.url),'utf8'))
 assert.equal(delivery.projectId,ready.meta.id)
 const {createHash}=await import('node:crypto')
 const bytes=await readFile(new URL('../assets/ready-example/complete-example.zip',import.meta.url))
 assert.equal(createHash('sha256').update(bytes).digest('hex'),delivery.sha256)
})
