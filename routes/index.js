// var express = require('express');
// var router = express.Router();
// const userModel=require('./users');
// const passport=require('passport');
// const upload=require('./multer');
// const postModel=require('./post');
// const mongoose=require('mongoose');

// const localStrategy=require('passport-local');
// passport.use(new localStrategy(userModel.authenticate()));


// /* GET home page. */
// router.get('/', function(req, res, next) {
//   const loginError = req.flash('loginError');
//   res.render('index', {nav: false, loginError});
  
// });
// router.get('/register', function(req, res, next) {
  
//   res.render('register',{nav: false, error: req.flash('error')});
  
// });



// router.get('/profile', isLoggedIn, async function(req, res, next){
//   const user=await userModel.findOne({username: req.session.passport.user}).populate("posts");
//   const user2=await userModel.findByUsername(req.params.username).populate('posts');
//   res.render('profile', {user,user2, nav: true, Your: "Your"});
// })

// router.get('/add', isLoggedIn, async function(req, res, next){
//   const user=await userModel.findOne({username: req.session.passport.user})
//   res.render('add', {user, nav: true});
// })

// router.get('/saved', isLoggedIn,async function(req, res){
//   const user=await userModel.findOne({username: req.session.passport.user}).populate('saved');
//   res.render('save', {user, nav: true});
// })

// router.delete('/account', isLoggedIn, async (req, res, next) => {
//   try {
//     // 1. Delete user’s posts, then user itself
//     await postModel.deleteMany({ user: req.user._id });
//     await userModel.findByIdAndDelete(req.user._id);

//     // 2. Log the user out *with a callback*
//     req.logout(err => {
//       if (err) return next(err);        // <‑‑ handle possible errors

//       // 3. Destroy the session explicitly (good hygiene)
//       req.session.destroy(err2 => {
//         if (err2) return next(err2);
//         res.redirect('/');       // or res.sendStatus(204) for APIs
//       });
//     });
//   } catch (err) {
//     next(err);
//   }
// });


// // router.get('/saved/:id', isLoggedIn, async function(req, res, next){
// //   const postID=req.params.id;
// //   const user=await userModel.findOne({username: req.params.username});
// //   const user2=await userModel.findOne({username: req.session.passport.username}).populate('saved');
// //   console.log(postID)
// //   res.redirect(req.get('Referer'));
// // });


// router.get('/saved/:id', isLoggedIn, async (req, res, next) => {
//   try {
         
//    await userModel.findByIdAndUpdate(
//       req.user._id,                     // current user (Passport already deserialised it)
//       { $addToSet: { saved: req.params.id } }, // add only if missing
//       { new: true }                     // optional: returns the updated doc
//     );

//     res.redirect('back');
//   } catch (err) {
//     next(err);
//   }
// });

// router.get('/show/:username/posts', isLoggedIn, async function(req, res, next){
//   const user=await userModel.findOne({username: req.params.username}).populate("posts");
  
//   res.render('show', {user, nav: true});
// })

// router.get('/show/:username/posts/:id', isLoggedIn, async function(req, res, next){
//   const user=await userModel.findOne({username: req.params.username}).populate("posts");
//   const postID=req.params.id;
//   const post=await postModel.findById(postID).populate("user");
  
 
//   res.render('post', {user,post, postID, nav: true});
// })



// router.delete('/posts/:id', isLoggedIn, async (req, res, next) => {
//   try {
//     const post = await postModel.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id        // ensure only owner can delete
//     });
//     const user=await userModel.findOne()

//     if (!post) return res.status(404).send('Post not found');

//     await userModel.updateOne(
//       { _id: req.user._id },
//       { $pull: { posts: post._id, saved: post._id} }   // 👈  MongoDB $pull operator
//     ); 

//     postID=post._id;

//     const session = await mongoose.startSession();
//     await session.withTransaction(async () => {
//       await postModel.findByIdAndDelete(postID, { session });

//       // Remove postId from the saved list of *every* user who has it
//       await userModel.updateMany(
//         { saved: postID },
//         { $pull: { saved: postID } },
//         { session }
//       );
//     });
//     session.endSession();

//     res.redirect('/profile');   // wherever you list posts
//   } catch (err) {
//     next(err);
//   }
// });

// router.delete('/saved/:id', isLoggedIn, async (req, res, next) => {
//   try {
    
    

//     const userId = req.user._id;          // user you’re logged in as
//     const postId = req.params.id;   // only if saved holds ObjectIds
// ; 
    
   
//     await userModel.updateOne(
//       { _id: userId },                    // find the correct user
//       { $pull: { saved: postId } }        // remove that post’s ID
//     );


    

//     res.redirect('back');   // wherever you list posts
//   } catch (err) {
//     next(err);
//   }
// });






// router.post('/fileupload', isLoggedIn, upload.single("image"), async (req, res)=>{

//   const user=await userModel.findOne({username: req.session.passport.user});
//   user.profileImage=req.file.path;
 
//   await user.save();
//   res.redirect('/profile');
 
  
// })

// router.post('/createpost', isLoggedIn, upload.single("postimage"), async (req, res)=>{

//   const user=await userModel.findOne({username: req.session.passport.user})
//   const post=await postModel.create({
//     user: user._id,
//     title: req.body.title,
//     description: req.body.description,
//     image: req.file.path
//   });

//   user.posts.push(post._id);
//   await user.save();
//   res.redirect("/profile");
  
// })

