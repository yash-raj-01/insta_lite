
const postsService = require("../services/posts.service");


const create = async (req, res) => {
  const { imageUrl, caption, location } = req.body;

  if (!imageUrl) {
    return res.status(400).json({
      error: "imageUrl is required",
    });
  }

  const data = { imageUrl };

  if (caption !== undefined) {
    data.caption = caption;
  }

  if (location !== undefined) {
    data.location = location;
  }

  try {
    const post = await postsService.createPost(data);
    return res.status(201).json(post);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};



async function list(req, res) {
  const page = req.query.page === undefined
    ? 1
    : Number(req.query.page);

  const requestedLimit = req.query.limit === undefined
    ? 10
    : Number(req.query.limit);

  const sortBy = req.query.sortBy === undefined
    ? "createdAt"
    : req.query.sortBy;

  const order = req.query.order === undefined
    ? "desc"
    : req.query.order;


  if (
    !Number.isInteger(page) ||
    page <= 0 ||
    !Number.isInteger(requestedLimit) ||
    requestedLimit <= 0
  ) {
    return res.status(400).json({
      error: "page and limit must be positive integers",
    });
  }

  const allowedSortFields = ["createdAt", "updatedAt"];

  if (!allowedSortFields.includes(sortBy)) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, updatedAt",
    });
  }

  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({
      error: "order must be asc or desc",
    });
  }

  const limit = Math.min(requestedLimit, 50);

  const result = await postsService.listPosts(
    page,
    limit,
    sortBy,
    order
  );

  return res.status(200).json(result);
}


const getOne = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    const post = await postsService.getPostById(id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const update = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "Post not found" });
  }

  const { caption, location } = req.body;
  const data = {};

  if (caption !== undefined) {
    data.caption = caption;
  }

  if (location !== undefined) {
    data.location = location;
  }

  try {
    const post = await postsService.updatePost(id, data);
    return res.status(200).json(post);
  } catch (error) {

    return res.status(500).json({ error: "Internal server error" });
  }
};


const remove = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "Post not found" });
  }

  try {
    await postsService.deletePost(id);
    return res.status(204).send();
  } catch (error) {
    
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
