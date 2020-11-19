export const setupMockTimers = (): void => {
  jest.useFakeTimers();
  jest.clearAllTimers();
};
