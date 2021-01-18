import http from 'http';

import app from './app';

import console from './logger';

const port = 4000;

const host = '127.0.0.1';

http.createServer(app.handle).listen({host, port}, () => {
    console.info(`Server listen on ${host}:${port}`);
});
