import config from 'config';
import express from 'express';
const router = express.Router();
import { redirectHome } from '../utils/index';

router.get(config.get('url.login'), redirectHome, (req, res) => {
    let url = JSON.stringify(config.get('url'));
    url = JSON.parse(url);
    res.render('form', url);
});

router.post(config.get('url.login'), (req, res) => {
    const { name, password } = req.body;
    if (name && password) {
        const user = config.get('users').find(user => user.name === name && user.password === password);
        if (user) {
            req.session.userId = user.id;
            if (req.session.userId) {
                return res.redirect('/');
            }
        } else {
            return res.redirect(config.get('url.login'));
        }
    }
});

router.post(config.get('url.logout'), (req, res) => {
    req.session = null;
    res.clearCookie(process.env.sessionId);
    res.redirect(config.get('url.login'));
});
export default router;
