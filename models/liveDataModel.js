const mongoose = require('mongoose');

const liveDataSchema = new mongoose.Schema({
    channel: {
        type: String,
        required: true,
    },
    message1: {
        UniqueName: String,
        Symbol: String,
        Ticker: String,
        Exchange: String,
        InstrumentType: String,
        ExpiryString: String,
        StrikePriceString: String,
        StrikePrice: Number,
        OptionType: String,
        LastTradedTime: Date,
        LTD: Number,
        LTT: Number,
        BBP: Number,
        BBQ: Number,
        BSP: Number,
        BSQ: Number,
        LTP: Number,
        Open: Number,
        High: Number,
        Low: Number,
        Vol: Number,
        PrevVol: Number,
        DayOpen: Number,
        DayHighest: Number,
        DayLowest: Number,
        PrevClose: Number,
        TTQ: Number,
        OI: Number,
        PrevOI: Number,
        ATP: Number,
        TTV: Number,
        IV: Number,
    },
});

const LiveDataModel = mongoose.model('LiveData', liveDataSchema);

module.exports = LiveDataModel;
