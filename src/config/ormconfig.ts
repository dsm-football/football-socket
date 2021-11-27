import { ConnectionOptions } from 'typeorm';
import { Chat } from '../entity/chat/chat.entity';
import { Room } from '../entity/room/room.entity';
import { User } from '../entity/user/user.entity';
import { dbOptions } from './secret';

const option: ConnectionOptions = {
  type: 'mysql',
  host: dbOptions.DB_HOST,
  port: Number(dbOptions.DB_PORT),
  username: dbOptions.DB_USER,
  password: dbOptions.DB_PASSWORD,
  database: dbOptions.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [Chat, User, Room],
};
export = option;
