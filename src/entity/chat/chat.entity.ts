import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Room } from '../room/room.entity';
import { User } from '../user/user.entity';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ length: 150, nullable: false })
  message: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Room, (room) => room.chats)
  @JoinColumn({ name: 'room_id' })
  room: number;

  @ManyToOne(() => User, (user) => user.chats)
  @JoinColumn({ name: 'user_id' })
  user: number;
}
