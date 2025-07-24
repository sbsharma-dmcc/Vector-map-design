import { ILogger } from './logger';
import { NetworkRequestEvent } from './network-request-event';
export type NetworkEventCallbackFn = (event: NetworkRequestEvent) => void;
export declare class NetworkEventCallback {
    readonly callback: (event: NetworkRequestEvent) => void;
    readonly id: string;
    constructor(callback: (event: NetworkRequestEvent) => void, id?: string);
}
export declare class NetworkObserver {
    private eventCallbacks;
    private globalScope?;
    private logger?;
    private isObserving;
    constructor(logger?: ILogger);
    static isSupported(): boolean;
    subscribe(eventCallback: NetworkEventCallback, logger?: ILogger): void;
    unsubscribe(eventCallback: NetworkEventCallback): void;
    protected triggerEventCallbacks(event: NetworkRequestEvent): void;
    private handleNetworkRequestEvent;
    private getTimestamps;
    private observeFetch;
    private observeXhr;
}
export declare const networkObserver: NetworkObserver;
//# sourceMappingURL=network-observer.d.ts.map