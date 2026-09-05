import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||4000);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
function safeFile(urlPath){let decoded;try{decoded=decodeURIComponent(urlPath.split('?')[0]);}catch{return null;}const normalized=path.normalize(decoded==='/'?'/index.html':decoded);const full=path.resolve(root,'.'+normalized);if(full!==root&&!full.startsWith(root+path.sep))return null;return full;}
const server=http.createServer((req,res)=>{const file=safeFile(req.url||'/');if(!file){res.writeHead(400);res.end('Bad request');return;}fs.stat(file,(err,stat)=>{if(err||!stat.isFile()){res.writeHead(404,{'content-type':'text/plain; charset=utf-8'});res.end('NexusLurkers: not found');return;}const ext=path.extname(file).toLowerCase();res.writeHead(200,{'content-type':types[ext]||'application/octet-stream','cache-control':'no-cache'});fs.createReadStream(file).pipe(res);});});
server.listen(port,'0.0.0.0',()=>console.log(`NexusLurkers running at http://127.0.0.1:${port}`));
