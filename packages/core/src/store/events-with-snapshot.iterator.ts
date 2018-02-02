import { EventMessage } from '../event/EventMessage';

/**
 * @public
 */
export interface EventsWithSnapshotIterator<T = any, R = any> extends AsyncIterableIterator<EventMessage<T>> {
  snapshotState?: R;
  snapshotVersion?: number;
  approximateVersion: number;
}
