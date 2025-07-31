import mongoose from 'mongoose';
function getCurrentISTDate() {
  // Create date in local time (this will be the server's timezone)
  const now = new Date();

  // Convert to IST (UTC+5:30)
  const ISTOffset = 330; // IST is UTC+5:30 (5*60 + 30 = 330 minutes)
  const ISTTime = new Date(now.getTime() + ISTOffset * 60 * 1000);

  return ISTTime;
}
const tripSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Trip name (e.g., Goa Trip)
  participants: { type: [String], required: true }, // Names or user IDs
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emails: { type: [String] },
  expenses: [
    {
      description: { type: String, required: true }, // e.g., Hotel Booking
      amount: { type: Number, required: true },
      paidBy: { type: String, required: true }, // Should match one of the participants
      createdAt: {
        type: Date,
        default: getCurrentISTDate
      },
    }
  ],
  createdAt: {
    type: Date,
    default: getCurrentISTDate
  },
});

export default mongoose.model('Trip', tripSchema);
