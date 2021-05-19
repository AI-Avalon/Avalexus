module.exports = class Command {
  constructor(name) {
    this.name = name;
  }
  run(fn, options = {}) {
    this.fn = fn;
    this.options = options;
    return this;
  }
};
