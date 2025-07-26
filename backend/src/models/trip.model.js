import mongoose from 'mongoose';

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
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Trip', tripSchema);
