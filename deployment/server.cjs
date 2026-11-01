// Local deployment helper. Transactions are signed only by the browser wallet.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const {compile} = require('../code/scripts/compile.cjs');
const artifacts = compile();
const config = require('./config.json');
const server = http.createServer((req,res)=>{
  const host = req.headers.host;
  if (!['127.0.0.1:5176','localhost:5176'].includes(host)) {res.writeHead(403);return res.end();}
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  const routes = {
    '/':['text/html',path.join(__dirname,'index.html')],
    '/app.js':['text/javascript',path.join(__dirname,'app.js')],
    '/ethers.js':['text/javascript',path.join(root,'node_modules/ethers/dist/ethers.umd.min.js')]
  };
  if(req.url==='/bundle.json') {res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({config,artifacts}));}
  const route = routes[req.url];
  if(!route){res.writeHead(404);return res.end('Not found');}
  res.setHeader('Content-Type',route[0]);fs.createReadStream(route[1]).pipe(res);
});
server.listen(5176,'127.0.0.1',()=>console.log('MetaMask deployment: http://127.0.0.1:5176/ (BNB testnet only)'));
