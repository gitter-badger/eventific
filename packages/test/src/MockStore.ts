import { EventMessage, EventsWithSnapshotIterator, IStore, Store } from '@eventific/core';
import * as Joi from 'joi';
import { MockEventsWithSnapshotIterator } from './mock-events-with-snapshot.iterator';

/**
 * A test utility that simulates a store. This construct uses an in memory storage mechanism for events and can
 * therefor not be shared between separate processes.
 *
 * @since 1.0.0
 */
@Store({
  name: 'Mock'
})
export class MockStore extends IStore {
  public static _instance: MockStore;

  public static async GetEvents<T, R>(
    aggregateName: string,
    aggregateId: string
  ): Promise<EventsWithSnapshotIterator<T, R>> {
    return await MockStore._instance.getEvents<T, R>(aggregateName, aggregateId);
  }

  public static async EmitEvents(aggregateName: string, ...events: EventMessage[]): Promise<void> {
    const eventMap = MockStore._instance._callbacks.get(aggregateName);
    if (eventMap) {
      for (const event of events) {
        const callback1 = eventMap.get(null);
        if (callback1) {
          callback1(event);
        }
        const callback2 = eventMap.get(event.event);
        if (callback2) {
          callback2(event);
        }
      }
    }
  }

  public static async ApplyEvents(aggregateName: string, events: EventMessage[]): Promise<void> {
    return await MockStore._instance.applyEvents(aggregateName, events);
  }

  private _started = false;
  private _events = new Map<string, EventMessage[]>();
  private _callbacks = new Map<string, Map<string | null, (event: EventMessage) => void>>();

  constructor() {
    super();
    MockStore._instance = this;
  }
  /**
   * @inheritDoc
   */
  public async start(): Promise<void> {
    if (!this._started) {
      this._started = true;
    } else {
      throw new Error('A store can not be started twice');
    }
  }

  public async getEvents<T, R>(
    aggregateName: string,
    aggregateId: string,
    options?: {skipSnapshot?: boolean}
    ): Promise<MockEventsWithSnapshotIterator<T, R>> {
    if (this._started) {
      Joi.assert(aggregateName, Joi.string());
      Joi.assert(aggregateId, Joi.string());
      const events = (this._events.get(aggregateName) || []).filter((x) => x.aggregateId === aggregateId);
      return new MockEventsWithSnapshotIterator<T, R>(events, events.length - 1);
    } else {
      throw new Error('Not started');
    }
  }

  public async applyEvents(aggregateName: string, events: EventMessage[]): Promise<void> {
    if (this._started) {
      Joi.assert(aggregateName, Joi.string());
      Joi.assert(events, Joi.array().min(1));

      const list = this._events.get(aggregateName) || [];
      list.push(...events);
      this._events.set(aggregateName, list);
      const eventMap = this._callbacks.get(aggregateName);
      if (eventMap) {
        for (const event of events) {
          const callback1 = eventMap.get(null);
          if (callback1) {
            await callback1(event);
          }
          const callback2 = eventMap.get(event.event);
          if (callback2) {
            await callback2(event);
          }
        }
      }
    } else {
      throw new Error('Not started');
    }
  }

  public async purgeAllSnapshots(aggregateName: string): Promise<void> {
    if (this._started) {
      Joi.assert(aggregateName, Joi.string());
    } else {
      throw new Error('Not started');
    }
  }

  public async saveSnapshots(
    aggregateName: string,
    aggregateId: string,
    version: number,
    state: any
  ): Promise<void> {
    // TODO: implement this
  }

  public onEvent(
    aggregateName: string,
    eventName: string | null,
    callback: (event: EventMessage) => Promise<void>
  ): void {
    if (this._started) {
      const eventMap = this._callbacks.get(aggregateName) || new Map();
      eventMap.set(eventName, callback);
      this._callbacks.set(aggregateName, eventMap);
    } else {
      throw new Error('Not started');
    }
  }
}
