import mongoose from "mongoose";

// Convert "now" to IST and then return that as a Date
function getCurrentISTDate() {
  // Create date in local time (this will be the server's timezone)
  const now = new Date();
  
  // Convert to IST (UTC+5:30)
  const ISTOffset = 330; // IST is UTC+5:30 (5*60 + 30 = 330 minutes)
  const ISTTime = new Date(now.getTime() + ISTOffset * 60 * 1000);
  
  return ISTTime;
}

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { 
    type: Date, 
    default: getCurrentISTDate 
  },
});

const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;
