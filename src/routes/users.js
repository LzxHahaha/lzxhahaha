import express from 'express';
import utils from 'utility';
import {ObjectId} from 'mongodb';

import DB from '../utils/DB';
import {successed, failMessage} from '../utils/responseData';

var router = express.Router();

var User = new DB('user');

router.post('/register', function(req, res) {
  const {username, password} = req.body;

  // TODO: 表单验证

  User.find({username})
    .then(r=>{
      r.toArray()
        .then(arr => {
          // 判断用户名重复
          if (arr.length > 0) {
            res.send(failMessage('User already been registered'));
            return;
          }

          let objId = new ObjectId();
          let token = md5(objId, [Date.now()]);

          let hashPwd = md5(password);
          User.insertOne({username, password: hashPwd, _id: objId, token})
            .then(user => {
              console.log('register success.', user.ops[0]);
              res.send(successed({token}));
            });
        });
    })
    .catch(err => {
      console.log('register error: ', err.stack);
      res.send(failMessage('注册失败'));
    });
});

router.post('/login', function (req, res) {
  const {username, password} = req.body;

  // TODO: 表单验证

  let hashPwd = md5(password);

  User.find({username, password: hashPwd})
    .then(r => {
      r.toArray()
        .then(arr => {
          if (arr.length === 0) {
            res.send(failMessage('用户名或密码错误'));
            return;
          }

          let user = arr[0];
          let token = md5(user._id, [Date.now()]);
          User.updateOne({_id: user._id}, {token})
            .then(r => {
              console.log(r);
              res.send(successed({token}));
            });
        });
    })
    .catch(err => {
      console.log('login error:', err.stack);
    });
});

export default router;

function md5(message, salts = []) {
  let config = require('../../config.json');

  let hash = utils.md5(message, 'base64');

  for (let salt of salts) {
    hash = utils.md5(hash + salt, 'base64');
  }

  return utils.md5(hash + config.salt, 'base64');
}
