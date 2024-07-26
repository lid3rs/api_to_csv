import express from 'express';
const router = express.Router();
import { fork } from 'child_process';
import { redirectLogin, sseSender } from '../utils/index';
import path from 'path';
import config from 'config';

router.post(
    '/',
    redirectLogin,
    (req, res, next) => {
        if (req.query.pid) {
            const pid = req.query.pid;
            process.kill(pid, 'SIGTERM');
            sseSender({
                isDisabledButton: false
            });
            res.send();
        } else {
            next();
        }
    },
    (req, res) => {
        const child = fork(path.join(__dirname, config.get('paths.getCatalog')), null, {
            detached: true
        });
        child.on('message', data => {
            sseSender({
                ...data,
                isDisabledButton: true,
                pid: child.pid
            });
        });
        child.unref();
        res.sendStatus(202);
    }
);
export default router;
