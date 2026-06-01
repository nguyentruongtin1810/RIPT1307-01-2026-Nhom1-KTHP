const bcrypt = require("bcryptjs");
const { createUser, findUserByEmailOrUsername, getUserById, getUserByEmail, getUserByUsername } = require("../models/userModel");
const { createCandidateProfile, getCandidateByUserId } = require("../models/candidateModel");
const { signToken } = require("../services/jwtService");

function buildTokenResponse(user) {
  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  };
}

async function register(req, res) {
  const { username, email, password, fullName } = req.body;

  if (!username || !email || !password || !fullName) {
    return res.status(400).json({ message: "username, email, password, and fullName are required." });
  }

  const existingEmail = await getUserByEmail(email);
  const existingUsername = await getUserByUsername(username);
  if (existingEmail || existingUsername) {
    return res.status(409).json({ message: "Username or email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await createUser({ username, email, passwordHash, role: "student" });
  await createCandidateProfile({ userId: user.id, fullName });

  return res.status(201).json(buildTokenResponse(user));
}

async function login(req, res) {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ message: "identifier and password are required." });
  }

  const user = await findUserByEmailOrUsername(identifier);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  return res.json(buildTokenResponse(user));
}

async function me(req, res) {
  const user = await getUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  const response = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.created_at
  };

  if (user.role === "student") {
    const candidate = await getCandidateByUserId(user.id);
    response.profile = candidate || null;
  }

  return res.json(response);
}

module.exports = { register, login, me };
