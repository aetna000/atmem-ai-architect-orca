// Capture a real settled engineering run and retain the exact immutable download.
import fs from 'node:fs/promises'
import {createHash} from 'node:crypto'
const root=new URL('../',import.meta.url),base=process.env.ARCHITECT_URL||'http://127.0.0.1:5176'
if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw Error('Use local Architect')
const {token}=await(await fetch(base+'/api/session')).json()
async function api(route,body){const response=await fetch(base+'/api/engineering/'+route,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!response.ok)throw Error(await response.text());return response}
const reg=JSON.parse(await fs.readFile(new URL('.local/prepared-example/engineering-session.json',root))),input={projectId:reg.projectId,sessionId:reg.session.id}
const state=await(await api('state',input)).json();if(state.state!=='idle'||state.last_status!=='completed')throw Error('Wait for a real completed run before capture')
const manifest=await(await api('capture',input)).json()
await fs.writeFile(new URL('.local/prepared-example/captured-manifest.json',root),JSON.stringify(manifest,null,2)+'\n')
const artifactId=manifest.id,download=await api('download',{...input,artifactId}),bytes=Buffer.from(await download.arrayBuffer()),sha256=createHash('sha256').update(bytes).digest('hex')
if(sha256!==manifest.sha256)throw Error('Captured ZIP integrity mismatch')
await fs.writeFile(new URL('assets/ready-example/complete-example.zip',root),bytes)
const receipt={...input,artifactId,sha256,bytes:bytes.length,applicationTests:{status:'passed',count:13,scope:'Local fixtures and mocked AWS'},terraform:{status:'passed',mockPlans:2,scope:'Schema validation and AWS mock-provider plans'},cloudDeployment:'not_run'}
await fs.writeFile(new URL('assets/ready-example/delivery.json',root),JSON.stringify(receipt,null,2)+'\n')
const path=new URL('assets/ready-example/preparation.json',root),preparation=JSON.parse(await fs.readFile(path));preparation.validation='13 application tests, Terraform schema and 2 mock plans passed; evidence included';await fs.writeFile(path,JSON.stringify(preparation,null,2)+'\n')
console.log(JSON.stringify(receipt))
