import { cleanupAfterTest, setup } from './setup';

xdescribe('Ensure moved nodes are reported correctly', (): void => {

  beforeEach((): void => {
    setup();
  });

  afterEach((): void => {
    cleanupAfterTest();
  });

  xit('Placeholder', async (): Promise<void> => {
    expect(1).toEqual(1);
  });
});