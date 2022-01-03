const { startConnection } = require('./dataBaseConnection');

let connection = startConnection();

class Model {

  static getAllData(selection, tableName, condition, groupby = null, orderby = null) {
    return new Promise((resolve, reject) => {
      connection.query(
        `select ${selection} from ${tableName} where ${condition} ${groupby ? `group by ${groupby}` : ''} ${orderby ? `order by ${orderby}` : ''}`,
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });

  }

  static addMaster(tableName, value) {
    return new Promise((resolve, reject) => {
      connection.query(
        `insert into ${tableName} set ?`,
        [value],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }


  static updateMaster(tableName, id, value, column = "id") {
    return new Promise((resolve, reject) => {
      connection.query(
        `update ${tableName} set ? where ${column} = ?`,
        [value, id],
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  static deleteMasterfromTable(tableName, condition) {
    // console.log(`DELETE FROM ${tableName} where ${condition}`)
    return new Promise((resolve, reject) => {
      connection.query(
        `DELETE FROM ${tableName} where  ${condition}`,
        (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }



}

module.exports = Model;