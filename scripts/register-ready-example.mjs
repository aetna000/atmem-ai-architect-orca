// Register a new local example and its real engineering session. Never overwrite an existing design.
import fs from 'node:fs/promises'
const base=process.env.ARCHITECT_URL||'http://127.0.0.1:5176'
const host=new URL(base);if(!['127.0.0.1','localhost'].includes(host.hostname))throw Error('Use the local Architect instance.')
const file=JSON.parse(await fs.readFile(new URL('../assets/ready-example/project.atmem-ai-architect.json',import.meta.url),'utf8'))
const {token}=await(await fetch(base+'/api/session')).json()
async function api(action,body){const r=await fetch(base+'/api/'+action,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)});const value=await r.json();if(!r.ok){const error=Error(value.detail||'Request failed');error.status=r.status;throw error}return value}
try{const existing=await api('projects/get',{id:file.meta.id});if(JSON.stringify(existing)!==JSON.stringify(file))throw Error('Example ID exists with different work; use a new versioned ID.')}catch(error){if(error.status!==404)throw error;await api('projects/save',{id:file.meta.id,file})}
const state=await api('engineering/create',{projectId:file.meta.id,model:'gpt-6.1-sol',effort:'medium'})
await fs.writeFile(new URL('../.local/prepared-example/engineering-session.json',import.meta.url),JSON.stringify({projectId:file.meta.id,session:state},null,2)+'\n')
console.log(JSON.stringify({projectId:file.meta.id,id:state.id,state:state.state,keys:Object.keys(state)}))
