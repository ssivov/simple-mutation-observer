/* develblock:start */
import DevTools from './dev/dev-tools';
/* develblock:end */

import { INodeState, ISimpleMutationObserverInit, ISimpleMutationRecord, SimpleMutationCallback } from '../types/interfaces';
import SimpleMutationBuffer from './simple-mutation-buffer';
import { forEachNode } from './traverse';
import { VirtualNode } from './virtual-node';

class VirtualDom {

  private root: Node;
  private vRoot: VirtualNode;
  private observer: MutationObserver;
  private options: ISimpleMutationObserverInit;
  private callback: SimpleMutationCallback;
  private observing: boolean;
  private nextIndex: number;

  private releaseVNodeBound: (vNode: VirtualNode) => void;

  // Utility data structures for handling a mutation. These are reset for each new mutation.
  private mutationBuffer: SimpleMutationBuffer;
  private nodeOldStates: Map<number, INodeState>;
  private allVNodes: Map<number, VirtualNode>;
  private attributesCache: Map<number, Map<string, string | null>>;
  private cDataCache: Map<number, string>;
  private affectedRoots: Set<number> = new Set();
  private affectedNodes: Set<number> = new Set();
  private tempStorage: Set<number> = new Set();

  constructor(callback: SimpleMutationCallback) {
    this.callback = callback;
    this.releaseVNodeBound = this.releaseVNode.bind(this);
    this.observer = new MutationObserver(this.handleMutations.bind(this));
  }

  public observe(target: Node, options: ISimpleMutationObserverInit): void {
    this.root = target;
    this.options = options;
    this.resetVDomState();
    this.observer.observe(this.root, {
      childList: true,
      subtree: true,
      attributes: this.options.attributes,
      attributeOldValue: this.options.attributes, // Required for attributes to be reported correctly
      characterData: this.options.characterData,
      characterDataOldValue: this.options.characterData // Required for cdata to be reported correctly
    });
    this.observing = true;
  }

  public disconnect(): void {
    if (this.observing) {
      this.observer.disconnect();
      forEachNode(
        this.vRoot,
        (vNode: VirtualNode): VirtualNode[] => vNode.getChildren(),
        (vNode: VirtualNode): void => vNode.release()
      );
    }
  }

  private resetVDomState(): void {
    this.nextIndex = 0;
    this.allVNodes = new Map();
    this.vRoot = this.virtualizeDomTree(this.root);
  }

  private handleMutations(mutations: MutationRecord[]): void {

    /* develblock:start */
    DevTools.performance.onMutationStart();
    /* develblock:end */

    this.resetMutationProcessingState();
    mutations.forEach((mutation: MutationRecord): void => {
      const targetIndex = VirtualNode.getIndex(mutation.target);
      switch (mutation.type) {
        case 'attributes':
          if (targetIndex >= 0) {
            const attrCache: Map<string, string | null> = this.attributesCache.get(targetIndex) || new Map();
            const attrSeen = attrCache.has(mutation.attributeName as string);
            if (!attrSeen) {
              attrCache.set(mutation.attributeName as string, mutation.oldValue);
            }
            this.attributesCache.set(targetIndex, attrCache);
          }
          break;
        case 'characterData':
          if (targetIndex >= 0) {
            const nodeSeen = this.cDataCache.has(targetIndex);
            if (!nodeSeen) {
              this.cDataCache.set(targetIndex, mutation.oldValue as string);
            }
          }
          break;
        case 'childList':
          mutation.addedNodes.forEach(this.markNodeAffected, this);
          mutation.removedNodes.forEach(this.markNodeAffected, this);
          break;
        default:
          break;
      }
    });

    this.simplifyDomTreeChanges();
    this.simplifyAttributeChanges();
    this.simplifyCharacterDataChanges();

    const simpleMutation = (this.mutationBuffer as SimpleMutationBuffer).getSimpleRecord();

    if (!this.isEmptyMutation(simpleMutation)) {
      this.callback(simpleMutation);
    }

    /* develblock:start */
    DevTools.performance.onMutationEnd(mutations);
    if (!DevTools.qa.vTreeIsCorrect(this.vRoot as VirtualNode, this.root)) {
      DevTools.debugger.devDebug();
    }
    /* develblock:end */
  }

