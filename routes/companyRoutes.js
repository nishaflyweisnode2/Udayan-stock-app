const express = require('express');
const router = express.Router();

const {
    createCompany,
    getAllCompanies,
    getCompanyById,
    updateCompany,
    deleteCompanyById,
    addNewsToCompany,
    getNewsForCompany,
    getAllNews,
    createEventForCompany,
    getCompanyEvents,
    createPerformance,
    getPerformanceByCompanyId,
    createFundamentals,
    getFundamentalsByCompanyId,
    getDailyStats,
    getDailyStatsByDate,
    getDailyGraphStatsByDate,
    getDailyStatsByDay,
    main,
    getLiveDataForCompany
} = require('../controllers/companyController');

const { validateCompany, performanceValidation, createFundamentalsSchema, validateDailyStats } = require('../validation/companyValidation');

const { companyImage } = require('../middleware/imageUpload');

const authJwt = require("../middleware/auth");



// Companies routes
router.post('/api/companies', [authJwt.verifyToken], companyImage.single('image'), createCompany);
router.get('/api/companies', [authJwt.verifyToken], getAllCompanies);
router.get('/api/companies/:id', [authJwt.verifyToken], getCompanyById);
router.put('/api/companies/:id', [authJwt.verifyToken], companyImage.single('image'), updateCompany);
router.delete('/api/companies/:id', [authJwt.verifyToken], deleteCompanyById);



// News routes
router.post('/api/companies/:id/news', [authJwt.verifyToken], addNewsToCompany);
router.get('/api/companies/:id/news', [authJwt.verifyToken], getNewsForCompany);
router.get('/api/news', [authJwt.verifyToken], getAllNews);



// Event Routes
router.post('/api/companies/:companyId/events', [authJwt.verifyToken], createEventForCompany);
router.get('/api/:companyId/events', [authJwt.verifyToken], getCompanyEvents);



// Create performance record for a specific company
router.post('/api/:id/performance', [authJwt.verifyToken], /*performanceValidation,*/ createPerformance);
router.get('/api/companies/:companyId/performance', [authJwt.verifyToken], getPerformanceByCompanyId);



// Create fundamentals for a company
router.post('/api/:companyId/fundamentals', [authJwt.verifyToken], createFundamentalsSchema, createFundamentals);
router.get('/api/:companyId/fundamentals', [authJwt.verifyToken], getFundamentalsByCompanyId);


//Daliy updates
router.get('/api/companies/:companyId/daily-stats', [authJwt.verifyToken], getDailyStats);
router.get('/api/companies/:companyId/daily-statsBy-date/:date', [authJwt.verifyToken], getDailyStatsByDate);
router.get('/api/companies/:companyId/graph/daily-statsBy-date/:date', [authJwt.verifyToken], getDailyGraphStatsByDate);
router.get('/api/companies/:companyId/daily-statsBy/:day', [authJwt.verifyToken], getDailyStatsByDay);

router.post('/api/companies/start-live-data/get', (req, res) => {
    const dynamicTicker = req.body.dynamicTicker;

    if (!dynamicTicker) {
        return res.status(400).json({ error: 'Dynamic ticker is required.' });
    }

    main(dynamicTicker);

    return res.status(200).json({ message: `Subscribed to ${dynamicTicker}.` });
});

router.get('/api/companies/livedata/:uniqueName', [authJwt.verifyToken], getLiveDataForCompany)


module.exports = router;
