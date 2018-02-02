import { EventMessage } from '../event/EventMessage';
import { Injector } from '../injector/Injector';
import { EventsWithSnapshotIterator } from './events-with-snapshot.iterator';


/**
 * A interface for event stores.
 * @public
 */
export abstract class IStore {
  public static _CreateStore: (injector: Injector) => IStore;
  public static Settings: (settings: object) => { _CreateStore: (injector: Injector) => IStore };

  /**
   * Starts this event store instance
   *
   *
   */
  public abstract start(): Promise<any>;

  /**
   * Returns the events for the particular aggregate. The result might also contain a snapshot.
   *
   *
   */
  public abstract getEvents<T, R>(
    aggregateName: string,
    aggregateId: string,
    options?: { skipSnapshot?: boolean }
    ): Promise<EventsWithSnapshotIterator<T, R>>;

  public abstract applyEvents<T>(aggregateName: string, events: EventMessage[]): Promise<void>;
  public abstract purgeAllSnapshots(aggregateName: string): Promise<void>;
  public abstract saveSnapshots(aggregateName: string, aggregateId: string, version: number, state: any): Promise<void>;
  public abstract onEvent(
    aggregateName: string,
    eventName: string | null,
    callback: (event: EventMessage) => Promise<void>
  ): void;
}
