import { Review } from '../models/review.model.js';

// Add a review
export const addReview = async (req, res) => {
    try {
        const { restaurantId, foodId, rating, comment } = req.body;

        if (!restaurantId && !foodId) {
            return res.status(400).json({ message: "Must specify restaurantId or foodId" });
        }

        const review = new Review({ userId: req.user._id, restaurantId, foodId, rating, comment });
        await review.save();

        res.status(201).json({ message: "Review added successfully", review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get reviews for a restaurant
export const getRestaurantReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ restaurantId: req.params.restaurantId }).populate('userId', 'email');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get reviews for a food item
export const getFoodReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ foodId: req.params.foodId }).populate('userId', 'email');
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a review
export const updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findOneAndUpdate(
            { _id: req.params.reviewId, userId: req.user._id },
            { rating, comment },
            { new: true }
        );

        if (!review) return res.status(404).json({ message: "Review not found or unauthorized" });

        res.status(200).json({ message: "Review updated successfully", review });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a review
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findOneAndDelete({ _id: req.params.reviewId, userId: req.user._id });

        if (!review) return res.status(404).json({ message: "Review not found or unauthorized" });

        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
