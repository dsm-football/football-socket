import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Chat } from '../chat/chat.entity';
import { User } from '../user/user.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @ManyToOne(() => User, (user) => user.host_rooms)
  @JoinColumn({ name: 'host_user_id' })
  host_user: User;

  @ManyToOne(() => User, (user) => user.rooms)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Chat, (chat) => chat.room)
  chats: Chat[];
}
