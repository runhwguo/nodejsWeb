import schedule from "node-schedule";

import * as Dao from "./dao";
import {Task} from "../models/Task";
import {TASK_STATE} from '../models/Task';


const setSchedule = () => {
  let scanRule = new schedule.RecurrenceRule();

  scanRule.minute = 28;
  scanRule.hour = 0;

  let job = schedule.scheduleJob(scanRule, function () {

  });
};

const offExpiredTask = async () => {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!
  let yyyy = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd
  }

  if (mm < 10) {
    mm = '0' + mm
  }

  today = yyyy + '-' + mm + '-' + dd;

  await Dao.findAll(Task, {
    attributes: [],
    where: {
      deadline: {
        $lt: today
      },
      state: TASK_STATE.released_not_claimed
    }
  });
  await Dao.update(Task, {
    state: TASK_STATE.expired
  }, {
    where: {
      state: TASK_STATE.released_not_claimed
    }
  });
};


export default setSchedule;

