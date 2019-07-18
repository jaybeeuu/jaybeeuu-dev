export class MockStorage {
  constructor() {
    this.store = {};
    this.setItem = jest.fn((key, val) => this.store[key] = val.toString());
    this.getItem = jest.fn((key) => this.store[key]);
    this.removeItem = jest.fn((key) => delete this.store[key]);
    this.clear = jest.fn(() => this.store = {});
  }
}