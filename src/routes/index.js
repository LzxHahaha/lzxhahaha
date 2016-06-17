import express from 'express';
var router = express.Router();
import fs from 'fs';
import {updateRSS} from './post';

/* GET home page. */
router.get('/', (req, res) => {
  res.send('Hello world');
});

router.get('/rss', async (req, res) => {
  res.set('Content-Type', 'application/xml; charset=utf-8');
  try {
    let file = fs.openSync('./data/rss.xml', 'r');
    let xml = fs.readFileSync(file);
    res.send(xml);
  }
  catch (err) {
    res.send(await updateRSS());
  }
});

export default router;
