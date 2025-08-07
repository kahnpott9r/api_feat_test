import { Base } from '../../base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserInfo extends Base {
  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ default: '' })
  avatar: string;

  @Column({ default: '' })
  sex: string;

  @OneToOne(() => User, (user) => user.user_info) // specify inverse side as a second parameter
  user: User;
}
