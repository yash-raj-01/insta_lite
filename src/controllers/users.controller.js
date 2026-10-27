
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

  const isPrivate = req.query.isPrivate;
  const search = req.query.search;

  // Validate pagination
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

  // Validate sorting field
  const allowedSortFields = ["createdAt", "username", "fullname"];

  if (!allowedSortFields.includes(sortBy)) {
    return res.status(400).json({
      error: "sortBy must be one of: createdAt, username, fullname",
    });
  }

  // Validate sorting order
  if (order !== "asc" && order !== "desc") {
    return res.status(400).json({
      error: "order must be asc or desc",
    });
  }

  // Validate isPrivate
  if (
    isPrivate !== undefined &&
    isPrivate !== "true" &&
    isPrivate !== "false"
  ) {
    return res.status(400).json({
      error: "isPrivate must be true or false",
    });
  }

  const limit = Math.min(requestedLimit, 50);

  const filters = {};

  if (isPrivate !== undefined) {
    filters.isPrivate = isPrivate === "true";
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

module.exports = {
  create,
  list,
  getOne,
  update,
  remove,
};
