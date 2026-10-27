
const usersService = require("../services/users.service");


const create = async (req, res) => {
  const { username, email, fullname, bio } = req.body;

  if (!username || !email || !fullname) {
    return res.status(400).json({
      error: "username, email and fullname are required",
    });
  }

  const data = { username, email, fullname };

  if (bio !== undefined) {
    data.bio = bio;
  }

  try {
    const user = await usersService.createUser(data);

    return res.status(201).json(user);
  } catch (error) {
    
    return res.status(500).json({ error: "Internal server error" });
  }
};



const postsService = require("../services/posts.service");
const { parsePagination } = require("../utils/pagination");

async function list(req, res) {
  const pagination = parsePagination(req.query);

  if (pagination.error) {
    return res.status(400).json({
      error: pagination.error,
    });
  }

  const { page, limit } = pagination;

  const sortBy =
    req.query.sortBy === undefined ? "createdAt" : req.query.sortBy;

  const order = req.query.order === undefined ? "desc" : req.query.order;

  const isPrivate = req.query.isPrivate;
  const hasPosts = req.query.hasPosts;
  const search = req.query.search;


  const allowedSortFields = ["createdAt", "username", "fullname"];

  if (!allowedSortFields.includes(sortBy)) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, username, fullname",
    });
  }


  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({
      error: "order must be asc or desc",
    });
  }

  if (
    isPrivate !== undefined &&
    isPrivate !== "true" &&
    isPrivate !== "false"
  ) {
    return res.status(400).json({
      error: "isPrivate must be true or false",
    });
  }

  if (
    hasPosts !== undefined &&
    hasPosts !== "true" &&
    hasPosts !== "false"
  ) {
    return res.status(400).json({
      error: "hasPosts must be true or false",
    });
  }

  const limit = Math.min(requestedLimit, 50);

  const filters = {};

  if (isPrivate !== undefined) {
    filters.isPrivate = isPrivate === "true";
  }

  if (hasPosts !== undefined) {
    filters.posts = hasPosts === "true" ? { some: {} } : { none: {} };
  }

  if (search !== undefined) {
    filters.OR = [
      {
        username: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        fullname: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const result = await usersService.listUsers(
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
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const user = await usersService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const update = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "User not found" });
  }

  const { fullname, bio, isPrivate } = req.body;
  const data = {};

  if (fullname !== undefined) {
    data.fullname = fullname;
  }

  if (bio !== undefined) {
    data.bio = bio;
  }

  if (isPrivate !== undefined) {
    data.isPrivate = isPrivate;
  }

  try {
    const user = await usersService.updateUser(id, data);

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const remove = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    await usersService.deleteUser(id);

    return res.status(204).send();
  } catch (error) {
    
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getUserPosts = async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(404).json({ error: "User not found" });
  }

  const pagination = parsePagination(req.query);

  if (pagination.error) {
    return res.status(400).json({
      error: pagination.error,
    });
  }

  const { page, limit } = pagination;

  try {
    const user = await usersService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await postsService.listPostsByAuthor(userId, page, limit);
    return res.status(200).json(result);
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
  getUserPosts,
};
