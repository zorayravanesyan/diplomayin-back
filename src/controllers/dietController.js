const dietService = require('../services/dietService.js');

async function getRandomRecommendations(req, res, next) {
  try {
    const result = await dietService.getTopDietRecommendationsForUser(req.user.id);
    res.json({
      success: true,
      bmi: result.bmi,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRandomRecommendations,
};
