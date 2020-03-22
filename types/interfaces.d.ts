export type PromiseResolver<T> = (value?: T | PromiseLike<T>) => void;
export type SimpleMutationCallback = (summary: ISimpleMutationRecord) => void;

export interface ISimpleMutationObserverInit {
  attributes: boolean;
  attributeOldValue: boolean;
  characterData: boolean;
  characterDataOldValue: boolean;
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
