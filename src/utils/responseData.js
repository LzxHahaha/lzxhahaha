/**
 * Created by LzxHahaha on 2016/5/26.
 */

const ERROR_INFO = {

  400: 'Insufficient parameters',
  401: 'Unauthorized',

  10086: 'Unknown error'
};

export function successed(data) {
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

export function failMessage(msg) {
  return {
    status: 2,
    data: msg
  };
}