const { load } = require('dotenv-safe');
const { execSync } = require('child_process');
const { join } = require('path');

load();

const deployDir = process.env.DEPLOY_DIR;
if (!deployDir) {
  console.error('DEPLOY_DIR not set');
  process.exit(1);
}

const www = join(deployDir, 'www');
execSync(`rm -rf ${www}`);
execSync(`mv build ${www}`);

const server = join(deployDir, 'homeui', 'server');
execSync(`rm -rf ${server}`);
execSync(`mv build_server ${server}`);
