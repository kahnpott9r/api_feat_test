import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { RefreshTokens } from '../../auth/entity/refresh_token.entity';
import { UserInfo } from './user_info.entity';
import { UserRole } from '../../user_roles/entities/user_role.entity';
import { Base } from '../../base.entity';

@Entity()
@Unique(['email'])
export class User extends Base {
  @Column({
    nullable: false,
    default: '',
  })
  email: string;

  @Exclude()
  @Column({
    nullable: false,
    default: '',
  })
  password: string;

  // @Exclude()
  @OneToMany(
    () => RefreshTokens,
    (refreshToken: RefreshTokens) => refreshToken.user,
  )
  refresh_tokens: RefreshTokens[];

  @OneToOne(() => UserInfo, (user_info) => user_info.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  user_info: UserInfo;

  @OneToMany(() => UserRole, (user_role) => user_role.user, {
    eager: true,
  })
  user_roles!: UserRole[];
}
