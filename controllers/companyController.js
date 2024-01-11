const Company = require('../models/companyModel');
const LiveData = require('../models/liveDataModel');
const axios = require('axios');
const { parse } = require('papaparse');
const cron = require('node-cron');
const schedule = require('node-schedule');
const { subYears, format, startOfDay, eachDayOfInterval } = require('date-fns');
const moment = require('moment');


const { validateCompany, updateValidateCompany, performanceValidation, createFundamentalsSchema } = require('../validation/companyValidation');




exports.createCompany1 = async (req, res) => {
    try {
        const { error } = validateCompany.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        if (!req.file) {
            return res.status(400).json({ error: "Image file is required" });
        }
        const { symbol, description, inst, exchange, price } = req.body;

        const existingCompany = await Company.findOne({ $or: [{ inst }, { symbol }] });

        if (existingCompany) {
            return res.status(400).json({ status: 400, error: 'Company inst or symbol already exists' });
        }

        const company = new Company({
            symbol,
            description,
            inst,
            exchange,
            price,
            image: req.file.path,
        });
        await company.save();
        res.status(201).json({ status: 201, message: "Company created successfully", data: company });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

function convertDateFormat(inputDate) {
    const matchResult = inputDate.match(/(\d{2})-(\d{2})-(\d{4})/);

    if (!matchResult) {
        console.error('Invalid date format:', inputDate);
        return inputDate;
    }

    const [day, month, year] = matchResult.slice(1);
    const months = {
        '01': 'JAN', '02': 'FEB', '03': 'MAR', '04': 'APR', '05': 'MAY', '06': 'JUN',
        '07': 'JUL', '08': 'AUG', '09': 'SEP', '10': 'OCT', '11': 'NOV', '12': 'DEC'
    };

    return `${day}${months[month]}${year}`;
}
function convertDateFormat1(inputDate) {
    try {
        const dateObject = new Date(inputDate);
        if (isNaN(dateObject.getTime())) {
            console.error('Invalid date format:', inputDate);
            return inputDate;
        }

        const day = String(dateObject.getDate()).padStart(2, '0');
        const month = String(dateObject.getMonth() + 1).padStart(2, '0');
        const year = dateObject.getFullYear();

        const months = {
            '01': 'JAN', '02': 'FEB', '03': 'MAR', '04': 'APR', '05': 'MAY', '06': 'JUN',
            '07': 'JUL', '08': 'AUG', '09': 'SEP', '10': 'OCT', '11': 'NOV', '12': 'DEC'
        };

        return `${day}${months[month]}${year}`;
    } catch (error) {
        console.error('Error converting date format:', error);
        return inputDate;
    }
}
async function createAccessToken() {
    const loginId = 'DC-UDAY8511';
    const product = 'DIRECTRTLITE';
    const apikey = '4A771C49C9534D8CAD3F';

    try {
        const response = await axios.get(`http://s3.vbiz.in/directrt/gettoken?loginid=${loginId}&product=${product}&apikey=${apikey}`);
        console.log(`statusCode: ${response.status}`);

        if (response.status === 200 && response.data.AccessToken) {
            console.log('Access Token created successfully:', response.data.AccessToken);
            return response.data.AccessToken;
        } else {
            console.error('Error getting access token:', response.status, response.data);
            throw new Error('Error getting access token');
        }
    } catch (error) {
        console.error('Error getting access token:', error.message);
        throw error;
    }
}
async function fetchDataFromApi(params) {
    const { loginId, accessToken, product, inst, tradeDate, symbol } = params;
    console.log("----", params);
    const apiUrl = `https://qbase1.vbiz.in/directrt/gethistorical?loginid=${loginId}&product=${product}&accesstoken=${accessToken}&inst=${inst}&tradedate=${tradeDate}&expiry=&symbol=${symbol}`;
    console.log("******", apiUrl);
    try {
        const response = await axios.get(apiUrl);
        const parsedData = parse(response.data, { header: true, skipEmptyLines: true }).data;
        return parsedData;
    } catch (error) {
        console.error('Error fetching data from API:', error);
        throw error;
    }
}
async function savePerformanceData(params, apiData) {
    try {
        const { loginId, accessToken, inst, product, tradeDate, symbol, companyId } = params;

        let company = await Company.findById(companyId);
        console.log('Company found:', companyId);

        if (!company) {
            console.error('Company not found:', companyId);
            return;
        }

        apiData.forEach(item => {
            const dateTimeString = `${item.Date.slice(0, 4)}-${item.Date.slice(4, 6)}-${item.Date.slice(6)}`;
            const dateValue = new Date(dateTimeString);
            const timeString = `${item.Time.slice(0, 2)}:${item.Time.slice(2)}`;

            if (!Array.isArray(company.overView.performance)) {
                company.overView.performance = [];
            }

            const existingPerformanceIndex = company.overView.performance.findIndex(performance => performance.date && performance.date.getTime() === dateValue.getTime());

            if (existingPerformanceIndex !== -1) {
                const existingTimeIndex = company.overView.performance[existingPerformanceIndex].details.findIndex(detail => detail.time === timeString);

                if (existingTimeIndex !== -1) {
                    company.overView.performance[existingPerformanceIndex].details[existingTimeIndex] = {
                        time: timeString,
                        Volume: Number(item.Volume),
                        PreviousClose: Number(item.Close),
                        Open: Number(item.Open),
                        TodayLow: Number(item.Low),
                        TodayHigh: Number(item.High),
                    };
                } else {
                    company.overView.performance[existingPerformanceIndex].details.push({
                        time: timeString,
                        Volume: Number(item.Volume),
                        PreviousClose: Number(item.Close),
                        Open: Number(item.Open),
                        TodayLow: Number(item.Low),
                        TodayHigh: Number(item.High),
                    });
                }
            } else {
                company.overView.performance.push({
                    date: dateValue,
                    details: [{
                        time: timeString,
                        Volume: Number(item.Volume),
                        PreviousClose: Number(item.Close),
                        Open: Number(item.Open),
                        TodayLow: Number(item.Low),
                        TodayHigh: Number(item.High),
                    }],
                });
            }
        });

        await company.save();
        console.log('Performance data saved successfully.');
    } catch (error) {
        console.error('Error saving performance data:', error);
    }
}

exports.createCompany1 = async (req, res) => {
    try {
        const { error } = validateCompany.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        if (!req.file) {
            return res.status(400).json({ error: "Image file is required" });
        }

        const { inst, symbol, description, exchange, price, startDate, endDate } = req.body;
        const formattedStartDate = convertDateFormat(startDate);
        const formattedEndDate = convertDateFormat(endDate);
        console.log("formattedStartDate", formattedStartDate);
        console.log("formattedEndDate", formattedEndDate);
        const company = new Company({
            symbol,
            description,
            inst,
            exchange,
            price,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            image: req.file.path,
        });

        await company.save();

        const companyId = company._id;

        // Create access token
        const accessToken = await createAccessToken();
        console.log("accessToken", accessToken);
        const performanceParams = {
            loginId: 'DC-UDAY8511',
            accessToken,
            inst,
            product: 'DIRECTRTLITE',
            tradeDate: formattedStartDate,
            symbol,
            companyId,
        };

        const apiData = await fetchDataFromApi(performanceParams);

        await savePerformanceData(performanceParams, apiData);

        return res.status(201).json({ status: 201, message: "Company created successfully", data: company });
    } catch (error) {
        console.error('Error creating company:', error.message);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

exports.createCompany = async (req, res) => {
    try {
        const { error } = validateCompany.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        if (!req.file) {
            return res.status(400).json({ error: "Image file is required" });
        }

        const { inst, symbol, description, exchange, price, startDate, endDate } = req.body;
        const formattedStartDate = convertDateFormat(startDate);
        const formattedEndDate = convertDateFormat(endDate);
        console.log("formattedStartDate", formattedStartDate);
        console.log("formattedEndDate", formattedEndDate);

        const company = new Company({
            symbol,
            description,
            inst,
            exchange,
            price,
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            image: req.file.path,
        });

        await company.save();

        const companyId = company._id;

        const accessToken = await createAccessToken();
        console.log("accessToken", accessToken);

        for (let currentDate = new Date(formattedStartDate); currentDate <= new Date(formattedEndDate); currentDate.setDate(currentDate.getDate() + 1)) {
            const formattedCurrentDate = convertDateFormat(currentDate.toISOString().slice(0, 10));
            console.log("formattedCurrentDate", formattedCurrentDate);

            const tradeDateForApi = convertDateFormat1(currentDate);
            console.log("tradeDateForApi", tradeDateForApi);

            if (currentDate > new Date(formattedEndDate)) {
                break;
            }

            const performanceParams = {
                loginId: 'DC-UDAY8511',
                accessToken,
                inst,
                product: 'DIRECTRTLITE',
                tradeDate: tradeDateForApi,
                symbol,
                companyId,
            };

            try {
                const apiData = await fetchDataFromApi(performanceParams);
                await savePerformanceData(performanceParams, apiData);
                console.log(`Performance data for ${formattedCurrentDate} processed successfully.`);
            } catch (error) {
                console.error(`Error processing performance data for ${formattedCurrentDate}:`, error);
            }
        }

        return res.status(201).json({ status: 201, message: "Company created successfully", data: company });
    } catch (error) {
        console.error('Error creating company:', error.message);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

// Function for start automatic cron job 
// const job = schedule.scheduleJob('0 3 * * *', async () => {
const job = schedule.scheduleJob('0 22 * * *', async () => {
    // const job = schedule.scheduleJob('* * * * *', async () => {
    try {
        console.log("Function In Cron Job Started");

        const companies = await Company.find();

        const today = startOfDay(new Date());

        const lastYearStartDate = subYears(today, 1);

        const dateRange = eachDayOfInterval({ start: lastYearStartDate, end: today });

        for (const company of companies) {
            const accessToken = await createAccessToken();
            console.log("accessToken", accessToken);

            const datesToFetch = dateRange.filter(date => {
                const dateString = format(date, 'ddMMMyyyy').toUpperCase();
                return !company.overView.performance.some(performance => performance.date === dateString);
            });


            for (const dateToFetch of datesToFetch) {
                const dateString = format(dateToFetch, 'ddMMMyyyy').toUpperCase();
                console.log("dateString", dateString);

                const params = {
                    loginId: 'DC-UDAY8511',
                    accessToken: accessToken,
                    inst: company.inst,
                    product: 'DIRECTRTLITE',
                    tradeDate: dateString,
                    symbol: company.symbol,
                    companyId: company._id,
                };

                const apiData = await fetchDataFromApi(params);

                await savePerformanceData(params, apiData);
            }

            console.log('Daily job completed successfully.');
        }
    } catch (error) {
        console.error('Error in daily job:', error);
    }
});
// end function cron job

exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json({ status: 200, message: "Get All Company Sucessfully", data: companies });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json({ status: 200, message: "Get Company Sucessfully", data: company });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.updateCompanyById1 = async (req, res) => {
    try {
        const { error } = updateValidateCompany.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { symbol, description, exchange, inst, price } = req.body;

        const companyId = req.params.id;

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        if (inst && inst !== company.inst) {
            const existingCompanyByName = await Company.findOne({ inst });
            if (existingCompanyByName) {
                return res.status(400).json({ status: 400, error: 'Company inst already exists' });
            }
        }

        if (symbol && symbol !== company.symbol) {
            const existingCompanyBySymbol = await Company.findOne({ symbol });
            if (existingCompanyBySymbol) {
                return res.status(400).json({ status: 400, error: 'Company symbol already exists' });
            }
        }

        company.symbol = symbol;
        company.description = description;
        company.exchange = exchange;
        company.inst = inst;
        company.price = price;
        company.image = req.file.path;

        const updatedCompany = await company.save();

        res.status(200).json({ status: 200, message: "Company Updated Successfully", data: updatedCompany });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.updateCompany1 = async (req, res) => {
    try {
        const companyId = req.params.id;
        const existingCompany = await Company.findById(companyId);

        if (!existingCompany) {
            return res.status(404).json({ error: 'Company not found' });
        }

        const { error } = validateCompany.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { inst, symbol, description, exchange, price, startDate, endDate } = req.body;
        const formattedStartDate = convertDateFormat(startDate);
        const formattedEndDate = convertDateFormat(endDate);
        console.log("formattedStartDate", formattedStartDate);
        console.log("formattedEndDate", formattedEndDate);

        existingCompany.inst = inst;
        existingCompany.symbol = symbol;
        existingCompany.description = description;
        existingCompany.exchange = exchange;
        existingCompany.price = price;
        existingCompany.startDate = formattedStartDate;
        existingCompany.endDate = formattedEndDate;

        await existingCompany.save();

        const accessToken = await createAccessToken();
        const performanceParams = {
            loginId: 'DC-UDAY8511',
            accessToken,
            inst,
            product: 'DIRECTRTLITE',
            tradeDate: formattedStartDate,
            symbol,
            companyId,
        };

        const updatedApiData = await fetchDataFromApi(performanceParams);

        await savePerformanceData(performanceParams, updatedApiData);

        return res.status(200).json({ status: 200, message: "Company updated successfully", data: existingCompany });
    } catch (error) {
        console.error('Error updating company:', error.message);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.updateCompany = async (req, res) => {
    try {
        const companyId = req.params.id;
        const existingCompany = await Company.findById(companyId);

        if (!existingCompany) {
            return res.status(404).json({ error: 'Company not found' });
        }

        const { error } = validateCompany.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { inst, symbol, description, exchange, price, startDate, endDate } = req.body;
        const formattedStartDate = convertDateFormat(startDate);
        const formattedEndDate = convertDateFormat(endDate);

        existingCompany.inst = inst;
        existingCompany.symbol = symbol;
        existingCompany.description = description;
        existingCompany.exchange = exchange;
        existingCompany.price = price;
        existingCompany.startDate = formattedStartDate;
        existingCompany.endDate = formattedEndDate;

        await existingCompany.save();

        const accessToken = await createAccessToken();
        console.log("accessToken", accessToken);

        for (let currentDate = new Date(formattedStartDate); currentDate <= new Date(formattedEndDate); currentDate.setDate(currentDate.getDate() + 1)) {
            const formattedCurrentDate = convertDateFormat(currentDate.toISOString().slice(0, 10));
            console.log("formattedCurrentDate", formattedCurrentDate);

            const tradeDateForApi = convertDateFormat1(currentDate);
            console.log("tradeDateForApi", tradeDateForApi);

            if (currentDate > new Date(formattedEndDate)) {
                break;
            }

            const performanceParams = {
                loginId: 'DC-UDAY8511',
                accessToken,
                inst,
                product: 'DIRECTRTLITE',
                tradeDate: tradeDateForApi,
                symbol,
                companyId,
            };

            try {
                const apiData = await fetchDataFromApi(performanceParams);
                await savePerformanceData(performanceParams, apiData);
                console.log(`Performance data for ${formattedCurrentDate} processed successfully.`);
            } catch (error) {
                console.error(`Error processing performance data for ${formattedCurrentDate}:`, error);
            }
        }

        return res.status(200).json({ status: 200, message: "Company updated successfully", data: existingCompany });
    } catch (error) {
        console.error('Error updating company:', error.message);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.deleteCompanyById = async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(204).send({ status: 204, message: "Company Deleted sucessfully" });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.addNewsToCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        company.news.push(req.body);
        await company.save();
        res.status(201).json({ status: 201, message: "News Created Sucessfully", data: company.news });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.getNewsForCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json({ status: 200, message: "Get News Sucessfully", data: company.news });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.getAllNews = async (req, res) => {
    try {
        const allNews = [];

        const companies = await Company.find();
        companies.forEach((company) => {
            allNews.push(...company.news);
        });

        res.status(200).json({ status: 200, message: "Get All News Sucessfully", data: allNews });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.createEventForCompany = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const eventData = req.body;

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        company.events.push(eventData);
        await company.save();

        res.status(201).json({ status: 201, message: "Event create Sucessfully", data: company.events[company.events.length - 1] });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.getCompanyEvents = async (req, res) => {
    try {
        const companyId = req.params.companyId;

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const events = company.events;

        return res.status(200).json({ message: 'Company events retrieved successfully', data: events });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.createPerformance1 = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const { date, Volume, PreviousClose, Open, TodayLow, TodayHigh } = req.body;

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        if (!company.overView.performance) {
            company.overView.performance = { history: [] };
        }

        const existingEntryIndex = company.overView.performance.history.findIndex(entry =>
            entry.date.toISOString() === new Date(date).toISOString()
        );

        if (existingEntryIndex !== -1) {
            const existingEntry = company.overView.performance.history[existingEntryIndex];
            existingEntry.Volume = Volume;
            existingEntry.PreviousClose = PreviousClose;
            existingEntry.Open = Open;
            existingEntry.TodayLow = TodayLow;
            existingEntry.TodayHigh = TodayHigh;
        } else {
            const newPerformanceEntry = {
                date,
                Volume,
                PreviousClose,
                Open,
                TodayLow,
                TodayHigh
            };

            company.overView.performance.history.push(newPerformanceEntry);
        }

        await company.save();

        return res.status(201).json({ status: 201, message: 'Performance data added or updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.createPerformance = async (req, res) => {
    try {
        const companyId = req.params.id;
        const existingCompany = await Company.findById(companyId);

        if (!existingCompany) {
            return res.status(404).json({ error: 'Company not found' });
        }

        const { inst, symbol, description, exchange, price, startDate, endDate } = req.body;
        const formattedStartDate = convertDateFormat(startDate);
        const formattedEndDate = convertDateFormat(endDate);
        existingCompany.inst = inst;
        existingCompany.symbol = symbol;
        existingCompany.description = description;
        existingCompany.exchange = exchange;
        existingCompany.price = price;
        existingCompany.startDate = formattedStartDate;
        existingCompany.endDate = formattedEndDate;

        await existingCompany.save();

        const accessToken = await createAccessToken();

        for (let currentDate = new Date(formattedStartDate); currentDate <= new Date(formattedEndDate); currentDate.setDate(currentDate.getDate() + 1)) {
            const formattedCurrentDate = convertDateFormat(currentDate.toISOString().slice(0, 10));
            console.log("formattedCurrentDate", formattedCurrentDate);

            const tradeDateForApi = convertDateFormat1(currentDate);
            console.log("tradeDateForApi", tradeDateForApi);

            if (currentDate > new Date(formattedEndDate)) {
                break;
            }

            const performanceParams = {
                loginId: 'DC-UDAY8511',
                accessToken,
                inst,
                product: 'DIRECTRTLITE',
                tradeDate: tradeDateForApi,
                symbol,
                companyId,
            };

            try {
                const apiData = await fetchDataFromApi(performanceParams);
                await savePerformanceData(performanceParams, apiData);
                console.log(`Performance data for ${formattedCurrentDate} processed successfully.`);
            } catch (error) {
                console.error(`Error processing performance data for ${formattedCurrentDate}:`, error);
            }
        }

        return res.status(201).json({ status: 201, message: 'Performance data added or updated successfully', data: existingCompany });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getPerformanceByCompanyId = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const performanceData = company.overView.performance;
        return res.status(200).json({ message: 'Performance data retrieved successfully', data: performanceData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.createFundamentals = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const { marketCap, roe, peRatio, pbRatio, divYeild, industryPe, bookValue, debtToEquity, faceValue } = req.body;

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        company.overView.fundamentals = {
            marketCap,
            roe,
            peRatio,
            pbRatio,
            divYeild,
            industryPe,
            bookValue,
            debtToEquity,
            faceValue,
        };

        await company.save();

        return res.status(201).json(company.overView.fundamentals);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.getFundamentalsByCompanyId = async (req, res) => {
    try {
        const companyId = req.params.companyId;

        const company = await Company.findById(companyId);

        if (!company || !company.overView.fundamentals) {
            return res.status(404).json({ error: 'Fundamentals not found' });
        }

        return res.status(200).json(company.overView.fundamentals);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.getDailyStats = async (req, res) => {
    try {
        const companyId = req.params.companyId;

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const performance = company.overView.performance;
        console.log("performance", performance);

        if (!performance || performance.length === 0) {
            return res.status(404).json({ message: 'No performance data available' });
        }

        const latestPerformance = performance[0];
        const historicalData = latestPerformance.details;
        console.log("historicalData", historicalData);

        if (!historicalData || historicalData.length === 0) {
            return res.status(404).json({ message: 'No historical data available' });
        }

        const latestData = historicalData[10];
        console.log("latestData", latestData);

        const marketCap = company.overView.fundamentals[0]?.marketCap;

        const dailyStats = {
            DailyOpen: latestData.Open,
            DailyHigh: Math.max(latestData.Open, latestData.TodayHigh),
            DailyLow: Math.min(latestData.Open, latestData.TodayLow),
            DailyClose: latestData.PreviousClose,
            DailyVolume: latestData.Volume,
            MarketCap: marketCap,
        };

        // return res.status(200).json({
        //     message: 'Historical data retrieved successfully',
        //     data: historicalData,
        // });
        return res.status(200).json({
            message: 'Daily statistics retrieved successfully',
            data: dailyStats,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getDailyStatsByDate = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const dateParam = new Date(req.params.date);

        if (isNaN(dateParam)) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const performance = company.overView.performance;

        if (!performance || performance.length === 0) {
            return res.status(404).json({ message: 'No performance data available' });
        }

        const dataForDate = performance.find(entry => entry.date.getTime() === dateParam.getTime());

        if (!dataForDate) {
            return res.status(404).json({ message: 'Performance data for the specified date not found' });
        }

        const historicalDataForDate = dataForDate.details;

        if (!historicalDataForDate || historicalDataForDate.length === 0) {
            return res.status(404).json({ message: 'No historical data available for the specified date' });
        }

        return res.status(200).json({
            message: 'Historical data retrieved successfully',
            data: historicalDataForDate,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

exports.getDailyGraphStatsByDate = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const dateParam = new Date(req.params.date);

        if (isNaN(dateParam)) {
            return res.status(400).json({ message: 'Invalid date format' });
        }

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const performance = company.overView.performance;

        if (!performance || performance.length === 0) {
            return res.status(404).json({ message: 'No performance data available' });
        }

        const dataForDate = performance.find(entry => entry.date.getTime() === dateParam.getTime());

        if (!dataForDate) {
            return res.status(404).json({ message: 'Performance data for the specified date not found' });
        }

        const historicalDataForDate = dataForDate.details;

        if (!historicalDataForDate || historicalDataForDate.length === 0) {
            return res.status(404).json({ message: 'No historical data available for the specified date' });
        }

        // Extract properties for graph rendering
        const labels = historicalDataForDate.map(entry => entry.time);
        const volumeData = historicalDataForDate.map(entry => entry.Volume);
        const previousCloseData = historicalDataForDate.map(entry => entry.PreviousClose);
        const openData = historicalDataForDate.map(entry => entry.Open);
        const todayLowData = historicalDataForDate.map(entry => entry.TodayLow);
        const todayHighData = historicalDataForDate.map(entry => entry.TodayHigh);

        // Format data for graph rendering
        const graphData = {
            labels: labels,
            datasets: [
                {
                    label: 'Volume',
                    data: volumeData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Previous Close',
                    data: previousCloseData,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Open',
                    data: openData,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Today Low',
                    data: todayLowData,
                    backgroundColor: 'rgba(255, 206, 86, 0.2)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 1,
                },
                {
                    label: 'Today High',
                    data: todayHighData,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1,
                },
            ],
        };

        return res.status(200).json({
            message: 'Historical data retrieved successfully',
            data: graphData,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getDailyStatsByDay = async (req, res) => {
    try {
        const companyId = req.params.companyId;
        const day = parseInt(req.params.day);

        if (isNaN(day) || day < 1 || day > 31) {
            return res.status(400).json({ message: 'Invalid day value' });
        }

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const performance = company.overView.performance;

        if (!performance || !Array.isArray(performance) || performance.length === 0) {
            return res.status(404).json({ message: 'No performance data available' });
        }

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        console.log("currentDate", currentDate);
        console.log("currentYear", currentYear);
        const dataForDate = performance.find(entry => {
            const entryDate = new Date(entry.date);
            console.log("entryDate", entryDate);

            const entryDay = entryDate.getDate();
            console.log("entryDay", entryDay);

            const entryMonth = entryDate.getMonth();
            console.log("entryMonth", entryMonth);

            const entryYear = entryDate.getFullYear();
            console.log("entryYear", entryYear);


            return entryDay === day && entryMonth + 1 === currentDate.getMonth() + 1 && entryYear === currentYear;
        });

        if (!dataForDate) {
            return res.status(404).json({ message: 'Data for the specified date not found' });
        }

        const historicalDataForDate = dataForDate.details;
        console.log("historicalDataForDate", historicalDataForDate);
        if (!historicalDataForDate || historicalDataForDate.length === 0) {
            return res.status(404).json({ message: 'No historical data available for the specified date' });
        }

        return res.status(200).json({
            message: 'Daily statistics retrieved successfully',
            data: historicalDataForDate,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};



////// third Party code 
//'0 9 * * *'
// cron.schedule('* * * * *', async () => {
//     console.log('Task scheduled at 9:00 AM');

//     function handle_message(channel, message) {
//         console.log(`message: ${message} - received from channel ${channel} `)
//     }

//     function subscribe_to_channel(socket, ticker) {
//         (async () => {

//             const channel_name = `${ticker}`
//             console.log(`subscribing to channel ${channel_name}`)
//             let myChannel = socket.subscribe(channel_name);

//             await myChannel.listener('subscribe').once();
//             (async () => {
//                 for await (let data of myChannel) {
//                     handle_message("SUBSCRIPTION-" + channel_name, data)
//                 }
//             })();
//         })();
//     }

//     function subscribe_to_events(socket, event) {
//         (async () => {
//             const channel_name = `${event}`
//             console.log(`subscribing to Event ${channel_name}`)
//             try {
//                 (async () => {
//                     for await (let data of socket.receiver(event)) {
//                         handle_message(event, data)
//                     }
//                 })();
//             } catch (error) {
//                 console.log(json.stringify(error));
//             }
//         })();
//     }

//     function unsubscribe_from_channel(socket, ticker) {
//         (async () => {
//             const channel_name = `${ticker}.json`
//             console.log(`unsubscribing from channel ${channel_name}`)
//             let myChannel = socket.unsubscribe(channel_name);
//             console.log(`successfully unsubscribed from channel ${JSON.stringify(channel_name)}`);
//         })();
//     }

//     function disconnect_websocket(socket) {
//         socket.disconnect()
//         console.log('disconnected the websocket connection.')
//     }

//     function download_ticker() {
//         console.log('downloading tickers...');
//         //var fs = require('fs');
//         reqEndPoint = "http://qbase1.vbiz.in/directrt/";
//         url = `http://qbase1.vbiz.in/directrt/gettickers?loginid=${loginId}&product=${product}&accesstoken=${access_token}`;
//         axios.get(url).then(function (res) {
//             if (!res.status == 200) {
//                 console.log('Error occured getting tickers - response status code not 200', res.status)
//                 return
//             } else {
//                 if (res.data.includes('Invalid session. Relogin to continue')) {
//                     console.log('Error occured downloading tickers[invalid session]: ', res.data)
//                     return
//                 }
//                 if (res.data.includes('Invalid access token')) {
//                     console.log('Error occured downloading tickers[invalid access token]: ', res.data)
//                     return
//                 }
//             }

//             //save the content (tickers) to file
//             fs.writeFile('tickers.txt', res.data, function (err) {
//                 if (err) {
//                     console.log(`Error writing the downloaded tickers to file: ${err} - no websocket connection will be made.`);
//                     return
//                 } else {
//                     console.log('successfully written the tickers to file.');
//                 }
//             });
//         })
//     }

//     function read_tickers_from_file() {
//         fs.readFile('tickers.txt', function (err, data) {
//             if (err) {
//                 console.log(`Error reading tickers from file tickers.txt: ${err} - no websocket connection will be made`);
//                 return
//             } else {
//                 console.log('tickers read from file successful');
//             }
//             var tickers = data.toString().split(',');
//         })
//     }

//     async function main() {
//         loginId = 'DC-UDAY8511';
//         product = 'DIRECTRTLITE';
//         apikey = '4A771C49C9534D8CAD3F';

//         const authEndPoint = `http://s3.vbiz.in/directrt/gettoken?loginid=${loginId}&product=${product}&apikey=${apikey}`
//         console.log("authEndPoint", authEndPoint);
//         axios
//             .get(authEndPoint)
//             .then(function (res) {
//                 console.log(`statusCode----: ${res.status}`)

//                 if (res.status == 200) {

//                     console.log("Response : " + JSON.stringify(res.data));

//                     if (res.data.hasOwnProperty('Status') == false) {
//                         console.log('authentication status not returned in payload. exiting')
//                         return
//                     } else {
//                     }

//                     if (res.data.hasOwnProperty('AccessToken') == false) {
//                         console.log('access token not returned in payload. exiting')
//                         return
//                     }

//                     var max_symbol = res.data['MaxSymbol']
//                     var access_token = res.data['AccessToken']
//                     var is_authenticated = res.data['Status']
//                     if (is_authenticated == false) {
//                         console.log('authentication NOT successful,exiting')
//                         return
//                     }
//                     console.log('access token: ', access_token)
//                     console.log('CSV Headerrs: ', res.data["Message"]);

//                     console.log('connecting to websocket...')
//                     var wsEndPoint = `116.202.165.216:992/directrt/?loginid=${loginId}&accesstoken=${access_token}&product=${product}`
//                     const socketClusterClient = require('socketcluster-client')
//                     socket = socketClusterClient.create({
//                         hostname: wsEndPoint,
//                         path: '',
//                         port: 80
//                     });
//                     var myInterval = setInterval(function () {
//                         console.log('websocket connection state: ', socket.state);
//                         if (socket.state == 'open') {
//                             console.log('websocket connection is open')
//                             clearInterval(myInterval);
//                             let a = 'https:qbase1.vbiz.in/directrt/gethistorical?loginid=DC-UDAY8511&product=DIRECTRTLITE&accesstoken=3409aa91f848445784b42820dbaa4b22&inst=STOCK&tradedate=03JAN2024&expiry=&symbol=INFY'     // ye historical data 
//                             // subscribe_to_channel(socket, 'NSE_STOCK_INFY.json')   /// live data 
//                             subscribe_to_channel(socket, 'NSE_FUTIDX_NIFTY_27OCT2022.json')

//                         } else if (socket.state == 'closed') {
//                             console.log(socket);
//                             console.log('websocket connection is closed. exiting');
//                             clearInterval(myInterval);
//                             // socket.disconnect();
//                             return
//                         }
//                     }, 1000)

//                 } else {
//                     console.log(`server-side error occurred when getting access token,status code returned was ${res.status}\r\nResponse : ${json.stringify(res)}`);
//                     return
//                 }
//             })
//             .catch(error => {
//                 console.error(`Exception occured: ${error}`);
//                 return
//             })
//     }
//     /* 
//     call main function, which will authenticate,download tickers and subscribe to the channels(demo mode).
//     comment out the code that subscribes to channels in main function. the main function will therefore only make the websocket connection only
//      you can then subscribe to channels you want, by calling the subscribe function above
//     to unsubscribe from a channel, call the unsubscribe function
//     to close the websocket connection, call the disconnect function above. 
//     */

//     var socket
//     var fs = require('fs');
//     // const axios = require('axios')
//     require('dotenv').config()

//     //load credentials from .env file
//     // loginId = process.env.loginId
//     // product = process.env.product
//     // apikey = process.env.apikey
//     // loginId = 'DC-UDAY8511';
//     // product = 'DIRECTRTLITE';
//     // apikey = '4A771C49C9534D8CAD3F';

//     //

//     main()
// })
/// end third party code 




//// my function 
async function savePerformanceData1(loginId, accessToken, inst, product, tradeDate, symbol, companyId) {
    try {
        const apiData = await fetchDataFromApi(loginId, accessToken, product, inst, tradeDate, symbol);

        // console.log('API Data:------------------', apiData);
        const company = await Company.findById(companyId);

        const performanceInstance = {
            history: apiData.map(item => {
                const dateTimeString = `${item.Date.slice(0, 4)}-${item.Date.slice(4, 6)}-${item.Date.slice(6)}`;
                console.log('dateTimeString', dateTimeString);

                const timeString = `${item.Time.slice(0, 2)}:${item.Time.slice(2)}`;
                console.log('timeString', timeString);

                return {
                    date: dateTimeString,
                    time: timeString,
                    Volume: Number(item.Volume),
                    PreviousClose: Number(item.Close),
                    Open: Number(item.Open),
                    TodayLow: Number(item.Low),
                    TodayHigh: Number(item.High),
                };
            }),
        };



        company.overView.performance = performanceInstance;

        await company.save();
        console.log('Performance data saved successfully.');
    } catch (error) {
        console.error('Error saving performance data:', error);
    }
}

// async function fetchDataFromApi(loginId, accessToken, product, inst, tradeDate, symbol) {
//     const apiUrl = `https://qbase1.vbiz.in/directrt/gethistorical?loginid=${loginId}&product=${product}&accesstoken=${accessToken}&inst=${inst}&tradedate=${tradeDate}&expiry=&symbol=${symbol}`;

//     try {
//         const response = await axios.get(apiUrl);
//         const parsedData = parse(response.data, { header: true, skipEmptyLines: true }).data;
//         return parsedData;
//     } catch (error) {
//         console.error('Error fetching data from API:', error);
//         throw error;
//     }
// }

async function savePerformanceData2(loginId, accessToken, inst, product, tradeDate, symbol, companyId) {
    try {
        const apiData = await fetchDataFromApi(loginId, accessToken, product, inst, tradeDate, symbol);

        const company = await Company.findById(companyId);

        apiData.forEach(item => {
            const dateTimeString = `${item.Date.slice(0, 4)}-${item.Date.slice(4, 6)}-${item.Date.slice(6)}`;
            const dateValue = new Date(dateTimeString);
            const timeString = `${item.Time.slice(0, 2)}:${item.Time.slice(2)}`;

            if (!Array.isArray(company.overView.performance)) {
                company.overView.performance = [];
            }

            const existingPerformanceIndex = company.overView.performance.findIndex(performance => performance.date && performance.date.getTime() === dateValue.getTime());

            if (existingPerformanceIndex !== -1) {
                const existingTimeIndex = company.overView.performance[existingPerformanceIndex].details.findIndex(detail => detail.time === timeString);

                if (existingTimeIndex !== -1) {
                    company.overView.performance[existingPerformanceIndex].details[existingTimeIndex] = {
                        time: timeString,
                        Volume: Number(item.Volume),
                        PreviousClose: Number(item.Close),
                        Open: Number(item.Open),
                        TodayLow: Number(item.Low),
                        TodayHigh: Number(item.High),
                    };
                } else {
                    company.overView.performance[existingPerformanceIndex].details.push({
                        time: timeString,
                        Volume: Number(item.Volume),
                        PreviousClose: Number(item.Close),
                        Open: Number(item.Open),
                        TodayLow: Number(item.Low),
                        TodayHigh: Number(item.High),
                    });
                }
            } else {
                company.overView.performance.push({
                    date: dateValue,
                    details: [{
                        time: timeString,
                        Volume: Number(item.Volume),
                        PreviousClose: Number(item.Close),
                        Open: Number(item.Open),
                        TodayLow: Number(item.Low),
                        TodayHigh: Number(item.High),
                    }],
                });
            }
        });

        await company.save();
        console.log('Performance data saved successfully.');
    } catch (error) {
        console.error('Error saving performance data:', error);
    }
}

// async function savePerformanceData(loginId, accessToken, inst, product, tradeDate, symbol, companyId) {
//     try {
//         const apiData = await fetchDataFromApi(loginId, accessToken, product, inst, tradeDate, symbol);

//         let company = await Company.findById(companyId);
//         console.log('Company found:', companyId);

//         if (!company) {
//             console.error('Company not found:', companyId);
//             return;
//         }

//         apiData.forEach(item => {
//             const dateTimeString = `${item.Date.slice(0, 4)}-${item.Date.slice(4, 6)}-${item.Date.slice(6)}`;
//             const dateValue = new Date(dateTimeString);
//             const timeString = `${item.Time.slice(0, 2)}:${item.Time.slice(2)}`;

//             if (!Array.isArray(company.overView.performance)) {
//                 company.overView.performance = [];
//             }

//             const existingPerformanceIndex = company.overView.performance.findIndex(performance => performance.date && performance.date.getTime() === dateValue.getTime());

//             if (existingPerformanceIndex !== -1) {
//                 const existingTimeIndex = company.overView.performance[existingPerformanceIndex].details.findIndex(detail => detail.time === timeString);

//                 if (existingTimeIndex !== -1) {
//                     company.overView.performance[existingPerformanceIndex].details[existingTimeIndex] = {
//                         time: timeString,
//                         Volume: Number(item.Volume),
//                         PreviousClose: Number(item.Close),
//                         Open: Number(item.Open),
//                         TodayLow: Number(item.Low),
//                         TodayHigh: Number(item.High),
//                     };
//                 } else {
//                     company.overView.performance[existingPerformanceIndex].details.push({
//                         time: timeString,
//                         Volume: Number(item.Volume),
//                         PreviousClose: Number(item.Close),
//                         Open: Number(item.Open),
//                         TodayLow: Number(item.Low),
//                         TodayHigh: Number(item.High),
//                     });
//                 }
//             } else {
//                 company.overView.performance.push({
//                     date: dateValue,
//                     details: [{
//                         time: timeString,
//                         Volume: Number(item.Volume),
//                         PreviousClose: Number(item.Close),
//                         Open: Number(item.Open),
//                         TodayLow: Number(item.Low),
//                         TodayHigh: Number(item.High),
//                     }],
//                 });
//             }
//         });

//         await company.save();
//         console.log('Performance data saved successfully.');
//     } catch (error) {
//         console.error('Error saving performance data:', error);
//     }
// }



// const loginId = 'DC-UDAY8511';
// const product = 'DIRECTRTLITE';
// const apikey = '4A771C49C9534D8CAD3F';

// axios
//     .get(`http://s3.vbiz.in/directrt/gettoken?loginid=${loginId}&product=${product}&apikey=${apikey}`)
//     .then(async function (res) {
//         console.log(`statusCode: ${res.status}`);

//         if (res.status === 200 && res.data.AccessToken) {
//             const accessToken = res.data.AccessToken;
//             console.log("Response : " + JSON.stringify(res.data));

//             console.log('Access Token:', accessToken);

//             const inst = 'FUTIDX';
//             const tradeDate = '02JAN2024';
//             const symbol = 'NIFTY';
//             const companyId = companyId;

//             await savePerformanceData(loginId, accessToken, inst, product, tradeDate, symbol, companyId);
//         } else {
//             console.error('Error getting access token:', res.status, res.data);
//         }
//     })
//     .catch(function (error) {
//         console.error('Error getting access token:', error.message);
//     });





const socketClusterClient = require('socketcluster-client');

let socket;

// function handle_message(channel, message) {
//     console.log(`message: ${message} - received from channel ${channel}`);
// }

async function handle_message(channel, message) {
    let cleanedChannel = channel.replace('SUBSCRIPTION-', '');

    let obj = {
        channel: cleanedChannel,
        message: JSON.parse(message)
    }
    console.log(obj);
    let saved = await LiveData.create(obj);
    if (saved) {
        console.log('Data saved to database')
    } else {
        console.error('Error saving data to database:')
    }
    console.log('After saving to database')
}

function subscribe_to_channel(socket, ticker) {
    (async () => {
        // const channel_name = `${ticker}`;
        const channel_name = `${ticker}.json`;

        console.log(`subscribing to channel ${channel_name}`);
        let myChannel = socket.subscribe(channel_name);

        await myChannel.listener('subscribe').once();

        (async () => {
            for await (let data of myChannel) {
                handle_message("SUBSCRIPTION-" + channel_name, data);
            }
        })();
    })();
}

exports.main = async function main(dynamicTicker) {
    const loginId = 'DC-UDAY8511';
    const product = 'DIRECTRTLITE';
    const apikey = '4A771C49C9534D8CAD3F';

    const authEndPoint = `http://s3.vbiz.in/directrt/gettoken?loginid=${loginId}&product=${product}&apikey=${apikey}`;

    axios
        .get(authEndPoint)
        .then(function (res) {
            console.log(`statusCode: ${res.status}`);

            if (res.status === 200) {
                console.log("Response: " + JSON.stringify(res.data));

                if (!res.data.hasOwnProperty('Status')) {
                    console.log('Authentication status not returned in payload. Exiting.');
                    return;
                }

                if (!res.data.hasOwnProperty('AccessToken')) {
                    console.log('Access token not returned in payload. Exiting.');
                    return;
                }

                const access_token = res.data['AccessToken'];
                const is_authenticated = res.data['Status'];
                if (!is_authenticated) {
                    console.log('Authentication NOT successful. Exiting.');
                    return;
                }

                console.log('Access token:', access_token);
                console.log('CSV Headers:', res.data['Message']);

                console.log('Connecting to websocket...');
                const wsEndPoint = `116.202.165.216:992/directrt/?loginid=${loginId}&accesstoken=${access_token}&product=${product}`;

                socket = socketClusterClient.create({
                    hostname: wsEndPoint,
                    path: '',
                    port: 80
                });

                var myInterval = setInterval(async () => {
                    console.log('Websocket connection state:', socket.state);

                    if (socket.state === 'open') {
                        console.log('Websocket connection is open');
                        clearInterval(myInterval);

                        // subscribe_to_channel(socket, 'NSE_STOCK_INFY.json');
                        subscribe_to_channel(socket, dynamicTicker);
                    } else if (socket.state === 'closed') {
                        console.log('Websocket connection is closed. Exiting.');
                        clearInterval(myInterval);
                        return;
                    }
                }, 1000);
            } else {
                console.log(`Server-side error occurred when getting access token, status code returned was ${res.status}\r\nResponse: ${JSON.stringify(res)}`);
                return;
            }
        })
        .catch(error => {
            console.error(`Exception occurred: ${error}`);
            return;
        });
}

// main(dynamicTicker);

exports.getLiveDataForCompany = async (req, res) => {
    const uniqueName = req.params.uniqueName;
    const queryDate = req.query.queryDate;

    try {
        let query = { 'message.UniqueName': uniqueName };

        if (queryDate) {
            const startDate = moment(queryDate).startOf('day');
            const endDate = moment(queryDate).endOf('day');

            query['message.LastTradedTime'] = {
                $gte: startDate.toDate(),
                $lte: endDate.toDate(),
            };
        }

        const liveData = await LiveData.find(query);

        if (liveData && liveData.length > 0) {
            return res.status(200).json({ status: 200, data: liveData });
        } else {
            return res.status(404).json({ status: 404, message: 'Live data not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal Server Error' });
    }
};

