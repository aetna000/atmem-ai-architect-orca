import {execFile} from 'node:child_process'
import {promisify} from 'node:util'
const run=promisify(execFile)
// Fixed native picker programs; selected paths are data, never shell commands.
async function nativePicker(signal?:AbortSignal):Promise<string|undefined> {
 const options={signal,timeout:120000,maxBuffer:65536}
 if(process.platform==='darwin'){
  const {stdout}=await run('/usr/bin/osascript',['-e','try','-e','POSIX path of (choose folder with prompt "Choose a project folder")','-e','on error number -128','-e','return ""','-e','end try'],options)
  return stdout.replace(/\r?\n$/,'')||undefined
 }
 if(process.platform==='win32'){
  const script='[Console]::OutputEncoding=[Text.UTF8Encoding]::new($false); Add-Type -AssemblyName System.Windows.Forms; $picker=New-Object System.Windows.Forms.FolderBrowserDialog; $picker.Description="Choose a project folder"; $picker.ShowNewFolderButton=$false; try { if($picker.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK){[Console]::Write($picker.SelectedPath)} } finally {$picker.Dispose()}'
  const {stdout}=await run('powershell.exe',['-NoProfile','-STA','-Command',script],options)
  return stdout||undefined
 }
 for(const [command,args] of [['zenity',['--file-selection','--directory','--title=Choose a project folder']],['kdialog',['--getexistingdirectory',process.cwd(),'--title','Choose a project folder']]] as const){
  try{const {stdout}=await run(command,[...args],options);return stdout.replace(/\r?\n$/,'')||undefined}
  catch(error){const code=(error as {code?:string|number}).code;if(code===1)return undefined;if(code!=='ENOENT')throw error}
 }
 throw Error('Folder picker unavailable. Enter the absolute folder path below.')
}

export async function chooseLocalFolder(signal?:AbortSignal):Promise<string|undefined>{
 try{return await nativePicker(signal)}catch(error){if(signal?.aborted)throw error;throw Error('Could not open the folder picker. Enter the absolute folder path below.')}
}
