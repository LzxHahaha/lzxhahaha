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

router.get('/list', (req, res) => {
  const {page, size} = req.query;
  Post.all(parseInt(page), parseInt(size))
    .then(result => {
      console.log('get result');
      result.toArray()
        .then(r => {
          let posts = r.map(el => ({
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
        });
    })
    .catch(err => {
      console.log('Get post list failed: ', err.message);
      res.send(failMessage(err.message));
    });
});

router.get('/detail/:id', (req, res) => {

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
    time: Date.now(),
    author: {
      _id: req.userInfo._id,
      // 保存用户名，方便列表查询
      username: req.userInfo.username
    },
    comments: []
  };
  Post.insertOne(data)
    .then(result => {
      res.send(success(result.ops));
    })
    .catch(err => {
      console.log('Insert new post failed: ', err.message);
      res.send(failMessage(err.message));
    });
});

router.post('/comment/:id', login, (req, res) => {
  const objId = new ObjectId(req.params.id);

  Post.find({_id: objId})
    .then(r => {
      r.toArray()
        .then(post => {
          if (post.length < 1) {
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

          Post.updateOne({_id: objId}, {
            $push: {comments: comment}
          }).then(() => {
            res.send(success())
          }).catch(err => {
            console.log(err.stack);
            res.send(failMessage('评论失败'));
          });
        });
    })
    .catch(err => {
      console.log('comment failed:', err.stack);
      res.send(failMessage());
    });
});

export default router;
