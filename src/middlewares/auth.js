/**
 * Created by LzxHahaha on 2016/5/28.
 */

import DB from '../utils/DB';
import {fail, failMessage} from '../utils/responseData';

let User = new DB('user');

export async function login(req, res, next) {
  let failed = fail(401);

  try {
    let token = req.header('X-Token');
    console.log(token);
    if (!token) {
      res.send(failed);
      return;
    }

    let result = await User.find({token: token}, 1, 1);
    let user = await result.toArray();

    if (user.length === 1) {
      req.userInfo = user[0];
      next();
    }
    else {
      res.send(failed);
    }
  }
  catch (err) {
    console.log(err.stack);
    res.send(failed);
  }
}

export async function admin(req, res, next) {
  let failed = failMessage('权限不足');

  try {
    let token = req.header('X-Token');
    console.log(token);
    if (!token) {
      res.send(failed);
      return;
    }

    let result = await User.find({token: token}, 1, 1);
    let user = await result.toArray();
    if (user.length > 0 && user[0].isAdmin) {
      req.userInfo = user[0];
      next();
    }
    else {
      res.send(failed);
    }
  }
  catch (err) {
    console.log(err.stack);
    res.send(failed);
  }

}
