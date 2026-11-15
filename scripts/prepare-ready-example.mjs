// Rebuild the prepared example from its source project and official AWS price catalogs.
import fs from 'node:fs/promises'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {gzipSync} from 'node:zlib'
import {createRequire} from 'node:module'
const root=path.resolve(import.meta.dirname,'..')
const engine=process.env.ARCHITECT_SOURCE_DIR
if(!engine)throw Error('Set ARCHITECT_SOURCE_DIR to the pinned Architect source package.')
const metadata=JSON.parse(await fs.readFile(path.join(engine,'package.json'),'utf8'))
if(metadata.version!=='0.2.1')throw Error('This producer is qualified against Architect 0.2.1.')
const moduleAt=name=>import(pathToFileURL(path.join(engine,'src',name)).href)
const [{fromProjectFile,toProjectFile},{deliveryPack},{estimate},{zipSync,strToU8}]=await Promise.all([moduleAt('project-file.mjs'),moduleAt('delivery.mjs'),moduleAt('estimate.mjs'),import(pathToFileURL(createRequire(path.join(engine,'package.json')).resolve('fflate')).href)])
const prices=path.join(root,'.local/prepared-example/prices'),out=path.join(root,'assets/ready-example')
await fs.mkdir(out,{recursive:true})
const sources=JSON.parse(await fs.readFile(path.join(prices,'sources.json'),'utf8'))
const catalogs={}
for(const source of sources){
 if(source.error)throw Error(source.error)
 const bytes=await fs.readFile(path.join(prices,source.service+'.json'))
 if(createHash('sha256').update(bytes).digest('hex')!==source.sha256)throw Error('Price catalog digest changed.')
 catalogs[source.service]=JSON.parse(bytes)
 await fs.mkdir(path.join(out,'price-catalogs'),{recursive:true})
 await fs.writeFile(path.join(out,'price-catalogs',source.service+'.json.gz'),gzipSync(bytes))
}
const day=new Date().toISOString().slice(0,10),ledger=[]
function meter(service,usage,begin='0'){
 const catalog=catalogs[service],found=[]
 for(const [sku,product]of Object.entries(catalog.products))if(product.attributes.usagetype===usage)
  for(const term of Object.values(catalog.terms.OnDemand[sku]||{}))for(const dimension of Object.values(term.priceDimensions))
   if(dimension.beginRange===begin)found.push({sku,attributes:product.attributes,effectiveDate:term.effectiveDate,...dimension})
 if(found.length!==1)throw Error('Expected one exact price meter for '+service+'/'+usage+', found '+found.length)
 return found[0]
}
function charge(componentId,description,quantity,service,usage,{begin='0',note=''}={}){
 const price=meter(service,usage,begin),source=sources.find(s=>s.service===service)
 const item={id:'example-charge-'+(ledger.length+1),componentId,description,quantity,price:Number(price.pricePerUnit.USD),unit:price.unit,currency:'USD',source:source.url+'#'+price.sku,date:day,region:service==='AmazonCloudFront'?'Australia / Global':'ap-southeast-2',service:service,sku:price.sku,meter:price.rateCode,sourceSha256:source.sha256,note}
 ledger.push(item);return item
}
function reference(componentId,description){const item={id:'example-charge-'+(ledger.length+1),componentId,description,quantity:1,price:0,unit:'existing reference',currency:'USD',source:'Example scope: existing browser or local normalized source-contract fixture; no incremental AWS resource.',date:day,region:'Local reference',service:'Existing reference',note:'Existing paid tenant/license integrations are not part of this local contract example.'};ledger.push(item);return item}
const raw=JSON.parse(await fs.readFile(path.join(root,'assets/templates/knowledge-assistant.json'),'utf8'))
const {project}=fromProjectFile(raw)
project.id='atmem-ai-ready-example-v1';project.name='AI knowledge assistant — complete example';project.revision=2
for(const node of project.nodes)if(node.data.provider==='aws')node.data.config.region='ap-southeast-2'
for(const decision of project.decisions)if(decision.context?.includes('region is unselected')){decision.status='Superseded';decision.supersededBy='example-region'}
project.decisions.push(...[
 ['example-region','cloud.region','ap-southeast-2','Sydney is selected by the example author for this sample, not as approval for a client deployment.'],
 ['example-country','data.country','Australia','Example data location; source fixtures run locally. Production residency requires destination review.'],
 ['example-model','model.bedrock','amazon.nova-lite-v1:0','Direct Nova Lite in Sydney. Published regional/Converse support reviewed; account access and quotas remain destination checks.'],
 ['example-retention','logs.retention','30 days','CloudWatch retention for this bounded example. Confirm real client policy before deployment.'],
].map(([id,subject,decision,context])=>({id,subject,title:subject,decision,context,owner:'AtMem example defaults',status:'Accepted',date:day,revision:1,reason:'Prepared example configuration'})))
project.useCases=[
 {id:'example-browser',title:'Signed-in browser answers with citations and source permissions',value:'High',risk:'Medium',fit:'High',verdict:'Pursue',reason:'Implemented by the generated web/API/catalog/model path; local tests cover cited answers and authorization.'},
 {id:'example-sync',title:'Local normalized source snapshots, updates and deletes',value:'High',risk:'Medium',fit:'High',verdict:'Pursue',reason:'The bundled contract fixtures qualify the normalized interface. Real Microsoft/Atlassian tenants are separate destination integration work.'},
 {id:'example-native-tenants',title:'Native SharePoint and Confluence tenant adapters',value:'High',risk:'High',fit:'Medium',verdict:'Park',reason:'The original example explicitly uses approved normalized local test servers. No native tenant or permissions compatibility is claimed.'},
 {id:'example-teams',title:'Microsoft Teams channel',value:'Medium',risk:'Medium',fit:'Medium',verdict:'Park',reason:'Retained from the original deferred-channel note; not part of this example.'}
]
project.extensions={...project.extensions,originalExampleRequirements:structuredClone(project.needs)}
for(const need of project.needs){need.source='user';need.basis=(need.basis||'')+' Confirmed by the prepared-example author for the bounded local source-contract sample; not a client approval.'}
project.needs.find(r=>r.id==='req-104d29bf').links=['web','api','rag-fn','model']
project.needs.push({id:'example-australia',kind:'nonfunctional',category:'compliance',statement:'Example application data, model processing and audit logs stay in the selected Australia/Sydney region; source fixtures run locally.',priority:'must',status:'open',source:'user',basis:'Prepared-example author default; destination account/residency verification remains required.',links:['web','cognito','api','rag-fn','catalog','model']})
project.facts=[...(project.facts||[]),{id:'example-budget',name:'budget.per_month',value:20,unit:'USD/month',text:'Illustrative example-author budget target, not a client-approved budget.',madeAt:day}]
const model=project.nodes.find(n=>n.id==='model');model.data.config.modelId='amazon.nova-lite-v1:0'
project.nodes.find(n=>n.id==='rag-fn').data.config={...project.nodes.find(n=>n.id==='rag-fn').data.config,memoryMb:256,estimatedDurationMs:5000}
project.assumptions.push({id:'example-usage',statement:'Monthly sample: 100 users, 10,000 answers, 2,000 input and 1,000 output tokens per answer, 256 MiB ARM Lambda for 5 seconds; no free-tier credits.',madeAt:new Date().toISOString()},
 {id:'example-cost-scope',statement:'Incremental AWS costs only. Browser and existing normalized local source fixtures carry no new AWS resource cost. SaaS licenses, tax, support plans and labor are outside this sample.',madeAt:new Date().toISOString()})
