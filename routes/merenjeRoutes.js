const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const merenjeController = require('../controllers/merenjeController');

router.use(authenticateToken);

router.post('/merenje', merenjeController.dodajMerenje);

router.get('/merenja/:athlete_id', merenjeController.getMerenja);

router.delete('/merenje/:id', merenjeController.obrisiMerenje);

router.put('/merenje/:id', merenjeController.izmeniMerenje);

router.get('/merenje/:athlete_id/:datum', merenjeController.getMerenjeZaDatum);

module.exports = router;

