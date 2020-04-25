export default class Cache {
  constructor() {
    this.data = {};
  }

  exists(key) {
    return (key in this.data);
  }

  setItem(key, value) {
    this.data[key] = value;
  }

  getItem(key) {
    return this.data[key];
  }
}
