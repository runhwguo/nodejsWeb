import db from "./db";

const _rawQuery = async sql => {
  return await db.sequelize.query(sql, {
      type: db.sequelize.QueryTypes.SELECT
    }
  );
};

const _convert2sqlGrammar = data => {
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      data[index] = `'${item}'`;
    });
    data = data.join(',');
  } else {
    data = `'${data}'`;
  }
  return data;
};

const get = async (id, state = [], page) => {
  state = _convert2sqlGrammar(state);
  id = _convert2sqlGrammar(id);

  const LIMIT = 8;

  const sql = `select tasks.id, type, state, title, deadline from tasks,userTasks where userTasks.deletedAt is null and userTasks.userId=${id} and userTasks.taskId=tasks.id and state  in (${state}) limit ${(page - 1) * LIMIT}, ${LIMIT}`;

  return await _rawQuery(sql);
};

const count = async (id, state = []) => {
  state = _convert2sqlGrammar(state);
  id = _convert2sqlGrammar(id);
  const sql = `select count(*) as count from tasks,userTasks where userTasks.deletedAt is null and userTasks.userId=${id} and userTasks.taskId=tasks.id and state in (${state})`;
  let result = await _rawQuery(sql);

  return result[0].count;
};


export {
  count, get
};
