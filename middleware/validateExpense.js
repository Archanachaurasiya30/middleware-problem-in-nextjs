const validateExpense = (req, res, next) => {
    const { title, amount } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
        return res.status(400).json({ error: "Validation Error: 'title' must be a non-empty string" });
    }

    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: "Validation Error: 'amount' must be a number greater than zero" });
    }

    next();
};

module.exports = validateExpense;