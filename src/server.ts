import * as http from 'http';

import config from './config.server';

import app from './app';

import console from './logger';

const server = http.createServer(app.handleHTTP).listen(config, () => {
    console.info(`Server listen on http://${config.host}:${config.port}`);
});

require('socket.io')(server).on('connection', socket =>  app.handleWS(socket));
