const zooData = [
  { name: "Gir National Park Zoo", country: "India", lat: 21.12, lng: 70.81, animals: 320, rating: 4.8, image: "https://loremflickr.com/400/220/zoo,lion?lock=101" },
  { name: "Jim Corbett Zoo", country: "India", lat: 29.53, lng: 78.77, animals: 280, rating: 4.7, image: "https://loremflickr.com/400/220/zoo,tiger?lock=102" },
  { name: "Bandipur Safari Zoo", country: "India", lat: 11.67, lng: 76.63, animals: 260, rating: 4.6, image: "https://loremflickr.com/400/220/zoo,wildlife?lock=103" },
  { name: "Kaziranga Wildlife Zoo", country: "India", lat: 26.58, lng: 93.17, animals: 290, rating: 4.9, image: "https://loremflickr.com/400/220/zoo,rhino?lock=104" },
  { name: "Sariska Tiger Reserve Zoo", country: "India", lat: 27.33, lng: 76.37, animals: 210, rating: 4.5, image: "https://loremflickr.com/400/220/safari,zoo?lock=105" },
  { name: "Central Park Zoo", country: "USA", lat: 40.77, lng: -73.97, animals: 180, rating: 4.6, image: "https://loremflickr.com/400/220/zoo,park?lock=201" },
  { name: "San Diego Zoo", country: "USA", lat: 32.74, lng: -117.15, animals: 650, rating: 4.9, image: "https://loremflickr.com/400/220/zoo,animals?lock=202" },
  { name: "Smithsonian National Zoo", country: "USA", lat: 38.93, lng: -77.05, animals: 410, rating: 4.8, image: "https://loremflickr.com/400/220/zoo,panda?lock=203" },
  { name: "Bronx Zoo", country: "USA", lat: 40.85, lng: -73.88, animals: 500, rating: 4.7, image: "https://loremflickr.com/400/220/zoo,gorilla?lock=204" },
  { name: "Houston Zoo", country: "USA", lat: 29.71, lng: -95.39, animals: 300, rating: 4.5, image: "https://loremflickr.com/400/220/zoo,elephant?lock=205" },
  { name: "London Zoo", country: "UK", lat: 51.54, lng: -0.16, animals: 380, rating: 4.7, image: "https://loremflickr.com/400/220/zoo,london?lock=301" },
  { name: "Chester Zoo", country: "UK", lat: 53.23, lng: -2.87, animals: 350, rating: 4.8, image: "https://loremflickr.com/400/220/zoo,chester?lock=302" },
  { name: "Edinburgh Zoo", country: "UK", lat: 55.94, lng: -3.27, animals: 220, rating: 4.6, image: "https://loremflickr.com/400/220/zoo,scotland?lock=303" },
  { name: "Paignton Zoo", country: "UK", lat: 50.43, lng: -3.57, animals: 170, rating: 4.4, image: "https://loremflickr.com/400/220/zoo,england?lock=304" },
  { name: "Toronto Zoo", country: "Canada", lat: 43.82, lng: -79.18, animals: 490, rating: 4.7, image: "https://loremflickr.com/400/220/zoo,canada?lock=401" },
  { name: "Vancouver Aquarium", country: "Canada", lat: 49.30, lng: -123.13, animals: 200, rating: 4.6, image: "https://loremflickr.com/400/220/aquarium,fish?lock=402" },
  { name: "Dubai Zoo", country: "UAE", lat: 25.26, lng: 55.31, animals: 160, rating: 4.3, image: "https://loremflickr.com/400/220/zoo,dubai?lock=501" },
  { name: "Al Ain Zoo", country: "UAE", lat: 24.21, lng: 55.79, animals: 220, rating: 4.5, image: "https://loremflickr.com/400/220/zoo,desert?lock=502" },
  { name: "Taronga Zoo", country: "Australia", lat: -33.84, lng: 151.24, animals: 340, rating: 4.8, image: "https://loremflickr.com/400/220/zoo,sydney?lock=601" },
  { name: "Melbourne Zoo", country: "Australia", lat: -37.78, lng: 144.95, animals: 310, rating: 4.7, image: "https://loremflickr.com/400/220/zoo,australia?lock=602" },
  { name: "Perth Zoo", country: "Australia", lat: -31.97, lng: 115.84, animals: 200, rating: 4.5, image: "https://loremflickr.com/400/220/zoo,koala?lock=603" },
  { name: "Johannesburg Zoo", country: "South Africa", lat: -26.18, lng: 28.01, animals: 320, rating: 4.5, image: "https://loremflickr.com/400/220/zoo,africa?lock=701" },
  { name: "Kruger National Park Zoo", country: "South Africa", lat: -23.99, lng: 31.55, animals: 500, rating: 4.9, image: "https://loremflickr.com/400/220/safari,africa?lock=702" },
  { name: "Serengeti Park Zoo", country: "Tanzania", lat: -2.33, lng: 34.83, animals: 450, rating: 4.9, image: "https://loremflickr.com/400/220/serengeti,wildlife?lock=801" },
  { name: "Ngorongoro Zoo", country: "Tanzania", lat: -3.23, lng: 35.50, animals: 380, rating: 4.8, image: "https://loremflickr.com/400/220/zoo,tanzania?lock=802" },
  { name: "Bwindi Gorilla Park", country: "Uganda", lat: -1.05, lng: 29.63, animals: 290, rating: 4.9, image: "https://loremflickr.com/400/220/gorilla,forest?lock=901" },
  { name: "Ueno Zoo", country: "Japan", lat: 35.71, lng: 139.77, animals: 380, rating: 4.7, image: "https://loremflickr.com/400/220/zoo,japan?lock=1001" },
  { name: "Asahiyama Zoo", country: "Japan", lat: 43.78, lng: 142.38, animals: 260, rating: 4.8, image: "https://loremflickr.com/400/220/zoo,hokkaido?lock=1002" },
  { name: "Kobe Oji Zoo", country: "Japan", lat: 34.72, lng: 135.18, animals: 210, rating: 4.6, image: "https://loremflickr.com/400/220/zoo,kobe?lock=1003" },
  { name: "Berlin Zoologischer Garten", country: "Germany", lat: 52.51, lng: 13.34, animals: 470, rating: 4.8, image: "https://loremflickr.com/400/220/zoo,berlin?lock=1101" },
  { name: "Frankfurt Zoo", country: "Germany", lat: 50.12, lng: 8.71, animals: 300, rating: 4.6, image: "https://loremflickr.com/400/220/zoo,germany?lock=1102" },
  { name: "Munich Hellabrunn Zoo", country: "Germany", lat: 48.10, lng: 11.57, animals: 360, rating: 4.7, image: "https://loremflickr.com/400/220/zoo,munich?lock=1103" },
  { name: "Paris Vincennes Zoo", country: "France", lat: 48.84, lng: 2.43, animals: 290, rating: 4.6, image: "https://loremflickr.com/400/220/zoo,paris?lock=1201" },
  { name: "Lyon Zoo", country: "France", lat: 45.77, lng: 4.85, animals: 200, rating: 4.4, image: "https://loremflickr.com/400/220/zoo,france?lock=1202" },
  { name: "Rome Bioparco Zoo", country: "Italy", lat: 41.92, lng: 12.48, animals: 220, rating: 4.5, image: "https://loremflickr.com/400/220/zoo,rome?lock=1301" },
  { name: "Milan Naturale Zoo", country: "Italy", lat: 45.47, lng: 9.20, animals: 180, rating: 4.3, image: "https://loremflickr.com/400/220/zoo,milan?lock=1302" },
  { name: "Madrid Zoo", country: "Spain", lat: 40.42, lng: -3.72, animals: 340, rating: 4.7, image: "https://loremflickr.com/400/220/zoo,madrid?lock=1401" },
  { name: "Barcelona Zoo", country: "Spain", lat: 41.38, lng: 2.19, animals: 260, rating: 4.5, image: "https://loremflickr.com/400/220/zoo,barcelona?lock=1402" },
  { name: "Beijing Zoo", country: "China", lat: 39.94, lng: 116.33, animals: 480, rating: 4.7, image: "https://loremflickr.com/400/220/zoo,beijing?lock=1501" },
  { name: "Shanghai Wild Animal Park", country: "China", lat: 31.01, lng: 121.74, animals: 400, rating: 4.6, image: "https://loremflickr.com/400/220/zoo,shanghai?lock=1502" },
  { name: "Chengdu Research Base Panda", country: "China", lat: 30.73, lng: 104.14, animals: 150, rating: 4.9, image: "https://loremflickr.com/400/220/panda,zoo?lock=1503" },
  { name: "Rio de Janeiro Zoo", country: "Brazil", lat: -22.95, lng: -43.22, animals: 310, rating: 4.5, image: "https://loremflickr.com/400/220/zoo,brazil?lock=1601" },
  { name: "Sao Paulo Zoo", country: "Brazil", lat: -23.65, lng: -46.62, animals: 380, rating: 4.6, image: "https://loremflickr.com/400/220/zoo,amazon?lock=1602" },
  { name: "Singapore Zoo", country: "Singapore", lat: 1.40, lng: 103.79, animals: 320, rating: 4.9, image: "https://loremflickr.com/400/220/zoo,singapore?lock=1701" },
  { name: "Night Safari Singapore", country: "Singapore", lat: 1.40, lng: 103.78, animals: 250, rating: 4.8, image: "https://loremflickr.com/400/220/safari,night?lock=1702" },
  { name: "Moscow Zoo", country: "Russia", lat: 55.76, lng: 37.58, animals: 400, rating: 4.5, image: "https://loremflickr.com/400/220/zoo,russia?lock=1801" },
  { name: "Prague Zoo", country: "Czech Republic", lat: 50.12, lng: 14.41, animals: 320, rating: 4.8, image: "https://loremflickr.com/400/220/zoo,prague?lock=1901" },
  { name: "Amsterdam Artis Zoo", country: "Netherlands", lat: 52.37, lng: 4.91, animals: 270, rating: 4.6, image: "https://loremflickr.com/400/220/zoo,amsterdam?lock=2001" },
  { name: "Zurich Zoo", country: "Switzerland", lat: 47.39, lng: 8.57, animals: 380, rating: 4.9, image: "https://loremflickr.com/400/220/zoo,zurich?lock=2101" },
  { name: "Copenhagen Zoo", country: "Denmark", lat: 55.67, lng: 12.52, animals: 290, rating: 4.7, image: "https://loremflickr.com/400/220/zoo,denmark?lock=2201" },
];

