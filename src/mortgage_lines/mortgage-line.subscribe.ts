import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MortgageLine } from './entities/mortgage-line.entity';

@EventSubscriber()
export class MortgageLineSubscriber
  implements EntitySubscriberInterface<MortgageLine>
{
  constructor(dataSource: DataSource, private eventEmitter: EventEmitter2) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return MortgageLine;
  }

  afterInsert(event: InsertEvent<MortgageLine>) {
    console.log('insert event triggered');
    this.eventEmitter.emit('mortgage-line.insert', event.entity);
  }
}
