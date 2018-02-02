import { EventMessage, EventsWithSnapshotIterator } from '@eventific/core';
import { Cursor } from 'mongodb';

export class MongoEventsWithSnapshotIterator<T, R> implements EventsWithSnapshotIterator<T, R> {
  public snapshotState?: R;
  public snapshotVersion?: number;
  public approximateVersion: number;

  constructor(
    private _cursor: Cursor,
    _aproxVersion: number,
    _snapshot?: { version: number, state: R }
  ) {
    this.approximateVersion = _aproxVersion;
    if (_snapshot) {
      this.snapshotVersion = _snapshot.version;
      this.snapshotState = _snapshot.state;
    }
  }

  public async next(): Promise<IteratorResult<EventMessage<T>>> {
    const event = await this._cursor.next();
    if (event) {
      delete (event as any)._id;
      return {
        done: false,
        value: event
      };
    } else {
      return {
        done: true,
        value: (null as any)
      };
    }
  }

  public [Symbol.asyncIterator](): AsyncIterableIterator<EventMessage<T>> {
    return this;
  }
}
