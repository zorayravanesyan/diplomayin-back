/**
 * @typedef {'male' | 'female'} DietGender
 *
 * @typedef {Object} MealRecommendations
 * @property {string} breakfast
 * @property {string} lunch
 * @property {string} dinner
 *
 * @typedef {Object} DietRecommendation
 * @property {number} id
 * @property {DietGender} gender
 * @property {number} min_age
 * @property {number} max_age - Use -1 for open-ended age ranges.
 * @property {number} min_bmi
 * @property {number} max_bmi - Use -1 for open-ended BMI ranges.
 * @property {MealRecommendations} recommendations
 * @property {string[]} key_nutrients
 */

/** @type {ReadonlyArray<DietRecommendation>} */
const dietRecommendations = Object.freeze([
  {
    id: 1,
    gender: 'male',
    min_age: 18,
    max_age: 30,
    min_bmi: 0,
    max_bmi: 18.4,
    recommendations: {
      breakfast: 'Վարսակի շիլա կաթով, բանանով և ընկույզով',
      lunch: 'Հավի կրծքամիս բրնձով, ավոկադոյով և բանջարեղենային աղցանով',
      dinner: 'Թխված ձուկ քինոայով և շոգեխաշած բրոկոլիով',
    },
    key_nutrients: ['Սպիտակուց', 'Բարդ ածխաջրեր', 'Օգտակար ճարպեր'],
  },
  {
    id: 2,
    gender: 'female',
    min_age: 18,
    max_age: 30,
    min_bmi: 0,
    max_bmi: 18.4,
    recommendations: {
      breakfast: 'Հունական յոգուրտ մեղրով, հատապտուղներով և նուշով',
      lunch: 'Հնդկաձավար հնդկահավի մսով և թարմ կանաչ աղցանով',
      dinner: 'Ոսպով ապուր ամբողջահատիկ հացով և կանաչիով',
    },
    key_nutrients: ['Երկաթ', 'Կալցիում', 'Սպիտակուց'],
  },
  {
    id: 3,
    gender: 'male',
    min_age: 18,
    max_age: 30,
    min_bmi: 18.5,
    max_bmi: 24.9,
    recommendations: {
      breakfast: 'Ձվածեղ բանջարեղենով և ամբողջահատիկ հացով',
      lunch: 'Տավարի անյուղ միս բուլղուրով և լոլիկի աղցանով',
      dinner: 'Կաթնաշոռ կանաչիով, վարունգով և ընկույզով',
    },
    key_nutrients: ['Սպիտակուց', 'Ցինկ', 'Մագնեզիում'],
  },
  {
    id: 4,
    gender: 'female',
    min_age: 18,
    max_age: 30,
    min_bmi: 18.5,
    max_bmi: 24.9,
    recommendations: {
      breakfast: 'Չիայի պուդինգ կաթով, խնձորով և դարչինով',
      lunch: 'Հավի աղցան ավոկադոյով, լոբով և կանաչիով',
      dinner: 'Թխված սաղմոն բանջարեղենով և քինոայով',
    },
    key_nutrients: ['Օմեգա-3', 'Կալցիում', 'Բջջանյութ'],
  },
  {
    id: 5,
    gender: 'male',
    min_age: 18,
    max_age: 30,
    min_bmi: 25,
    max_bmi: -1,
    recommendations: {
      breakfast: 'Սպիտակուցային ձվածեղ սպանախով և լոլիկով',
      lunch: 'Հավի կրծքամիս մեծ բանջարեղենային աղցանով և հնդկաձավարով',
      dinner: 'Թունայով աղցան վարունգով, կանաչիով և ձիթապտղի յուղով',
    },
    key_nutrients: ['Սպիտակուց', 'Բջջանյութ', 'Վիտամին C'],
  },
  {
    id: 6,
    gender: 'female',
    min_age: 18,
    max_age: 30,
    min_bmi: 25,
    max_bmi: -1,
    recommendations: {
      breakfast: 'Կաթնաշոռ հատապտուղներով և կտավատի սերմերով',
      lunch: 'Ոսպով աղցան հավի մսով, կանաչիով և լիմոնի սոուսով',
      dinner: 'Շոգեխաշած բանջարեղեն ձկով և կանաչ աղցանով',
    },
    key_nutrients: ['Բջջանյութ', 'Կալցիում', 'Սպիտակուց'],
  },
  {
    id: 7,
    gender: 'male',
    min_age: 31,
    max_age: 44,
    min_bmi: 0,
    max_bmi: 18.4,
    recommendations: {
      breakfast: 'Հնդկաձավարի շիլա կաթով, չրերով և ընկույզով',
      lunch: 'Տավարի մսով ռագու կարտոֆիլով և բանջարեղենով',
      dinner: 'Հավի ապուր լոբազգիներով և ամբողջահատիկ հացով',
    },
    key_nutrients: ['Երկաթ', 'Սպիտակուց', 'Բարդ ածխաջրեր'],
  },
  {
    id: 8,
    gender: 'female',
    min_age: 31,
    max_age: 44,
    min_bmi: 0,
    max_bmi: 18.4,
    recommendations: {
      breakfast: 'Վարսակ կաթով, մեղրով, ընկույզով և բանանով',
      lunch: 'Հնդկահավի կոտլետ բրնձով և գազարի աղցանով',
      dinner: 'Սաղմոն քաղցր կարտոֆիլով և կանաչ լոբով',
    },
    key_nutrients: ['Կալցիում', 'Օգտակար ճարպեր', 'Երկաթ'],
  },
  {
    id: 9,
    gender: 'male',
    min_age: 31,
    max_age: 44,
    min_bmi: 18.5,
    max_bmi: 24.9,
    recommendations: {
      breakfast: 'Ամբողջահատիկ հաց ավոկադոյով և խաշած ձվով',
      lunch: 'Խորոված հավ բուլղուրով և բանջարեղենային աղցանով',
      dinner: 'Լոբով աղցան թարմ կանաչիով և մածունով',
    },
    key_nutrients: ['Բջջանյութ', 'Սպիտակուց', 'Կալիում'],
  },
  {
    id: 10,
    gender: 'female',
    min_age: 31,
    max_age: 44,
    min_bmi: 18.5,
    max_bmi: 24.9,
    recommendations: {
      breakfast: 'Կաթնաշոռ նռով, նուշով և ամբողջահատիկ կրեկերով',
      lunch: 'Ձկով աղցան քինոայով, սպանախով և լոլիկով',
      dinner: 'Բանջարեղենային ապուր հավի մսով և կանաչիով',
    },
    key_nutrients: ['Կալցիում', 'Օմեգա-3', 'Ֆոլաթթու'],
  },
  {
    id: 11,
    gender: 'male',
    min_age: 31,
    max_age: 44,
    min_bmi: 25,
    max_bmi: -1,
    recommendations: {
      breakfast: 'Ձվածեղ սնկով, սպանախով և լոլիկով',
      lunch: 'Հնդկահավի միս կանաչ աղցանով և փոքր չափաբաժին բրնձով',
      dinner: 'Թխված ձուկ շոգեխաշած բանջարեղենով',
    },
    key_nutrients: ['Սպիտակուց', 'Բջջանյութ', 'Վիտամին D'],
  },
  {
    id: 12,
    gender: 'female',
    min_age: 31,
    max_age: 44,
    min_bmi: 25,
    max_bmi: -1,
    recommendations: {
      breakfast: 'Յոգուրտ չիայի սերմերով, հատապտուղներով և դարչինով',
      lunch: 'Հավի աղցան լոբով, կանաչիով և ձիթապտղի յուղով',
      dinner: 'Թխված սմբուկ կաթնաշոռով և թարմ աղցանով',
    },
    key_nutrients: ['Բջջանյութ', 'Կալցիում', 'Մագնեզիում'],
  },
  {
    id: 13,
    gender: 'male',
    min_age: 45,
    max_age: -1,
    min_bmi: 0,
    max_bmi: 18.4,
    recommendations: {
      breakfast: 'Վարսակի շիլա կաթով, մեղրով և ընկույզով',
      lunch: 'Տավարի մսով ռագու բանջարեղենով և հնդկաձավարով',
      dinner: 'Թխված սաղմոն քինոայով և շոգեխաշած կանաչիով',
    },
    key_nutrients: ['Կալցիում', 'Օգտակար ճարպեր', 'Բարդ ածխաջրեր'],
  },
  {
    id: 14,
    gender: 'female',
    min_age: 45,
    max_age: -1,
    min_bmi: 0,
    max_bmi: 18.4,
    recommendations: {
      breakfast: 'Հնդկաձավարի շիլա կաթով, չամիչով և նուշով',
      lunch: 'Հավի միս բանջարեղենային ռագուով և բրնձով',
      dinner: 'Կաթնաշոռ կանաչիով, ընկույզով և ամբողջահատիկ հացով',
    },
    key_nutrients: ['Կալցիում', 'Երկաթ', 'Սպիտակուց'],
  },
  {
    id: 15,
    gender: 'male',
    min_age: 45,
    max_age: -1,
    min_bmi: 18.5,
    max_bmi: 24.9,
    recommendations: {
      breakfast: 'Խաշած ձու, ամբողջահատիկ հաց և լոլիկի աղցան',
      lunch: 'Ձուկ հնդկաձավարով և թարմ բանջարեղենով',
      dinner: 'Ոսպով ապուր կանաչիով և մածունով',
    },
    key_nutrients: ['Օմեգա-3', 'Բջջանյութ', 'Վիտամին B12'],
  },
  {
    id: 16,
    gender: 'female',
    min_age: 45,
    max_age: -1,
    min_bmi: 18.5,
    max_bmi: 24.9,
    recommendations: {
      breakfast: 'Յոգուրտ վարսակով, հատապտուղներով և կտավատի սերմերով',
      lunch: 'Հավի կրծքամիս քինոայով և կանաչ աղցանով',
      dinner: 'Թխված ձուկ բրոկոլիով և գազարով',
    },
    key_nutrients: ['Կալցիում', 'Վիտամին D', 'Օմեգա-3'],
  },
  {
    id: 17,
    gender: 'male',
    min_age: 45,
    max_age: -1,
    min_bmi: 25,
    max_bmi: -1,
    recommendations: {
      breakfast: 'Սպիտակուցային ձվածեղ կանաչիով և վարունգով',
      lunch: 'Հնդկահավի միս մեծ բանջարեղենային աղցանով',
      dinner: 'Շոգեխաշած ձուկ ծաղկակաղամբով և սպանախով',
    },
    key_nutrients: ['Սպիտակուց', 'Բջջանյութ', 'Կալիում'],
  },
  {
    id: 18,
    gender: 'female',
    min_age: 45,
    max_age: -1,
    min_bmi: 25,
    max_bmi: -1,
    recommendations: {
      breakfast: 'Կաթնաշոռ հատապտուղներով և դարչինով',
      lunch: 'Լոբով ու հավի մսով աղցան կանաչիով',
      dinner: 'Բանջարեղենային ապուր ձկով և ամբողջահատիկ հացով',
    },
    key_nutrients: ['Կալցիում', 'Բջջանյութ', 'Սպիտակուց'],
  },
]);

module.exports = {
  dietRecommendations,
};
