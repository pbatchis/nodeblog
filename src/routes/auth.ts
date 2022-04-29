require("dotenv").config();
import * as express from "express";
import * as bcrypt from "bcrypt";
const jwt = require("jsonwebtoken");
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";

export const authRouter = express.Router();

const userRepository = AppDataSource.getRepository(User);

authRouter.post("/register", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Validate
  if (!username) {
    return res.status(400).json({ message: "Username cannot be blank." });
  }
  if (!password) {
    return res.status(400).json({ message: "Password cannot be blank." });
  }
  const existingUser = await userRepository.findOneBy({ username: username });
  if (existingUser != null) {
    return res.status(400).json({ message: "Username already taken." });
  }

  // Create new user account
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User();
  user.username = username;
  user.password = hashedPassword;
  try {
    const savedUser = await userRepository.save(user);
    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error." });
  }
});

authRouter.post("/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const user = await userRepository.findOneBy({ username: username });
  try {
    if (user && (await bcrypt.compare(password, user.password))) {
      const accessToken = jwt.sign(username, process.env.jwtSecretKey);
      res.json({ accessToken: accessToken });
    } else {
      res.status(400).send({ message: "Access denied." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error." });
  }
});
