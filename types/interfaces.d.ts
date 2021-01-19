export type PromiseResolver<T> = (value?: T | PromiseLike<T>) => void;
export type SimpleMutationCallback = (summary: ISimpleMutationRecord) => void;

export interface ISimpleMutationObserverInit {
  attributes: boolean;
  characterData: boolean;

  // We need old values of attrs and cdata to identify add/remove operation correctly.
  // At the current stage, if user enables attrs or cdata, we will enable old values automatically.
  // TODO: Consider implementation independent of the 'oldValue' property in native MO callback
  // attributeOldValue: boolean;
  // characterDataOldValue: boolean;
}

export interface ISimpleMutationRecord {
  added: IDomTreeChangeRecord[];
  removed: IDomTreeChangeRecord[];
  moved: IDomTreeChangeRecord[];
  attributes: IAttributeChangeRecord[];
  cdata: ICharacterDataChangeRecord[];
}

export interface IDomTreeChangeRecord {
  node: Node;
  action: string;
  oldState: null | INodeState;
}

export interface INodeState {
  parent: Node;
  previousSibling: Node | null;
  nextSibling: Node | null;
}

export interface IAttributeChangeRecord {
  node: Node;
  added: string[];
  removed: string[];
  changed: string[];
  all: string[];
  oldValues: Map<string, string | null>;
}

export interface ICharacterDataChangeRecord {
  node: Node;
  oldValue: string;
}
