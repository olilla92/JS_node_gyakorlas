import express from "express";
import * as Posts from "../data/post.js";
import * as Users from "../data/user.js";
import { auth } from "./usersRoutes.js";

const router = express.Router();

router.get("/", auth, (req, res) => {
  const posts = Posts.getPosts();
  res.status(200).json(posts);
});

router.get("/:id", (req, res) => {
  const post = Posts.getPostById(+req.params.id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  const user = Users.getUsertById(post.userId);
  const data = {
    postId: post.id,
    title: post.title,
    content: post.content,
    author: user.name,
    contact: user.email,
  };
  res.status(200).json(data);
});

router.post("/", auth, (req, res) => {
  const { title, content } = req.body;
  if (!title || !content)
    return res.status(400).json({ message: "Missing some data!" });
  const saved = Posts.savePost(req.userId, title, content);
  const post = Posts.getPostById(saved.lastInsertRowid);
  res.status(200).json(post);
});

router.patch("/:id", (req, res) => {
  const id = +req.params.id;
  let post = Posts.getPostById(id);
  if (!post) return res.status(404).json({ message: "Post not found!" });
  const { title, content } = req.body;
  Posts.updatePost(id, title || post.title, content || post.content);
  post = Posts.getPostById(id);
  const now = new Date(Date.now()); //jelenlegi időpont
  const data = {
    ...post,
    updated: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`, //idő frissítése, aktuális
  };
  res.status(200).json(data);
});

router.delete("/:id", (req, res) => {
  const id = +req.params.id;
  const post = Posts.getPostById(id);
  if (!post) return res.status(404).json({ message: "Post not found" });
  Posts.deletePost(id);
  res.sendStatus(204);
});

export default router;
