import { NextFunction } from 'express';
import { Server, Socket } from 'socket.io';
import { directExchangeName, amqpClient } from '../config/rabbitmq';
import { UnauthorizedError } from '../error/error';
import { Event } from './enum/event';
import * as jwt from 'jsonwebtoken';
import { JwtSecret } from '../config/secret';
import { CreateRoomRequestDto } from './dto/request/create-room.dto';
import { SendMessageRequestDto } from './dto/request/send-message.dto';
import { getCustomRepository } from 'typeorm';
import { ChatRepository } from '../entity/chat/chat.repository';

export default class SocketInit {
  public async start(io: Server) {
    io.use(async (socket: any, next: NextFunction) => {
      try {
        const token: string = socket.handshake.query.token as string;
        if (!token) throw UnauthorizedError;
        const splitToken = token.split(' ');
        if (splitToken[0] !== 'Bearer') throw UnauthorizedError;
        const payload = jwt.verify(splitToken[1], JwtSecret) as jwt.JwtPayload;
        if (payload.type !== 'access') return UnauthorizedError;
        socket.request.user = payload;
        next();
      } catch (e) {
        console.log(e);
        if (
          e instanceof jwt.JsonWebTokenError ||
          e instanceof jwt.TokenExpiredError
        ) {
          throw UnauthorizedError;
        }
        next(e);
      }
    });

    io.on('connect', (socket: Socket) => {
      socket.on(Event.CREATE_ROOM, async (dto: CreateRoomRequestDto) => {
        const roomId = dto.roomId;
        console.log(roomId);
        const fanoutRoomName = 'room.fanout.' + roomId;
        const queueName = 'room.' + roomId;
        await amqpClient.assertExchange(fanoutRoomName, 'fanout', {
          durable: true,
        });

        await amqpClient.bindExchange(
          fanoutRoomName,
          directExchangeName,
          fanoutRoomName,
        );

        await amqpClient.assertQueue(queueName, {
          durable: true,
        });

        amqpClient.bindQueue(queueName, fanoutRoomName, fanoutRoomName);
      });

      socket.on(Event.SEND_MESSAGE, async (dto: SendMessageRequestDto) => {
        const chatRepository = getCustomRepository(ChatRepository);
        const message = dto.message;

        amqpClient.publish(
          directExchangeName,
          'room.fanout.1',
          Buffer.from(message),
        );

        const chat = await chatRepository.postChat(dto);
        socket.emit(Event.RECEIVE_MESSAGE, chat);
        console.log(chat);
      });

      socket.on(Event.GET_MESSAGE, (getMessageRequest: any) => {
        const roomId = getMessageRequest.roomId;
        console.log(roomId);

        amqpClient.consume(
          'room.' + roomId,
          (msg) => {
            console.log(
              " [x] %s :'%s'",
              msg.fields.routingKey,
              msg.content.toString(),
            );
          },
          { noAck: true },
        );
      });

      socket.on('disconnect', () => {
        console.log('asdf');
      });
    });
  }
}
