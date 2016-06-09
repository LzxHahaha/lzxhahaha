/**
 * Created by LzxHahaha on 2016/5/11.
 */

import express from 'express';
import {ObjectId} from 'mongodb';

let router = express.Router();

import {success, fail, failMessage} from '../utils/responseData';
import {login, admin} from '../middlewares/auth';
import DB from '../utils/DB';

const DB_NAME = 'post';

let Post = new DB(DB_NAME);

router.get('/list', async(req, res) => {
  const {page, size} = req.query;

  try {
    let result = await Post.all(parseInt(page), parseInt(size));
    let array = await result.sort({time: -1}).toArray();
    let posts = array.map(el => ({
      id: el._id,
      title: el.title,
      content: el.content,
      category: el.category,
      time: el.time,
      author: el.author,
      // 隐藏comments，只返回数量
      commentsCount: el.comments.length
    }));
    res.send(success(posts));
  }
  catch (err) {
    console.log('Get post list failed: ', err.message);
    res.send(fail());
  }
});

router.get('/detail/:id', async (req, res) => {
  const objId = new ObjectId(req.params.id);

  try {
    let result = await Post.find({'_id': objId});
    let arr = await result.toArray();
    if (arr.length < 1) {
      res.send(fail(404));
    }

    res.send(success(arr[0]));
  }
  catch (err) {
    console.log('Get post detail failed: ', err.message);
    res.send(fail());
  }
});

router.post('/new', admin, async(req, res) => {
  const {title, content, category} = req.body;
  if (!title || !content) {
    res.send(fail(400));
  }

  console.log('start')

  let data = {
    title,
    content,
    category,
    time: Date.now(),
    author: {
      _id: req.userInfo._id,
      // 保存用户名，方便列表查询
      username: req.userInfo.username
    },
    comments: []
  };

  try {
    let result = await Post.insertOne(data);
    res.send(success(result.ops));
  }
  catch (err) {
    console.log('Insert new post failed: ', err.message);
    res.send(fail());
  }
});

router.post('/comment/:id', login, async(req, res) => {
  const objId = new ObjectId(req.params.id);

  try {
    let result = await Post.find({_id: objId});
    let array = await result.toArray();

    if (array.length < 1) {
      res.send(fail(404))
    }

    let comment = {
      content: req.body.comment,
      time: Date.now(),
      author: {
        _id: req.userInfo._id,
        // 多存一份用户名
        username: req.userInfo.username
      }
    };

    await Post.updateOne({_id: objId}, {
      $push: {comments: comment}
    });
    res.send(success());
  }
  catch (err) {
    console.log('comment failed:', err.stack);
    res.send(fail());
  }
});

export default router;
