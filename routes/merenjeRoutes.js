const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const merenjeController = require('../controllers/merenjeController');

router.use(authenticateToken);

router.post('/', merenjeController.dodajMerenje);

router.get('/:athlete_id', merenjeController.getMerenja);

router.delete('/:id', merenjeController.obrisiMerenje);

router.put('/:id', merenjeController.izmeniMerenje);

router.get('/:athlete_id/:datum', merenjeController.getMerenjeZaDatum);

module.exports = router;

