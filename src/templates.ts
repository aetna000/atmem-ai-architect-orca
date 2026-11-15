import {readFile} from 'node:fs/promises'
import {randomUUID} from 'node:crypto'
import {templates} from '../panel/templates.mjs'
import type {ProjectFile} from './project-bridge'
export async function templateProject(id:string):Promise<ProjectFile> {
 const template=templates.find(t=>t.id===id)
 if(!template)throw Error('Choose a listed template.')
 const project=JSON.parse(await readFile(new URL('../assets/templates/'+template.id+'.json',import.meta.url),'utf8')) as ProjectFile
 const now=new Date().toISOString()
 project.meta={...project.meta,id:randomUUID(),name:template.title,createdAt:now,updatedAt:now,revision:1}
 project.extensions={...project.extensions as object,templateOrigin:{id:template.id,kind:'public-example',copiedAt:now}}
 return project
}

export async function readyExampleProject():Promise<ProjectFile> {
 return JSON.parse(await readFile(new URL('../assets/ready-example/project.atmem-ai-architect.json',import.meta.url),'utf8')) as ProjectFile
}