  private simplifyDomTreeChanges(): void {

    // Find all removed nodes
    const removedNodes = new Set(this.affectedNodes);
    removedNodes.forEach((nodeIndex: number): void => {
      const vNode = this.allVNodes.get(nodeIndex) as VirtualNode;
      this.cacheOldState(vNode);
      if (this.isConnectedToDom(vNode.node)) {
        removedNodes.delete(nodeIndex);
      } else {
        (vNode.parent as VirtualNode).removeChild(vNode);
      }
    });

    // Sync remaining (non-removed) affected roots
    while (this.affectedRoots.size > 0) {
      this.affectedRoots.forEach((affectedRootIndex: number): void => {
        const affectedRootNode = (this.allVNodes.get(affectedRootIndex) as VirtualNode).node;
        if (!removedNodes.has(affectedRootIndex) && this.isConnectedToDom(affectedRootNode)) {
          this.syncNode(affectedRootNode);
        }
        this.affectedRoots.delete(affectedRootIndex);
      });
    }

    removedNodes.forEach((nodeIndex: number): void => {
      const removedVNode = this.allVNodes.get(nodeIndex)  as VirtualNode;
      forEachNode(removedVNode, (vNode: VirtualNode): VirtualNode[] => {
        return vNode.released ? [] : vNode.getChildren()
      }, this.releaseVNodeBound);
    });
  }

  // TODO: Test that attr/cdata changes are not reflected on added/removed nodes
  private simplifyAttributeChanges(): void {
    this.attributesCache.forEach((attrs: Map<string, string | null>, nodeIndex: number): void => {
      const node = (this.allVNodes.get(nodeIndex)  as VirtualNode).node;
      this.mutationBuffer.recordAttributesChange(node as Element, this.attributesCache.get(nodeIndex) as Map<string, string | null>);
    });
  }

  private simplifyCharacterDataChanges(): void {
    this.cDataCache.forEach((cData: string, nodeIndex: number): void => {
      const node = (this.allVNodes.get(nodeIndex) as VirtualNode).node;
      this.mutationBuffer.recordCharacterDataChange(node as CharacterData, this.cDataCache.get(nodeIndex) as string);
    });
  }

  private virtualizeDomTree(root: Node): VirtualNode {
    let vNode = this.getVirtualNode(root);
    if (vNode === null) {
      vNode = this.createVirtualNode(root);
      root.childNodes.forEach((child: Node): void => {
        const vChild = this.virtualizeDomTree(child);
        (vNode as VirtualNode).appendChild(vChild);
      });
    }
    return vNode;
  }

  private createVirtualNode(node: Node): VirtualNode {
    const vNode = new VirtualNode(node, this.nextIndex);
    this.allVNodes.set(this.nextIndex, vNode);
    this.nextIndex++;
    return vNode;
  }

  private markNodeAffected(node: Node): void {
    const nodeIndex = VirtualNode.getIndex(node);
    const vNode = this.getVirtualNode(node);
    const oldParentIndex = vNode && vNode.parent ? vNode.parent.index : -1;
    const newParentIndex = node.parentNode ? VirtualNode.getIndex(node.parentNode) : -1;
    if (nodeIndex >= 0) {
      this.affectedNodes.add(nodeIndex);
    }
    if (oldParentIndex >= 0) {
      this.affectedRoots.add(oldParentIndex);
    }
    if (newParentIndex >= 0) {
      this.affectedRoots.add(newParentIndex);
    }
  }

