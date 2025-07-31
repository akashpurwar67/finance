// controllers/transactionController.js
import Transaction from "../models/transaction.model.js"
import Budget from "../models/budget.model.js";
function getCurrentISTDate(date) {
  // Create date in local time (this will be the server's timezone)
  

  // Convert to IST (UTC+5:30)
  const ISTOffset = 330; // IST is UTC+5:30 (5*60 + 30 = 330 minutes)
  const ISTTime = new Date(date.getTime() + ISTOffset * 60 * 1000);

  return ISTTime;
}
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
  
  const transaction = new Transaction({
    userId,
    type,
    category,
    amount,
    date: getCurrentISTDate(new Date(date)), // Convert to IST
    note
  });
  // Save transaction
  await transaction.save();
  res.status(201).send(transaction);
};

export const getTransactions = async (req, res) => {
  try {

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

    console.log(now,getCurrentISTDate(now))
   
    const month = now.getMonth();
    const year = now.getFullYear();
    const startDate = new Date(year, month, 1); // Start of the month
    const endDate = new Date(year, month + 1, 1); // Start of next month

    // Find if a budget for this category and this month/year exists
    let existingBudget = await Budget.findOne({
      userId,
      category,
      createdAt: {
        $gte: getCurrentISTDate(startDate),          // IST month start
        $lt: getCurrentISTDate(endDate),       // before next month
      },
    });


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

    // Get current IST date parts
    const now = new Date();
    

    const month = now.getMonth();
    const year = now.getFullYear();
    const startDate = new Date(year, month, 1); // Start of the month
    const endDate = new Date(year, month + 1, 1); // Start of next month
    const budgets = await Budget.find({
      userId,
      createdAt: {
        $gte: getCurrentISTDate(startDate),
        $lt: getCurrentISTDate(endDate),
      },
    });

    res.status(200).send(budgets);
  } catch (err) {
    console.error('Error fetching budgets:', err);
    res.status(500).send({ message: 'Internal server error' });
  }
};


export const deleteBudget = async (req, res) => {
  try {
    const { budgetId } = req.params;
    const budget = await Budget.findOneAndDelete({
      _id: budgetId,
      userId: req.user._id
    });

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



