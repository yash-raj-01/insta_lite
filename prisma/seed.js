
const prisma = require("../src/db");
const { users, posts } = require("./seed-data");

async function main() {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const createdUsers = await prisma.user.createMany({
  data: users.map((user) => ({
    ...user,
    createdAt: new Date(user.createdAt),
  })),
});

const allUsers = await prisma.user.findMany({
  select: { id: true },
});

const createdPosts = await prisma.post.createMany({
  data: posts.map((post, index) => ({
    ...post,
    createdAt: new Date(post.createdAt),
    userId: allUsers[index % allUsers.length].id,
  })),
});
console.log(
    `🌱 Seeded ${createdUsers.count} users and ${createdPosts.count} posts`
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
