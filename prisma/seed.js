const prisma = require("../src/db");
const { users, posts, likes } = require("./seed-data");

async function main() {
  // 1. Delete all rows: children first
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create all users in one query, returning created rows
  const createdUsers = await prisma.user.createManyAndReturn({
    data: users.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt),
    })),
  });

  // 3. Build username -> id lookup
  const userMap = new Map(createdUsers.map((u) => [u.username, u.id]));

  // 4. Create all posts in one query, returning created rows
  const createdPosts = await prisma.post.createManyAndReturn({
    data: posts.map((post) => {
      const { author, ...rest } = post;
      return {
        ...rest,
        createdAt: new Date(post.createdAt),
        authorId: userMap.get(author),
      };
    }),
  });

  // 5. Build insta## -> post id lookup
  const postMap = new Map(
    createdPosts.map((p) => [p.imageUrl.split("/")[4], p.id])
  );

  // 6. Create all likes in one query
  const createdLikes = await prisma.like.createManyAndReturn({
    data: likes.map((like) => ({
      userId: userMap.get(like.user),
      postId: postMap.get(like.post),
    })),
  });

  // 7. Print summary
  console.log(
    `🌱 Seeded ${createdUsers.length} users, ${createdPosts.length} posts and ${createdLikes.length} likes`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
