"""Run the bundled bounded-RAG and source-contract tests without installing packages or calling AWS."""
from pathlib import Path
import json
import sys
import tempfile
import unittest
import zipfile
root=Path(__file__).resolve().parents[1]
archives=sorted((root/'terraform/build').glob('block_*.zip'))
if len(archives)!=1:raise RuntimeError('Expected one generated Lambda artifact')
temporary=root/'.worker-tmp';temporary.mkdir(exist_ok=True)
with tempfile.TemporaryDirectory(prefix='example-tests-',dir=temporary) as folder:
    with zipfile.ZipFile(archives[0]) as archive:archive.extractall(folder)
    sys.path.insert(0,folder)
    suite=unittest.defaultTestLoader.discover(str(root/'terraform/app-tests'),pattern='*_test.py')
    result=unittest.TextTestRunner(verbosity=2).run(suite)
    print(json.dumps({'status':'passed'if result.wasSuccessful()else'failed','tests':result.testsRun,'failures':len(result.failures),'errors':len(result.errors),'scope':'Local application and normalized-source contract checks; cloud deployment and real tenant integration not run.'}))
    raise SystemExit(0 if result.wasSuccessful()else 1)
