const ReferralTerms = require('../models/referTermModel');
const Referral = require('../models/referModel');
const User = require('../models/userModel');



// create refer term
exports.createOrUpdateReferralTerms = async (req, res) => {
    try {
        const { termsAndConditions, howToUse } = req.body;

        let terms = await ReferralTerms.findOne().sort({ createdAt: -1 });

        if (!terms) {
            terms = new ReferralTerms({ termsAndConditions, howToUse });
        } else {
            terms.termsAndConditions = termsAndConditions;
            terms.howToUse = howToUse;
        }

        await terms.save();

        res.status(201).json({ status: 201, message: 'Referral terms updated successfully', data: terms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getReferralTerms = async (req, res) => {
    try {
        const terms = await ReferralTerms.findOne().sort({ createdAt: -1 });

        if (!terms) {
            return res.status(404).json({ status: 404, message: 'Referral terms not found' });
        }

        res.status(200).json({ status: 200, data: terms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.createReferral = async (req, res) => {
    try {
        const { referrerUserId, referredUserId, rewardAmount } = req.body;

        const referrerUser = await User.findById(referrerUserId);
        const referredUser = await User.findById(referredUserId);

        if (!referrerUser || !referredUser) {
            return res.status(400).json({ status: 400, message: 'Invalid user ID(s)' });
        }

        const referral = new Referral({
            referrer: referrerUserId,
            referredUser: referredUserId,
            rewardAmount,
        });

        await referral.save();

        res.status(201).json({ status: 201, message: 'Referral created successfully', data: referral });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.completeReferral = async (req, res) => {
    try {
        const referralId = req.params.id;

        const referral = await Referral.findById(referralId);

        if (!referral) {
            return res.status(404).json({ status: 404, message: 'Referral not found' });
        }

        if (referral.status === 'Completed') {
            return res.status(400).json({ status: 400, message: 'Referral has already been completed' });
        }

        const referrerUser = await User.findById(referral.referrer);
        if (referrerUser) {
            referrerUser.totalRewardsEarned += referral.rewardAmount;
            referrerUser.totalReferrals += 1;
            await referrerUser.save();
        }

        referral.status = 'Completed';
        referral.completedAt = new Date();
        await referral.save();

        res.status(200).json({ status: 200, message: 'Referral completed successfully', data: referral });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getAllReferrals = async (req, res) => {
    try {
        const referrals = await Referral.find();
        res.status(200).json({ status: 200, data: referrals });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.deleteReferral = async (req, res) => {
    try {
        const referralId = req.params.id;

        const referral = await Referral.findByIdAndDelete(referralId);

        if (!referral) {
            return res.status(404).json({ status: 404, message: 'Referral not found' });
        }

        if (referral.status === 'Completed') {
            // Update the referrer user's totalRewardsEarned and totalReferrals
            const referrerUser = await User.findById(referral.referrer);
            if (referrerUser) {
                referrerUser.totalRewardsEarned -= referral.rewardAmount;
                referrerUser.totalReferrals -= 1;
                await referrerUser.save();
            }
        }

        res.status(200).json({ status: 200, message: 'Referral deleted successfully', data: referral });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


