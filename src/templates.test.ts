import {assert,test} from 'orca/testing'
import {templateProject} from './templates'
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
