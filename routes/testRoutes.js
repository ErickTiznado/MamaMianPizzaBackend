const express = require('express');
const router = express.Router();
const testController = require('../contollers/testController');

router.get('/DBprueba', testController.testConnection);


module.exports = router;