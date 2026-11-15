"""Seed only the new example's idle engineering workspace; supplied backend inputs remain untouched."""
from pathlib import Path
import json,shutil
root=Path(__file__).resolve().parents[1];source=root/'.local/prepared-example/generated'
registration=json.loads((root/'.local/prepared-example/engineering-session.json').read_text())
project=registration['projectId']
if project!='atmem-ai-ready-example-v1' or registration['session']['last_status'] is not None:raise RuntimeError('Use a new idle prepared-example session')
found=[]
for folder in (Path.home()/'.atforma/workspaces').glob('atm-job-*'):
    context=folder/'project-context.json'
    if context.is_file() and json.loads(context.read_text()).get('meta',{}).get('id')==project:found.append(folder)
if len(found)!=1:raise RuntimeError('Expected one new example workspace')
workspace=found[0]
for path in source.rglob('*'):
    if not path.is_file() or any(p in {'.terraform','__pycache__','.worker-tmp'}for p in path.parts):continue
    relative=path.relative_to(source)
    if str(relative).startswith('terraform/build/') and path.suffix!='.zip' and path.name!='artifact-hashes.json':continue
    target=workspace/relative
    if target.exists():raise RuntimeError('Refusing to overwrite workspace file: '+str(relative))
    target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,target)
print(json.dumps({'projectId':project,'seeded':True,'builtLambdaZipIncluded':True}))
