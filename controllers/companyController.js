const Company = require('../models/companyModel');

const { validateCompany, updateValidateCompany, performanceValidation, createFundamentalsSchema } = require('../validation/companyValidation');




exports.createCompany = async (req, res) => {
    try {
        const { error } = validateCompany.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        if (!req.file) {
            return res.status(400).json({ error: "Image file is required" });
        }
        const { name, symbol, description, industry, headquarters, website, price } = req.body;

        const existingCompany = await Company.findOne({ $or: [{ name }, { symbol }] });

        if (existingCompany) {
            return res.status(400).json({ status: 400, error: 'Company name or symbol already exists' });
        }

        const company = new Company({
            name,
            symbol,
            description,
            industry,
            headquarters,
            website,
            price,
            image: req.file.path,
        });
        await company.save();
        res.status(201).json({ status: 201, message: "Company created successfully", data: company });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};


exports.getAllCompanies = async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json({ status: 200, message: "Get All Company Sucessfully", data: company });
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


exports.updateCompanyById = async (req, res) => {
    try {
        const { error } = updateValidateCompany.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { name, symbol, description, industry, headquarters, website, price } = req.body;

        const companyId = req.params.id;

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }

        if (name && name !== company.name) {
            const existingCompanyByName = await Company.findOne({ name });
            if (existingCompanyByName) {
                return res.status(400).json({ status: 400, error: 'Company name already exists' });
            }
        }

        if (symbol && symbol !== company.symbol) {
            const existingCompanyBySymbol = await Company.findOne({ symbol });
            if (existingCompanyBySymbol) {
                return res.status(400).json({ status: 400, error: 'Company symbol already exists' });
            }
        }

        company.name = name;
        company.symbol = symbol;
        company.description = description;
        company.industry = industry;
        company.headquarters = headquarters;
        company.website = website;
        company.price = price;
        company.image = req.file.path;

        const updatedCompany = await company.save();

        res.status(200).json({ status: 200, message: "Company Updated Successfully", data: updatedCompany });
    } catch (error) {
        res.status(500).json({ error: 'Server error', details: error.message });
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


exports.createPerformance = async (req, res) => {
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
        const historicalData = performance.history;

        if (!historicalData || historicalData.length === 0) {
            return res.status(404).json({ message: 'No historical data available' });
        }

        const latestData = historicalData[0];

        const marketCap = company.overView.fundamentals[0]?.marketCap;

        const dailyStats = {
            DailyOpen: latestData.Open,
            DailyHigh: Math.max(latestData.Open, latestData.TodayHigh),
            DailyLow: Math.min(latestData.Open, latestData.TodayLow),
            DailyClose: latestData.PreviousClose,
            DailyVolume: latestData.Volume,
            MarketCap: marketCap,
        };

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
        const historicalData = performance.history;

        if (!historicalData || historicalData.length === 0) {
            return res.status(404).json({ message: 'No historical data available' });
        }

        const dataForDate = historicalData.find(entry => entry.date.getTime() === dateParam.getTime());

        if (!dataForDate) {
            return res.status(404).json({ message: 'Data for the specified date not found' });
        }

        const dailyStats = {
            DailyOpen: dataForDate.Open,
            DailyHigh: Math.max(dataForDate.Open, dataForDate.TodayHigh),
            DailyLow: Math.min(dataForDate.Open, dataForDate.TodayLow),
            DailyClose: dataForDate.PreviousClose,
            DailyVolume: dataForDate.Volume,
            MarketCap: company.overView.fundamentals[0]?.marketCap,
        };

        return res.status(200).json({
            message: 'Daily statistics retrieved successfully',
            data: dailyStats,
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
        const historicalData = performance.history;

        if (!historicalData || historicalData.length === 0) {
            return res.status(404).json({ message: 'No historical data available' });
        }

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const dataForDate = historicalData.find(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getDate() === day && entryDate.getFullYear() === currentYear;
        });

        if (!dataForDate) {
            return res.status(404).json({ message: 'Data for the specified date not found' });
        }

        const dailyStats = {
            DailyOpen: dataForDate.Open,
            DailyHigh: Math.max(dataForDate.Open, dataForDate.TodayHigh),
            DailyLow: Math.min(dataForDate.Open, dataForDate.TodayLow),
            DailyClose: dataForDate.PreviousClose,
            DailyVolume: dataForDate.Volume,
            MarketCap: company.overView.fundamentals[0]?.marketCap,
        };

        return res.status(200).json({
            message: 'Daily statistics retrieved successfully',
            data: dailyStats,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};




