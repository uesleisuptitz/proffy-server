import db from "../database/connection";
import { convertHourToMinutes } from "../utils";
import { Request, Response } from "express";

export default class ConnectionsController {
  async index(req: Request, res: Response) {
    try {
      const totalConnections = await db("connections").count("* as total");
      const { total } = totalConnections[0];
      return res.json({ total });
    } catch (error) {
      res.status(500).send({
        error,
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { user_id } = req.body;
      await db("connections").insert({
        user_id,
      });

      return res.status(201).send();
    } catch (error) {
      res.status(500).send({
        error,
      });
    }
  }
}
