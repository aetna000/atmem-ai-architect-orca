import {assert,mockHost,mount,test} from 'orca/testing'
import * as panel from './panel'
function host() {return mockHost({requests:{'architect.overview':()=>({workspaces:[{id:'project',name:'Example'}],url:'http://127.0.0.1:5174'}),'architect.documents':()=>({documents:[{path:'START_HERE.md',label:'Start here'}]}),'architect.start':()=>({message:'Starting in its terminal. When ready, open Architect.'}),'architect.open':()=>{throw Error('Architect is not ready. Check its terminal, then try again.')},'architect.stop':()=>({message:'Stop requested.'}),'architect.document':()=>({message:'Opened project document.'})}})}
test('starts, opens documents and shows actionable failures',async()=>{
 const view=await mount(panel,{host:host()})
 await view.press({text:'Start Architect'});assert.ok(view.find({text:'Starting in its terminal. When ready, open Architect.'}))
 await view.press({text:'Open Architect'});assert.ok(view.find({text:'Architect is not ready. Check its terminal, then try again.'}))
 await view.press({text:'Start here'});assert.ok(view.find({text:'Opened project document.'}))
 assert.deepEqual(view.errors,[]);assert.deepEqual(view.warnings,[]);assert.deepEqual(view.refusals,[]);await view.unmount()
})
