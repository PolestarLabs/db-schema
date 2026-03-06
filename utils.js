/**
 * Mongoose query conventions (bot + dashboard + database_schema):
 *
 * LEAN IS IMPLICIT:
 *   - find() and findOne() default to .lean() (plain objects). Prefer model.get(id) when it exists.
 *   - To get a full Document (e.g. for .save() or instance methods), opt out: findOne(q, proj, { lean: false }) or use model.getFull(id).
 *
 * Caveats of NOT using lean (i.e. full Mongoose documents):
 *   - Heavier: more memory and CPU (change tracking, getters/setters). Lean docs are ~3x smaller.
 *   - Risk of accidental persistence: if code calls .save() or modifies and saves, changes are written. With lean you get POJOs and cannot .save().
 *   - Virtuals and document instance methods only exist on full documents; lean results are plain objects.
 *
 * .exec():
 *   - Use .exec() only on hand-offs: when the promise is passed elsewhere (e.g. .then(cb), Promise.all([ ... ])).
 *   - When we await the result in the same flow, do not use .exec(): use await Model.find() (lean is already default).
 */
module.exports = {
  dbSetter(query, alter, options = {}) {
    return new Promise((resolve) => {
      if (["string", "number"].includes(typeof query)) {
        query = { id: query.toString() };
      }
      if (!alter) resolve(null);
      if (!options.upsert) options.upsert = true;
      if (["guilds", "sv_meta"].includes(this.cat)) options.upsert = false;

      return resolve(this.updateOne(query, alter, options).lean().exec());
    });
  },

  async dbChecker(query) {
    if (["string", "number"].includes(typeof query)) {
      query = { id: query.toString() };
    }
    if (!alter) resolve(false);
    else resolve(true);
  },

  dbGetter(query, project) {
    return new Promise((resolve) => {
      if (["string", "number"].includes(typeof query)) {
        query = { id: query.toString() };
      }
      if (!project) project = { _id: 0 };
      return this.findOne(query, project).exec().then((data) => { // lean implicit via plugin; .exec() for hand-off
        try{
          if (!data && !!this.cat && PLX[this.cat].size) return this.new(PLX[this.cat].find((u) => u.id === query.id)).then(resolve);
          if (data === null) return resolve(null);// return resolve( this.new(PLX.users.find(u=>u.id === query.id)) );
        }catch(err){
            
        }
        return resolve(data?._doc || data);
      });
    });
  },

  dbGetterFull(query, project, avoidNew) {
    return new Promise(async (resolve) => {
      if (["string", "number"].includes(typeof query)) {
        query = { id: query.toString() };
      }
      if (!project) project = { _id: 0 };

      const data = await this.findOne(query, project, { lean: false });

      if (!avoidNew){
        if (!data && !!this.cat) return resolve( await this.new(PLX[this.cat].find((u) => u.id === query.id)));
        if (data === null)  return resolve( await this.new(PLX.users.find(u=>u.id === query.id||query)) );
      }
      return resolve(data);
    });
  },
}