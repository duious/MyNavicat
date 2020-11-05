const mysql = require('mysql');

export const SQL_DEF = {
  'SCHEMA_NAME': 'SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME FROM information_schema.SCHEMATA;',
  'ALL_DATABASE': 'SHOW FULL TABLES WHERE Table_type != \'VIEW\';',
  'TABLE_STATE': 'SHOW TABLE STATUS;',
  'TABLE_STATE_LIKE': 'SHOW TABLE STATUS LIKE ?;',
  'ALL_TABLE': 'SELECT TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_SCHEMA, TABLE_TYPE;',
  'SHOW_COLUMNS': 'SHOW COLUMNS FROM ??.??;',
  'SELECT_ALL_FROM_TABLE': 'SELECT * FROM ??.?? LIMIT 0,200;',
  'SET_PROFILING': 'SET PROFILING = ?;',
  'SHOW_PROFILE_FOR_QUERY': 'show profile for query ?;',
  'SQL_SUM_TIME': 'SELECT QUERY_ID, SUM(DURATION) AS SUM_DURATION FROM INFORMATION_SCHEMA.PROFILING GROUP BY QUERY_ID',
  'SQL_PERFORMANCE': 'SELECT STATE AS `Status`, ROUND(SUM(DURATION),7) AS `Duration`, CONCAT(ROUND(SUM(DURATION)/0.000856*100,3), \'\') AS `Percentage` FROM INFORMATION_SCHEMA.PROFILING WHERE QUERY_ID=? GROUP BY SEQ, STATE ORDER BY SEQ',
};

/**
 * 执行sql
 *
 * @example var sql = "SELECT * FROM ?? WHERE ?? = ?";
 *          var inserts = ['users', 'id', userId];
 *          sql = mysql.format(sql, inserts);
 *
 * @param connection 链接对象
 * @param sql
 * @param params
 * @return {Promise<unknown>}
 */
export function query (connection, sql, params = []) {
  return new Promise((resolve, reject) => {
    if (params.length !== 0) {
      sql = mysql.format(sql, params);
    }
    console.debug('sql query:', sql);
    connection.query(sql, (error, results, fields) => {
      console.debug('sql query res:', results?.length);
      if (error) {
        console.debug(error, results, fields);
        reject(error);
      }
      console.debug(error, results, fields);
      resolve(results);
    });
  });
}

mysql.$SQL_DEF = SQL_DEF;
mysql.$query = query;
export default {
  install: function (app) {
    app.config.globalProperties.$mysql = mysql;
  },
};
