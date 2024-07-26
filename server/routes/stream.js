import express from 'express';
const router = express.Router();
import { connections } from '../utils/index';

router.get('/', (req, res) => {
    res.sseSetup();
    connections.push(res);
});

export default router;
