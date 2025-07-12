const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const upload = require('./multer');
const cloudinary = require('./cloudinary');

const userModel = require('./users');
const postModel = require('./post');

const router = express.Router();

//------------------------------------------------------------------
// Utility helpers
//------------------------------------------------------------------



/** Sign + return a JWT that expires in 7 days */
function generateToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/** Express middleware to protect routes (expects "Authorization: Bearer <token>") */
function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

//------------------------------------------------------------------
// Auth Routes
//------------------------------------------------------------------

// POST /auth/register
/* ------------------------------------------------------------------------- */
/*  Auth                                                                  */
/* ------------------------------------------------------------------------- */
/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Registration & login
 *   - name: Users
 *     description: Profile & account management
 *   - name: Posts
 *     description: Create, read, delete, save & unsave posts
 * servers:
 *   - url: http://localhost:8080
 *     description: Local development server
 *   - url: https://my-picsharer-api.onrender.com
 *     description: Production server
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, fullname]
 *             properties:
 *               username:  { type: string, example: samrat }
 *               email:     { type: string, format: email, example: samrat@example.com }
 *               password:  { type: string, minLength: 6, example: pass1234 }
 *               contact:   { type: string, example: "9999999999" }
 *               fullname:  { type: string, example: "Samrat Ghosh" }
 *     responses:
 *       201:
 *         description: User created + JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user:  { $ref: '#/components/schemas/User' }
 */
router.post('/auth/register', async (req, res, next) => {
  try {
    const { username, email, contact, fullname, password } = req.body;

    // Check duplicate email
    const exists = await userModel.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = new userModel({ username, email, contact, name: fullname });

    // If you use passport‑local‑mongoose, replace the next two lines with userModel.register()
    user.password = await bcrypt.hash(password, 10);
    await user.save();

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, username } });
  } catch (err) {
    next(err);
  }
});

// POST /auth/login
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string, example: samrat }
 *               password: { type: string, example: pass1234 }
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 */
router.post('/auth/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ token: generateToken(user) });
  } catch (err) {
    next(err);
  }
});

//------------------------------------------------------------------
// User Routes (needs auth)
//------------------------------------------------------------------

