const express = require('express');
const logger = require('./middleware/logger');
const identify = require('./middleware/identify');
const validateExpense = require('./middleware/validateExpense');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 1. JSON body parser middleware mandatory for come in before roots
app.use(express.json());

// 2. Global Request Logger
app.use(logger);

// Root Route test direct in browser
app.get('/', (req, res) => {
    res.send("Expense Tracker API is running!");
});

// In-Memory Database Array (Assignment Requirement)
const expenses = [];

// ---------------- ROUTES ----------------

// POST /expenses - New expense add 
app.post('/expenses', identify, validateExpense, (req, res) => {
    const { title, amount, category } = req.body;

    const newExpense = {
        id: Date.now().toString(),
        userId: req.userId,
        title: title.trim(),
        amount,
        category: category || 'General',
        createdAt: new Date().toISOString()
    };

    expenses.push(newExpense);
    return res.status(201).json(newExpense);
});

// GET /expenses - only for request expenses
app.get('/expenses', identify, (req, res) => {
    const userExpenses = expenses.filter(e => e.userId === req.userId);
    return res.status(200).json(userExpenses);
});

// GET /expenses/:id - Ek specific expenses
app.get('/expenses/:id', identify, (req, res) => {
    const expense = expenses.find(e => e.id === req.params.id);

    if (!expense || expense.userId !== req.userId) {
        return res.status(404).json({ error: "Expense not found or unauthorized" });
    }

    return res.status(200).json(expense);
});

// PUT /expenses/:id - Expense Update 
app.put('/expenses/:id', identify, validateExpense, (req, res) => {
    const expense = expenses.find(e => e.id === req.params.id);

    if (!expense || expense.userId !== req.userId) {
        return res.status(404).json({ error: "Expense not found or unauthorized" });
    }

    const { title, amount, category } = req.body;
    expense.title = title.trim();
    expense.amount = amount;
    if (category) expense.category = category;

    return res.status(200).json(expense);
});

// DELETE /expenses/:id - Expense delete
app.delete('/expenses/:id', identify, (req, res) => {
    const index = expenses.findIndex(e => e.id === req.params.id && e.userId === req.userId);

    if (index === -1) {
        return res.status(404).json({ error: "Expense not found or unauthorized" });
    }

    const deletedExpense = expenses.splice(index, 1)[0];
    return res.status(200).json(deletedExpense);
});

// 3. Centralized Error Handling Middleware 
app.use(errorHandler);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});