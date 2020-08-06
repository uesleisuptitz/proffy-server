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
  try {
    const { name, avatar, whatsapp, bio, subject, cost, schedule } = req.body;
    const insertedUsersIds = await db("users").insert({
      name,
      avatar,
      whatsapp,
      bio,
    });

    const user_id = insertedUsersIds[0];

    const insertedClassesIds = await db("classes").insert({
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

    await db("class_schedule").insert(classSchedule);

    return res.send();
  } catch (error) {
    res.status(500).send({
      error,
    });
  }
});

export default routes;
