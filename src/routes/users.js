const mongoose=require('mongoose');
const plm=require('passport-local-mongoose');

// mongoose.connect("mongodb://127.0.0.1:27017/pin");

const userSchema=mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  password: String,
  profileImage: String,
  contact: Number,
  boards: {
    type: Array,
    default: []
  },
  posts:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post"
    }
  ],
  saved:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "post"
    }
  ]
});

userSchema.plugin(plm);

module.exports=mongoose.model("user", userSchema);
