import {chromium} from '@playwright/test'
import {createServer} from 'node:http'
import {readFile} from 'node:fs/promises'
import {resolve,extname} from 'node:path'
import assert from 'node:assert/strict'
import {modelSetupReady,openModelSetup} from '../panel/model-onboarding.mjs'
const root=resolve(import.meta.dirname,'..')
const server=createServer(async(req,res)=>{
 try{
  const path=resolve(root,'.'+new URL(req.url,'http://localhost').pathname)
  if(!path.startsWith(root+'/')){res.writeHead(403).end();return}
  res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.woff2':'font/woff2','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream')
  res.end(await readFile(path))
 }catch{res.writeHead(404).end()}
})
await new Promise(r=>server.listen(0,'127.0.0.1',r))
const browser=await chromium.launch({headless:true})
let checks=0
try{
 const page=await browser.newPage({viewport:{width:560,height:1180},deviceScaleFactor:1})
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.addInitScript(()=>{
  const listeners={}
  window.fixture={runtime:'ready',owned:true,projects:[{id:'example',name:'Support assistant',updatedAt:1794700000000,dateKind:'opened'}],calls:[],fail:false,designs:[]}
  window.orca={plugin:{on:(name,fn)=>{listeners[name]=fn;return {dispose(){}}},request:async(name,input)=>{
   const f=window.fixture;f.calls.push({name,input})
   if(name==='architect.overview')return {workspaces:f.projects,url:'http://127.0.0.1:5176',owned:f.owned,runtime:f.runtime}
   if(name==='architect.documents')return {documents:[{path:'START_HERE.md',label:'Start here'}],designs:f.designs}
   if(name==='architect.open'){
    if(f.fail)throw Error('Design file is invalid JSON. Repair it before opening.')
    listeners['architect.progress']?.({message:'Loading your design…'})
    return {message:'Your design is open.',workspaceId:'example',projectId:'example-design'}
   }
   if(name==='architect.stop'){f.runtime='offline';f.owned=false;return {message:'Architect stopped.'}}
   return {message:'Opened document.'}
  }},on:()=>({dispose(){}}),host:{call:async()=>({opened:true})}}
 })
 const url=`http://127.0.0.1:${server.address().port}/panel/index.html`
 await page.goto(url);await page.getByText('Running locally',{exact:true}).waitFor()
 assert.match(await page.locator('#folder option').nth(1).textContent(),/Support assistant.*Opened.*2026/)
 await page.screenshot({path:'/tmp/architect-reference-560.png',fullPage:true})
 assert.equal(await page.getByRole('link',{name:'atmem.ai ↗',exact:true}).getAttribute('href'),'https://atmem.ai')
 assert.equal(await page.getByRole('link',{name:'Contact us',exact:true}).getAttribute('href'),'mailto:info@atmem.ai')
 assert.equal(await page.getByRole('button',{name:'Start new',exact:true}).isEnabled(),true)
 assert.equal(await page.locator('#example-fields img,.example-note').count(),0)
 await page.getByRole('button',{name:'Start new',exact:true}).click()
 await page.getByRole('button',{name:'Continue in Architect',exact:true}).waitFor()
 assert.deepEqual(await page.evaluate(()=>window.fixture.calls.find(c=>c.name==='architect.open').input),{name:'AI knowledge assistant example',template:'knowledge-assistant',example:true})
 checks++
 await page.goto(url);await page.getByText('Running locally',{exact:true}).waitFor()
 await page.getByRole('button',{name:'Create new project',exact:true}).click()
 assert.equal(await page.getByRole('button',{name:'Enter a project name',exact:true}).isDisabled(),true)
 await page.getByLabel('Project name',{exact:true}).fill('Support portal')
 await page.getByRole('button',{name:'Start designing',exact:true}).click()
 await page.getByRole('button',{name:'Continue in Architect',exact:true}).waitFor()
 assert.deepEqual(await page.evaluate(()=>window.fixture.calls.find(c=>c.name==='architect.open').input),{name:'Support portal'})
 checks++
 await page.getByRole('button',{name:'Stop',exact:true}).click();await page.getByText('Not running',{exact:true}).waitFor()
 assert.equal(await page.getByRole('button',{name:'Stop',exact:true}).count(),0);checks++
 await page.getByRole('tab',{name:'Start',exact:true}).click()
 await page.getByRole('tab',{name:'Open folder',exact:true}).focus();await page.keyboard.press('ArrowLeft')
 assert.equal(await page.getByRole('tab',{name:'Templates',exact:true}).getAttribute('aria-selected'),'true');await page.keyboard.press('Home');checks++
 await page.evaluate(()=>{window.fixture.fail=true;window.fixture.designs=[{path:'one.atforma.json',name:'Design one'},{path:'two.atforma.json',name:'Design two'}]})
 await page.getByRole('button',{name:'Reload folders',exact:true}).click()
 await page.getByRole('tab',{name:'Open folder',exact:true}).click()
 await page.getByLabel('Saved design',{exact:true}).selectOption('two.atforma.json')
 await page.getByRole('button',{name:'Open design in Architect',exact:true}).click()
 await page.getByRole('alert').filter({hasText:'invalid JSON'}).waitFor();checks++
 for(const template of [{id:'private-storage',title:'Private file storage'},{id:'document-processing',title:'Document processing'},{id:'knowledge-assistant',title:'Knowledge assistant'}]){
  await page.goto(url);await page.getByText('Running locally',{exact:true}).waitFor()
  await page.getByRole('tab',{name:'Templates',exact:true}).click()
  await page.getByRole('button',{name:new RegExp(template.title)}).click()
  assert.equal(await page.getByLabel('Project name',{exact:true}).inputValue(),template.title)
  assert.equal(await page.locator('#template-preview').getAttribute('src'),'../assets/templates/'+template.id+'.svg')
  await page.locator('#template-preview').evaluate(img=>img.decode())
  assert.ok(await page.locator('#template-preview').evaluate(img=>img.naturalWidth>0))
  if(template.id==='knowledge-assistant')await page.screenshot({path:'/tmp/architect-template-gallery.png',fullPage:true})
  await page.getByRole('button',{name:'Use this template',exact:true}).click()
  assert.deepEqual(await page.evaluate(()=>window.fixture.calls.find(c=>c.name==='architect.open').input),{name:template.title,template:template.id})
  checks++
 }
 await page.goto(url);await page.getByText('Running locally',{exact:true}).waitFor()
 for(const width of [280,360,400,560]){
  await page.setViewportSize({width,height:width===560?1180:779})
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`No horizontal overflow at ${width}px`)
 }
 await page.setViewportSize({width:360,height:779});await page.screenshot({path:'/tmp/architect-reference-360.png',fullPage:true});checks++
 const modelPage=await browser.newPage()
 await modelPage.goto(url+'?project=example-design')
 await modelPage.evaluate(()=>{
  document.body.innerHTML='<button class="model">Connect a model</button>'
  document.querySelector('button').onclick=()=>{const dialog=document.createElement('section');dialog.role='dialog';dialog.textContent='Connect your model';document.body.append(dialog)}
  localStorage.setItem('atforma-workspace-v3',JSON.stringify({id:'other-design'}))
 })
 assert.equal(await modelPage.evaluate(modelSetupReady),false)
 await modelPage.evaluate(()=>localStorage.setItem('atforma-workspace-v3',JSON.stringify({id:'example-design'})))
 await modelPage.evaluate(()=>{const welcome=document.createElement('section');welcome.role='dialog';welcome.setAttribute('aria-label','welcome');document.body.append(welcome)})
 assert.equal(await modelPage.evaluate(modelSetupReady),false,'Wait for the initial welcome to finish before opening model setup')
 await modelPage.evaluate(()=>document.querySelector('[aria-label="welcome"]').remove())
 assert.equal(await modelPage.evaluate(modelSetupReady),true)
 assert.equal(await modelPage.evaluate(openModelSetup),'opened')
 await modelPage.getByRole('dialog').filter({hasText:'Connect your model'}).waitFor()
 assert.equal(await modelPage.evaluate(openModelSetup),'dialog-already-open')
 await modelPage.evaluate(()=>{document.querySelector('[role="dialog"]').remove();document.querySelector('button').textContent='Connected model'})
 assert.equal(await modelPage.evaluate(openModelSetup),'already-connected');checks++
 assert.deepEqual(errors,[])
 console.log(`${checks} browser checks passed: create, runtime stop, keyboard tabs, saved-design failure, responsive layout, model setup.`)
}finally{await browser.close();await new Promise(r=>server.close(r))}
