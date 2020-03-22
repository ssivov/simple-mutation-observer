import { cleanupAfterTest, getSimpleMutationObserver, setup, setupHtml } from './setup';
import { createElement, getById, getFixtureWormhole } from './utils/dom';
import { PromiseResolver } from './utils/simple-observer';

describe(`No-op operations tests:`, (): void => {

  let wormhole: HTMLDivElement;

  beforeEach((): void => {
    setup();
    wormhole = getFixtureWormhole();
  });

  afterEach((): void => {
    cleanupAfterTest();
  });

  function yieldThread(): Promise<void> {
    return new Promise((resolve: PromiseResolver<void>): void => {
      window.setTimeout((): void => {
        resolve();
      }, 0);
    });
  }

  async function expectNoMutations(): Promise<void> {
    await yieldThread();
    const mutations = getSimpleMutationObserver().getAllMutations();
    expect(mutations.length).toEqual(0);
  }

  it(`Adding and removing the same node is no-op`, async (done: DoneFn): Promise<void> => {
    const newNode = createElement({ parent: wormhole })
    wormhole.removeChild(newNode);

    await yieldThread();
    const mutations = getSimpleMutationObserver().getAllMutations();
    expect(mutations.length).toEqual(0);
    done();
  });

  it(`Removing existing node and placing it back is no-op`, async (done: DoneFn): Promise<void> => {
    setupHtml(`<div id='target'></div>`);
    const target = getById('target');
    wormhole.removeChild(target);
    wormhole.appendChild(target);

    expectNoMutations().then(done);
  });

  it(`Moving existing node and placing it back is no-op`, async (done: DoneFn): Promise<void> => {
    setupHtml(`
      <div id='parent'>
        <div id='target'></div>
      </div>
    `);
    const parent = getById('parent');
    const target = getById('target');
    wormhole.appendChild(target);
    parent.appendChild(target);

    expectNoMutations().then(done);
  });

  it(`Moving multiple children ending up in the same order is no-op`, async (done: DoneFn): Promise<void> => {
    setupHtml(`
      <div id='c1'></div>
      <div id='c2'></div>
      <div id='c3'></div>
    `);
    wormhole.appendChild(getById('c1'));
    wormhole.appendChild(getById('c2'));
    wormhole.appendChild(getById('c3'));

    expectNoMutations().then(done);
  });
});
