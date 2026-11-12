export type Workspace = {id: string; name: string}
export type Overview = {workspaces: Workspace[]; url: string}
export type Action = {message: string}
export type Document = {path: string; label: string}
export {}
declare module 'orca' {
  interface PluginRequests {
    'architect.overview': {output: Overview}
    'architect.start': {input: {workspaceId:string}; output: Action}
    'architect.stop': {output: Action}
    'architect.open': {input: {workspaceId:string}; output: Action}
    'architect.documents': {input: {workspaceId:string}; output: {documents:Document[]}}
    'architect.document': {input: {workspaceId:string; path:string}; output: Action}
  }
}
