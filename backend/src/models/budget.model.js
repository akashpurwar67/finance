import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;