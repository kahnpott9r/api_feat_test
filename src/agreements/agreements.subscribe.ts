import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Agreement } from './entities/agreement.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';

@EventSubscriber()
export class AgreementsSubscribe
  implements EntitySubscriberInterface<Agreement>
{
  constructor(dataSource: DataSource, private eventEmitter: EventEmitter2) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Agreement;
  }

  afterInsert(event: InsertEvent<Agreement>) {
    console.log('insert event triggered (but disabled - using manual emit)');
    // Disabled - now using manual emit after transaction commit
    // this.eventEmitter.emit('agreement.insert', event.entity);
  }
}
