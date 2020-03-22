import { cleanupAfterTest, setup } from './setup';

xdescribe('Ensure moved nodes are reported correctly', (): void => {

  beforeEach((): void => {
    setup();
  });

  afterEach((): void => {
    cleanupAfterTest();
  });

  it('Placeholder', async (): Promise<void> => {
    expect(1).toEqual(1);
    // // Test
    // function _testRemoveOutsideTheDom() {
    //   const c1 = createDivWithId('c1');
    //   const c2 = createDivWithId('c2');
    //   const c3 = createDivWithId('c3');
    //   c1.appendChild(c2);
    //   root.appendChild(c1);
    //   beforeEach();

    //   mutationCallback = (mutations: MutationRecord[]): void => {
    //     debugger;
    //     afterEach();
    //   }

    //   root.removeChild(c1);
    //   c3.appendChild(c2);
    //   root.appendChild(c3);
    // }

    // function _testRemoveThroughNewNode() {
    //   const c1 = createDivWithId('c1');
    //   root.appendChild(c1);
    //   beforeEach();

    //   mutationCallback = (mutations: MutationRecord[]): void => {
    //     debugger;
    //     afterEach();
    //   }

    //   const c2 = createDivWithId('c2');
    //   root.appendChild(c2);
    //   c2.appendChild(c1);
    //   root.removeChild(c2);
    // }

    // TODO: Test removing node from the chain (e.g. 1 -> 2 -> 3), remove 2, reattach 3 back to 1
  });
});