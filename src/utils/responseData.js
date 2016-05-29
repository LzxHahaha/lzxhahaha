/**
 * Created by LzxHahaha on 2016/5/26.
 */

const ERROR_INFO = {

  400: '参数有误',
  401: '需要登录',
  404: '资源未找到',

  10086: '未知错误'
};

export function success(data = {}) {
  return {
    status: 1,
    data
  }
}

export function fail(code = 10086) {
  let err = ERROR_INFO[code] || ERROR_INFO[10086];

  return {
    status: 2,
    data: err
  };
}

export function failMessage(msg = '') {
  return {
    status: 2,
    data: msg
  };
}