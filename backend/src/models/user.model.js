import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    budget: [
      {
        category: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          default: 0,
        },
        period: {
          type: String,
          enum: ['monthly', 'yearly'],
          required: true,
        },
      }
    ],


  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
