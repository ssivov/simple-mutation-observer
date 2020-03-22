import { ISimpleMutationObserverInit, SimpleMutationCallback } from "./interfaces";

export default class SimpleMutationObserver {
    constructor(callback: SimpleMutationCallback);
    observe(target?: Node, options?: Partial<ISimpleMutationObserverInit>): void;
    disconnect(): void;
}