// GET /users/me  – view own profile (with posts + saved)
/* ------------------------------------------------------------------------- */
/*  Users                                                                 */
/* ------------------------------------------------------------------------- */
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Profile & account management
 */

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get your own profile (posts & saved)
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: The current user's data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/users/me', verifyToken, async (req, res, next) => {
  try {
    const user = await userModel
      .findById(req.user.id)
      .populate('posts')
      .populate({ path: 'saved', populate: 'user' });

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// DELETE /users/me  – delete account + posts
/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete your account (and all your posts)
 *     tags: [Users]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       204:
 *         description: Account deleted successfully
 */
router.delete('/users/me', verifyToken, async (req, res, next) => {
  try {
    // 1. 🔍 Get all the user's posts
    const userPosts = await postModel.find({ user: req.user.id });

    // 2. 🧹 Delete each post's image from Cloudinary
    const deletePromises = userPosts
      .filter(post => post.publicId)
      .map(post => cloudinary.uploader.destroy(post.publicId));

    await Promise.all(deletePromises);
    // Remove all user posts first
    await postModel.deleteMany({ user: req.user.id });
    await userModel.findByIdAndDelete(req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /users/:username – public profile (posts only)
/**
 * @swagger
 * /users/{username}:
 *   get:
 *     summary: Public profile by username
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/users/:username', async (req, res, next) => {
  try {
    const user = await userModel
      .findOne({ username: req.params.username })
      .populate('posts');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

//------------------------------------------------------------------
// Post Routes (needs auth)
//------------------------------------------------------------------

// GET /posts – global feed (populated)
/* ------------------------------------------------------------------------- */
/*  Posts                                                                 */
/* ------------------------------------------------------------------------- */
/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Create, read, delete, save & unsave posts
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get the global feed
 *     tags: [Posts]
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200:
 *         description: List of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Post' }
 */
router.get('/posts', verifyToken, async (req, res, next) => {
  try {
    const posts = await postModel.find().populate('user');
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// POST /posts – create a post (multipart/form‑data with key "image")
/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post (multipart/form‑data)
 *     tags: [Posts]
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, description, image]
 *             properties:
 *               title:       { type: string, example: "My first post" }
 *               description: { type: string, example: "Hello world!" }
 *               image:       { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Post created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 */
router.post('/posts', verifyToken, upload.single('image'), async (req, res, next) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const post = await postModel.create({
      user: req.user.id,
      publicId: result.public_id,
      title: req.body.title,
      description: req.body.description,
      image: req.file?.path,
    });

    // Push to user's posts array
    await userModel.updateOne({ _id: req.user.id }, { $push: { posts: post._id } });

    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

// GET /posts/:id – single post
/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
router.get('/posts/:id', verifyToken, async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: 'Invalid post ID' });
  try {
    const post = await postModel.findById(req.params.id).populate('user');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// DELETE /posts/:id – owner can delete
/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete your own post
 *     tags: [Posts]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Post deleted
 *       404:
 *         description: Post not found or not yours
 */
router.delete('/posts/:id', verifyToken, async (req, res, next) => {
    console.log('DELETE attempt → post:', req.params.id, 'user:', req.user.id);
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: 'Invalid post ID' });
  try {
    const post = await postModel.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found or not yours' });

    if (post.publicId) {
      await cloudinary.uploader.destroy(post.publicId);
    }

    // Remove from owner.posts and every user's saved array
    await userModel.updateOne({ _id: req.user.id }, { $pull: { posts: post._id, saved: post._id } });
    await userModel.updateMany({ saved: post._id }, { $pull: { saved: post._id } });
    
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

//------------------------------------------------------------------
// Save / Unsave routes
//------------------------------------------------------------------

// POST /posts/:id/save – save a post
/* ------------------------------------------------------------------------- */
/*  Save / Unsave                                                         */
/* ------------------------------------------------------------------------- */
/**
 * @swagger
 * /posts/{id}/save:
 *   post:
 *     summary: Save a post to your collection
 *     tags: [Posts]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post saved
 */
router.post('/posts/:id/save', verifyToken, async (req, res, next) => {
  try {
    await userModel.updateOne(
      { _id: req.user.id },
      { $addToSet: { saved: req.params.id } }
    );
    res.status(200).json({ message: 'Post saved' });
  } catch (err) {
    next(err);
  }
});

// DELETE /posts/:id/save – remove from saved list
// DELETE /api/v1/posts/:id/unsave
/**
 * @swagger
 * /posts/{id}/unsave:
 *   delete:
 *     summary: Remove a post from your saved list
 *     tags: [Posts]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Post unsaved
 */
router.delete('/posts/:id/unsave', verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    await userModel.findByIdAndUpdate(userId, {
      $pull: { saved: postId }
    });

    res.status(200).json({ message: 'Post unsaved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to unsave post', error: err.message });
  }
});
//PUT /users/me/avatar – set an avatar
/**
 * @swagger
 * /users/me/avatar:
 *   put:
 *     summary: Upload or update the user's display picture (DP)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: The image file to upload as profile picture
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Avatar updated
 *                 avatarUrl:
 *                   type: string
 *                   format: uri
 *                   example: https://res.cloudinary.com/demo/image/upload/v1621234567/avatar.jpg
 *       400:
 *         description: No image provided
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/users/me/avatar', verifyToken, upload.single('avatar'), async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!req.file) return res.status(400).json({ message: 'No image provided' });

    // Delete old avatar from Cloudinary
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    // Upload new avatar to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'avatars'
    });

    user.avatarUrl = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    res.status(200).json({
      message: 'Avatar updated',
      avatarUrl: user.avatarUrl
    });
  } catch (err) {
    next(err);
  }
});




router.get('/ping', (req, res) => {
  res.send('pong');
});

module.exports = router;
