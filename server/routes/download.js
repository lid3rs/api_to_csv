import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.setHeader('Content-disposition', 'attachment; filename=products.csv');
    res.setHeader('Content-Type', 'text/csv');

    res.download(req.query.link, 'products.csv', err => {
        if (err) console.error(err);
    });
});
export default router;
