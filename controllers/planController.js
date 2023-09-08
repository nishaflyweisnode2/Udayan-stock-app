const Plan = require('../models/planModel');
const { planSchema, planUpdateSchema, planIdSchema } = require('../validation/planValidation');



exports.createPlan = async (req, res) => {
    try {
        const { error } = planSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const newPlan = new Plan(req.body);
        await newPlan.save();

        return res.status(201).json(newPlan);
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};


exports.getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find();
        return res.status(200).json(plans);
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};


exports.updatePlan = async (req, res) => {
    try {
        const planId = req.params.id;
        const { title, description, price } = req.body;
        const { error, value } = planUpdateSchema.validate({ planId, title, description, price });

        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        const updates = { title, description, price };
        const updatedPlan = await Plan.findByIdAndUpdate(planId, updates, { new: true });

        if (!updatedPlan) {
            return res.status(404).json({ error: 'Plan not found' });
        }

        return res.status(200).json(updatedPlan);
    } catch (error) {
        return res.status(500).json({ error: 'Server error' });
    }
};


exports.getPlanById = async (req, res) => {
    try {
        const { error, value } = planIdSchema.validate({ id: req.params.id });

        if (error) {
            return res.status(400).json({ message: 'Invalid plan ID', error: error.details[0].message });
        }

        const planId = value.id;

        const plan = await Plan.findById(planId);

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        return res.status(200).json({ message: 'Plan found', data: plan });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};




