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
import { UserRepository } from '../entity/user/user.repository';

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
        const userRepository = getCustomRepository(UserRepository);
        const user = await userRepository.findOne({
          email: payload.sub,
        });
        socket.request.user = user.id;
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

    io.on('connect', (socket: any) => {
      console.log('이진우 제발 들어와');
      socket.on(Event.CREATE_ROOM, async (dto: CreateRoomRequestDto) => {
        const roomId = dto.room_id;
        console.log(roomId);
        const fanoutRoomName = 'room.fanout.' + roomId;
        const hostUserQueueName =
          'room.' + roomId + '.user.' + dto.host_user_id;
        const userQueueName = 'room.' + roomId + '.user.' + dto.user_id;
        await amqpClient.assertExchange(fanoutRoomName, 'fanout', {
          durable: true,
        });

        await amqpClient.bindExchange(
          fanoutRoomName,
          directExchangeName,
          fanoutRoomName,
        );

        await amqpClient.assertQueue(hostUserQueueName, {
          durable: true,
        });

        await amqpClient.assertQueue(userQueueName, {
          durable: true,
        });

        amqpClient.bindQueue(hostUserQueueName, fanoutRoomName, fanoutRoomName);
        amqpClient.bindQueue(userQueueName, fanoutRoomName, fanoutRoomName);
      });

      socket.on(Event.SEND_MESSAGE, async (dto: SendMessageRequestDto) => {
        const chatRepository = getCustomRepository(ChatRepository);
        const message = dto.message;
        const fanoutRoomName = 'room.fanout.' + dto.room_id;
        const queueName =
          'room.' + dto.room_id + '.user.' + socket.request.user;

        amqpClient.publish(
          directExchangeName,
          fanoutRoomName,
          Buffer.from(message),
        );

        const chat = await chatRepository.postChat(dto);
        amqpClient.consume(
          queueName,
          (msg) => {
            console.log(
              " [x] %s : '%s",
              msg.fields.routingKey,
              msg.content.toString(),
            );
          },
          { noAck: true },
        );
        socket.emit(Event.RECEIVE_MESSAGE, chat);
      });

      socket.on(Event.GET_MESSAGE, (getMessageRequest: any) => {
        const roomId = getMessageRequest.roomId;
        const queueName = 'room.' + roomId + '.user.' + socket.request.user;
        console.log(queueName);

        amqpClient.consume(
          queueName,
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
