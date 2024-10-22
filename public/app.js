// Variables for cachedConstants & data
let cachedConstants = null;
let data = null;

// Function to fetch and process data from 'data.json'
async function fetchData() {
  try {
	  if(!data){
		  const response = await fetch('data.json');
		  data = await response.json();
	  }
	return data;
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

// Function to fetch and process constants from 'constants.json'
async function fetchConstants() {
  try {
	  if(!cachedConstants){
		  const response = await fetch('constants.json');
		  cachedConstants = await response.json();
	  }
      return cachedConstants;
  } catch (error) {
      console.error('Error fetching data:', error);
  }
}

//Function to go through constants and populate pot type dropdown menu
async function populatePottype() {
  if (!cachedConstants) return;

  const dropdown = document.getElementById("potType");
  const fragment = document.createDocumentFragment(); // create empty domfragment
  
  cachedConstants.forEach (item => {
    if(item.datatype === "pot") {
      var option = document.createElement("option");
      option.text = item.name;
      option.value = item.name;
      fragment.appendChild(option);
    }
  });
  
  dropdown.appendChild(fragment);  // Update DOM in a single operation
}

//Function to go through constants and populate plant type dropdown menu
async function populatePlantType() {
  if (!cachedConstants) return;

  const dropdown = document.getElementById("plantType");
  const fragment = document.createDocumentFragment(); // create empty domfragment
  
  cachedConstants.forEach (item => {
    if(item.datatype === "species") {
      var option = document.createElement("option");
      option.text = item.name;
      option.value = item.name;
      fragment.appendChild(option);
    }
  });
  
  dropdown.appendChild(fragment);  // Update DOM in a single operation
}

//Function to go through constants and populate season dropdown menu
async function populateSeason() {
  if (!cachedConstants) return;

  const dropdown = document.getElementById("season");
  const fragment = document.createDocumentFragment(); // create empty domfragment
  
  cachedConstants.forEach (item => {
    if(item.datatype === "season") {
      var option = document.createElement("option");
      option.text = item.name;
      option.value = item.name;
      fragment.appendChild(option);
    }
  });
  
  dropdown.appendChild(fragment);  // Update DOM in a single operation
}

async function initialize() {
  await fetchConstants();
  await fetchData();
  await populatePottype()
  await populatePlantType()
  await populateSeason()

}
function calculatePotVolume(diameter, height) {
  const radius = diameter / 2;
  return Math.PI * Math.pow(radius, 2) * height;
}

//Function to calculate water and fertilizer recommendations
async function calculateRecommendations(potVolume, potType, plantType, season) {
  if (!cachedConstants) return;

  // more simplified and efficient data go through
  let potdata = cachedConstants.find(item => item.datatype === 'pot' && item.name === potType);
  let speciesdata = cachedConstants.find(item => item.datatype === 'species' && item.name === plantType);
  let seasondata = cachedConstants.find(item => item.datatype === 'season' && item.name === season);

  let water = potVolume * 0.0001 *potdata.datafield_1*seasondata.datafield_1
  let fertilizer = water * seasondata.datafield_2

  document.getElementById('recommendedWater').textContent = `${water.toFixed(1)} liters`;
  document.getElementById('recommendedFertilizer').textContent = `${fertilizer.toFixed(2)} units`;
}

// Function to search recommendations data and calculate statistics based on it and user inputs
async function findRecommendations(potVolume, potType, plantType, season) {
  if (!data) return;

  let similarCount = 0
  
  // Using filter instead of for loop for efficiency
  const matchingItems = data.filter(item => 
	item.pot_type === potType &&
	item.plant_type === plantType &&
	item.time_of_year === season &&
	item.pot_volume > (potVolume * 0.9) &&
	item.pot_volume < (potVolume * 1.1)  // Should this be under not over 1.1?
  );
  
  similarCount = matchingItems.length;
   
  document.getElementById('similar').textContent = similarCount;

  let similarwaterCount = 0
  let similarwaterGrowthSum = 0
  let similarwaterYieldSum = 0
  
  // Using filter instead of for loop for efficiency
  const filteredItems = data.filter(item => 
    item.pot_type === potType &&
    item.plant_type === plantType &&
    item.time_of_year === season &&
    item.pot_volume > (potVolume * 0.9) &&
    item.pot_volume < (potVolume * 1.1) &&  // Should this be under not over 1.1?
    item.actual_water > (item.recommented_water * 0.9) &&
    item.actual_water < (item.recommented_water * 1.1)  // Should this be under not over 1.1?
  );
  
  // Calculating values
  similarwaterCount = filteredItems.length;
  similarwaterGrowthSum = filteredItems.reduce((sum, item) => sum + item.growth_rate, 0);
  similarwaterYieldSum = filteredItems.reduce((sum, item) => sum + item.crop_yield, 0);
  
  document.getElementById('similarwaterCount').textContent = similarwaterCount;
  document.getElementById('similarwaterGrowthAverage').textContent = similarwaterCount ? (similarwaterGrowthSum / similarwaterCount).toFixed(1) : "-";
  document.getElementById('similarwaterYieldAverage').textContent = similarwaterCount ? (similarwaterYieldSum / similarwaterCount).toFixed(1):"-";

  let lesswaterCount = 0
  let lesswaterGrowthSum = 0
  let lesswaterYieldSum = 0
  
  // Using filter instead of for loop for efficiency
  const lessItems = data.filter(item => 
    item.pot_type === potType &&
    item.plant_type === plantType &&
    item.time_of_year === season &&
    item.pot_volume > (potVolume * 0.9) &&
    item.pot_volume < (potVolume * 1.1) &&  // Correcting the comparison as well
    item.actual_water <= (item.recommented_water * 0.9)
  );
 
   // Calculating values
  lesswaterCount = lessItems.length;
  lesswaterGrowthSum = lessItems.reduce((sum, item) => sum + item.growth_rate, 0);
  lesswaterYieldSum = lessItems.reduce((sum, item) => sum + item.crop_yield, 0);
 
  document.getElementById('lesswaterCount').textContent = lesswaterCount;
  document.getElementById('lesswaterGrowthAverage').textContent = lesswaterCount ?(lesswaterGrowthSum / lesswaterCount).toFixed(1): "-";
  document.getElementById('lesswaterYieldAverage').textContent = lesswaterCount ? (lesswaterYieldSum / lesswaterCount).toFixed(1):"-";

  let morewaterCount = 0
  let morewaterGrowthSum = 0
  let morewaterYieldSum = 0
  
  // Using filter instead of for loop for efficiency
  const moreItems = data.filter(item => 
    item.pot_type === potType &&
    item.plant_type === plantType &&
    item.time_of_year === season &&
    item.pot_volume > (potVolume * 0.9) &&
    item.pot_volume < (potVolume * 1.1) &&  // Correcting the comparison as well
    item.actual_water >= (item.recommented_water * 1.1)
  );

  // Calculate the count, growth sum, and yield sum
  morewaterCount = moreItems.length;
  morewaterGrowthSum = moreItems.reduce((sum, item) => sum + item.growth_rate, 0);
  morewaterYieldSum = moreItems.reduce((sum, item) => sum + item.crop_yield, 0);
  
  document.getElementById('morewaterCount').textContent = morewaterCount;
  document.getElementById('morewaterGrowthAverage').textContent = morewaterCount ? (morewaterGrowthSum / morewaterCount).toFixed(1):"-";
  document.getElementById('morewaterYieldAverage').textContent = morewaterCount ? (morewaterYieldSum / morewaterCount).toFixed(1):"-";

  let outputSection = document.getElementById("outputSection");
  outputSection.style.display = "block";
}

// Event listener for the calculate button
document.getElementById('calculateButton').addEventListener('click', function() {
  const potType = document.getElementById('potType').value;
  const potDiameter = parseFloat(document.getElementById('potDiameter').value);
  const potHeight = parseFloat(document.getElementById('potHeight').value);
  const plantType = document.getElementById('plantType').value;
  const season = document.getElementById('season').value;

  // Calculate pot volume (if needed in your logic)
  const potVolume = calculatePotVolume(potDiameter, potHeight);
  document.getElementById('potSize').textContent = (potVolume/1000).toFixed(1);

  calculateRecommendations(potVolume, potType, plantType, season)

  // Find and display recommendations and statistics
  findRecommendations(potVolume, potType, plantType, season);
});
