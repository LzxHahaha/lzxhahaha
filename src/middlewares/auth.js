/**
 * Created by LzxHahaha on 2016/5/28.
 */

import DB from '../utils/DB';
import {fail} from '../utils/responseData';

let User = new DB('user');

export function login(req, res, next) {
  let failed = fail(401);

  let token = req.header('token');
  if (!token) {
    res.send(failed);
    return;
  }

  User.find({token: token})
    .then(r => {
      r.toArray()
        .then(user=>{
          if (user.length === 1) {
            req.userInfo = user[0];
            next();
          }
          else {
            res.send(failed);
          }
        })
    });
}

export function admin(req, res, next) {
  let failed = fail(401);

  let token = req.header('token');
  if (!token) {
    res.send(failed);
    return;
  }

  User.find({token: token})
    .then(r => {
      r.toArray()
        .then(user=>{
          if (user.length === 1 && user[0].isAdmin) {
            req.userInfo = user[0];
            next();
          }
          else {
            res.send(failed);
          }
        })
    });
}
