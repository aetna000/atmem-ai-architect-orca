import {defineCheck} from 'orca/testing'
const results={'workspace.list':{workspaces:[],truncated:false},'settings.get':{settings:{port:5174}}}
export default defineCheck({empty:{results},failed:{results:{...results,'workspace.list':{workspaces:[],truncated:true}}}})
