const sequelize = require('../../../utils/database/connect');

const UpcomingFlight = require('./model');
const table = require('./table');
const constraints = require('./constraints');
const triggers = require('./triggers');
// const procedures = require('./procedures');
const methods = require('./methods');
const queryWrappers = require('../../../utils/query-wrappers');


UpcomingFlight.sqlCommands = {
    table: table,
    constraints: constraints,
    triggers: triggers,
    // procedures: procedures,
};
const seeds = require('./seeds');
UpcomingFlight.seeds = seeds;


UpcomingFlight.createTable = async function (options) {
    const {table} = this.sqlCommands;
    const force = (options && options.force) || false;
    let queryResult;
    try {
        if (force) {
            console.log(table.dropCascade);
            queryResult = await sequelize.query(table.dropCascade);
        } else {
            console.log(table.drop);
            queryResult = await sequelize.query(table.drop);
        }

        queryResult = await sequelize.query(table.exists);

        if (queryResult[0].length > 0) {
            throw new Error("Drop Failed!. force was set to " + force);
        }

        console.log(table.create);
        queryResult = await sequelize.query(table.create);
        // console.log(queryResult);
    } catch (error) {
        console.log(error);
    }
};

UpcomingFlight.createTriggers = async function(options){
    const {triggers} = this.sqlCommands;

    let keys = Object.keys(triggers);
    for(key of keys) {
        console.log(triggers[key].procedure);
        let result = await sequelize.query(triggers[key].procedure);

        console.log(triggers[key].trigger);
        result = await sequelize.query(triggers[key].trigger);
    }
};

UpcomingFlight.createConstraints = async function (options) {
    const {constraints} = this.sqlCommands;
    const all_queries = [];
    for (type in constraints){
        all_queries.push(...Object.values(constraints[type]))
    }

    let queryResult;
    try {
        for (q of all_queries) {
            console.log(q);
            queryResult = await sequelize.query(q);
        }
    } catch (error){
        console.log(error);

    }
};


/*

UpcomingFlight.createTriggers = async function(options){
    const {triggers} = this.sqlCommands;
    Object.keys(triggers).map(async key=>{

        console.log(triggers[key].procedure);
        let result = await sequelize.query(triggers[key].procedure);

        console.log(triggers[key].trigger);
        result = await sequelize.query(triggers[key].trigger);
    });
};
*/

UpcomingFlight.createAll = function (options){
    // await this.createTable(options);
    // await this.createConstraints(options);
    // await this.createTriggers(options);

    return this.createTable(options).then(result=>{
        return this.createConstraints(options);
    }).then(result=>{
        return this.createTriggers();
    })
};
/* Set all method prototypes */
// UpcomingFlight.prototype.x = methods.x;

UpcomingFlight.seedTable = async function (options) {
    for (record of this.seeds) {
        let keys = Object.keys(record);
        let fields = keys.map(key => queryWrappers.wrapField(key));
        fieldsString = fields.join(',');

        let values = keys.map(key => {
            let val = record[key];
            if (typeof (val) === "string") return queryWrappers.wrapValue(val);
            else return val;
        });

        valuesString = values.join(',');

        insertQuery = `INSERT INTO ${this.getTableName()} (${fieldsString}) VALUES (${valuesString})`;
        console.log(insertQuery);
        await sequelize.query(insertQuery).then(result=>{

        }).catch(err=>{
            console.log(err);
            console.log(`Insert Failed for fields: ${fieldsString} values: ${valuesString}`);
        })
    }
};
module.exports = UpcomingFlight;