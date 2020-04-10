/**
 * @file 服务端入口文件
 * @author 小强赵
 */

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import getIp from 'get-ip';
import {
    Nuxt,
    Builder
} from 'nuxt';

import apiRouter from './api-router';
import NuxtConfig from '../nuxt.config.js';
import config from './config.js';
import ssrCookie from './middlewares/ssr-cookie.js';

const app = express();
const host = getIp() || '127.0.0.1';
const port = process.env.PORT || config.port;

app.use(bodyParser.json());
app.use(cookieParser(config.sessionSecret));
app.set('port', port);

// SSR Cookie
app.use(ssrCookie);
// Import API Routes
app.use('/api', apiRouter);
// 静态文件
app.use('/upload-files', express.static(__dirname + '/../upload-files/'));

NuxtConfig.dev = !(process.env.NODE_ENV === 'production');

// Init Nuxt.js
const nuxt = new Nuxt(NuxtConfig);

// Build only in dev mode
if (NuxtConfig.dev) {
    const builder = new Builder(nuxt);
    builder.build();
}

// Give nuxt middleware to express
app.use(nuxt.render);

// Listen the server
app.listen(port, host);
console.log('Server listening on ' + host + ':' + port); // eslint-disable-line no-console
