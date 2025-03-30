import express from 'express';
const router = express.Router();

// Sample Payment Route
router.post('/create', (req, res) => {
    res.status(200).json({ message: "Payment route working!" });
});

export default router;