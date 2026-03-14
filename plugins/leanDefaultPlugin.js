/**
 * Makes .lean() the default for find() and findOne() on all schemas.
 * Opt out when you need a full Mongoose document (e.g. .save(), instance methods)
 * by passing { lean: false } as options:
 *
 *   Model.findOne(query, projection, { lean: false })
 *   Model.find(query, projection, { lean: false })
 *
 * getFull() and any code that needs a Document should use that opt-out.
 */
function leanDefaultPlugin(schema) {
  schema.pre("find", function setLean() {
    const opts = this.getOptions ? this.getOptions() : this.options;
    if (opts && opts.lean === false) return;
    this.lean();
  });
  schema.pre("findOne", function setLean() {
    const opts = this.getOptions ? this.getOptions() : this.options;
    if (opts && opts.lean === false) return;
    this.lean();
  });
}

module.exports = leanDefaultPlugin;
