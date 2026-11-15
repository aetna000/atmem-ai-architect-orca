import {assert,mockHost,mount,test} from 'orca/testing'
import * as panel from './panel'
const overview={workspaces:[{id:'project',name:'Example'}],url:'http://127.0.0.1:5174',owned:false}
const documents={documents:[{path:'START_HERE.md',label:'Start here'}],designs:[]}
test('a newcomer can name a project and enter Architect with one action',async()=>{
 let input:unknown
 const view=await mount(panel,{host:mockHost({requests:{'architect.overview':()=>overview,'architect.documents':()=>documents,'architect.open':value=>{input=value;return {message:'Your blank design is open.',workspaceId:'project',projectId:'example-design'}}}})})
 assert.ok(view.find({text:'What do you want to build?'}))
 assert.equal(view.find({text:'Start Architect'}),null)
 assert.equal(view.find({text:'Stop local Architect'}),null)
 await view.type({label:'Project name'},'Support assistant')
 await view.press({text:'Start designing'})
 assert.deepEqual(input,{name:'Support assistant'})
 assert.ok(view.find({text:'Continue in Architect'}));assert.ok(view.find({text:'Bring your work back'}))
 assert.deepEqual(view.errors,[]);assert.deepEqual(view.warnings,[]);assert.deepEqual(view.refusals,[]);await view.unmount()
})
test('folder flow selects the saved design and exposes failures without claiming success',async()=>{
 const view=await mount(panel,{host:mockHost({requests:{'architect.overview':()=>overview,'architect.documents':()=>({...documents,designs:[{path:'one.atforma.json',name:'One'},{path:'two.atforma.json',name:'Two'}]}),'architect.open':value=>{assert.equal(value.source,'two.atforma.json');throw Error('Design file is invalid JSON. Repair it before opening.')}}})})
 await view.press({text:'Existing folder'})
 await view.select({label:'Saved design'},'two.atforma.json')
 await view.press({text:'Open design in Architect'})
 assert.match(JSON.stringify(view.tree()),/Could not continue/);assert.equal(view.find({text:'Continue in Architect'}),null)
 assert.deepEqual(view.errors,[]);assert.deepEqual(view.warnings,[]);await view.unmount()
})
test('no folders does not block creating a new project',async()=>{
 const view=await mount(panel,{host:mockHost({requests:{'architect.overview':()=>({...overview,workspaces:[]})}})})
 await view.press({text:'Existing folder'});assert.match(JSON.stringify(view.tree()),/No local folders yet/)
 await view.press({text:'New project'});assert.ok(view.find({label:'Project name'}))
 assert.deepEqual(view.errors,[]);await view.unmount()
})
