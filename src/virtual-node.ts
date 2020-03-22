

export class VirtualNode {

  // TODO: Change to non-static to be able to observe multiple trees, or same tree with different callbacks
  private static readonly IndexSymbol: symbol = Symbol();

  public parent: VirtualNode | null = null;
  public previousSibling: VirtualNode | null = null;
  public nextSibling: VirtualNode | null = null;
  public released: boolean = false;

  public node: Node;
  public index: number;
  public firstChild: VirtualNode | null = null;
  public lastChild: VirtualNode | null = null;
  public childrenByIndex: Map<number, VirtualNode> = new Map();

  static getIndex(node: Node): number {
    return VirtualNode.IndexSymbol in node
      ? (node as any)[VirtualNode.IndexSymbol]
      : -1;
  }

  constructor(node: Node, index: number) {
    this.node = node;
    this.index = index;
    (node as any)[VirtualNode.IndexSymbol] = index;
  }

  public appendChild(newNode: VirtualNode): void {
    newNode.parent = this;
    newNode.previousSibling = this.lastChild;
    this.childrenByIndex.set(newNode.index, newNode);

    if (!this.firstChild) {
      this.firstChild = newNode;
    }

    if (this.lastChild) {
      this.lastChild.nextSibling = newNode;
    }
    this.lastChild = newNode;
  }

  public insertBefore(newNode: VirtualNode, referenceNode: VirtualNode): void {
    newNode.parent = this;
    newNode.nextSibling = referenceNode;
    newNode.previousSibling = referenceNode.previousSibling;
    this.childrenByIndex.set(newNode.index, newNode);
    if (referenceNode.previousSibling) {
      referenceNode.previousSibling.nextSibling = newNode;
    } else {

      if (this.firstChild !== referenceNode) {
        throw new Error();
      }
      this.firstChild = newNode;
    }
    referenceNode.previousSibling = newNode;
  }

  public insertAt(newNode: VirtualNode, positionIndex: number): void {
    const children = this.getChildren();

    if (positionIndex > children.length) { throw new Error(); }

    if (positionIndex < children.length) {
      this.insertBefore(newNode, children[positionIndex]);
    } else {
      this.appendChild(newNode);
    }
  }

  public removeChild(child: VirtualNode): VirtualNode {
    child.parent = null;
    this.childrenByIndex.delete(child.index);

    if (child.previousSibling) {
      child.previousSibling.nextSibling = child.nextSibling;
    } else {
      if (this.firstChild !== child) { throw new Error(); }
      this.firstChild = child.nextSibling;
    }

    if (child.nextSibling) {
      child.nextSibling.previousSibling = child.previousSibling;
    } else {
      if (this.lastChild !== child) { throw new Error(); }
      this.lastChild = child.previousSibling;
    }

    child.previousSibling = null;
    child.nextSibling = null;

    return child;
  }

  public release(): void {
    delete (this.node as any)[VirtualNode.IndexSymbol];
    this.released = true;
  }

  public getChildren(): VirtualNode[] {
    const children: VirtualNode[] = [];
    let nextChild = this.firstChild;
    while (nextChild) {
      children.push(nextChild);
      nextChild = nextChild.nextSibling;
    }
    return children;
  }
}