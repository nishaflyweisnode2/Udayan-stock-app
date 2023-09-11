const PurchasePlan = require('../models/PurchasePlanModel');
const Plan = require('../models/planModel');
const User = require('../models/userModel');

const { purchasePlanSchema, purchasePlanIdSchema } = require('../validation/PurchasePlanValidation');



exports.buyPlan = async (req, res) => {
    try {
        const userId = req.user
        const { planId, paymentMethod } = req.body;

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
            userId: userId._id,
            planId,
            price: plan.price,
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


exports.getAllPayments = async (req, res) => {
    try {
        const payments = await PurchasePlan.find();
        return res.status(200).json({ data: payments });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};


exports.getPaymentById = async (req, res) => {
    try {
        const paymentId = req.params.id;

        const { error } = purchasePlanIdSchema.validate(req.params);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const payment = await PurchasePlan.findById(paymentId);

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        return res.status(200).json({ data: payment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};

