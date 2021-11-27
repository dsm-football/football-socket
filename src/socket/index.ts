import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { JwtSecret } from '../config/secret';
import { UnauthorizedError } from '../error/error';
import { socketInit } from './socketInit';

export default (io: Server) => {
  io.use(async (socket: any) => {
    try {
      const token: string = socket.handshake.query.token as string;
      const splitToken = token.split(' ');
      if (splitToken[0] !== 'Bearer') throw UnauthorizedError;
      const payload = jwt.verify(token, JwtSecret) as jwt.JwtPayload;

      if (payload.type !== 'access_token') return UnauthorizedError;
      socket.request.user = payload;
      await socketInit(socket, io);
    } catch (e) {
      if (
        e instanceof jwt.JsonWebTokenError ||
        e instanceof jwt.TokenExpiredError
      ) {
        throw UnauthorizedError;
      }
      throw e;
    }
  });
};
