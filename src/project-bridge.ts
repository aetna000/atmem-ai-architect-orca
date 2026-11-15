import {open, readdir, lstat, realpath} from 'node:fs/promises'
import {constants} from 'node:fs'
import {resolve, relative, sep} from 'node:path'
import {randomUUID} from 'node:crypto'

export type DesignSource = {path:string; name:string}
export type ProjectFile = {format:string; formatVersion:string; meta:{id:string;name:string;revision:number;[key:string]:unknown}; design:{nodes:unknown[];edges:unknown[];provider:string};[key:string]:unknown}
const validId=(id:unknown):id is string=>typeof id==='string'&&/^[A-Za-z0-9-]{8,64}$/.test(id)
const allowed=(path:string)=>/^(?:design-documents\/)?[^/\\]+\.(?:atmem-ai-architect|atforma)\.json$/.test(path)
export async function readDesign(root:string,path:string):Promise<ProjectFile> {
  if(!allowed(path))throw Error('Choose a listed Architect design.')
  root=await realpath(root)
  let target=root
  for(const part of path.split('/')) {
    target=resolve(target,part)
    if((await lstat(target)).isSymbolicLink())throw Error('Linked design files cannot be imported.')
  }
  const rel=relative(root,await realpath(target))
  if(rel==='..'||rel.startsWith('..'+sep))throw Error('Design must be inside the selected folder.')
  const handle=await open(target,constants.O_RDONLY|(constants.O_NOFOLLOW||0))
  let raw:string
  try {
    const stat=await handle.stat()
    if(!stat.isFile()||stat.size>2_000_000)throw Error('Choose an Architect design file smaller than 2 MB.')
    const bytes=Buffer.alloc(2_000_001)
    let total=0
    while(total<bytes.length) {
      const {bytesRead}=await handle.read(bytes,total,bytes.length-total,total)
      if(!bytesRead)break
      total+=bytesRead
    }
    if(total>2_000_000)throw Error('Design exceeds 2 MB. Nothing was imported.')
    raw=bytes.subarray(0,total).toString('utf8')
  }finally{await handle.close()}
  let file:ProjectFile
  try{file=JSON.parse(raw)}catch{throw Error('Design file is invalid JSON. Repair it before opening.')}
  if(!['atmem.ai-architect.project','atforma.project'].includes(file?.format)||!['2','3'].includes(String(file.formatVersion).split('.')[0])||
    !validId(file.meta?.id)||typeof file.meta?.name!=='string'||!Number.isInteger(file.meta?.revision)||file.meta.revision<1||
    !Array.isArray(file.design?.nodes)||!Array.isArray(file.design?.edges)||file.design.nodes.length>200||file.design.edges.length>600)
    throw Error('Unsupported Architect design. Update Architect or repair the project file.')
  return file
}
export async function designSources(root:string):Promise<DesignSource[]> {
  const result:DesignSource[]=[]
  for(const prefix of ['', 'design-documents/']) {
    let entries
    try {
      if(prefix&&(await lstat(resolve(root,'design-documents'))).isSymbolicLink())continue
      entries=await readdir(resolve(root,prefix),{withFileTypes:true})
    }catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')continue;throw error}
    for(const entry of entries)if(allowed(prefix+entry.name)&&(entry.isFile()||entry.isSymbolicLink())) {
      result.push({path:prefix+entry.name,name:prefix+entry.name})
      if(result.length>50)throw Error('Too many design files. Keep at most 50 in this folder.')
    }
  }
  return result.sort((a,b)=>a.path.localeCompare(b.path))
}
export function blankDesign(name:string):ProjectFile {
  const now=new Date().toISOString()
  return {format:'atmem.ai-architect.project',formatVersion:'2.3.0',meta:{id:randomUUID(),name,revision:1,createdAt:now,updatedAt:now},
    design:{provider:'tools',nodes:[],edges:[]},discovery:{problem:''},requirements:[],assumptions:[],openQuestions:[],decisions:[],extensions:{}}
}
export async function connectDesign(url:string,file:ProjectFile|undefined,projectId:string|undefined,name:string,fetcher:typeof fetch=fetch):Promise<string> {
  const signal=AbortSignal.timeout(25000)
  const session=await fetcher(url+'/api/session',{signal,redirect:'error'})
  if(!session.ok)throw Error('Architect could not connect. Retry opening your design.')
  const {token}=await session.json()
  if(typeof token!=='string'||!token)throw Error('Architect did not provide a local session.')
  const call=(action:string,body:unknown)=>fetcher(url+'/api/projects/'+action,{method:'POST',redirect:'error',signal,
    headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)})
  const id=projectId||file?.meta.id
  if(id) {
    if(!validId(id))throw Error('Invalid saved design link.')
    const existing=await call('get',{id})
    if(existing.ok)return id // Reopen live edits; never replace them with an older export.
    if(existing.status!==404)throw Error('Saved design is unavailable. Retry; existing work was not replaced.')
    if(projectId)throw Error('Linked design is missing or in the bin. Restore it in Architect’s Projects.')
  }
  const next=file||blankDesign(name)
  const saved=await call('save',{id:next.meta.id,file:next})
  if(!saved.ok) {
    const detail=await saved.json().catch(()=>({}))
    throw Error(typeof detail.detail==='string'?detail.detail:'Design could not be saved. Retry opening it.')
  }
  return next.meta.id
}
