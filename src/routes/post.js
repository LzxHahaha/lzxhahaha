/**
 * Created by LzxHahaha on 2016/5/11.
 */

import express from 'express';
let router = express.Router();

import {successed, fail, failMessage} from '../utils/responseData';
import {admin} from '../middlewares/auth';
import DB from '../utils/DB';

const DB_NAME = 'post';

let Post = new DB(DB_NAME);

router.get('/list', (req, res) => {
  const {page, size} = req.query;
  Post.all(parseInt(page), parseInt(size))
    .then(result => {
      console.log('get result');
      result.toArray()
        .then(r => {
          res.send(successed(r));
        });
    })
    .catch(err => {
      console.log('Get post list failed: ', err.message);
      res.send(failMessage(err.message));
    });
});

router.post('/new', admin, (req, res) => {
  const {title, content, category} = req.body;
  if (!title || !content) {
    res.send(fail(400));
  }

  let data = {
    title,
    content,
    category,
    time: Date.now()
  };
  Post.insertOne(data)
    .then(result => {
      res.send(successed(result.ops));
    })
    .catch(err => {
      console.log('Insert new post failed: ', err.message);
      res.send(failMessage(err.message));
    });
});

export default router;
