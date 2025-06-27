const express = require('express');
const router = express.Router();
const swimmerController = require('../../controllers/swimmerController');

router.use((req, res, next) => {
  req.resourceType = 'swimmers';
  next();
});

router.post('/', swimmerController.createSwimmer);
router.get('/', swimmerController.getSwimmers);
router.get('/:id', swimmerController.getSwimmerById);
router.put('/:id', swimmerController.updateSwimmer);
router.delete('/:id', swimmerController.deleteSwimmer);

router.get('/club/:clubId', swimmerController.getSwimmersByClub);
router.get('/age-range/:minAge/:maxAge', swimmerController.getSwimmersByAgeRange);
router.get('/:id/delete-impact', swimmerController.getDeleteImpact);

module.exports = router;
