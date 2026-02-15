const express = require('express');
const router = express.Router();
const {
  getCookingSession,
  saveCookingSession,
  deleteCookingSession,
} = require('../controllers/cookingSessionController');

router.get('/:recipeId', getCookingSession);
router.post('/:recipeId', saveCookingSession);
router.delete('/:recipeId', deleteCookingSession);

module.exports = router;
