import { Router } from "express";
import * as Users from "../data/user.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

// router.get("/", (req, res) => {
//   res.send("USERS");
// });

router.get("/", auth, (req, res) => {
  const users = Users.getUsers();
  res.status(200).json(users);
});

router.get("/:id", auth, (req, res) => {
  const user = Users.getUsertById(+req.params.id);
  if (!user) return res.status(404).json({ message: "User not fount!" });
  res.status(200).json(user);
});

router.get("/me", auth, (req, res) => {
  const user = Users.getUsertById(+req.userId);
  if (!user) return res.status(404).json({ message: "User not fount!" });
  res.status(200).json(user);
});

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Missing some data" });

  const salt = bcrypt.genSaltSync(12);
  const hashedPassword = bcrypt.hashSync(password, salt);
  const saved = Users.saveUser(name, email, hashedPassword);
  const user = Users.getUsertById(saved.lastInsertRowid);
  res.status(201).json(user);
});

router.put("/:id", auth, (req, res) => {
  const id = +req.params.id;
  let user = Users.getUsertById(id);
  if (!user) return res.status(404).json({ message: "User not fount!" });
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "Missing some data" });
  const salt = bcrypt.genSaltSync(12);
  const hashedPassword = bcrypt.hashSync(password, salt);
  Users.updateUser(id, name, email, hashedPassword);
  user = Users.getUsertById(id);
  res.status(200).json(user);
});

router.patch("/:id", auth, (req, res) => {
  const id = +req.params.id;
  let user = Users.getUsertById(id);
  if (!user) return res.status(404).json({ message: "User not fount!" });
  const { name, email, password } = req.body;
  let hashedPassword;
  if (password) {
    const salt = bcrypt.genSaltSync(12);
    hashedPassword = bcrypt.hashSync(password, salt);
  }
  Users.updateUser(
    id,
    name || user.name,
    email || user.email,
    hashedPassword || user.password
  );
  user = Users.getUsertById(id);
  res.status(200).json(user);
});

router.delete("/:id", auth, (req, res) => {
  const user = Users.getUsertById(+req.params.id);
  if (!user) return res.status(404).json({ message: "User not fount!" });
  Users.deleteUser(+req.params.id);
  delete req.userId;
  delete req.headers.authorization
  res.status(200).json({ message: "Delete successful!" });
});

//tokennel:   npm i jsonwebtoken  telemítése
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(401).json({ message: "Invalid credentials! 1" });
  
  const user = Users.getUserByEmail(email);
  console.log(user)
  if (!user) return res.status(401).json({ message: "Invalid credentials! 2" });
  // if (!bcrypt.compareSync(password, user.password))
  //   return res.status(401).json({ message: "Invalid credentials!" });
  req.userId = user.id;
  const token = jwt.sign({ id: user.id, email: user.email }, "secret_key", {
    expiresIn: "30m",
  });
  res.status(200).json(token);
});

//autentikáció, loginhoz hasonlít leginkább, | auth | -> autentikáció szükséges az adatok megtekintéséhez
export function auth(req, res, next) {
  console.log("In auth");
  const accessToken = req.headers.authorization;
  if (!accessToken) return res.status(401).json({ message: "Unauthorized" });
  const token = accessToken.split(" ")[1];
  const data = jwt.verify(token, "secret_key");
  const now = Math.floor(Date.now() / 1000);
  if (data?.exp < now)
    return res.status(403).json({ message: "Token expired" });
  console.log(data.id);
  req.userId = data.id; //userId lementése
  next();
}

export default router;
