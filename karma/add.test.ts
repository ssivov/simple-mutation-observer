import { cleanupAfterTest, getSimpleMutationObserver, setup, setupHtml } from './setup';
import { createElement, getById, getFixtureWormhole } from './utils/dom';

describe(`'Add' mutations tests:`, (): void => {

  let wormhole: HTMLDivElement;

  beforeEach((): void => {
    setup();
    wormhole = getFixtureWormhole();
  });

  afterEach((): void => {
    cleanupAfterTest();
  });

  it('Adding 1 new child creates 1 entry', async (): Promise<void> => {
    const newNode = createElement({ parent: wormhole })
    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.added.length).toEqual(1);
    expect(simpleMutation.added[0].node).toEqual(newNode);
  });

  it('Adding 1 node via removed existing node creates 1 entry', async (): Promise<void> => {
    setupHtml(`<div id='target'></div>`);
    const target = getById('target');
    wormhole.removeChild(target);
    const newNode = createElement({ parent: target });
    wormhole.appendChild(target);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.added.length).toEqual(1);
    expect(simpleMutation.added[0].node).toEqual(newNode);
  });

  it('Adding a node to a moved node creates 1 entries', async (): Promise<void> => {
    setupHtml(`
      <div id='old-parent'>
        <div id='move-target'></div>
      </div>
      <div id='new-parent'></div>
    `);
    const moveTarget = getById('move-target');
    getById('new-parent').appendChild(moveTarget);
    createElement({ parent: moveTarget })

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.added.length).toEqual(1);
  });

  it('Adding a node to a removed node creates 0 entries', async (): Promise<void> => {
    setupHtml(`<div id='target'></div>`);
    const target = getById('target');
    createElement({ parent: target })
    wormhole.removeChild(target);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.added.length).toEqual(0);
  });

  it('Adding a node to a re-inserted node creates 1 entry', async (): Promise<void> => {
    setupHtml(`<div id='target'></div>`);
    const target = getById('target');
    wormhole.removeChild(target);
    createElement({ parent: target })
    wormhole.appendChild(target);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    expect(simpleMutation.added.length).toEqual(1);
  });
});