const countries = [
  "India","USA","UK","Canada","UAE","Australia",
  "South Africa","Tanzania","Uganda","Japan",
  "Germany","France","Italy","Spain","China","Brazil"
];

const zooNames = [
  "National Zoo","City Wildlife Park","Safari World","Animal Kingdom","Wildlife Reserve",
  "Nature's Haven","Eco Zoo","Jungle Park","Wild World","Forest Zoo"
];

const zoos = zooData.map((z, i) => ({ id: i + 1, ...z }));

let extraId = zooData.length + 1;
while (zoos.length < 200) {
  const country = countries[(extraId - 1) % countries.length];
  const name = zooNames[(extraId - 1) % zooNames.length];
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
  const seed = extraId * 9973;
  const lat = parseFloat((latBase[0] + ((seed % 1000) / 1000) * (latBase[1] - latBase[0])).toFixed(4));
  const lng = parseFloat((lngBase[0] + ((seed % 997) / 997) * (lngBase[1] - lngBase[0])).toFixed(4));
  zoos.push({
    id: extraId,
    name: `${name} ${extraId}`,
    country,
    lat,
    lng,
    animals: 50 + (extraId * 17) % 400,
    rating: parseFloat((3.5 + ((extraId % 15) / 10)).toFixed(1)),
    image: `https://loremflickr.com/400/220/zoo,wildlife?lock=${extraId + 5000}`
  });
  extraId++;
}

export default zoos;
