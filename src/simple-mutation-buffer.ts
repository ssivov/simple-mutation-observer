import { IAttributeChangeRecord, INodeState, ISimpleMutationRecord } from "../types/interfaces";

export enum DomChangeType {
  Add = "add",
  Remove = "remove",
  Move = "move"
}

class SimpleMutationBuffer {

  private readonly mutation: ISimpleMutationRecord;

  constructor() {
    this.mutation = {
      added: [],
      removed: [],
      moved: [],
      attributes: [],
      cdata: []
    };
  }

  public getSimpleRecord(): ISimpleMutationRecord {
    return this.mutation;
  }

  public recordAddedNode(node: Node): void {
    this.mutation.added.push({
      node,
      action: DomChangeType.Add,
      oldState: null
    });
  }

  public recordRemovedNode(node: Node, oldState: INodeState): void {
    this.mutation.removed.push({
      node,
      action: DomChangeType.Remove,
      oldState
    });
  }

  public recordMovedNode(node: Node, oldState: INodeState): void {
    this.mutation.moved.push({
      node,
      action: DomChangeType.Move,
      oldState
    });
  }

  public recordAttributesChange(element: Element, oldValues: Map<string, string | null>): void {
    const record: IAttributeChangeRecord = {
      node: element,
      added: [],
      removed: [],
      changed: [],
      all: [],
      oldValues
    };
    oldValues.forEach((value: string | null, attr: string): void => {
      record.all.push(attr);
      if (oldValues.get(attr) === null) {
        record.added.push(attr);
      } else if (!(element.hasAttribute(attr))) {
        record.removed.push(attr);
      } else if (value !== element.getAttribute(attr)) {
        record.changed.push(attr);
      } else {
        record.all.pop();
      }
    });
    if (record.all.length > 0) {
      this.mutation.attributes.push(record);
    }
  }

  public recordCharacterDataChange(node: CharacterData, oldValue: string): void {
    if (oldValue !== node.data) {
      this.mutation.cdata.push({ node, oldValue });
    }
  }
}

export default SimpleMutationBuffer;
