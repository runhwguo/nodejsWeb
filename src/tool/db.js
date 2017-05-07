// 统一Model的定义
import Sequelize from "sequelize";
import {v4} from "uuid";
import {db} from "./config";

console.log('init sequelize...');

const sequelize = new Sequelize(db.database, db.username, db.password, {
  host: db.host,
  dialect: db.dialect,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  port: db.port,
  dialectOptions: {
    charset: 'utf8'
  }
});

const ID_TYPE = Sequelize.STRING(50);
// 强制实现规则
const defineModel = (name, attributes) => {
  let attrs = {};
  for (let key in attributes) {
    let value = attributes[key];
    if (typeof value === 'object' && value['type']) {
      value.allowNull = value.allowNull || false;
      attrs[key] = value;
    } else {
      attrs[key] = {
        type: value,
        allowNull: false
      };
    }
  }
  attrs.id = {
    type: ID_TYPE,
    primaryKey: true
  };
  attrs.version = {
    type: Sequelize.BIGINT,
    allowNull: false
  };
  console.log('model defined for table: ' + name + '\n' + JSON.stringify(attrs, (k, v) => {
      if (k === 'type') {
        for (let key in Sequelize) {
          if (key === 'ABSTRACT' || key === 'NUMBER') {
            continue;
          }
          let dbType = Sequelize[key];
          if (typeof dbType === 'function') {
            if (v instanceof dbType) {
              if (v._length) {
                return `${dbType.key}(${v._length})`;
              }
              return dbType.key;
            }
            if (v === dbType) {
              return dbType.key;
            }
          }
        }
      }
      return v;
    }, '  '));
  return sequelize.define(name, attrs, {
    tableName: name,
    charset: 'utf8',
    collate: 'utf8_general_ci',
    paranoid: true,
    hooks: {
      beforeValidate: obj => {
        let now = Date.now();
        if (obj.isNewRecord) {
          if (!obj.id) {
            console.log('will create entity...' + obj);
            obj.id = v4();
          }
          obj.version = 0;
        } else {
          console.log('will update entity...');
          obj.updatedAt = now;
          obj.version++;
        }
      }
    }
  });
};

const TYPES = ['STRING', 'INTEGER', 'BIGINT', 'TEXT', 'DOUBLE', 'DATEONLY', 'BOOLEAN', 'BLOB', 'REAL'];

let exp = {
  defineModel: defineModel,
  sync: () => sequelize.sync({force: true}),
  sequelize: sequelize
};

for (let type of TYPES) {
  exp[type] = Sequelize[type];
}

export default exp;