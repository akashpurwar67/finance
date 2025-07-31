import mongoose from 'mongoose';
function getCurrentISTDate() {
  // Create date in local time (this will be the server's timezone)
  const now = new Date();

  // Convert to IST (UTC+5:30)
  const ISTOffset = 330; // IST is UTC+5:30 (5*60 + 30 = 330 minutes)
  const ISTTime = new Date(now.getTime() + ISTOffset * 60 * 1000);

  return ISTTime;
}
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
    createdAt: {
      type: Date,
      default: getCurrentISTDate
    },
  },

);

const User = mongoose.model('User', userSchema);

export default User;
