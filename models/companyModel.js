const mongoose = require('mongoose');


// const performanceSchema = new mongoose.Schema({
//     history: [
//         {
//             date: Date,
//             time: String,
//             Volume: Number,
//             PreviousClose: Number,
//             Open: Number,
//             TodayLow: Number,
//             TodayHigh: Number,
//         }
//     ],
// });

const performanceDetailSchema = new mongoose.Schema({
    time: String,
    Volume: Number,
    PreviousClose: Number,
    Open: Number,
    TodayLow: Number,
    TodayHigh: Number,
});

const performanceSchema = new mongoose.Schema({
    date: {
        type: Date,
        unique: true,
    },
    details: [performanceDetailSchema],
});

const fundamentalsSchema = new mongoose.Schema({
    marketCap: {
        type: Number,
    },
    roe: {
        type: Number,
    },
    peRatio: {
        type: Number,
    },
    pbRatio: {
        type: Number,
    },
    divYeild: {
        type: Number,
    },
    industryPe: {
        type: Number,
    },
    bookValue: {
        type: Number,
    },
    debtToEquity: {
        type: Number,
    },
    faceValue: {
        type: Number,
    },
});


const newsSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
    },
}, { timestamps: true });


const eventSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    date: {
        type: Date,
    },
}, { timestamps: true });


const companySchema = new mongoose.Schema({
    image: {
        type: String,
    },
    symbol: {
        type: String,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
    },
    exchange: {
        type: String,
        enum: ['NSE', 'BSE'],
    },
    inst: {
        type: String,
        enum: ['STOCK', 'INDICES'],
    },
    startDate: {
        type: String,
    },
    endDate: {
        type: String,
    },
    overView: {
        performance: {
            type: [performanceSchema],
            default: null,
        },
        fundamentals: {
            type: [fundamentalsSchema],
            default: null,
        },
    },
    news: [newsSchema],
    events: [eventSchema],

}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
