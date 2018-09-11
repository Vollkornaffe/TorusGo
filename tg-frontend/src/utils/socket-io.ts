import * as socketIO                            from 'socket.io-client';
import {changeConnectionStatus, updateResource} from '../redux/actions';
import {asyncLoginWithToken}                    from '../redux/async-actions';

import {EConnectionStatus} from '../types/network';
import tokenManager        from './token';

let URL = 'http://localhost:3450/';

if (process.env.NODE_ENV === 'production') {
  URL = 'https://torusgo.com:12345/';
}

const socket = socketIO.connect(URL);

['connect', 'connect_error', 'connect_timeout', 'error', 'disconnect', 'reconnect', 'reconnect_attempt',
  'reconnecting', 'reconnect_error', 'reconnect_failed'].forEach((name) => {
  socket.on(name, (...args: any[]) => {
    console.log(name + ': ' + args.join(' '));
  });
});

socket.on('connect', () => {
  changeConnectionStatus(EConnectionStatus.Connected);
  const tokenString = tokenManager.read();
  if (tokenString) {
    asyncLoginWithToken(tokenString);
  }
});

socket.on('disconnect', () => {
  changeConnectionStatus(EConnectionStatus.Disconnected);
});

socket.on('reconnecting', () => {
  changeConnectionStatus(EConnectionStatus.Connecting);
});

socket.on('update', (data: any) => {
  // discard invalid data
  if (!data || !data.name || !data.id) {
    return;
  }

  updateResource(data.name, data.id, data.item);
});

const withTimeout = (callback: (response: any) => void) => {
  let called = false;

  const interval = setTimeout(() => {
    if (called) {
      return;
    }
    called = true;
    clearTimeout(interval);

    callback({error: 'timeout_error', message: 'The request timed out'});
  }, 10 * 1000 /* 10 seconds */);

  return (response: any) => {
    if (called) {
      return;
    }
    called = true;
    clearTimeout(interval);

    callback(response);
  }
};

export const sendWithAck = (event: string, payload: any) => new Promise((resolve, reject) => {
  socket.emit(event, payload, withTimeout((response: any) => {
    if (response && response.error) {
      reject(response);
    } else {
      resolve(response);
    }
  }));
});

export const send = (event: string, payload: any) => {
  socket.emit(event, payload);
};
