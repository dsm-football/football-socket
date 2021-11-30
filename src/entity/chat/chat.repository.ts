import { EntityRepository, Repository } from 'typeorm';
import { SendMessageRequestDto } from '../../socket/dto/request/send-message.dto';
import { Chat } from './chat.entity';

@EntityRepository(Chat)
export class ChatRepository extends Repository<Chat> {
  public postChat(dto: SendMessageRequestDto): Promise<Chat> {
    let newChat: Chat;
    newChat = this.create({
      room: dto.room_id,
      user: dto.user_id,
      message: dto.message,
      created_at: new Date(),
    });
    return this.save(newChat);
  }
}
