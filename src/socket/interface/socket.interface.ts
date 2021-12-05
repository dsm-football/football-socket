import { Socket } from 'socket.io';

export default interface ISocket extends Socket {
  user: number;
}
