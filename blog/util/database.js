import Database from "better-sqlite3";
import * as db from "../data/database.sqlite";

const db = new Database();

db.prepare(
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstname TEXT,
    lastname TEXT,
    email TEXT)`
).run();

export const getUsers = () => db.prepare("SELECT * FROM users").all();

export const getUserId = (id) =>
  db.prepare("SELECT * FROM users WHERE id = ?").get(id);

export const saveUser = (firstname, lastname, email) =>
  db
    .prepare("INSERT INIO users (firstname, lastname, email) VALUES (?, ?, ?)")
    .run(firstname, lastname, email);

export const updateUser = (id, firstname, lastname, email) =>
  db
    .prepare(
      "UPDATE users SET firstname = ?, lastname = ?, email = ? WHERE id = ?"
    )
    .run(firstname, lastname, email, id);

export const deleteUser = (id) =>
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
