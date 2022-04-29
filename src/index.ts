import * as express from "express";
import { AppDataSource } from "./data-source";
import { authRouter } from "./routes/auth";
import { cardRouter } from "./routes/cards";

const port = 3000;

AppDataSource.initialize()
  .then(async () => {
    const app = express();
    app.use(express.json());

    app.use("/api/auth", authRouter);
    app.use("/api/cards", cardRouter);

    app.listen(port);

    console.log(`Server listening on port ${port}`);
  })
  .catch((error) => console.log(error));
