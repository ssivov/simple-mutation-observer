import { cleanupAfterTest, getSimpleMutationObserver, setup, setupHtml } from './setup';
import { createElement, getById, getFixtureWormhole } from './utils/dom';

describe(`'Move' mutation tests:`, (): void => {

  let wormhole: HTMLDivElement;

  beforeEach((): void => {
    setup();
    wormhole = getFixtureWormhole();
  });

  afterEach((): void => {
    cleanupAfterTest();
  });

  it('Moving node to a different parent', async (): Promise<void> => {
    setupHtml(`
      <div>
        <div id='target'></div>
      </div>
      <div id='new-parent'></div>
    `);
    const target = getById('target');
    const newParent = getById('new-parent');
    newParent.appendChild(target);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.moved.length).toEqual(1);
  });

  it('Moving node to the same parent, but new position', async (): Promise<void> => {
    setupHtml(`
      <div id='parent'>
        <div id='target'></div>
        <div></div>
      </div>
    `);
    const target = getById('target');
    const parent = getById('parent');
    parent.appendChild(target);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.moved.length).toEqual(1);
  });

  it('Moving node with a subtree', async (): Promise<void> => {
    setupHtml(`
      <div>
        <div id='target'>
          <div></div>
        </div>
      </div>
      <div id='new-parent'></div>
    `);
    const target = getById('target');
    const newParent = getById('new-parent');
    newParent.appendChild(target);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.moved.length).toEqual(1);
  });

  it('Removing node, but then inserting in a different place', async (): Promise<void> => {
    setupHtml(`
      <div>
        <div id='target'></div>
      </div>
      <div id='new-parent'></div>
    `);
    const target = getById('target');
    const newParent = getById('new-parent');
    target.parentElement?.removeChild(target);
    newParent.appendChild(target);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.removed.length).toEqual(0);
    expect(simpleMutation.moved.length).toEqual(1);
  });

  it('Moving node to a disconnected parent and attaching that parent to dom', async (): Promise<void> => {
    setupHtml(`
      <div>
        <div id='target'></div>
      </div>
    `);
    const target = getById('target');
    const newNode = createElement({ tag: 'div' });
    newNode.appendChild(target);
    wormhole.appendChild(newNode);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.added.length).toEqual(1);
    expect(simpleMutation.moved.length).toEqual(1);
  });

  it('Removing parent, but inserting node back in the dom', async (): Promise<void> => {
    setupHtml(`
      <div id='parent'>
        <div id='target'></div>
      </div>
      <div id='new-parent'></div>
    `);
    const parent = getById('parent');
    const target = getById('target');
    const newParent = getById('new-parent');
    wormhole.removeChild(parent);
    newParent.appendChild(target);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.removed.length).toEqual(1);
    expect(simpleMutation.moved.length).toEqual(1);
  });
});