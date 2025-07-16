# 📸 PicSharer API

A feature-rich RESTful backend API for a photo-sharing platform. Built with Express, MongoDB, Cloudinary, and JWT authentication.

---

## 🚀 Features

- 🔐 User Registration & Login with JWT
- 📄 Swagger API Documentation
- 🧑‍💼 View / Update Profile & Avatar
- 📷 Upload / Delete Posts with Images (Cloudinary)
- 💾 Save / Unsave Posts
- ⚙️ Protected Routes using JWT
- ☁️ Cloudinary Image Handling
- 📤 File Upload via Multer
- 📍 Deployed on Render

---

## 🧰 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JSON Web Token (JWT)
- **File Upload:** Multer + Cloudinary
- **API Docs:** Swagger (OpenAPI 3.0)
- **Deployment:** Render

---

## 🌐 Live URLs

| Environment | URL |
|-------------|-----|
| API Docs    | [`/api-docs`](https://my-picsharer-api.onrender.com/api-docs) |
| Base API    | [`https://my-picsharer-api.onrender.com`](https://my-picsharer-api.onrender.com) |

---

## Installation

```bash
git clone https://github.com/samrat-ghosh-007/my-picsharer-api.git
cd picsharer-api
npm install
```

## 🔑 Environment Variables

Create a `.env` file in the root directory with the following:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/picsharer
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🏁 Run the Server

```bash
node server.js
```
The server will start at `http://localhost:8080`

## 🧪 Test the API

Use Postman or Swagger UI to explore:
 **Swagger UI:** http://localhost:8080/api-docs

 ---

 ## 📚 API Endpoints Overview

### 📌 Auth

| Method | Endpoint                                     | Description                        |
|--------|----------------------------------------------|------------------------------------|
| POST   | `/api/v1/auth/register`                      | Register User                      |
| POST   | `/api/v1/auth/login`                         | Login & get JWT                    |

### 👤 Users

| Method | Endpoint                                     | Description                        |
|--------|----------------------------------------------|------------------------------------|
| GET    | `/api/v1/users/me`                           | Get own profile (with posts)       |
| DELETE | `/api/v1/users/me`                           | Delete account + posts             |
| PUT    | `/api/v1/users/me/avatar`                    | Update profile picture             |
| GET    | `/api/v1/users/:username`                    | Get public user profile            |

## 🖼️ Posts

| Method | Endpoint                                     | Description                        |
|--------|----------------------------------------------|------------------------------------|
| GET    | `/api/v1/posts`                              | Get all posts (global feed)        |
| POST   | `/api/v1/posts`                              | Create post (image upload)         |
| GET    | `/api/v1/posts/:id`                          | Get single post by ID              |
| DELETE | `/api/v1/posts/:id`                          | Save a post to collection          |
| POST   | `/api/v1/posts/:id/save`                     | Delete own post                    |
| DELETE | `/api/v1/posts/:id/unsave`                   | Unsave a saved post                |

---

## 🔐 Authentication

Use the JWT token from /auth/login or /auth/register in the Authorization header for protected routes:
```makefile
Authorization: Bearer <your_token>
```

---

## 🖼️ Image Handling

Cloudinary is used for storing images.

Multer handles file uploads.

On avatar or post deletion, the images are also deleted from Cloudinary.

---

## 📂 Folder Structure

```bash
.
├── routes/              # All routes, Mongoose Schemas & Cloudinary, Multer Config
├── server.js            # Entry point of the app
├── swagger.js           # Swagger config 
├── .env                 # Environmental variables
├── app.js               # Applies middlewares, defines or mounts routes and sets up error handling
├── .gitignore
├── package.json
└── README.md
```

---

## 🧼 Cleanup on Delete

When a user deletes their account:

All posts are deleted from DB

All post images + avatar are deleted from Cloudinary

---

## 📖 License

This project is licensed for demo purposes.

---

## 👨‍💻 Author

@samrat-ghosh-007













