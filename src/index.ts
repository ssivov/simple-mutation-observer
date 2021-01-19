import { ISimpleMutationObserverInit, SimpleMutationCallback } from "../types/interfaces";
import VirtualDom from "./virtual-dom";

export default class SimpleMutationObserver {

  private readonly defaultOptions: ISimpleMutationObserverInit = {
    attributes: true,
    characterData: true
  };

  private vDom: VirtualDom;

  constructor(callback: SimpleMutationCallback) {
    if (typeof window['MutationObserver'] !== 'function') {
      throw new Error(`Can't create SimpleMutationObserver: required MutationObserver API is missing.`);
    }
    if (callback) {
      this.vDom = new VirtualDom(callback);
    } else {
      throw new Error('SimpleMutationObserver constructor requires a callback function');
    }
  }

  observe(target?: Node, options?: Partial<ISimpleMutationObserverInit>): void {
    target = target || document;
    const mergedOptions = this.mergeOptions(options || {});
    this.vDom.observe(target, mergedOptions);
  }

  disconnect(): void {
    this.vDom.disconnect();
  }

  private mergeOptions(options: Partial<ISimpleMutationObserverInit>): ISimpleMutationObserverInit {
    const mergedOptions = Object.assign({}, options);
    const keys = Object.keys(this.defaultOptions) as (keyof ISimpleMutationObserverInit)[];
    keys.forEach((key: keyof ISimpleMutationObserverInit): void => {
      if (!(key in mergedOptions)) {
        (mergedOptions as any)[key] = (this.defaultOptions as any)[key];
      }
    });

    return mergedOptions as ISimpleMutationObserverInit;
  }
}
