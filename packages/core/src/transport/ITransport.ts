import { CommandMessage } from '../command/CommandMessage';
import { Injector } from '../injector/Injector';

/**
 * @public
 */
export abstract class ITransport {
  public static _CreateTransport: (injector: Injector) => ITransport;
  public static Settings: (settings: object) => { _CreateTransport: (injector: Injector) => ITransport };
  public abstract start(): Promise<void>;
  public onCommand?(aggregateName: string, handler: (data: CommandMessage) => Promise<void>): void;
  public sendCommand?(aggregateName: string, data: CommandMessage): Promise<void>;
}
