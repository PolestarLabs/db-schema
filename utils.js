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
    return new Promise(async resolve => {
      if (["string", "number"].includes(typeof query)) {
        query = { id: query.toString() };
      }
      if (!project) project = { _id: 0 };
      data = await this.findOne(query, project).lean();
      try{
        if (!data && !!this.cat && PLX[this.cat].size) {
          console.log(this.cat,"thiscat")
          let newUser = this.new(PLX[this.cat].find((u) => u.id === query.id));
          return resolve (newUser); 
        };
        if (data === null) {
          if(PLX){
            let newUser = this.new(PLX.users.find(u=>u.id === query.id))
            console.log("New User".green,typeof newUser);
            return resolve(newUser);
          }
          else
            return resolve(null);
        }
      }catch(err){
          console.error(err,' User creation error '.bgRed)
      }
      return resolve(data);
      
    });
  },

  dbGetterFull(query, project) {
    return new Promise((resolve) => {
      if (["string", "number"].includes(typeof query)) {
        query = { id: query.toString() };
      }
      if (!project) project = { _id: 0 };
      return this.findOne(query, project).then((data) => {
        try{
          if (!data && !!this.cat && PLX[this.cat] ) return this.new(PLX[this.cat].find((u) => u.id === query.id)).then(resolve);
          if (data === null) {
            if(PLX)
              return resolve( this.new(PLX.users.find(u=>u.id === query.id)) );
            else
              return resolve(null);
          }
        }catch(err){
          
        }
        return resolve(data);
      }).catch(e=>null);
    });
  },
}