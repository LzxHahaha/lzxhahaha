import express from 'express';
import utils from 'utility';
import {ObjectId} from 'mongodb';

import DB from '../utils/DB';
import {success, fail, failMessage} from '../utils/responseData';
import {login} from "../middlewares/auth";

var router = express.Router();

var User = new DB('user');

router.post('/register', async(req, res) => {
  const {username, password} = req.body;

  // TODO: 表单验证

  try {
    let result = await User.findOne({username});
    let arr = await result.toArray();
    // 判断用户名重复
    if (arr.length > 0) {
      res.send(failMessage('用户已注册'));
      return;
    }

    // 手动建ObjectId，直接算出token并写入
    let objId = new ObjectId();
    // Token 为id+当前时间戳的md5
    let token = md5(objId, [Date.now()]);

    let hashPwd = md5(password);

    let user = await User.insertOne({username, password: hashPwd, _id: objId, token});
    console.log('register success.', user.ops[0]);
    res.send(success({token}));
  }
  catch (err) {
    console.log('register error: ', err.stack);
    res.send(fail());
  }
});

router.post('/login', async(req, res) => {
  const {username, password} = req.body;

  // TODO: 表单验证

  let hashPwd = md5(password);

  try {
    let result = await User.findOne({username, password: hashPwd});
    let arr = await result.toArray();
    if (arr.length < 1) {
      res.send(failMessage('用户名或密码错误'));
      return;
    }

    let user = arr[0];
    let token = md5(user._id, [Date.now()]);

    // 更新token
    await User.updateOne({_id: user._id}, {$set: {token}});
    res.send(success({token}));
  }
  catch (err) {
    console.log('login error:', err.stack);
    res.send(fail());
  }
});

router.post('/info', login, async(req, res) => {
  let userInfo = req.userInfo;
  userInfo.password = undefined;
  res.send(success(userInfo));
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
