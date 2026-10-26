
const prisma = require("../db");

const createUser = async (data) => {
  const user = await prisma.user.create({
    data,
  });

  return user;
};

const listUsers = async () => {
  const users = await prisma.user.findMany();

  return users;
};

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
