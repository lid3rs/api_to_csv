import config from 'config';

export const redirectLogin = (req, res, next) => {
    if (!req.session.userId) res.redirect(config.get('url.login'));
    else next();
};
export const redirectHome = (req, res, next) => {
    if (req.session.userId) res.redirect('/');
    else next();
};

export let connections = [];

export function sseSender(obj) {
    for (var i = 0; i < connections.length; i++) {
        connections[i].sseSend(obj);
    }
}
