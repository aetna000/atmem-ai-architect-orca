import urllib.request,json,concurrent.futures,hashlib
from pathlib import Path
root=(Path(__file__).resolve().parents[1]/'.local/prepared-example/prices');root.mkdir(parents=True,exist_ok=True)
services=['AmazonCloudFront','AmazonApiGateway','AmazonDynamoDB','AmazonCognito','AmazonBedrock','AmazonS3','AWSLambda','AmazonCloudWatch']
def fetch(service):
 url=f'https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/{service}/current/'+('index.json' if service=='AmazonCloudFront' else 'ap-southeast-2/index.json')
 path=root/(service+'.json')
 try:
  if not path.exists():
   with urllib.request.urlopen(url,timeout=60) as r: data=r.read(60_000_001)
   if len(data)>60_000_000:raise ValueError('Catalog over 60 MB')
   json.loads(data);path.write_bytes(data)
  data=path.read_bytes();parsed=json.loads(data)
  return {'service':service,'url':url,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'publicationDate':parsed.get('publicationDate'),'products':len(parsed.get('products',{}))}
 except Exception as e:return {'service':service,'error':str(e),'url':url}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(fetch,services))
(root/'sources.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
