// Run against a running Architect with a saved public sample. No prompts are sent.
import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import {boardReset} from '../panel/board-reset.mjs'
import {embeddedLayout,modelSetupReady} from '../panel/model-onboarding.mjs'
const url=process.env.ARCHITECT_EMBED_CHECK_URL
if(!url)throw Error('Set ARCHITECT_EMBED_CHECK_URL to a local saved sample project URL.')
const parsed=new URL(url)
if(!['localhost','127.0.0.1'].includes(parsed.hostname))throw Error('Use a local Architect instance.')
const browser=await chromium.launch({headless:true})
try{
 const page=await browser.newPage({viewport:{width:893,height:738}})
 await page.goto(url);await page.waitForFunction(modelSetupReady)
 await page.evaluate(embeddedLayout)
 for(const width of [893,560,400,1200]){
  await page.setViewportSize({width,height:738})
  const input=page.getByRole('textbox',{name:'Your message',exact:true})
  await input.fill('Draft for layout verification; do not send.')
  assert.equal(await input.inputValue(),'Draft for layout verification; do not send.')
  const box=await input.boundingBox()
  assert.ok(box&&box.y>=0&&box.y+box.height<=738,`Message field visible at ${width}px`)
  const send=await page.getByRole('button',{name:'Send message',exact:true}).boundingBox()
  assert.ok(send&&send.y>=0&&send.y+send.height<=738,`Send action visible at ${width}px`)
 }
 await page.getByRole('textbox',{name:'Your message',exact:true}).fill('')
 await page.evaluate(boardReset)
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('atforma-workspace-v3')))
 await page.getByRole('button',{name:'Reset board and context',exact:true}).click()
 await page.getByRole('heading',{name:'Reset board and context?',exact:true}).waitFor()
 await page.getByRole('button',{name:'Keep working',exact:true}).click()
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('atforma-workspace-v3')).id),before.id)
 await page.getByRole('button',{name:'Reset board and context',exact:true}).click()
 await page.getByRole('button',{name:'Confirm reset board and context',exact:true}).click()
 await page.waitForFunction(id=>JSON.parse(localStorage.getItem('atforma-workspace-v3'))?.id!==id,before.id)
 const fresh=await page.evaluate(()=>JSON.parse(localStorage.getItem('atforma-workspace-v3')))
 assert.notEqual(fresh.id,before.id);assert.equal(fresh.nodes.length,0);assert.equal(fresh.edges.length,0)
 assert.equal(fresh.requirements,'');assert.equal(fresh.needs?.length||0,0);assert.equal(fresh.decisions?.length||0,0)
 assert.equal((fresh.extensions?.conversation?.messages||[]).filter(m=>m.role==='user').length,0)
 assert.equal(await page.getByRole('textbox',{name:'Your message',exact:true}).inputValue(),'')
 console.log('Reset check passed: cancel preserves project; confirm creates a fresh board, requirements and chat scope.')
 console.log('Live embedded chat checks passed at 893/560/400/1200px; typed drafts only, no prompts sent.')
}finally{await browser.close()}
