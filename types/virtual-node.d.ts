export declare class VirtualNode {
    private static readonly IndexSymbol;
    parent: VirtualNode | null;
    previousSibling: VirtualNode | null;
    nextSibling: VirtualNode | null;
    released: boolean;
    node: Node;
    index: number;
    firstChild: VirtualNode | null;
    lastChild: VirtualNode | null;
    childrenByIndex: Map<number, VirtualNode>;
    static getIndex(node: Node): number;
    constructor(node: Node, index: number);
    appendChild(newNode: VirtualNode): void;
    insertBefore(newNode: VirtualNode, referenceNode: VirtualNode): void;
    insertAt(newNode: VirtualNode, positionIndex: number): void;
    removeChild(child: VirtualNode): VirtualNode;
    release(): void;
    getChildren(): VirtualNode[];
}
