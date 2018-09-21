/**
 * A simple server that stores config data in a JSON file.
 */

import * as express from 'express';
import * as program from 'commander';
import * as proxy from 'http-proxy-middleware';
import * as cors from 'cors';
import { watch } from 'chokidar';
import { readFile, writeFile } from 'fs';
import { apply as patch } from 'json-patch';
import { deepEqual, clone } from './util';
import * as Ajv from 'ajv';
import { Config } from './types';
import { connect } from './socket';
import { load as loadEnv } from 'dotenv-safe';
import { parse as parseUrl } from 'url';
import { parse as parseQuery } from 'querystring';
import * as WebSocket from 'ws';

loadEnv();

program
  .option('-p, --port <port>', 'port to listen on (default is 3003)')
  .option('-w, --ws-port <port>', 'ws port to listen on (default is 3004)')
  .option('-c, --config <path>', 'config file (default is .homeui.json)')
  .option('-d, --debug', 'enable debug logging')
  .parse(process.argv);

const port = program.port || process.env.REACT_APP_HOMEUI_PORT || 3003;
const configFile = program.config || '.homeui.json';
const host = process.env.REACT_APP_HUBITAT_HOST;
const dashboard = process.env.DASHBOARD;
const wsConnections: WebSocket[] = [];

const dashboardUrl = parseUrl(dashboard!);
const params = parseQuery(dashboardUrl.query!);
const token = params.access_token;
const dashboardPath = dashboardUrl.pathname;

console.log(`Using dashboard at ${dashboardPath}`);
console.log(`Using token ${token}`);

const ajv = new Ajv();
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
const configSchema = require('./config_schema.json');
const validateConfig = ajv.compile(configSchema);

let config: Config;

(async () => {
  try {
    log(`Using config file ${configFile}`);

    const watcher = watch(configFile);
    watcher.on('ready', () => {
      watcher.on('change', () => {
        loadConfig().then(newConfig => {
          if (!deepEqual(newConfig, config)) {
            config = newConfig;
            publishConfig(config);
          }
        });
      });
    });

    const app = express();

    app.use(cors());

    app.use(
      proxy('/device/list', {
        target: `http://${host}${dashboardPath}/devices`,
        pathRewrite: {
          '^/device/list': ''
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
    );

    app.use(
      proxy('/device', {
        target: `http://${host}`
      })
    );

    app.get('/config', (req, res) => {
      res.send(config);
    });

    app.patch('/config', express.json(), (req, res) => {
      const resSend = res.send;
      res.send = function(body?: object) {
        return resSend.apply(res, arguments);
      };

      const data = req.body;
      log(`Patching config with ${JSON.stringify(data, null, '  ')}`);
      try {
        const newConfig = clone(config);
        patch(newConfig, data);

        if (!validateConfig(newConfig)) {
          console.log(newConfig);
          throw new Error('Invalid config');
        }

        config = newConfig;
        saveConfig().then(
          () => {
            try {
              res.send(config);
            } catch (error) {
              console.error('Error sending:', error);
            }
          },
          error => {
            console.error('Error saving:', error);
            res.status(400).send(error.message);
          }
        );
        publishConfig(config);
      } catch (error) {
        console.error('Error updating:', error);
        res.status(400).send(error.message);
      }
    });

    app.use(express.static('build'));

    loadConfig().then(configData => {
      config = configData;
      console.log('loaded', config);

      const server = app.listen(port);
      server.on('upgrade', (request, socket, head) => {
        const pathname = parseUrl(request.url).pathname;
        if (pathname === '/eventsocket') {
          wsServer.handleUpgrade(request, socket, head, ws => {
            wsServer.emit('connection', ws);
          });
        } else {
          socket.destroy();
        }
      });

      log(`Listening on port ${port}...`);
    });
  } catch (error) {
    log(error.message);
    process.exit(1);
  }

  const wsServer = new WebSocket.Server({
    noServer: true
  });
  wsServer.on('connection', ws => {
    console.log('Client connected to eventsocket');
    wsConnections.push(ws);
    ws.on('close', () => {
      const index = wsConnections.indexOf(ws);
      if (index !== -1) {
        console.log('Removing connection');
        wsConnections.splice(index, 1);
      }
    });
  });

  connect(WebSocket, `ws://${host}/eventsocket`, socket => {
    console.log('Connected to Hubitat');

    socket.addEventListener('message', event => {
      const message = JSON.parse(event.data);
      if (message.source === 'DEVICE') {
        if (program.debug) {
          debug(
            `Received ${message.name} -> ${message.value} for ${
              message.deviceId
            }`
          );
        }
        const msg = JSON.stringify({
          type: 'device',
          payload: {
            deviceId: message.deviceId,
            attribute: message.name,
            value: message.value
          }
        });

        if (program.debug) {
          debug(`Sending to ${wsConnections.length} clients...`);
        }

        wsConnections.forEach(ws => {
          ws.send(msg);
        });
      }
    });
  });

  function loadConfig() {
    return new Promise<Config>((resolve, reject) => {
      readFile(configFile, { encoding: 'utf8' }, (error, data) => {
        if (error) {
          if (error.code === 'ENOENT') {
            resolve(<Config>{
              rooms: {},
              devices: {}
            });
          } else {
            reject(error);
          }
        } else {
          const cfg = JSON.parse(data);
          if (!cfg.rooms) {
            cfg.rooms = {};
          }
          if (!cfg.devices) {
            cfg.devices = {};
          }
          resolve(cfg);
        }
      });
    });
  }

  function saveConfig() {
    return new Promise((resolve, reject) => {
      writeFile(configFile, JSON.stringify(config, null, '  '), error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  function publishConfig(cfg: object) {
    log('Publishing new config...');
    wsConnections.forEach(ws => {
      ws.send(
        JSON.stringify({
          type: 'config',
          payload: cfg
        })
      );
    });
  }
})();

// tslint:disable-next-line:no-any
function log(...args: any[]) {
  console.log(
    `[${new Date().toLocaleTimeString('en-US', { hour12: false })}]`,
    ...args
  );
}

// tslint:disable-next-line:no-any
function debug(...args: any[]) {
  console.log(
    `[${new Date().toLocaleTimeString('en-US', { hour12: false })}]`,
    ...args
  );
}
