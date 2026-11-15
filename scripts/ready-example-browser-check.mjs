import {chromium} from '@playwright/test'
import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {exampleWelcome,exampleDownload,modelSetupReady} from '../panel/model-onboarding.mjs'
const receipt=JSON.parse(await fs.readFile(new URL('../assets/ready-example/delivery.json',import.meta.url)))
const browser=await chromium.launch({headless:true})
try{
 const page=await browser.newPage({viewport:{width:1440,height:950},acceptDownloads:true})
 await page.goto('http://localhost:5176/?project='+receipt.projectId+'&example=1')
 await page.waitForFunction(() => JSON.parse(localStorage.getItem('atforma-workspace-v3')||'null')?.id==='atmem-ai-ready-example-v1')
 await page.waitForFunction(modelSetupReady)
 await page.evaluate(exampleWelcome)
 await page.evaluate(exampleDownload(receipt))
 const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download example ZIP',exact:true}).click()])
 const data=await fs.readFile(await download.path());assert.equal(createHash('sha256').update(data).digest('hex'),receipt.sha256)
 await page.locator('[aria-label=Delivery]').click()
 await page.getByRole('region',{name:'Prepared example checklist'}).waitFor()
 assert.equal(await page.locator('#atmem-reference-checks .check-complete').count(),8)
 await page.screenshot({path:'/tmp/architect-complete-example-delivery.png',fullPage:true})
 console.log('Ready example: immutable ZIP download verified; eight reference checks visible on Delivery.')
}finally{await browser.close()}
