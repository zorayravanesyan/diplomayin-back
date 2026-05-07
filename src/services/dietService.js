const { dietRecommendations } = require('../data/dietRecommendations.js');
const { User, UserSettings } = require('../models/index.js');
const { AppError, NotFoundError, ValidationError } = require('../utils/errors.js');

const TOP_RECOMMENDATION_COUNT = 5;
const GENDER_MISMATCH_PENALTY = 1000;
const AGE_SCORE_WEIGHT = 10;
const MAX_DISTANCE_FOR_PERCENTAGE = 1000;
const VALID_GENDERS = new Set(['male', 'female']);

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateRecommendationShape(item) {
  const hasValidAgeRange = item?.max_age === -1 || item?.min_age <= item?.max_age;
  const hasValidBmiRange = item?.max_bmi === -1 || item?.min_bmi <= item?.max_bmi;

  return (
    item &&
    Number.isInteger(item.id) &&
    VALID_GENDERS.has(item.gender) &&
    Number.isInteger(item.min_age) &&
    Number.isInteger(item.max_age) &&
    isFiniteNumber(item.min_bmi) &&
    isFiniteNumber(item.max_bmi) &&
    hasValidAgeRange &&
    hasValidBmiRange &&
    typeof item.recommendations?.breakfast === 'string' &&
    typeof item.recommendations?.lunch === 'string' &&
    typeof item.recommendations?.dinner === 'string' &&
    Array.isArray(item.key_nutrients) &&
    item.key_nutrients.every((nutrient) => typeof nutrient === 'string' && nutrient.trim().length > 0)
  );
}

function assertDietRecommendationsValid(items = dietRecommendations) {
  if (!Array.isArray(items)) {
    throw new AppError('INTERNAL_ERROR', 'Diet recommendations data must be an array');
  }

  const seenIds = new Set();
  for (const item of items) {
    if (!validateRecommendationShape(item)) {
      throw new AppError('INTERNAL_ERROR', `Invalid diet recommendation shape for id ${item?.id ?? 'unknown'}`);
    }
    if (seenIds.has(item.id)) {
      throw new AppError('INTERNAL_ERROR', `Duplicate diet recommendation id ${item.id}`);
    }
    seenIds.add(item.id);
  }
}

function normalizeGender(gender) {
  if (gender === 'MALE') return 'male';
  if (gender === 'FEMALE') return 'female';
  return null;
}

function toPositiveNumber(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function calculateBmi(weightKg, heightSm) {
  const weight = toPositiveNumber(weightKg);
  const heightCm = toPositiveNumber(heightSm);

  if (!weight || !heightCm) {
    throw new ValidationError('Weight and height are required for diet recommendations', [
      { field: 'settings.weight_kg', message: 'weight_kg is required and must be positive' },
      { field: 'settings.height_sm', message: 'height_sm is required and must be positive' },
    ]);
  }

  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(1));
}

function normalizeAge(age) {
  const numeric = Number(age);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

function distanceFromRange(value, min, max) {
  if (max === -1) {
    return value >= min ? 0 : min - value;
  }
  if (value < min) return min - value;
  if (value > max) return value - max;
  return 0;
}

function scoreRecommendation(item, userGender, bmi, age) {
  const genderScore = userGender && item.gender !== userGender ? GENDER_MISMATCH_PENALTY : 0;
  const bmiScore = distanceFromRange(bmi, item.min_bmi, item.max_bmi);
  const ageScore = age ? distanceFromRange(age, item.min_age, item.max_age) * AGE_SCORE_WEIGHT : 0;

  return genderScore + ageScore + bmiScore;
}

function calculateClosenessPercentage(score) {
  const boundedScore = Math.min(Math.max(score, 0), MAX_DISTANCE_FOR_PERCENTAGE);
  return Math.round(((MAX_DISTANCE_FOR_PERCENTAGE - boundedScore) / MAX_DISTANCE_FOR_PERCENTAGE) * 100);
}

async function getUserDietProfile(userId) {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'gender'],
    include: [
      {
        model: UserSettings,
        as: 'settings',
        required: false,
      },
    ],
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const plain = user.toJSON();
  const bmi = calculateBmi(plain.settings?.weight_kg, plain.settings?.height_sm);

  return {
    gender: normalizeGender(plain.gender),
    bmi,
    age: normalizeAge(plain.settings?.age),
  };
}

async function getTopDietRecommendationsForUser(userId, count = TOP_RECOMMENDATION_COUNT) {
  assertDietRecommendationsValid();
  const profile = await getUserDietProfile(userId);
  const limit = Math.min(count, dietRecommendations.length);

  const recommendations = [...dietRecommendations]
    .map((item) => ({
      item,
      score: scoreRecommendation(item, profile.gender, profile.bmi, profile.age),
    }))
    .sort((a, b) => a.score - b.score || a.item.id - b.item.id)
    .slice(0, limit)
    .map(({ item, score }) => ({
      ...item,
      closeness_percentage: calculateClosenessPercentage(score),
    }));

  return {
    bmi: profile.bmi,
    age: profile.age,
    data: recommendations,
  };
}

module.exports = {
  TOP_RECOMMENDATION_COUNT,
  assertDietRecommendationsValid,
  calculateBmi,
  calculateClosenessPercentage,
  getTopDietRecommendationsForUser,
};
