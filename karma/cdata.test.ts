import { cleanupAfterTest, getSimpleMutationObserver, setup, setupHtml } from './setup';
import { createElement, getById, getFixtureWormhole } from './utils/dom';

describe(`Character data mutations tests:`, (): void => {

  let wormhole: HTMLDivElement;

  beforeEach((): void => {
    setup();
    wormhole = getFixtureWormhole();
  });

  afterEach((): void => {
    cleanupAfterTest();
  });

  it('Changing cdata creates one entry correctly', async (): Promise<void> => {
    setupHtml(`
      <div id='target'>old-text</div>
    `);
    const target = getById('target') as HTMLDivElement;
    const text = target.childNodes[0] as CharacterData;
    text.data = 'new-text';

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    
    expect(simpleMutation.cdata.length).toEqual(1);
    expect(simpleMutation.cdata[0].node).toEqual(text);
    expect(simpleMutation.cdata[0].oldValue).toEqual('old-text');
  });

  it('Changing cdata twice reports initial old value', async (): Promise<void> => {
    setupHtml(`
      <div id='target'>old-text</div>
    `);
    const target = getById('target') as HTMLDivElement;
    const text = target.childNodes[0] as CharacterData;
    text.data = 'interim-text';
    text.data = 'new-text';

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();
    
    expect(simpleMutation.cdata.length).toEqual(1);
    expect(simpleMutation.cdata[0].node).toEqual(text);
    expect(simpleMutation.cdata[0].oldValue).toEqual('old-text');
  });

  it(`Changing cdata of a new node doesn't report cdata change`, async (): Promise<void> => {
    setupHtml(`
      <div id='target'></div>
    `);
    const target = getById('target') as HTMLDivElement;
    target.innerText = 'some-text';
    const text = target.childNodes[0] as CharacterData;
    text.data = 'new-text';

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();

    expect(simpleMutation.added.length).toEqual(1);
    expect(simpleMutation.cdata.length).toEqual(0);
  });

  it(`Changing cdata of a removed node doesn't report cdata change`, async (): Promise<void> => {
    setupHtml(`
      <div id='target'>some-text</div>
    `);
    const target = getById('target') as HTMLDivElement;
    const text = target.childNodes[0] as CharacterData;
    text.data = 'new-text';
    text.remove();

    const simpleMutation = await getSimpleMutationObserver().getSimpleMutationRecord();

    expect(simpleMutation.removed.length).toEqual(1);
    expect(simpleMutation.cdata.length).toEqual(0);
  });
});
