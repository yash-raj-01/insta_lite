
const express = require("express");
const prisma = require("./db");

const app = express();


app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/users", async (req, res) => {
  const { username, email, fullname, bio } = req.body;

  if (!username || !email || !fullname) {
    return res.status(400).json({
      error: "username, email and fullname are required",
    });
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "username or email already taken",
      });
    }

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        fullname,
        ...(bio !== undefined && { bio }),
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/users/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});


app.patch("/users/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: "User not found",
      });
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

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: data,
    });

    return res.status(200).json(updatedUser);
  } catch (error) {


    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

app.delete("/users/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({
      error: "User not found",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    await prisma.user.delete({
      where: { id: id },
    });

    return res.status(204).send();
  } catch (error) {

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});






module.exports = app;
