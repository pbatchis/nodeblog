require("dotenv").config();
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Card } from "./entity/Card";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: process.env.username,
  password: process.env.password,
  database: process.env.database,
  synchronize: true,
  logging: false,
  entities: [User, Card],
  migrations: [],
  subscribers: [],
});
