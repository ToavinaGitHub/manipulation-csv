const express = require('express');
const router = express.Router();
const FileUploadMiddleware = require('../middlewares/FileUploadMiddleware');
const CsvController = require('../controller/CsvController');

const fileUploadMiddleware = new FileUploadMiddleware();

router.post('/upload', fileUploadMiddleware.getMiddleware().array('file', 10), CsvController.handleCsvUpload);

module.exports = router;
