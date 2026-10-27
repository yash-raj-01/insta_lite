const prisma = require("../db");

const getLikesByPostId = async (postId) => {
  return await prisma.user.findMany({
    where: {
      likes: {
        some: {
          postId,
        },
      },
    },
    select: {
      id: true,
      username: true,
      fullname: true,
    },
    orderBy: {
      username: "asc",
    },
  });
};

const createLike = async (postId, userId) => {
  return await prisma.like.create({
    data: {
      postId,
      userId,
    },
  });
};

const deleteLike = async (postId, userId) => {
  return await prisma.like.delete({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
  });
};

module.exports = {
  getLikesByPostId,
  createLike,
  deleteLike,
};
