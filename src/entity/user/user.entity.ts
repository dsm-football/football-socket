import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Chat } from '../chat/chat.entity';
import { Room } from '../room/room.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ length: 80, nullable: false })
  email: string;

  @Column({ length: 16, nullable: false })
  name: string;

  @Column({ length: 150, nullable: false })
  profile: string;

  @Column()
  age: number;

  @Column({ type: 'bit', nullable: false })
  is_pro: boolean;

  @Column({ length: 200 })
  bio: string;

  @Column()
  club_back_num: number;

  @OneToMany(() => Room, (room) => room.host_user)
  host_rooms: Room[];

  @OneToMany(() => Room, (room) => room.user)
  rooms: Room[];

  @OneToMany(() => Chat, (chat) => chat.user)
  chats: Chat[];
}
