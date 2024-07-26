import config from 'config';
import express from 'express';
const router = express.Router();
import { redirectLogin } from '../utils/index';

import auth from './auth';
import request from './request';
import stream from './stream';
import download from './download';

router.get('/', redirectLogin, (req, res) => {
    const { user } = res.locals;
    let url = JSON.stringify(config.get('url'));
    url = JSON.parse(url);
    if (user) {
        res.render('homepage', url);
    }
});

router.use('/', auth);
router.use(config.get('url.request'), request);
router.use(config.get('url.stream'), stream);
router.use(config.get('url.download'), download);

export default router;
