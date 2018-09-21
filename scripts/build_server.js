const { execSync } = require('child_process');
const { writeFileSync } = require('fs');
const pkg = require('../package.json');
const tsconfig = require('../tsconfig.server.json');
const buildDir = tsconfig.compilerOptions.outDir;

execSync('tsc -p tsconfig.server.json');
execSync(`cp src/config_schema.json ${buildDir}`);
execSync(`cp .env* ${buildDir}`);

delete pkg.devDependencies;
delete pkg.scripts;
delete pkg.prettier;
delete pkg.proxy;
pkg.private = true;

writeFileSync(`${buildDir}/package.json`, JSON.stringify(pkg, null, '  '));
writeFileSync(`${buildDir}/.npmrc`, 'package-lock=false\n');

execSync('npm i', { cwd: buildDir, stdio: 'inherit' });
