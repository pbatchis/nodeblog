require("dotenv").config();
import * as express from "express";
import { Request, Response } from "express";
const jwt = require("jsonwebtoken");
import { AppDataSource } from "../data-source";
import { Card } from "../entity/Card";
import { User } from "../entity/User";

export const cardRouter = express.Router();

const cardRepository = AppDataSource.getRepository(Card);
const userRepository = AppDataSource.getRepository(User);

cardRouter.get("/", async (req, res) => {
  try {
    const cards = await cardRepository.find({
      relations: { author: true },
    });
    res.json(cards.map(createCardPayload));
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

cardRouter.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const card = await cardRepository.findOne({
      relations: { author: true },
      where: { id: id },
    });
    if (card) {
      res.json(createCardPayload(card));
    } else {
      res.status(400).send({ message: "Card does not exist" });
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

function createCardPayload(card: Card) {
  return {
    id: card.id,
    name: card.name,
    status: card.status,
    content: card.content,
    category: card.category,
    author: card.author.username,
  };
}

cardRouter.post("/", authenticateToken, async (req: any, res) => {
  const user: User = req.user;
  const card = new Card();
  card.name = req.body.name;
  card.status = req.body.status;
  card.content = req.body.content;
  card.category = req.body.category;
  card.author = user;
  try {
    await cardRepository.save(card);
    res.json({ id: card.id });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

cardRouter.put("/:id", authenticateToken, findCard, async (req: any, res) => {
  try {
    const card = req.card;
    card.name = req.body.name;
    card.status = req.body.status;
    card.content = req.body.content;
    card.category = req.body.category;
    await cardRepository.save(card);
    res.send();
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

cardRouter.delete(
  "/:id",
  authenticateToken,
  findCard,
  async (req: any, res) => {
    try {
      const card = req.card;
      await cardRepository.remove(card);
      res.send();
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
);

// middleware

function authenticateToken(req: any, res: Response, next: Function) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.sendStatus(401);
  }
  const jwtSecretKey = process.env.jwtSecretKey;
  jwt.verify(token, jwtSecretKey, async (error: any, username: string) => {
    if (error) {
      console.log(error);
      return res.sendStatus(403);
    }
    const user = await userRepository.findOneBy({ username: username });
    if (user == null) {
      return res.sendStatus(400);
    }
    req.user = user;
    next();
  });
}

async function findCard(req: any, res: Response, next: Function) {
  try {
    const id = parseInt(req.params.id);
    const card = await cardRepository.findOne({
      relations: { author: true },
      where: { id: id },
    });
    if (card) {
      if (card.author.id !== req.user.id) {
        return res.status(400).json({ message: "Can only modify own cards." });
      }
      req.card = card;
      next();
    } else {
      res.status(400).send({ message: "Card does not exist." });
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}
