export const useFakeTimers = (): void => {
  // eslint-disable-next-line jest/no-hooks, jest/require-top-level-describe
  beforeEach(() => {
    jest.useFakeTimers();
  });
  // eslint-disable-next-line jest/no-hooks, jest/require-top-level-describe
  afterEach(() => {
    jest.clearAllTimers();
  });
};
