interface ICreateElementOptions {
  tag?: string;
  id?: string;
  parent?: Element;
  insertBefore?: Element;
}

const defaultElementTag: string = 'simple-mutation-test';

export function createElement(opts?: ICreateElementOptions): Element {
  opts = opts || {};
  const tag = ('tag' in opts) ? opts.tag as string : defaultElementTag;
  const elem = document.createElement(tag);
  if ('id' in opts) {
    elem.id = opts.id as string;
  }
  if (opts.parent) {
    if (opts.insertBefore) {
      opts.parent.insertBefore(elem, opts.insertBefore);
    } else {
      opts.parent.appendChild(elem);
    }
  }
  return elem;
}

export function getById(id: string): Element {
  return document.getElementById(id) as Element;
}

export function getFixtureWormhole(): HTMLDivElement {
  const wormhole = getById('test-page-wormhole');
  if (wormhole) {
    return wormhole as HTMLDivElement;
  } else {
    throw new Error('Test wormhole div not found in the document');
  }
}