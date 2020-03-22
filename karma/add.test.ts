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
      <div id='oldParent'>
        <div id='moveTarget'></div>
      </div>
      <div id='newParent'></div>
    `);
    const moveTarget = getById('moveTarget');
    getById('newParent').appendChild(moveTarget);
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

  // /************** GRID TESTS *****************/

  // //// Skip-parent: Unaffected

  // // Parent: Unaffected
  // it('Skip-parent: Unaffected, Parent: Unaffected', async (): Promise<void> => {
  //   setupHtml(`
  //     <div id='skip-parent'>
  //       <div id='parent'></div>
  //     </div>
  //   `);
  //   const target = getById('parent');
  //   createElement({ parent: target })

  //   const simpleMutation = await getSimpleMutationObserver().getSimpleMutationSummary();
  //   expect(simpleMutation.added.length).toEqual(1);
  // });

  // // Parent: Added
  // it('Skip-parent: Unaffected, Parent: Added', async (): Promise<void> => {
  //   setupHtml(`
  //     <div id='skip-parent'></div>
  //   `);
  //   const parent = createElement();
  //   createElement({ parent });
  //   getById('skip-parent').appendChild(parent);

  //   const simpleMutation = await getSimpleMutationObserver().getSimpleMutationSummary();
  //   expect(simpleMutation.added.length).toEqual(2);
  // });

  // // Parent: Removed
  // it('Skip-parent: Unaffected, Parent: Removed', async (): Promise<void> => {
  //   setupHtml(`
  //     <div id='skip-parent'>
  //       <div id='parent'></div>
  //     </div>
  //   `);
  //   const parent = getById('parent');
  //   createElement({ parent });
  //   getById('skip-parent').removeChild(parent);

  //   const simpleMutation = await getSimpleMutationObserver().getSimpleMutationSummary();
  //   expect(simpleMutation.added.length).toEqual(0);
  // });

  // // Parent: Moved
  // it('Skip-parent: Unaffected, Parent: Moved', async (): Promise<void> => {
  //   setupHtml(`
  //     <div id='old-skip-parent'>
  //       <div id='parent'></div>
  //     </div>
  //     <div id='new-skip-parent'></div>
  //   `);
  //   const parent = getById('parent');
  //   createElement({ parent });
  //   getById('new-skip-parent').appendChild(parent);

  //   const simpleMutation = await getSimpleMutationObserver().getSimpleMutationSummary();
  //   expect(simpleMutation.added.length).toEqual(1);
  // });

  // //// Skip-parent: Added

  // // Parent: Unaffected
  // it('Skip-parent: Added, Parent: Unaffected', async (): Promise<void> => {
  //   const skipParent = createElement();
  //   const parent = createElement({ parent: skipParent });
  //   wormhole.appendChild(skipParent);
  //   createElement({ parent });

  //   const simpleMutation = await getSimpleMutationObserver().getSimpleMutationSummary();
  //   expect(simpleMutation.added.length).toEqual(3);
  // });

  // // Parent: Added
  // it('Skip-parent: Added, Parent: Added', async (): Promise<void> => {
  //   const skipParent = createElement({ parent: wormhole });
  //   const parent = createElement({ parent: skipParent });
  //   createElement({ parent });

  //   const simpleMutation = await getSimpleMutationObserver().getSimpleMutationSummary();
  //   expect(simpleMutation.added.length).toEqual(3);
  // });

  // // Parent: Removed
  // it('Skip-parent: Added, Parent: Removed', async (): Promise<void> => {
  //   const skipParent = createElement();
  //   const parent = createElement({ parent: skipParent });
  //   wormhole.appendChild(skipParent);
  //   createElement({ parent });
  //   skipParent.removeChild(parent);

  //   const simpleMutation = await getSimpleMutationObserver().getSimpleMutationSummary();
  //   expect(simpleMutation.added.length).toEqual(1);
  // });

  // // Parent: Moved
  // it('Skip-parent: Added, Parent: Moved', async (): Promise<void> => {
  //   setupHtml(`
  //     <div id='old-skip-parent'>
  //       <div id='parent'></div>
  //     </div>
  //   `);
  //   const skipParent = createElement({ parent: wormhole });
  //   const parent = getById('parent');
  //   createElement({ parent });
  //   skipParent.appendChild(parent);

  //   const simpleMutation = await getSimpleMutationObserver().getSimpleMutationSummary();
  //   expect(simpleMutation.added.length).toEqual(2);
  // });

  // //// Skip-parent: Removed

  // // Parent: Unaffected
  // it('Skip-parent: Removed, Parent: Unaffected', async (): Promise<void> => {
  //   setupHtml(`
  //     <div id='skip-parent'>
  //       <div id='parent'></div>
  //     </div>
  //   `);
  //   createElement({ parent: getById('parent') });
  //   wormhole.removeChild(getById('skip-parent'));

  //   const simpleMutation = await getSimpleMutationObserver().getSimpleMutationSummary();
  //   expect(simpleMutation.added.length).toEqual(0);
  // });

  // // Parent: Added
  // it('Skip-parent: Removed, Parent: Added', async (): Promise<void> => {
  //   setupHtml(`<div id='skip-parent'></div>`);
  //   const skipParent = getById('skip-parent');
  //   const parent = createElement({ parent: skipParent });
  //   createElement({ parent });
  //   wormhole.removeChild(skipParent);

  //   const simpleMutation = await getSimpleMutationObserver().getSimpleMutationSummary();
  //   expect(simpleMutation.added.length).toEqual(0);
  // });

  // // Parent: Removed
  // it('Skip-parent: Removed, Parent: Removed', async (): Promise<void> => {
  //   setupHtml(`
  //     <div id='skip-parent'>
  //       <div id='parent'></div>
  //     </div>
  //   `);
  //   const parent = getById('parent');
  //   const skipParent = getById('skip-parent');
  //   createElement({ parent });
  //   skipParent.removeChild(parent);
  //   wormhole.removeChild(skipParent);

  //   const simpleMutation = await getSimpleMutationObserver().getSimpleMutationSummary();
  //   expect(simpleMutation.added.length).toEqual(0);
  // });

  // // Parent: Moved [FAILING]
  // it('Skip-parent: Removed, Parent: Moved', async (): Promise<void> => {
  //   setupHtml(`
  //     <div id='old-skip-parent'>
  //       <div id='parent'></div>
  //     </div>
  //     <div id='new-skip-parent'></div>
  //   `);
  //   const parent = getById('parent');
  //   const skipParent = getById('new-skip-parent');
  //   createElement({ parent });
  //   skipParent.appendChild(parent);
  //   wormhole.removeChild(skipParent);

  //   const simpleMutation = await getSimpleMutationObserver().getSimpleMutationSummary();
  //   expect(simpleMutation.added.length).toEqual(0);
  // });

  // //// Skip-parent: Moved

  // // Parent: Unaffected

  // // Parent: Added

  // // Parent: Removed

  // // Parent: Moved

  // TODO: Adding to added node - is it reported? E.g. 0 + 1, 1 + 2 (is 2 added to 1 reported?)
  // Answer: Yes, reported
});
