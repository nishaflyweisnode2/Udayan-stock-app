const Company = require('../models/companyModel');
const axios = require('axios');
const { parse } = require('papaparse');
const cron = require('node-cron');


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


exports.getDailyStats1 = async (req, res) => {
    try {
        const companyId = req.params.companyId;

        const company = await Company.findById(companyId);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        const performance = company.overView.performance;
        console.log("performance", performance);

        const historicalData = performance.history;
        console.log("historicalData", historicalData);

        if (!historicalData || historicalData.length === 0) {
            return res.status(404).json({ message: 'No historical data available' });
        }

        const latestData = historicalData[0];
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

        return res.status(200).json({
            message: 'Daily statistics retrieved successfully',
            data: dailyStats,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
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

async function fetchDataFromApi(loginId, accessToken, product, inst, tradeDate, symbol) {
    const apiUrl = `https://qbase1.vbiz.in/directrt/gethistorical?loginid=${loginId}&product=${product}&accesstoken=${accessToken}&inst=${inst}&tradedate=${tradeDate}&expiry=&symbol=${symbol}`;

    try {
        const response = await axios.get(apiUrl);
        const parsedData = parse(response.data, { header: true, skipEmptyLines: true }).data;
        return parsedData;
    } catch (error) {
        console.error('Error fetching data from API:', error);
        throw error;
    }
}

async function savePerformanceData(loginId, accessToken, inst, product, tradeDate, symbol, companyId) {
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


const loginId = 'DC-UDAY8511';
const product = 'DIRECTRTLITE';
const apikey = '4A771C49C9534D8CAD3F';

axios
    .get(`http://s3.vbiz.in/directrt/gettoken?loginid=${loginId}&product=${product}&apikey=${apikey}`)
    .then(async function (res) {
        console.log(`statusCode: ${res.status}`);

        if (res.status === 200 && res.data.AccessToken) {
            const accessToken = res.data.AccessToken;
            console.log('Access Token:', accessToken);

            const inst = 'FUTIDX';
            const tradeDate = '02JAN2024';
            const symbol = 'NIFTY';
            const companyId = '6597cc826f20fc1fe52fc792';

            await savePerformanceData(loginId, accessToken, inst, product, tradeDate, symbol, companyId);
        } else {
            console.error('Error getting access token:', res.status, res.data);
        }
    })
    .catch(function (error) {
        console.error('Error getting access token:', error.message);
    });





