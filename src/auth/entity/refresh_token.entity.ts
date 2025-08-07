import { Column, Entity, ManyToOne } from 'typeorm';
import { Base } from '../../base.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class RefreshTokens extends Base {
  @Column()
  refresh_token: string;

  @Column({ type: 'timestamptz', nullable: true })
  valid_until: Date;

  @ManyToOne(() => User, (user: User) => user.refresh_tokens, {
    onDelete: 'CASCADE',
  })
  user: User;
}
