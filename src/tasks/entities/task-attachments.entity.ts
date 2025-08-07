import { Base } from 'src/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Task } from './task.entity';
import { ATACHMENT_TYPE } from 'src/Utils/utils';



@Entity()
export class TaskAttachment extends Base {
  @Column()
  url: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: 0 })
  size: number;

  @Column({ default: '' })
  mimeType: string;

  @Column({ default: ATACHMENT_TYPE.IMAGE })
  type: ATACHMENT_TYPE;

  @ManyToOne(() => Task, (task) => task.attachments, { onDelete: 'CASCADE' })
  task: Task;
}
