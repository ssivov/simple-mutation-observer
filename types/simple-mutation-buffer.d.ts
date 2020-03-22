import { INodeState, ISimpleMutationRecord } from "./interfaces";

export declare enum DomChangeType {
    Add = "add",
    Remove = "remove",
    Move = "move"
}

declare class SimpleMutationBuffer {
    private readonly mutation;
    constructor();
    getSimpleRecord(): ISimpleMutationRecord;
    recordAddedNode(node: Node): void;
    recordRemovedNode(node: Node, oldState: INodeState): void;
    recordMovedNode(node: Node, oldState: INodeState): void;
    recordAttributesChange(element: Element, oldValues: Map<string, string | null>): void;
    recordCharacterDataChange(node: Node, oldValue: string): void;
}

export default SimpleMutationBuffer;
