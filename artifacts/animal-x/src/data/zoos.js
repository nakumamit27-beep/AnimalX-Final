const countries = [
  "India","USA","UK","Canada","UAE","Australia",
  "South Africa","Tanzania","Uganda","Japan",
  "Germany","France","Italy","Spain","China","Brazil"
];

const zooNames = [
  "National Zoo","City Wildlife Park","Safari World","Animal Kingdom","Wildlife Reserve",
  "Nature's Haven","Eco Zoo","Jungle Park","Wild World","Forest Zoo",
  "Ocean Park","Desert Safari","Mountain Zoo","Tropical Gardens","Wild Safari"
];

const zoos = [];

for (let i = 0; i < 150; i++) {
  const country = countries[i % countries.length];
  const name = zooNames[i % zooNames.length];
  
  let latBase, lngBase;
  switch (country) {
    case "India": latBase = [8, 35]; lngBase = [68, 97]; break;
    case "USA": latBase = [25, 49]; lngBase = [-125, -67]; break;
    case "UK": latBase = [50, 59]; lngBase = [-5, 2]; break;
    case "Canada": latBase = [43, 70]; lngBase = [-140, -52]; break;
    case "UAE": latBase = [22, 26]; lngBase = [51, 56]; break;
    case "Australia": latBase = [-43, -10]; lngBase = [114, 154]; break;
    case "South Africa": latBase = [-34, -22]; lngBase = [17, 33]; break;
    case "Tanzania": latBase = [-11, -1]; lngBase = [30, 40]; break;
    case "Uganda": latBase = [-1, 4]; lngBase = [29, 35]; break;
    case "Japan": latBase = [31, 45]; lngBase = [130, 145]; break;
    case "Germany": latBase = [47, 55]; lngBase = [6, 15]; break;
    case "France": latBase = [42, 51]; lngBase = [-5, 8]; break;
    case "Italy": latBase = [37, 47]; lngBase = [7, 18]; break;
    case "Spain": latBase = [36, 44]; lngBase = [-9, 4]; break;
    case "China": latBase = [18, 53]; lngBase = [73, 135]; break;
    case "Brazil": latBase = [-33, 5]; lngBase = [-73, -35]; break;
    default: latBase = [-60, 60]; lngBase = [-180, 180];
  }

  const lat = parseFloat((latBase[0] + Math.random() * (latBase[1] - latBase[0])).toFixed(4));
  const lng = parseFloat((lngBase[0] + Math.random() * (lngBase[1] - lngBase[0])).toFixed(4));

  zoos.push({
    id: i + 1,
    name: `${name} ${i + 1}`,
    country,
    lat,
    lng,
    animals: Math.floor(Math.random() * 300 + 50),
    rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1))
  });
}

export default zoos;
