const express = require('express');
const { body } = require('express-validator');
const merenjeController = require('../controllers/merenjeController');

const router = express.Router();

router.post('/merenje', [
  body('athlete_id').isInt().withMessage('Athlete ID mora biti ceo broj'),
  body('datum_merenja').isDate().withMessage('Datum mora biti validan'),

  body('visina_cm').optional().isFloat({ min: 50 }).withMessage('Visina mora biti broj veći od 50 cm'),
  body('tezina_kg').optional().isFloat({ min: 15 }).withMessage('Težina mora biti broj veći od 15 kg'),

  body('obim_struka_cm').optional().isFloat({ min: 30 }),
  body('obim_kukova_cm').optional().isFloat({ min: 30 }),
  body('obim_grudi_cm').optional().isFloat({ min: 30 }),
  body('obim_nadlaktice_cm').optional().isFloat({ min: 10 }),
  body('obim_podlaktice_cm').optional().isFloat({ min: 10 }),
  body('obim_ramena_cm').optional().isFloat({ min: 30 }),
  body('obim_butine_cm').optional().isFloat({ min: 30 }),
  body('obim_vrata_cm').optional().isFloat({ min: 10 }),

  body('body_fat_percent').optional().isFloat({ min: 0, max: 100 }),
  body('lean_mass_kg').optional().isFloat({ min: 0 }),
  body('bmr').optional().isFloat({ min: 500 }),
  body('vo2_max').optional().isFloat({ min: 10 })
], merenjeController.dodajMerenje);

router.get('/merenja/:athlete_id', merenjeController.getMerenja);

router.delete('/merenje/:id', merenjeController.obrisiMerenje);

router.put('/merenje/:id', merenjeController.izmeniMerenje);

module.exports = router;

