import { createServer } from 'http';
import { appConfig } from './config/env';
import { createApp } from './core/app';

const app = createApp();
const server = createServer(app);

server.listen(appConfig.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Matrix Hub backend running on port ${appConfig.port} in ${appConfig.env} mode.`);
});
