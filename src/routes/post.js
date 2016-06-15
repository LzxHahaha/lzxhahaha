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
  const {page, size, tag} = req.query;
  const category = tag || /.*/;

  try {
    let result = await Post.find({category}, parseInt(page), parseInt(size));
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
    let result = await Post.find({'_id': objId}, 1, 1);

    let arr = await result.toArray();
    if (arr.length < 1) {
      res.send(fail(404));
    }
    let data = arr[0];

    // 查询前后
    let prev = await (await Post.findAll({time: {'$lt': data.time}})).sort({time: -1}).toArray();
    if (prev.length > 0) {
      data.prev = prev[0]._id;
    }
    let next = await (await Post.find({time: {'$gt': data.time}})).toArray();
    if (next.length > 0) {
      data.next = next[0]._id;
    }

    res.send(success(data));
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
    let result = await Post.find({_id: objId}, 1, 1);
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

router.post('/edit/:id', admin, async(req, res) => {
  const objId = new ObjectId(req.params.id);
  const {title, content, category} = req.body;
  if (!title || !content) {
    res.send(fail(400));
  }

  try {
    let result = await Post.find({_id: objId}, 1, 1);
    let array = await result.toArray();

    if (array.length < 1) {
      res.send(fail(404))
    }

    await Post.updateOne({_id: objId}, {
      $set: {title, content, category}
    });
    res.send(success());
  }
  catch (err) {
    console.log('comment failed:', err.stack);
    res.send(fail());
  }
});

export default router;
