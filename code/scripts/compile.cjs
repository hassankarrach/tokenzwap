const fs = require('node:fs');
const path = require('node:path');
const solc = require('solc');
const root = path.resolve(__dirname, '../..');
function compile({fixtures = false} = {}) {
  const dir = path.join(root, 'code/contracts');
  const sources = Object.fromEntries(fs.readdirSync(dir).filter(f => f.endsWith('.sol')).map(f => [f, {content: fs.readFileSync(path.join(dir,f),'utf8')}]));
  if (fixtures) sources['Buyer.sol'] = {content:fs.readFileSync(path.join(root,'code/tests/fixtures/Buyer.sol'),'utf8')};
  const input = {language:'Solidity', sources, settings:{optimizer:{enabled:true,runs:200},evmVersion:'paris',outputSelection:{'*':{'*':['abi','evm.bytecode.object','evm.deployedBytecode.object']}}}};
  const output = JSON.parse(solc.compile(JSON.stringify(input), {import: name => {
    try {return {contents:fs.readFileSync(path.join(root,'node_modules',name),'utf8')}} catch {return {error:'Missing import: '+name}}
  }}));
  for (const error of output.errors || []) console.error(error.formattedMessage);
  if ((output.errors || []).some(e => e.severity === 'error')) throw Error('Solidity compilation failed');
  const artifacts = {};
  fs.mkdirSync(path.join(root,'artifacts'),{recursive:true});
  for (const [file,contracts] of Object.entries(output.contracts)) {
    if (!sources[file]) continue;
    for (const [name,c] of Object.entries(contracts)) {
      artifacts[name] = {contractName:name,compiler:solc.version(),evmVersion:'paris',optimizer:input.settings.optimizer,abi:c.abi,bytecode:'0x'+c.evm.bytecode.object};
      fs.writeFileSync(path.join(root,'artifacts',name+'.json'),JSON.stringify(artifacts[name],null,2)+'\n');
    }
  }
  return artifacts;
}
if (require.main === module) console.log('Compiled:',Object.keys(compile()).join(', '));
module.exports = {compile};
