import {chromium} from '@playwright/test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
const browser=await chromium.launch({headless:true})
try{
 const page=await browser.newPage({acceptDownloads:true})
 const base=process.env.ARCHITECT_URL||'http://localhost:5176'
 await page.goto(base+'/?example=1')
 await page.getByRole('button',{name:'Download example ZIP',exact:true}).waitFor()
 await page.getByRole('tab',{name:'Delivery',exact:true}).click()
 await page.locator('summary').filter({hasText:/^Bundled runtime evidence$/}).click()
 assert.equal(await page.locator('.ready-reference .check-complete').count(),8)
 const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download runnable example',exact:true}).click()])
 const bytes=await fs.readFile(await download.path());assert.equal(bytes.subarray(0,2).toString(),'PK');assert.ok(bytes.length>1_000_000)
 console.log('Portable reference opens and downloads without a local engineering session.')
}finally{await browser.close()}
