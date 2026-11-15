import {defineCheck} from 'orca/testing'
const overview={workspaces:[],url:'http://127.0.0.1:5174',owned:false}
export default defineCheck({
 welcome:{requests:{'architect.overview':()=>overview}},
 folder:{persisted:{plugin:{project:'example'}},requests:{'architect.overview':()=>({...overview,workspaces:[{id:'example',name:'Support assistant'}]}),'architect.documents':()=>({documents:[],designs:[]})}},
 failed:{requests:{'architect.overview':()=>{throw Error('Could not load local folders. Reload folders to retry.')}}},
})
