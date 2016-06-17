/**
 * Created by LzxHahaha on 2016/5/26.
 */

import {MongoClient, ObjectId} from 'mongodb';

const DB_URL = 'mongodb://localhost:27017/blog';

/*
这个类的函数仅用于实现数据库操作，不要加其他的
 */
export default class DB {
  constructor(name) {
    this._dbName = name;
  }

  connect(func) {
    return MongoClient.connect(DB_URL).then(db => func(db, this._dbName));
  }

  insertOne(data) {
    return this.connect((db, name)=>db.collection(name).insertOne(data));
  }

  all(paging = true, page = 1, size = 10) {
    if (paging) {
      if (page < 1 || size < 1) {
        throw new Error(`Wrong parameters: [page]: ${page}, size: ${size}`);
      }
      return this.connect(((db, name)=>db.collection(name).find().skip((page - 1) * size).limit(size)));
    }
    else {
      return this.connect(((db, name)=>db.collection(name).find()));
    }
  }

  find(conditions, paging = true, page = 1, size = 10) {
    if (paging) {
      if (page < 1 || size < 1) {
        throw new Error(`Wrong parameters: [page]: ${page}, size: ${size}`);
      }
      return this.connect((db, name)=>db.collection(name).find(conditions).skip(page - 1).limit(size));
    }
    else {
      return this.connect((db, name)=>db.collection(name).find(conditions));
    }
  }

  findOne(conditions) {
    return this.connect((db, name)=>db.collection(name).find(conditions).limit(1));
  }

  findAll(conditions) {
    return this.connect((db, name)=>db.collection(name).find(conditions));
  }

  findOneAndUpdate(conditions, data) {
    return this.connect((db, name)=>db.collection(name).findOneAndUpdate(conditions, data));
  }

  updateOne(conditions, data) {
    return this.connect((db, name)=>db.collection(name).updateOne(conditions, data));
  }
}