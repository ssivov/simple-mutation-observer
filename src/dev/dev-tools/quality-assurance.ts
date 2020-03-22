import { VirtualNode } from '../../virtual-node';

export function vTreeIsCorrect(vRoot: VirtualNode, domRoot: Node): boolean {
  return vTreeIsValid(vRoot) && vTreeMatchesDomTree(vRoot, domRoot);
}

export function vTreeMatchesDomTree(vRoot: VirtualNode, domRoot: Node): boolean {
  if (vRoot.node !== domRoot) {
    return false;
  }

  const nodeChildren = domRoot.childNodes;
  const vNodeChildren = vRoot.getChildren();
  if (nodeChildren.length !== vNodeChildren.length) {
    return false;
  }

  for (let i = 0; i < nodeChildren.length; i++) {
    if (!vTreeMatchesDomTree(vNodeChildren[i], nodeChildren[i])) {
      return false;
    }
  }

  return true;
}

export function vTreeIsValid(vRoot: VirtualNode): boolean {

  const remainingChildren: Set<number> = new Set();
  vRoot.childrenByIndex.forEach((value: VirtualNode, index: number): void => {
    remainingChildren.add(index);
  });

  if (vRoot.firstChild && vRoot.firstChild.previousSibling) {
    return false;
  }

  if (vRoot.lastChild && vRoot.lastChild.nextSibling) {
    return false;
  }

  let currentChild = vRoot.firstChild;
  while (currentChild) {
    if (currentChild.parent !== vRoot) {
      return false;
    }

    if (!(remainingChildren.has(currentChild.index))) {
      return false;
    }

    if (currentChild && currentChild.previousSibling && currentChild.previousSibling.nextSibling !== currentChild) {
      return false;
    }

    if (currentChild && currentChild.nextSibling && currentChild.nextSibling.previousSibling !== currentChild) {
      return false;
    }

    if (!vTreeIsValid(currentChild)) {
      return false;
    }

    remainingChildren.delete(currentChild.index);
    currentChild = currentChild.nextSibling;
  }

  if (remainingChildren.size !== 0) {
    return false;
  }

  return true;
}