  private syncNode(node: Node): void {
    // Factors that are expected to be true at this point:
    //   1. Node was fully in sync with vDom before mutation started
    //   2. 'Removed nodes' have already been disconnected from vDom
    // Given conditions above are satisfied, the logic is the following:
    //  For each node child at index 'i':
    //    1. If nodeChildren[i] has not been affected and vNodeChildren[i] has not been affected either,
    //       then they must be matching already.
    //    2. If nodeChildren[i] has not been affected, but vNodeChildren[i] has been affected, then we
    //       need to move vNodeChildren[i] to temporary storage and expect it to be used somewhere else later
    //       - Note: at the end of all processing, temporariry storage must be empty
    //    3. If nodeChildren[i] has been affected, then we need to insert matching vNode in vNodeChilden at position i
    //    4. If nodeChildren[i] is a new node, create a new vNode, add it in vNodeChildren at position i and mark it as an affected root
    //  Note: multiple affected/new nodes in a row can be inserted together as a range
    const vNode = this.getVirtualNode(node);
    if (vNode === null) {
      throw new Error('Expected node to have a matching vNode');
    }

    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const index = VirtualNode.getIndex(child);
      if (index < 0) {
        // Handle (4)
        const childVNode = this.createVirtualNode(child);
        this.mutationBuffer.recordAddedNode(child);
        this.affectedRoots.add(childVNode.index);
        vNode.insertAt(childVNode, i);
      } else if (this.affectedNodes.has(index)) {
        // Handle (3)
        const childVNode = this.allVNodes.get(index) as VirtualNode;
        const inTempStorage = this.tempStorage.has(index);
        if (childVNode.parent) {
          childVNode.parent.removeChild(childVNode);
        } else if (!inTempStorage) {
          throw new Error('Expected affected childVNode that is not in temp storage to have a parent');
        }
        vNode.insertAt(childVNode, i);
        if (inTempStorage) {
          this.tempStorage.delete(index);
        }
        const oldState = this.nodeOldStates.get(index);
        if (!oldState) {
          throw new Error(`Old state not found for a moved node`);
        } else if (this.nodeMoved(child, oldState)) {
          this.mutationBuffer.recordMovedNode(child, oldState);
        }
      } else {
        const vNodeChildren = vNode.getChildren();
        if (i >= vNodeChildren.length) { throw new Error(); }
        const vChild = vNodeChildren[i];
        if (this.affectedNodes.has(vChild.index)) {
          // Handle (2)
          vNode.removeChild(vChild);
          this.tempStorage.add(vChild.index);
          i--;
        } else {
          // Verify (1)
          if (vNodeChildren[i].node !== child) {
            throw new Error();
          }
        }
      }
    }
  }

  // TODO: mutation-summary 'getOldPreviousSibling' fails for removed nodes
  // TODO: Verify that all oldStates are correct
  private releaseVNode(vNode: VirtualNode): void {
    this.mutationBuffer.recordRemovedNode(vNode.node, this.nodeOldStates.get(vNode.index) as INodeState);
    this.attributesCache.delete(vNode.index);
    this.cDataCache.delete(vNode.index);
    if (!vNode.released) {
      vNode.release();
    }
  }

  private cacheOldState(vNode: VirtualNode | null): void {
    if (!(vNode && vNode.index >= 0)) {
      return;
    }
    if (vNode.parent) {
      this.nodeOldStates.set(vNode.index, {
        parent: vNode.parent.node,
        previousSibling: vNode.previousSibling && vNode.previousSibling.node,
        nextSibling: vNode.nextSibling && vNode.nextSibling.node
      });
    } else {
      throw new Error('Expected vNode to have a parent when caching old state');
    }
  }

  private resetMutationProcessingState(): void {
    this.mutationBuffer = new SimpleMutationBuffer();
    this.nodeOldStates = new Map();
    this.attributesCache = new Map();
    this.cDataCache = new Map();
    this.affectedRoots.clear();
    this.affectedNodes.clear();
    this.tempStorage.clear();
  }

  private getVirtualNode(node: Node): VirtualNode | null {
    const index = VirtualNode.getIndex(node);
    return index < 0 ? null : this.allVNodes.get(index) as VirtualNode;
  }

  private isConnectedToDom(node: Node): boolean {
    return 'isConnected' in node ? node.isConnected : document.contains(node);
  }

  private isEmptyMutation(mutation: ISimpleMutationRecord): boolean {
    return (
      mutation.added.length === 0
      && mutation.removed.length === 0
      && mutation.moved.length === 0
      && mutation.attributes.length === 0
      && mutation.cdata.length === 0
    );
  }

  private nodeMoved(node: Node, oldState: INodeState): boolean {
    return !(
      node.parentNode === oldState.parent
      && node.previousSibling === oldState.previousSibling
      && node.nextSibling === oldState.nextSibling
    );
  }
}

export default VirtualDom;
