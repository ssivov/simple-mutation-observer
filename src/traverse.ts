export function forEachNode<T>(node: T, getChildren: (node: T) => T[], func: (node: T) => void): void {
  const children = getChildren(node);
  for (let i = 0; i < children.length; i++) {
    forEachNode(children[i], getChildren, func);
  }
  func(node);
}
