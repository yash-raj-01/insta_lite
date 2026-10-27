
const postsService = require("../services/posts.service");


const usersService = require("../services/users.service");

const create = async (req, res) => {
  const { imageUrl, authorId, caption, location } = req.body;

  if (
    !imageUrl ||
    authorId === undefined ||
    authorId === null ||
    authorId === ""
  ) {
    return res.status(400).json({
      error: "imageUrl and authorId are required",
    });
  }

  const numericAuthorId = Number(authorId);
  if (!Number.isInteger(numericAuthorId) || numericAuthorId <= 0) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  try {
    const user = await usersService.getUserById(numericAuthorId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const data = {
      imageUrl,
      authorId: numericAuthorId,
    };

    if (caption !== undefined) {
      data.caption = caption;
    }

    if (location !== undefined) {
      data.location = location;
    }

    const post = await postsService.createPost(data);
    return res.status(201).json(post);
  } catch (error) {
    if (error.code === "P2003") {
      return res.status(404).json({
        error: "User not found",
      });
    }
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

  const location = req.query.location;
  const search = req.query.search;
  const from = req.query.from;
  const to = req.query.to;

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

  function isValidDate(value) {
    if (value === undefined) {
      return true;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }

  if (!isValidDate(from) || !isValidDate(to)) {
    return res.status(400).json({
      error: "from and to must be valid dates",
    });
  }

  const limit = Math.min(requestedLimit, 50);

  const filters = {};


  if (location !== undefined) {
    filters.location = {
      equals: location,
      mode: "insensitive",
    };
  }

  if (search !== undefined) {
    filters.caption = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (from !== undefined || to !== undefined) {
    filters.createdAt = {};

    if (from !== undefined) {
      filters.createdAt.gte = new Date(`${from}T00:00:00.000Z`);
    }

    if (to !== undefined) {
      filters.createdAt.lt = new Date(`${to}T00:00:00.000Z`);
    }
  }

  const result = await postsService.listPosts(
    page,
    limit,
    sortBy,
    order,
    filters
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
