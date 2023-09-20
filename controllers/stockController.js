const Stock = require('../models/stockModel');
const Transaction = require('../models/transcationModel');
const SearchQuery = require('../models/searchModel');
const Company = require('../models/companyModel');

const { stockValidation, stockUpdateValidation } = require('../validation/stockValidation');


exports.createStock = async (req, res) => {
    try {
        const { error } = stockValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const stock = new Stock(req.body);

        const existingStock = await Stock.findOne({ $and: [{ name: req.body.name }, { symbol: req.body.symbol }] });

        if (existingStock) {
            return res.status(400).json({ status: 400, error: 'Stock name or symbol already exists' });
        }

        await stock.save();

        return res.status(201).json({ status: 201, message: 'Stock Created Successfully', data: stock });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};


exports.getAllStocks = async (req, res) => {
    try {
        const stocks = await Stock.find();
        return res.status(200).json({ status: 200, messsage: "Sucessfully", data: stocks });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};


exports.getStockById = async (req, res) => {
    try {
        const stock = await Stock.findById(req.params.stockId);
        if (!stock) {
            return res.status(404).json({ status: 200, messsage: 'Stock not found' });
        }
        return res.status(200).json({ status: 200, messsage: "Sucessfully", data: stock });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};


exports.updateStockById = async (req, res) => {
    try {
        const { error } = stockUpdateValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const updatedStock = await Stock.findByIdAndUpdate(
            req.params.stockId,
            req.body,
            { new: true }
        );

        if (!updatedStock) {
            return res.status(404).json({ status: 200, messsage: 'Stock not found' });
        }

        return res.status(200).json({ status: 200, messsage: "Stock Updated Sucessfully", data: updatedStock });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};


exports.deleteStockById = async (req, res) => {
    try {
        const deletedStock = await Stock.findByIdAndRemove(req.params.stockId);
        if (!deletedStock) {
            return res.status(404).json({ status: 404, message: 'Stock not found' });
        }
        return res.status(200).send({ status: 200, message: "Deleted Sucessfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};


exports.getTrendingStocks = async (req, res) => {
    try {
        const transactions = await Transaction.find({});

        const stockCountMap = transactions.reduce((countMap, transaction) => {
            if (transaction.stockId) {
                const stockId = transaction.stockId.toString();
                countMap[stockId] = (countMap[stockId] || 0) + 1;
            }
            return countMap;
        }, {});

        const sortedStocks = Object.keys(stockCountMap).sort(
            (stockIdA, stockIdB) => stockCountMap[stockIdB] - stockCountMap[stockIdA]
        );

        const trendingStockIds = sortedStocks.slice(0, 40);

        const trendingStocks = await Stock.find({ _id: { $in: trendingStockIds } });

        res.status(200).json({ status: 200, message: 'Get Tranding Stock Sucessfully', data: trendingStocks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.getLatestStockUpdates = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const perPage = req.query.perPage || 20;

        const skip = (page - 1) * perPage;

        const trendingStocks = await Stock.find({})
            .skip(skip)
            .limit(perPage);

        res.status(200).json(trendingStocks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// exports.searchStocks = async (req, res) => {
//     try {
//         const productsCount = await Stock.countDocuments();

//         let matchQuery = {};

//         if (req.query.search) {
//             const searchRegex = new RegExp(req.query.search, 'i');

//             matchQuery = {
//                 $or: [
//                     { name: searchRegex },
//                     { symbol: searchRegex },
//                     { 'company.name': searchRegex },
//                     { 'company.symbol': searchRegex },
//                 ],
//             };
//         }

//         const apiFeature = await Stock.aggregate([
//             {
//                 $lookup: { from: 'companies', localField: 'company', foreignField: '_id', as: 'company' },
//             },
//             { $unwind: '$company' },
//             { $match: matchQuery },
//         ]);

//         return res.status(200).json({ status: 200, message: 'Product data found.', data: apiFeature, count: productsCount });
//     } catch (err) {
//         console.log(err);
//         return res.status(500).send({ message: 'Internal server error while searching products.' });
//     }
// };


exports.searchStocks = async (req, res) => {
    try {
        const productsCount = await Stock.countDocuments();

        let matchQuery = {};

        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');

            matchQuery = {
                $or: [
                    { name: searchRegex },
                    { symbol: searchRegex },
                    { 'company.name': searchRegex },
                    { 'company.symbol': searchRegex },
                ],
            };

            await SearchQuery.findOneAndUpdate(
                { query: req.query.search },
                { $inc: { count: 1 } },
                { upsert: true }
            );
        }

        const apiFeature = await Stock.aggregate([
            {
                $lookup: { from: 'companies', localField: 'company', foreignField: '_id', as: 'company' },
            },
            { $unwind: '$company' },
            { $match: matchQuery },
        ]);

        return res.status(200).json({ status: 200, message: 'Product data found.', data: apiFeature, count: productsCount });
    } catch (err) {
        console.log(err);
        return res.status(500).send({ message: 'Internal server error while searching products.' });
    }
};


exports.getPopularSearches = async (req, res) => {
    try {
        const popularSearches = await SearchQuery.find()
            .sort({ count: -1 })
            .limit(20);

        res.status(200).json({ status: 200, data: popularSearches });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

