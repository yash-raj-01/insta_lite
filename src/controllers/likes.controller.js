const likesService = require("../services/likes.service");
const postsService = require("../services/posts.service");
const usersService = require("../services/users.service");

const getLikes = async (req, res) => {
  const postId = Number(req.params.id);

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const post = await postsService.getPostById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const likes = await likesService.getLikesByPostId(postId);
    return res.status(200).json(likes);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const createLike = async (req, res) => {
  const { userId } = req.body;

  if (userId === undefined || userId === null || userId === "") {
    return res.status(400).json({ error: "userId is required" });
  }

  const postId = Number(req.params.id);

  if (!Number.isInteger(postId) || postId <= 0) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const post = await postsService.getPostById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const numericUserId = Number(userId);
    if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = await usersService.getUserById(numericUserId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const like = await likesService.createLike(postId, numericUserId);
    return res.status(201).json(like);
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Already liked" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteLike = async (req, res) => {
  const postId = Number(req.params.id);
  const userId = Number(req.params.userId);

  if (
    !Number.isInteger(postId) ||
    postId <= 0 ||
    !Number.isInteger(userId) ||
    userId <= 0
  ) {
    return res.status(404).json({ error: "Like not found" });
  }

  try {
    await likesService.deleteLike(postId, userId);
    return res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Like not found" });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getLikes,
  createLike,
  deleteLike,
};
