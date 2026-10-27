
const prisma = require("../db");

const createPost = async (data) => {
  return await prisma.post.create({
    data,
  });
};


async function listPosts(page, limit, sortBy, order) {
  const skip = (page - 1) * limit;

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      skip: skip,
      take: limit,
      orderBy: {
        [sortBy]: order,
      },
    }),

    prisma.post.count(),
  ]);

  return {
    data: posts,
    meta: {
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    },
  };
}


const getPostById = async (id) => {
  return await prisma.post.findUnique({
    where: { id },
  });
};

const updatePost = async (id, data) => {
  return await prisma.post.update({
    where: { id },
    data,
  });
};

const deletePost = async (id) => {
  return await prisma.post.delete({
    where: { id },
  });
};

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