reference('user','Existing staff browser')
charge('web','CloudFront Australia HTTPS requests',10000,'AmazonCloudFront','AU-Requests-Tier2-HTTPS')
charge('web','CloudFront Australia internet egress (GB)',10,'AmazonCloudFront','AU-DataTransfer-Out-Bytes')
charge('web','S3 assets and all retained object versions (GB-month)',1,'AmazonS3','APS2-TimedStorage-ByteHrs')
charge('web','S3 asset uploads and listing requests',1000,'AmazonS3','APS2-Requests-Tier1')
charge('web','S3 origin GET requests',10000,'AmazonS3','APS2-Requests-Tier2')
charge('cognito','Cognito Essentials monthly active users',100,'AmazonCognito','APS2-CognitoEssentialsMAU')
charge('api','HTTP API requests',10000,'AmazonApiGateway','APS2-ApiGatewayHttpRequest')
charge('api','API access log ingestion (GB)',.5,'AmazonCloudWatch','APS2-DataProcessing-Bytes')
charge('api','API access log storage (GB-month)',.5,'AmazonCloudWatch','APS2-TimedStorage-ByteHrs')
charge('rag-fn','Lambda requests',10000,'AWSLambda','APS2-Request')
charge('rag-fn','Lambda ARM 256 MiB × 5 seconds × 10,000 answers',12500,'AWSLambda','APS2-Lambda-GB-Second-ARM')
charge('rag-fn','Lambda log ingestion (GB)',.5,'AmazonCloudWatch','APS2-DataProcessing-Bytes')
charge('rag-fn','Lambda log storage (GB-month)',.5,'AmazonCloudWatch','APS2-TimedStorage-ByteHrs')
charge('catalog','DynamoDB read request units; bounded scans and identity reads',1050000,'AmazonDynamoDB','APS2-ReadRequestUnits')
charge('catalog','DynamoDB conditional write request units',10000,'AmazonDynamoDB','APS2-WriteRequestUnits')
charge('catalog','DynamoDB standard storage; free allowance assumed consumed',.1,'AmazonDynamoDB','APS2-TimedStorage-ByteHrs',{begin:'25',note:'Conservative marginal cost with no free allowance applied.'})
charge('catalog','DynamoDB point-in-time recovery storage (GB-month)',.1,'AmazonDynamoDB','APS2-TimedPITRStorage-ByteHrs')
charge('model','Nova Lite input tokens (1,000-token units)',20000,'AmazonBedrock','APS2-NovaLite-input-tokens')
charge('model','Nova Lite output tokens (1,000-token units)',10000,'AmazonBedrock','APS2-NovaLite-output-tokens')
reference('sp-src','Existing local SharePoint contract fixture')
reference('cf-src','Existing local Confluence contract fixture')
project.estimate={projectSize:'small',usage:{requests_per_month:10000,tokens_per_request:3000,data_gb:.1,events_per_month:10000,endpoint_hours:0,training_hours:0},details:ledger,low:.7,high:1.5}
project.extensions={...project.extensions,preparedExample:{version:1,owner:'AtMem example author',scope:'Bounded AWS knowledge assistant with local normalized source fixtures',priceDate:day,priceLedger:'evidence/price-ledger.json',cloudDeployment:'not_run',assumptionNotice:'Sample configuration and usage, not client approval or a quote.'},priceLedger:ledger,priceSources:sources}
const file=toProjectFile(project),roundtrip=fromProjectFile(file).project,cost=estimate(roundtrip)
if(!cost.complete||cost.gaps.length)throw Error('Prepared estimate still has gaps: '+cost.gaps.join('; '))
await fs.writeFile(path.join(out,'project.atmem-ai-architect.json'),JSON.stringify(file,null,2)+'\n')
await fs.writeFile(path.join(out,'price-ledger.json'),JSON.stringify({version:1,date:day,scope:project.extensions.preparedExample.scope,assumptions:project.assumptions.filter(a=>a.id.startsWith('example-')),lines:ledger,sources},null,2)+'\n')
const files=deliveryPack(roundtrip,null)
files['design-reference-START_HERE.md']=files['START_HERE.md']
files['START_HERE.md']=await fs.readFile(path.join(root,'packaging/READY_EXAMPLE.md'),'utf8')
files['scripts/check-example.py']=await fs.readFile(path.join(root,'packaging/check-example.py'),'utf8')
const preparedInputs=JSON.parse(files['terraform/deployment.tfvars.json.example']);preparedInputs.aws_region='ap-southeast-2'
files['terraform/prepared-example.tfvars.json.example']=JSON.stringify(preparedInputs,null,2)+'\n'

files['evidence/price-ledger.json']=JSON.stringify({lines:ledger,sources},null,2)
for(const source of sources)files['evidence/price-catalogs/'+source.service+'.json.gz']=await fs.readFile(path.join(out,'price-catalogs',source.service+'.json.gz'))
const workspace=path.join(root,'.local/prepared-example/generated');await fs.mkdir(workspace,{recursive:true})
for(const [name,value]of Object.entries(files)){const destination=path.join(workspace,name);await fs.mkdir(path.dirname(destination),{recursive:true});await fs.writeFile(destination,value)}
const bytes=zipSync(Object.fromEntries(Object.entries(files).map(([name,value])=>[name,typeof value==='string'?strToU8(value):value])))
await fs.writeFile(path.join(out,'design-and-source.zip'),bytes)
const receipt={producer:'Architect '+metadata.version,projectId:project.id,files:Object.keys(files).length,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),cost:{monthly:cost.expected,currency:cost.currency,maturity:cost.maturity,complete:cost.complete},validation:'pending independent checks',cloudDeployment:'not_run'}
await fs.writeFile(path.join(out,'preparation.json'),JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify(receipt,null,2))
