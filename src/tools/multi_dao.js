import db from "./db";

const getUserUnfinishedTaskIds = async id => {
  return await _rawQuery(`select tasks.id, type, detail, deadline from tasks,userTasks where userTasks.userId=${id} and userTasks.taskId=tasks.id and state='completing'`);
};

const _rawQuery = async sql => {
  return await db.sequelize.query(sql, {
      type: db.sequelize.QueryTypes.SELECT
    }
  );
};


export {
  getUserUnfinishedTaskIds
};
