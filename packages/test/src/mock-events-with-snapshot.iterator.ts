import { EventMessage, EventsWithSnapshotIterator } from '@eventific/core';

export class MockEventsWithSnapshotIterator<T, R> implements EventsWithSnapshotIterator<T, R> {
  public snapshotState?: R;
  public snapshotVersion?: number;
  public approximateVersion: number;
  private _counter = 0;

  constructor(
    private _events: Array<EventMessage<T>>,
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
    if (this._counter < this._events.length) {
      delete (this._events[this._counter] as any)._id;
      const e = this._events[this._counter];
      this._counter += 1;
      return {
        done: false,
        value: e
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
