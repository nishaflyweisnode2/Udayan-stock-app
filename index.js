const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const compression = require("compression");
const serverless = require("serverless-http");
const app = express();
const path = require("path");
const PORT = process.env.PORT || 2613;
const DB_URI = process.env.DB_URI;


app.use(compression({ threshold: 500 }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.get("/", (req, res) => {
    res.send("Hello World!");
});


const userRoutes = require('./routes/userRoutes');
const planRoutes = require('./routes/planRoutes');
const purchasePlanRoutes = require('./routes/PurchasePlanRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const supportRoutes = require('./routes/supportRoutes');
const companyRoutes = require('./routes/companyRoutes');
const stockRoutes = require('./routes/stockRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const brokerRoutes = require('./routes/brokerRoutes');
const storyRoutes = require('./routes/storyRoutes');
const investingTradingTutorialRoutes = require('./routes/investing&TradingTutorialRoutes');
const termAndConditionRoutes = require('./routes/term&ConditionRoutes');
const strageyRoutes = require('./routes/strategyRoutes');
const investorRoutes = require('./routes/investorRoutes');
const traderRoutes = require('./routes/traderRoutes');






mongoose.Promise = global.Promise;
mongoose.set("strictQuery", true);
mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
})
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });



app.use('/user', userRoutes);
app.use('/plan', planRoutes);
app.use('/purchasePlan', purchasePlanRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/support', supportRoutes);
app.use('/company', companyRoutes);
app.use('/stock', stockRoutes);
app.use('/portfolio', portfolioRoutes);
app.use('/broker', brokerRoutes);
app.use('/story', storyRoutes);
app.use('/investingTradingTutorial', investingTradingTutorialRoutes);
app.use('/termAndCondition', termAndConditionRoutes);
app.use('/stragey', strageyRoutes);
app.use('/investor', investorRoutes);
app.use('/trader', traderRoutes);






app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}!`);
});


module.exports = { handler: serverless(app) };