// router.get('/feed', isLoggedIn, async (req, res)=>{

//   const user=await userModel.findOne({username: req.session.passport.user})
//   const posts=await postModel.find().populate("user").populate('user');

//   res.render('feed', {user, posts, nav: true});
// })

// router.get('/feed/post/:id', isLoggedIn, async function(req, res, next) {
//   const postId = req.params.id;

//   if (!mongoose.Types.ObjectId.isValid(postId)) {
//     return res.status(400).send("Invalid post ID");
//   }

//   try {
//     const user = await userModel.findOne({ username: req.session.passport.user });
//     const post = await postModel.findById(postId).populate("user");

//     if (!user || !post) {
//       return res.status(404).send("User or Post not found");
//     }
    
//     res.render('post', { user, post, nav: true });
//   } catch (err) {
//     next(err);
//   }
// });

// router.get('/post/:id', isLoggedIn, async function(req, res, next) {
//   const postId = req.params.id;

//   if (!mongoose.Types.ObjectId.isValid(postId)) {
//     return res.status(400).send("Invalid post ID");
//   }

//   try {
//     const user = await userModel.findOne({ username: req.session.passport.user }).populate("posts");
//     // const post = await postModel.findById(postId).populate("user");

//     if (!user || !post) {
//       return res.status(404).send("User or Post not found");
//     }
    
//     res.render('post', { user, nav: true });
//   } catch (err) {
//     next(err);
//   }
// });

// router.get('/profile/:username', async function(req, res){
//   const name = req.params.username;
//   const name2 = req.session.passport.user;
 
//   const user=await userModel.findByUsername(name).populate("posts");
//   const user2=await userModel.findByUsername(name2).populate("posts");

//   res.render('profile', {user,user2, nav:true, Your: ""});
// })



// // router.post('/register', function(req, res, next, err){
// //   try{
// //     const userdata=new userModel({
// //     username: req.body.username,
// //     email: req.body.email,
// //     contact: req.body.contact,
// //     name: req.body.fullname
// //   })

// //   userModel.register(userdata, req.body.password)
// //     .then(function(){
// //       passport.authenticate('local')(req, res, function(){
// //         res.redirect('/profile');
// //       })
// //     })
// //   }catch(err){
           
// //      res.redirect('/register', {error: req.flash('error')});            
    
   
// //     return next(err);
// //   }
// // });
// router.post('/register', async (req, res, next) => {
//   try {
//     const { username, email, contact, fullname, password } = req.body;

//     const user = new userModel({
//       username,
//       email,
//       contact,
//       name: fullname,
//     });

//     await userModel.register(user, password);   // may throw UserExistsError

//     // log the user in immediately
//     req.login(user, err => (err ? next(err) : res.redirect('/profile')));
//   } catch (err) {
//     if (err.code === 11000 && err.keyPattern?.email) {
//       req.flash('error', 'Email is already registered');
//     }else{
//       req.flash('error', err.message);          // e.g. “Username already exists”
//              // flash survives the redirect
    
     
//     }   
//     return res.status(400).render('register', { nav:false, error: req.flash('error') });  
//     return next(err);                     // any other error → default handler
//   }
// });


// router.post('/login', passport.authenticate('local',{
//   successRedirect: '/profile',
//   failureRedirect: '/',
//   failureFlash: { type: 'loginError', message: 'Invalid username or password' },
  
// }), function(req, res) { });

// router.get('/logout', function(req, res){
//   req.logout(function(err){
//      if(err) {return next(err);}
//      res.redirect('/');
//   })
// });

// function isLoggedIn(req, res, next){
//   if(req.isAuthenticated()) return next();
//   res.redirect('/');
// }



// module.exports = router;

// apiRouter.js – REST‑style rewrite of your previous EJS routes
// -------------------------------------------------------------
// Assumptions:
//   • You still have userModel and postModel Mongoose schemas (User, Post)
//   • Passwords are hashed via passport‑local‑mongoose *or* a manual bcrypt hook
//   • Multer config lives in ./multer (single‑file uploads -> req.file)
//   • JWT_SECRET is set in your environment variables
//   • app.js mounts this router under "/api/v1" (e.g., /api/v1/auth/login)

const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const upload = require('./multer');

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
router.delete('/users/me', verifyToken, async (req, res, next) => {
  try {
    // Remove all user posts first
    await postModel.deleteMany({ user: req.user.id });
    await userModel.findByIdAndDelete(req.user.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// GET /users/:username – public profile (posts only)
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
router.get('/posts', verifyToken, async (req, res, next) => {
  try {
    const posts = await postModel.find().populate('user');
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// POST /posts – create a post (multipart/form‑data with key "image")
router.post('/posts', verifyToken, upload.single('image'), async (req, res, next) => {
  try {
    const post = await postModel.create({
      user: req.user.id,
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
router.delete('/posts/:id', verifyToken, async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).json({ message: 'Invalid post ID' });
  try {
    const post = await postModel.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found or not yours' });

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
router.delete('/posts/:id/save', verifyToken, async (req, res, next) => {
  try {
    await userModel.updateOne(
      { _id: req.user.id },
      { $pull: { saved: req.params.id } }
    );
    res.status(200).json({ message: 'Post unsaved' });
  } catch (err) {
    next(err);
  }
});

//------------------------------------------------------------------
// Global error handler (should be last in your app.js, not here)
//------------------------------------------------------------------
// app.use((err, req, res, next) => { ... });

module.exports = router;
