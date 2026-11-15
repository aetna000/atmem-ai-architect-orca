export type Workspace = {id: string; name: string}
export type Overview = {workspaces: Workspace[]; url: string;owned:boolean;runtime:'ready'|'offline'|'occupied'}
export type Action = {message: string;workspaceId?:string;projectId?:string}
export type Document = {path: string; label: string}
export {}
declare module 'orca' {
  interface PluginRequests {
    'architect.overview': {output: Overview}
    'architect.start': {input: {workspaceId:string}; output: Action}
    'architect.stop': {output: Action}
    'architect.open': {input: {workspaceId?:string;name?:string;source?:string}; output: Action}
    'architect.documents': {input: {workspaceId:string}; output: {documents:Document[];designs:{path:string;name:string}[]}}
    'architect.document': {input: {workspaceId:string; path:string}; output: Action}
  }
  interface PluginPanelEvents {'architect.progress':{message:string}}
}
