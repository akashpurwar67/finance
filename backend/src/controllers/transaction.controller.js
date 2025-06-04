// controllers/transactionController.js
import Transaction from "../models/transaction.model.js"
import User from "../models/user.model.js";
import Budget from "../models/budget.model.js";

export const addTransaction = async (req, res) => {
  const { type, category, amount, date, note } = req.body;
  const userId = req.user.id;
  // Validate input
  if (!type || !['income', 'expense'].includes(type)) {
    return res.status(400).send({ message: "Type must be either 'income' or 'expense'" });
  }
  if (!userId || !amount || !date || !category) {
    3
    return res.status(400).send({ message: "All fields are required" });
  }
  if (isNaN(amount) || amount <= 0) {
    return res.status(400).send({ message: "Amount must be a positive number" });
  }
  if (new Date(date) > new Date()) {
    return res.status(400).send({ message: "Date cannot be in the future" });
  }
  const transaction = new Transaction({
    userId,
    type,
    category,
    amount,
    date: new Date(date),
    note
  });
  // Save transaction
  await transaction.save();
  res.status(201).send(transaction);
};

export const getTransactions = async (req, res) => {
  try {
    const now = new Date();

    // Start of the current month (e.g., May 1st 00:00:00)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of next month (exclusive upper bound)
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const transactions = await Transaction.find({
      userId: req.user._id,
    }).sort({ date: -1 }); // Optional: sort by most recent first

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching current month transactions:", error);
    res.status(500).json({ message: "Failed to get transactions" });
  }
};

export const deleteTransaction = async (req, res) => {
  const { transactionId } = req.params;
  const transaction = await Transaction.findOneAndDelete({ _id: transactionId, userId: req.user._id });

  if (!transaction) {
    return res.status(404).send({ message: "Transaction not found" });
  }

  res.send({ message: "Transaction deleted successfully" });
};

export const addBudget = async (req, res) => {
  try {
    const { category, amount, period } = req.body;

    const userId = req.user._id;
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    // Find if a budget for this category and this month/year exists
    let existingBudget = await Budget.findOne({
      userId,
      category,
      createdAt: {
        $gte: new Date(year, month, 1),
        $lt: new Date(year, month + 1, 1)
      }
    });



    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    if (!category || !amount || !period) {
      return res.status(400).send({ message: "All fields are required" });
    }
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).send({ message: "Amount must be a positive number" });
    }
    if (user.budget.some(b => b.category === category)) {
      user.budget = user.budget.map(b =>
        b.category === category ? { ...b, amount, period } : b
      );
    }
    else {
      const budget = { category, amount, period };
      user.budget.push(budget);

    }
    await user.save();



    let budget;
    if (existingBudget) {
      // Update existing budget
      existingBudget.amount = amount;
      await existingBudget.save();
      budget = existingBudget;
    } else {
      // Create new budget
      budget = new Budget({
        userId,
        category,
        amount,
      });
      await budget.save();
    }
    
    res.status(201).send(budget);
  } catch (err) {
    console.error("Error adding budget:", err);
    res.status(500).send({ message: "Internal server error" });
  }
};

export const getBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('budget');

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send(user.budget);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).send({ message: "Internal server error" });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const b = user.budget.find(b => b._id.toString() === budgetId);
    if (!b) {
      return res.status(404).send({ message: "Budget not found" });
    }
    const budget = await Budget.findOneAndDelete({
      userId,
      createdAt: {
        $gte: new Date(year, month, 1),
        $lt: new Date(year, month + 1, 1)
      },
      category: b.category
    });

    user.budget = user.budget.filter(b => b._id.toString() !== budgetId);
    await user.save();


    res.status(200).send({ message: "Budget deleted successfully" });
  } catch (err) {
    console.error("Error deleting budget:", err);
    res.status(500).send({ message: "Internal server error" });
  }
};
export const getAllBudget = async (req, res) => {
  try {
    const userId = req.user._id;
    const budgets = await Budget.find({ userId });

    if (!budgets || budgets.length === 0) {
      return res.status(404).send({ message: "No budgets found" });
    }

    res.status(200).send(budgets);
  } catch (err) {
    console.error("Error fetching budgets:", err);
    res.status(500).send({ message: "Internal server error" });
  }
};



