import db from "../database/connection";
import { convertHourToMinutes } from "../utils";
import { Request, Response } from "express";

interface scheduleItem {
  week_day: number;
  from: string;
  to: string;
}

export default class ClassesController {
  async index(req: Request, res: Response) {
    try {
      const week_day = req.query.week_day as string;
      const subject = req.query.subject as string;
      const time = req.query.time as string;

      if (!week_day || !subject)
        return res.status(400).json({
          message: "Todos os filtros obrigatórios devem ser enviados!",
        });

      const timeInMinutes = convertHourToMinutes(time);

      const classes = await db("classes")
        .whereExists(function () {
          this.select("class_schedule.*")
            .from("class_schedule")
            .whereRaw("`class_schedule`.`class_id` = `classes`.`id`")
            .whereRaw("`class_schedule`.`week_day` = ??", [Number(week_day)])
            .whereRaw("`class_schedule`.`from` <= ??", [timeInMinutes])
            .whereRaw("`class_schedule`.`to` > ??", [timeInMinutes]);
        })
        .where("classes.subject", "=", subject)
        .join("users", "classes.user_id", "=", "users.id")
        .select(["classes.*", "users.*"]);

      return res.json(classes);
    } catch (error) {
      res.status(500).send({
        error,
      });
    }
  }

  async create(req: Request, res: Response) {
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
  }
}
