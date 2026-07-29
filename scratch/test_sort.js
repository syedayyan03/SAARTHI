const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const csvPath = path.join(__dirname, '..', 'data', 'market_demand.csv');
const locLower = "medchal, telangana";

const NEARBY_MARKET_MAPPING = {
  "medchal": "hyderabad",
  "malkajgiri": "hyderabad",
  "rangareddy": "hyderabad",
  "secunderabad": "hyderabad",
  "siddipet": "hyderabad",
  "medak": "hyderabad",
  "sangareddy": "hyderabad",
  "suryapet": "nalgonda",
  "miryalaguda": "nalgonda",
  "yadadri": "nalgonda",
  "bhongir": "nalgonda",
  "kothagudem": "khammam",
  "mahabubabad": "khammam",
  "bhadrachalam": "khammam",
  "karimnagar": "warangal",
  "jagtial": "warangal",
  "hanamkonda": "warangal",
  "peddapalli": "warangal",
  "mancherial": "warangal",
  "adilabad": "warangal",
  "nizamabad": "warangal",
  "kamareddy": "warangal",
  "mahabubnagar": "hyderabad",
  "wanaparthy": "hyderabad",
  "gadwal": "hyderabad"
};

let mappedNearestCity = "";
for (const [keyCity, targetCity] of Object.entries(NEARBY_MARKET_MAPPING)) {
  if (locLower.includes(keyCity)) {
    mappedNearestCity = targetCity;
    break;
  }
}
console.log("Mapped nearest city for 'medchal, telangana':", mappedNearestCity);

const results = [];
fs.createReadStream(csvPath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    let scored = results.map(row => {
      let score = 0;
      const marketName = (row.Market || '').toLowerCase().replace("apmc", "").replace("mandi", "").trim();
      const districtName = (row.District || '').toLowerCase().trim();
      const stateName = (row.State || '').toLowerCase().trim();

      if (marketName && locLower.includes(marketName)) {
        score += 100;
      }
      if (districtName && locLower.includes(districtName)) {
        score += 10;
      }
      if (mappedNearestCity && (districtName.includes(mappedNearestCity) || marketName.includes(mappedNearestCity))) {
        score += 50;
      }
      if (stateName && locLower.includes(stateName)) {
        score += 1;
      }
      row.locationScore = score;
      return row;
    });

    let matched = scored.filter(row => row.locationScore > 0);
    matched.sort((a, b) => {
      if (b.locationScore !== a.locationScore) {
        return b.locationScore - a.locationScore;
      }
      const score = (d) => d === 'High' ? 3 : d === 'Rising' ? 2 : d === 'Medium' ? 1 : 0;
      return score(b.Demand) - score(a.Demand);
    });

    console.log("Matched rows with scores:");
    matched.forEach(row => {
      console.log(`Market: ${row.Market}, District: ${row.District}, State: ${row.State}, Score: ${row.locationScore}, Demand: ${row.Demand}`);
    });
  });
