import {createRequire} from 'node:module';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('vite'))('esbuild');
export async function loadTs(path){
 const dir=await mkdtemp(tmpdir()+'/zeitkonto-module-');
 try{await build({entryPoints:[path],bundle:true,platform:'node',format:'esm',outfile:dir+'/module.mjs'});return await import(pathToFileURL(dir+'/module.mjs'))}finally{await rm(dir,{recursive:true,force:true})}
}
