const PurchasePlan = require('../models/PurchasePlanModel');
const Plan = require('../models/planModel');
const User = require('../models/userModel');

const { purchasePlanSchema } = require('../validation/PurchasePlanValidation');



exports.buyPlan = async (req, res) => {
    try {
        const { userId, planId, paymentMethod } = req.body;

        const { error } = purchasePlanSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const plan = await Plan.findById(planId);

        if (!plan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        const purchasePlan = new PurchasePlan({
            userId,
            planId,
            paymentMethod,
            paymentStatus: 'Pending',
        });

        await purchasePlan.save();

        // Simulate payment processing
        // Replace this with your actual payment processing logic
        // If payment is successful, update the paymentStatus to 'Completed'

        // Example:
        // if (paymentIsSuccessful) {
        //     purchasePlan.paymentStatus = 'Completed';
        //     await purchasePlan.save();
        // }

        return res.status(201).json(purchasePlan);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};


