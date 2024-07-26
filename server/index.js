import path from 'path';
import express from 'express';
import session from 'cookie-session';
import bodyParser from 'body-parser';
const app = express();
import config from 'config';

import router from './routes/index';

const { port = 3000, sessionLifetime = 1000 * 60 * 60 * 24 } = process.env;

app.set('trust proxy', true);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, config.get('paths.views')));
// app.use(cors());

app.use(
    session({
        name: 'sid',
        keys: ['key1', 'key2'],
        secret: 'EddeQ4',
        cookie: {
            maxAge: sessionLifetime,
            sameSite: true
        }
    })
);

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use((req, res, next) => {
    const { userId } = req.session;
    if (userId) {
        res.locals.user = config.get('users').find(user => user.id === userId);
    }
    next();
});

app.use((req, res, next) => {
    res.sseSetup = () => {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
        });
    };

    res.sseSend = data => {
        res.write('data: ' + JSON.stringify(data) + '\n\n');
    };

    next();
});

app.use(express.static(path.join(__dirname, config.get('paths.public'))));

app.use('/', router);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

// export default app;
