import { cleanupAfterTest, getSimpleMutationObserver, setup, setupHtml } from './setup';
import { createElement, getById, getFixtureWormhole } from './utils/dom';

describe(`Attribute mutations tests:`, (): void => {

  let wormhole: HTMLDivElement;

  beforeEach((): void => {
    setup();
    wormhole = getFixtureWormhole();
  });

  afterEach((): void => {
    cleanupAfterTest();
  });

  it('Adding attribute creates one entry correctly', async (): Promise<void> => {
    wormhole.setAttribute('attr', 'val');

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    
    // 1 correct node has mutated attributes
    expect(simpleMutation.attributes.length).toEqual(1);
    expect(simpleMutation.attributes[0].node).toEqual(wormhole);

    // The only mutation is exactly 1 new attribute
    expect(simpleMutation.attributes[0].added.length).toEqual(1);
    expect(simpleMutation.attributes[0].removed.length).toEqual(0);
    expect(simpleMutation.attributes[0].changed.length).toEqual(0);
    expect(simpleMutation.attributes[0].all.length).toEqual(1);

    // Correct attribute is added
    expect(simpleMutation.attributes[0].added[0]).toEqual('attr');
  });

  it('Removing attribute creates one entry correctly', async (): Promise<void> => {
    setupHtml(`
      <div id='target' attr='val'></div>
    `);
    const target = getById('target');
    target.removeAttribute('attr');

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    
    // 1 correct node has mutated attributes
    expect(simpleMutation.attributes.length).toEqual(1);
    expect(simpleMutation.attributes[0].node).toEqual(target);

    // The only mutation is exactly 1 new attribute
    expect(simpleMutation.attributes[0].added.length).toEqual(0);
    expect(simpleMutation.attributes[0].removed.length).toEqual(1);
    expect(simpleMutation.attributes[0].changed.length).toEqual(0);
    expect(simpleMutation.attributes[0].all.length).toEqual(1);

    // Correct attribute is removed
    expect(simpleMutation.attributes[0].removed[0]).toEqual('attr');
    expect(simpleMutation.attributes[0].oldValues.get('attr')).toEqual('val');
  });

  it('Changing attribute creates one entry correctly', async (): Promise<void> => {
    setupHtml(`
      <div id='target' attr='old-val'></div>
    `);
    const target = getById('target');
    target.setAttribute('attr', 'new-val');

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    
    // 1 correct node has mutated attributes
    expect(simpleMutation.attributes.length).toEqual(1);
    expect(simpleMutation.attributes[0].node).toEqual(target);

    // The only mutation is exactly 1 new attribute
    expect(simpleMutation.attributes[0].added.length).toEqual(0);
    expect(simpleMutation.attributes[0].removed.length).toEqual(0);
    expect(simpleMutation.attributes[0].changed.length).toEqual(1);
    expect(simpleMutation.attributes[0].all.length).toEqual(1);

    // Correct attribute is changed
    expect(simpleMutation.attributes[0].changed[0]).toEqual('attr');
    expect(simpleMutation.attributes[0].oldValues.get('attr')).toEqual('old-val');
  });

  it('Add, remove and update 3 different attributes creates 3 correct entries', async (): Promise<void> => {
    setupHtml(`
      <div id='target' attr-remove='val' attr-change='old-val'></div>
    `);
    const target = getById('target');
    target.setAttribute('attr-add', 'val');
    target.removeAttribute('attr-remove');
    target.setAttribute('attr-change', 'new-val');

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    
    // 1 correct node has mutated attributes
    expect(simpleMutation.attributes.length).toEqual(1);
    expect(simpleMutation.attributes[0].node).toEqual(target);

    // All three mutations are reported
    expect(simpleMutation.attributes[0].added.length).toEqual(1);
    expect(simpleMutation.attributes[0].removed.length).toEqual(1);
    expect(simpleMutation.attributes[0].changed.length).toEqual(1);
    expect(simpleMutation.attributes[0].all.length).toEqual(3);
  });

  it('Adding and updating same attribute records only adding', async (): Promise<void> => {
    wormhole.setAttribute('attr', 'val');

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    
    expect(simpleMutation.attributes.length).toEqual(1);
    expect(simpleMutation.attributes[0].added.length).toEqual(1);
    expect(simpleMutation.attributes[0].changed.length).toEqual(0);
    expect(simpleMutation.attributes[0].all.length).toEqual(1);
  });

  it('Updating and removing same attribute records only removing', async (): Promise<void> => {
    setupHtml(`
      <div id='target' attr='val'></div>
    `);
    const target = getById('target');
    target.removeAttribute('attr');

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    
    expect(simpleMutation.attributes.length).toEqual(1);
    expect(simpleMutation.attributes[0].removed.length).toEqual(1);
    expect(simpleMutation.attributes[0].changed.length).toEqual(0);
    expect(simpleMutation.attributes[0].all.length).toEqual(1);
  });

  it('Changing attribute twice reports initial old value', async (): Promise<void> => {
    setupHtml(`
      <div id='target' attr='old-val'></div>
    `);
    const target = getById('target');
    target.setAttribute('attr', 'interim-val');
    target.setAttribute('attr', 'new-val');

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    
    expect(simpleMutation.attributes.length).toEqual(1);
    expect(simpleMutation.attributes[0].changed.length).toEqual(1);
    expect(simpleMutation.attributes[0].changed[0]).toEqual('attr');
    expect(simpleMutation.attributes[0].oldValues.get('attr')).toEqual('old-val');
  });

  it(`Adding attribute to a new node doesn't report attribute change`, async (): Promise<void> => {
    const newNode = createElement({ tag: 'div', parent: wormhole});
    newNode.setAttribute('attr', 'val');

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    
    expect(simpleMutation.added.length).toEqual(1);
    expect(simpleMutation.attributes.length).toEqual(0);
  });

  it(`Adding attribute and to a removed node doesn't report attribute change`, async (): Promise<void> => {
    setupHtml(`
      <div id='target'></div>
    `)
    const target = getById('target');
    target.setAttribute('attr', 'val');
    wormhole.removeChild(target);

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    
    expect(simpleMutation.removed.length).toEqual(1);
    expect(simpleMutation.attributes.length).toEqual(0);
  });
});
