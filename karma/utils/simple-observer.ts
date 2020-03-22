import SimpleMutationObserver from "../../src";
import { ISimpleMutationRecord } from "../../types/interfaces";
import { getFixtureWormhole } from "./dom";

export type PromiseResolver<T> = (value?: T | PromiseLike<T>) => void;

export default class SimpleMutationObserverTestWrapper {

  private simpleObserver: SimpleMutationObserver;
  private mutationPromise: Promise<ISimpleMutationRecord>;
  private promiseResolver: PromiseResolver<ISimpleMutationRecord>;
  private allMutations: ISimpleMutationRecord[] = [];

  constructor() {
    this.simpleObserver = new SimpleMutationObserver(this.handleSimpleMutation.bind(this));
    this.createSimpleMutationPromise();
  }

  public observe(): void {
    this.simpleObserver.observe(getFixtureWormhole());
  }

  public disconnect(): void {
    this.simpleObserver.disconnect();
  }

  public getSimpleMutationRecord(): Promise<ISimpleMutationRecord> {
    return this.mutationPromise;
  }

  public getAllMutations(): ISimpleMutationRecord[] {
    return this.allMutations;
  }

  private handleSimpleMutation(summary: ISimpleMutationRecord): void {
    this.allMutations.push(summary);
    const oldResolver = this.promiseResolver;
    this.createSimpleMutationPromise();
    oldResolver(summary);
  }

  private createSimpleMutationPromise(): void {
    this.mutationPromise = new Promise((resolve: PromiseResolver<ISimpleMutationRecord>): void => {
      this.promiseResolver = resolve;
    });
  }
}