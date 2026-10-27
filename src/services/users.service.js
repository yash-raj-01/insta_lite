
const prisma = require("../db");

const createUser = async (data) => {
  const user = await prisma.user.create({
    data,
  });

  return user;
};

async function listUsers(page, limit) {
  const skip = (page - 1) * limit;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.user.count(),
  ]);

  return {
    data: users,
    meta: {
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user;
};

const updateUser = async (id, data) => {
  const user = await prisma.user.update({
    where: { id },
    data,
  });

  return user;
};

const deleteUser = async (id) => {
  const user = await prisma.user.delete({
    where: { id },
  });

  return user;
};

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
};
