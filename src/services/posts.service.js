
const prisma = require("../db");

const createPost = async (data) => {
  return await prisma.post.create({
    data,
  });
};



async function listPosts(page, limit, sortBy, order, filters = {}) {
  const skip = (page - 1) * limit;

  let orderBy;
  if (sortBy === "likes") {
    orderBy = [
      { likes: { _count: order } },
      { createdAt: "desc" },
    ];
  } else {
    orderBy = {
      [sortBy]: order,
    };
  }

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where: filters,
      skip: skip,
      take: limit,
      orderBy: orderBy,
      include: {
        author: {
          select: userSummarySelect,
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    }),

    prisma.post.count({
      where: filters,
    }),
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



const userSummarySelect = {
  id: true,
  username: true,
  fullname: true,
};

const getPostById = async (id) => {
  return await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: userSummarySelect,
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
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
