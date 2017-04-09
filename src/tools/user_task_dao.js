import db from './db';

const getUserUnfinishedTasks = async id => {
  return await _rawQuery(`select tasks.id, type, title, deadline from tasks,userTasks where userTasks.userId=${id} and userTasks.taskId=tasks.id and state='unfinished'`);
};

const getUserCompletedTasks = async id => {
  return await _rawQuery(`select tasks.id, type, title, state from tasks,userTasks where userTasks.userId=${id} and userTasks.taskId=tasks.id and state in ('completing', 'completed')`);
};

const _rawQuery = async sql => {
  return await db.sequelize.query(sql, {
      type: db.sequelize.QueryTypes.SELECT
    }
  );
};

const _convert2sqlGrammar = data => {
  if (Array.isArray(data)) {
    data.forEach(item => {
      item = `'${item}'`;
    });
  } else {
    data = `'${data}'`;
  }
  return data;
};

const get = async (id, stateArray = []) => {
  stateArray.forEach(item => {
    item = `'${item}'`;
  });
};

const count = async (id, state=[]) => {
  _convert2sqlGrammar(state);
  let state = state.join(',');
  const sql = `select count(*) from tasks,userTasks where userTasks.userId='${id}' and userTasks.taskId=tasks.id and state in (${state})`;
  let result = await _rawQuery(sql);


  return result;
};


export {
  getUserUnfinishedTasks, getUserCompletedTasks, count
};
