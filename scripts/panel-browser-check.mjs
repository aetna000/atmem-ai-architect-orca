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
  window.fixture={runtime:'ready',owned:true,projects:[{id:'example',name:'Support assistant',path:'/Users/example/Client plans/Support assistant',updatedAt:1794700000000,dateKind:'opened'}],calls:[],fail:false,designs:[]}
  window.orca={plugin:{on:(name,fn)=>{listeners[name]=fn;return {dispose(){}}},request:async(name,input)=>{
   const f=window.fixture;f.calls.push({name,input})
   if(name==='architect.overview')return {workspaces:f.projects,url:'http://127.0.0.1:5176',owned:f.owned,runtime:f.runtime}
   if(name==='architect.documents')return {documents:[{path:'START_HERE.md',label:'Start here'}],designs:f.designs}
   if(name==='architect.open'){
    if(f.fail)throw Error('Design file is invalid JSON. Repair it before opening.')
    listeners['architect.progress']?.({message:'Loading your design…'})
    return {message:'Your design is open.',workspaceId:'example',projectId:'example-design'}
   }
   if(name==='architect.browse'){
    if(f.browseCancelled)return {cancelled:true}
    const path=input?.path||'/Users/example/Local projects/AI assistant'
    f.projects.push({id:'picked-folder',name:'AI assistant',path,updatedAt:1794700000002,dateKind:'opened'})
    f.designs=[{path:'project.atmem-ai-architect.json',name:'Saved local design'}]
    return {cancelled:false,workspaceId:'picked-folder'}
   }
   if(name==='architect.stop'){f.runtime='offline';f.owned=false;return {message:'Architect stopped.'}}
   return {message:'Opened document.'}
  }},on:()=>({dispose(){}}),host:{call:async(name,input)=>{window.fixture.hostCalls||=[];window.fixture.hostCalls.push({name,input});return {opened:true}}}}
 })
 await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.fixture.copied=text}}}))
 const url=`http://127.0.0.1:${server.address().port}/panel/index.html`
 await page.goto(url);await page.getByText('Running locally',{exact:true}).waitFor()
 assert.match(await page.locator('#folder option').nth(1).textContent(),/Support assistant.*Opened.*2026/)
 const support=page.locator('details.support-star'),star=support.locator('summary')
 assert.equal(await star.isVisible(),true)
 await star.click();assert.equal(await support.getByRole('link',{name:'Open on Orca ↗',exact:true}).getAttribute('href'),'https://orca.dev/plugins/aetna000/atmem-ai-architect-orca')
 await support.getByRole('link',{name:'Open on Orca ↗',exact:true}).click()
 assert.deepEqual(await page.evaluate(()=>window.fixture.hostCalls.at(-1)),{name:'shell.openExternal',input:{url:'https://orca.dev/plugins/aetna000/atmem-ai-architect-orca'}})
 assert.equal(await support.getAttribute('open'),null);checks++
 await star.click();await support.getByRole('link',{name:'Star on GitHub ↗',exact:true}).click()
 assert.deepEqual(await page.evaluate(()=>window.fixture.hostCalls.at(-1)),{name:'shell.openExternal',input:{url:'https://github.com/aetna000/atmem-ai-architect-orca'}});assert.equal(await support.getAttribute('open'),null);checks++
 await star.click();await page.keyboard.press('Escape');assert.equal(await support.getAttribute('open'),null);checks++

 await page.screenshot({path:'/tmp/architect-reference-560.png',fullPage:true})
 assert.equal(await page.getByRole('link',{name:'atmem.ai ↗',exact:true}).getAttribute('href'),'https://atmem.ai')
 assert.equal(await page.getByRole('link',{name:'Contact us: hello@atmem.ai',exact:true}).getAttribute('href'),'mailto:hello@atmem.ai')
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
  assert.equal(await page.locator('#template-fields img').count(),0)
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
 // Path tooltips and copy stay tied to the selected local folder.
 await page.goto(url);await page.getByText('Running locally',{exact:true}).waitFor()
 await page.getByRole('tab',{name:'Open folder',exact:true}).click()
 const firstPath='/Users/example/Client plans/Support assistant'
 assert.equal(await page.locator('#folder').getAttribute('title'),firstPath)
 assert.equal(await page.locator('#folder option').nth(1).getAttribute('title'),firstPath)
 assert.equal(await page.getByRole('textbox',{name:'Absolute folder path',exact:true}).inputValue(),firstPath)
 await page.getByRole('button',{name:'Copy absolute folder path',exact:true}).click()
 assert.equal(await page.evaluate(()=>window.fixture.copied),firstPath);checks++
 await page.evaluate(()=>window.fixture.projects.push({id:'second',name:'Research',path:'/Volumes/Work/Research — AI',updatedAt:1794700000001,dateKind:'opened'}))
 await page.getByRole('button',{name:'Reload folders',exact:true}).click()
 await page.getByLabel('Orca folder',{exact:true}).selectOption('second')
 await page.getByRole('button',{name:'Copy absolute folder path',exact:true}).click()
 assert.equal(await page.locator('#folder').getAttribute('title'),'/Volumes/Work/Research — AI')
 assert.equal(await page.evaluate(()=>window.fixture.copied),'/Volumes/Work/Research — AI');checks++
 await page.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw Error('Clipboard API unavailable')};document.execCommand=()=>{const field=document.querySelector('#folder-path');window.fixture.fallback=field.value.slice(field.selectionStart,field.selectionEnd);return true}})
 await page.getByRole('button',{name:'Copy absolute folder path',exact:true}).click()
 assert.equal(await page.evaluate(()=>window.fixture.fallback),'/Volumes/Work/Research — AI')
 await page.getByRole('status').filter({hasText:'Folder path copied.'}).waitFor();checks++
 await page.evaluate(()=>document.execCommand=()=>false)
 await page.getByRole('button',{name:'Copy absolute folder path',exact:true}).click()
 await page.getByRole('status').filter({hasText:'Path selected.'}).waitFor()
 assert.equal(await page.locator('#folder-path').evaluate(field=>field.selectionEnd-field.selectionStart),'/Volumes/Work/Research — AI'.length)
 await page.getByLabel('Orca folder',{exact:true}).selectOption('')
 assert.equal(await page.locator('#copy-folder-path').isDisabled(),true)
 assert.equal(await page.locator('#folder-path').inputValue(),'')
 assert.equal(await page.locator('#folder-location').isVisible(),false);checks++
 await page.goto(url);await page.getByText('Running locally',{exact:true}).waitFor()
 await page.getByRole('tab',{name:'Open folder',exact:true}).click()
 await page.evaluate(()=>window.fixture.browseCancelled=true)
 const beforeCancel=await page.locator('#folder').inputValue()
 await page.getByRole('button',{name:'Browse local folder…',exact:true}).click()
 await page.waitForFunction(()=>!document.querySelector('#browse-folder').disabled)
 assert.equal(await page.locator('#folder').inputValue(),beforeCancel)
 assert.equal(await page.evaluate(()=>window.fixture.calls.some(c=>c.name==='architect.open')),false);checks++
 await page.evaluate(()=>window.fixture.browseCancelled=false)
 await page.getByRole('button',{name:'Browse local folder…',exact:true}).click()
 await page.getByRole('status').filter({hasText:'Folder selected.'}).waitFor()
 assert.equal(await page.locator('#folder-path').inputValue(),'/Users/example/Local projects/AI assistant')
 await page.getByRole('button',{name:'Open design in Architect',exact:true}).click()
 await page.getByRole('button',{name:'Continue in Architect',exact:true}).waitFor()
 assert.deepEqual(await page.evaluate(()=>window.fixture.calls.find(c=>c.name==='architect.open').input),{workspaceId:'picked-folder',source:'project.atmem-ai-architect.json'});checks++
 await page.goto(url);await page.getByText('Running locally',{exact:true}).waitFor()
 await page.getByRole('tab',{name:'Open folder',exact:true}).click()
 await page.getByText('Enter folder path',{exact:true}).click()
 await page.getByRole('textbox',{name:'Local folder path',exact:true}).fill('/Volumes/Work/My local project')
 await page.getByRole('textbox',{name:'Local folder path',exact:true}).press('Enter')
 await page.getByRole('status').filter({hasText:'Folder selected.'}).waitFor()
 assert.equal(await page.locator('#folder-path').inputValue(),'/Volumes/Work/My local project')
 assert.equal(await page.evaluate(()=>window.fixture.calls.some(c=>c.name==='architect.open')),false)
 await page.screenshot({path:'/tmp/architect-browse-local-folder.png',fullPage:true});checks++
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
 await modelPage.evaluate(()=>{
  document.querySelector('button').remove();
  const show=document.createElement('button');show.setAttribute('aria-label','Show chat');document.body.append(show);
  show.onclick=()=>{show.remove();const connect=document.createElement('button');connect.className='model';connect.textContent='Connect a model';document.body.append(connect);connect.onclick=()=>{const dialog=document.createElement('section');dialog.role='dialog';dialog.textContent='Connect your model';document.body.append(dialog)}};
 });
 assert.equal(await modelPage.evaluate(modelSetupReady),true,'Collapsed chat is a loaded project');
 assert.equal(await modelPage.evaluate(openModelSetup),'opened');
 await modelPage.getByRole('dialog').filter({hasText:'Connect your model'}).waitFor();checks++;
 console.log(`${checks} browser checks passed: create, runtime stop, keyboard tabs, saved-design failure, responsive layout, gold support control, local browse/cancel/path entry, folder path hover/copy/fallback, model setup.`)
}finally{await browser.close();await new Promise(r=>server.close(r))}
