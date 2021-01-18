import { cleanupAfterTest, setup, setupHtml, getSimpleMutationObserver } from './setup';
import { getFixtureWormhole, getById, createElement } from './utils/dom';

describe(`'Remove' mutation tests:`, (): void => {

  let wormhole: HTMLDivElement;

  beforeEach((): void => {
    setup();
    wormhole = getFixtureWormhole();
  });

  afterEach((): void => {
    cleanupAfterTest();
  });

  it('Simply removing node', async (): Promise<void> => {
    setupHtml(`
      <div>
        <div id='target'></div>
      </div>
    `);
    const target = getById('target');
    target.parentElement?.removeChild(target);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.removed.length).toEqual(1);
  });

  it('Removing node with subtree', async (): Promise<void> => {
    setupHtml(`
      <div>
        <div id='target'>
          <div></div>
        </div>
      </div>
    `);
    const target = getById('target');
    target.parentElement?.removeChild(target);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.removed.length).toEqual(2);
  });

  it('Removing node with child and re-attaching child to dom', async (): Promise<void> => {
    setupHtml(`
      <div>
        <div id='target'>
          <div id='child'></div>
        </div>
      </div>
    `);
    const target = getById('target');
    const child = getById('child');
    target.parentElement?.removeChild(target);
    wormhole.appendChild(child);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.removed.length).toEqual(1);
    expect(simpleMutation.removed[0].node).toEqual(target);
  });

  it('Removing node with child, detaching child and placing node back in the dom', async (): Promise<void> => {
    setupHtml(`
      <div>
        <div id='target'>
          <div id='child'></div>
        </div>
      </div>
    `);
    const target = getById('target');
    const child = getById('child');
    target.parentElement?.removeChild(target);
    target.removeChild(child);
    wormhole.appendChild(target);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.removed.length).toEqual(1);
    expect(simpleMutation.removed[0].node).toEqual(child);
  });

  it('Removing node twice', async (): Promise<void> => {
    setupHtml(`
      <div id='parent'>
        <div id='target'></div>
      </div>
    `);
    const outsideNode = createElement({ tag: 'div' })
    const target = getById('target');
    outsideNode.appendChild(target);
    getById('parent').appendChild(outsideNode);
    outsideNode.removeChild(target);;

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.removed.length).toEqual(1);
    expect(simpleMutation.removed[0].node).toEqual(target);
  });

  it('Removing node with a child, giving child a new parent and attaching new parent to dom', async (): Promise<void> => {
    setupHtml(`
      <div>
        <div id='parent'>
          <div id='child'></div>
        </div>
      </div>
    `);
    const parent = getById('parent');
    const child = getById('child');
    const newParent = createElement({ tag: 'newParent' });

    parent.parentElement?.removeChild(parent);
    newParent.appendChild(child);
    wormhole.appendChild(newParent);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.removed.length).toEqual(1);
    expect(simpleMutation.added.length).toEqual(1);
    expect(simpleMutation.moved.length).toEqual(1);
  });

  it('Remove node through subtree of new node', async (): Promise<void> => {
    setupHtml(`
      <div>
        <div id='target'></div>
      </div>
    `);
    const target = getById('target');
    const newNode = createElement({ tag: 'div' });

    wormhole.appendChild(newNode);
    newNode.appendChild(target);
    wormhole.removeChild(newNode);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.removed.length).toEqual(1);
    expect(simpleMutation.removed[0].node).toEqual(target);
  });

  it('Remove from the middle of the tree vertical', async (): Promise<void> => {
    setupHtml(`
      <div id='top'>
        <div id='target'>
          <div id='bottom'></div>
        </div>
      </div>
    `);
    const top = getById('top'); 
    const target = getById('target');
    const bottom = getById('bottom');

    top.removeChild(target);
    top.appendChild(bottom);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.removed.length).toEqual(1);
    expect(simpleMutation.removed[0].node).toEqual(target);
  });

  it('Append to node and then remove its skip-parent', async (): Promise<void> => {
    setupHtml(`
      <div id='skip-parent'>
        <div>
          <div id='target'></div>
        </div>
      </div>
    `);
    const skipParent = getById('skip-parent'); 
    const target = getById('target');
    const newNode = createElement({ tag: 'div', parent: target });

    wormhole.removeChild(skipParent);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.removed.length).toEqual(3);
  });
});