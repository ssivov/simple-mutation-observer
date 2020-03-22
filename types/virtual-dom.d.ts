import { ISimpleMutationObserverInit, SimpleMutationCallback } from './interfaces';

declare class VirtualDom {
    private root;
    private vRoot;
    private observer;
    private options;
    private callback;
    private observing;
    private nextIndex;
    private releaseVNodeBound;
    private mutationBuffer;
    private nodeOldStates;
    private allVNodes;
    private attributesCache;
    private cDataCache;
    private affectedRoots;
    private affectedNodes;
    private tempStorage;
    constructor(callback: SimpleMutationCallback);
    observe(target: Node, options: ISimpleMutationObserverInit): void;
    disconnect(): void;
    private resetVDomState;
    private handleMutations;
    private simplifyDomTreeChanges;
    private simplifyAttributeChanges;
    private simplifyCharacterDataChanges;
    private virtualizeDomTree;
    private createVirtualNode;
    private markNodeAffected;
    private syncNode;
    private releaseVNode;
    private cacheOldState;
    private resetMutationProcessingState;
    private getVirtualNode;
    private isConnectedToDom;
    private isEmptyMutation;
    private nodeMoved;
}

export default VirtualDom;
