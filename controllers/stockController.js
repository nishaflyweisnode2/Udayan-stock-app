const Stock = require('../models/stockModel');

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
