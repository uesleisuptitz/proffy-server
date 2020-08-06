import express from "express";
import db from "./database/connection";
import { convertHourToMinutes } from "./utils";

const routes = express.Router();

interface scheduleItem {
  week_day: number;
  from: string;
  to: string;
}

routes.post("/classes", async (req, res) => {
  const trx = await db.transaction();
  try {
    const { name, avatar, whatsapp, bio, subject, cost, schedule } = req.body;
    const insertedUsersIds = await trx("users").insert({
      name,
      avatar,
      whatsapp,
      bio,
    });
    const user_id = insertedUsersIds[0];
    const insertedClassesIds = await trx("classes").insert({
      subject,
      cost,
      user_id,
    });
    const class_id = insertedClassesIds[0];
    const classSchedule = schedule.map((s: scheduleItem) => ({
      class_id,
      week_day: s.week_day,
      from: convertHourToMinutes(s.from),
      to: convertHourToMinutes(s.to),
    }));
    await trx("class_schedule").insert(classSchedule);
    await trx.commit();
    return res.status(201).send();
  } catch (error) {
    await trx.rollback();
    res.status(500).send({
      error,
    });
  }
});

export default routes;
