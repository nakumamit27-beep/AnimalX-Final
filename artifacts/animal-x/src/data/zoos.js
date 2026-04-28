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
  // Asia
  "India","China","Japan","South Korea","Thailand","Singapore","Indonesia","Malaysia","Philippines","Vietnam",
  "Sri Lanka","Bangladesh","Pakistan","Nepal","Bhutan","Mongolia","Kazakhstan","Uzbekistan","Iran","Iraq",
  "Saudi Arabia","Qatar","Kuwait","Oman","Jordan","Lebanon","Israel","Turkey","Cyprus","Maldives",
  // Europe
  "UK","Ireland","Germany","France","Italy","Spain","Portugal","Netherlands","Belgium","Switzerland",
  "Austria","Sweden","Norway","Finland","Denmark","Iceland","Poland","Czech Republic","Hungary","Romania",
  "Greece","Croatia","Slovenia","Slovakia","Bulgaria","Estonia","Latvia","Lithuania","Russia","Ukraine",
  "Serbia","Bosnia","Albania","Moldova","Belarus","Luxembourg","Malta",
  // Americas
  "USA","Canada","Mexico","Cuba","Jamaica","Bahamas","Costa Rica","Panama","Guatemala","Honduras",
  "Brazil","Argentina","Chile","Peru","Colombia","Venezuela","Ecuador","Bolivia","Uruguay","Paraguay","Galápagos",
  // Africa
  "South Africa","Egypt","Morocco","Tunisia","Algeria","Libya","Nigeria","Kenya","Tanzania","Uganda",
  "Ethiopia","Ghana","Senegal","Madagascar","Zimbabwe","Botswana","Namibia","Zambia","Mozambique","Angola",
  "Cameroon","Rwanda","Sudan","Mauritius","Seychelles",
  // Oceania
  "Australia","New Zealand","Fiji","Papua New Guinea","Samoa","Solomon Islands",
  // Middle East / Other
  "UAE","Bahrain","Yemen","Afghanistan","Greenland","Antarctica"
];

const zooNames = [
  "National Zoo","City Wildlife Park","Safari World","Animal Kingdom","Wildlife Reserve",
  "Nature's Haven","Eco Zoo","Jungle Park","Wild World","Forest Zoo"
];

const zoos = zooData.map((z, i) => ({ id: i + 1, ...z }));

let extraId = zooData.length + 1;
// Capital-ish coordinates for each country (approx country center)
const countryCoords = {
  "India":[20.59,78.96],"China":[35.86,104.20],"Japan":[36.20,138.25],"South Korea":[35.91,127.77],
  "Thailand":[15.87,100.99],"Singapore":[1.35,103.82],"Indonesia":[-0.79,113.92],"Malaysia":[4.21,101.98],
  "Philippines":[12.88,121.77],"Vietnam":[14.06,108.28],"Sri Lanka":[7.87,80.77],"Bangladesh":[23.68,90.36],
  "Pakistan":[30.38,69.35],"Nepal":[28.39,84.12],"Bhutan":[27.51,90.43],"Mongolia":[46.86,103.85],
  "Kazakhstan":[48.02,66.92],"Uzbekistan":[41.38,64.59],"Iran":[32.43,53.69],"Iraq":[33.22,43.68],
  "Saudi Arabia":[23.89,45.08],"Qatar":[25.35,51.18],"Kuwait":[29.31,47.48],"Oman":[21.47,55.98],
  "Jordan":[30.59,36.24],"Lebanon":[33.85,35.86],"Israel":[31.05,34.85],"Turkey":[38.96,35.24],
  "Cyprus":[35.13,33.43],"Maldives":[3.20,73.22],
  "UK":[55.38,-3.44],"Ireland":[53.41,-8.24],"Germany":[51.17,10.45],"France":[46.23,2.21],
  "Italy":[41.87,12.57],"Spain":[40.46,-3.75],"Portugal":[39.40,-8.22],"Netherlands":[52.13,5.29],
  "Belgium":[50.50,4.47],"Switzerland":[46.82,8.23],"Austria":[47.52,14.55],"Sweden":[60.13,18.64],
  "Norway":[60.47,8.47],"Finland":[61.92,25.75],"Denmark":[56.26,9.50],"Iceland":[64.96,-19.02],
  "Poland":[51.92,19.15],"Czech Republic":[49.82,15.47],"Hungary":[47.16,19.50],"Romania":[45.94,24.97],
  "Greece":[39.07,21.82],"Croatia":[45.10,15.20],"Slovenia":[46.15,14.99],"Slovakia":[48.67,19.70],
  "Bulgaria":[42.73,25.49],"Estonia":[58.60,25.01],"Latvia":[56.88,24.60],"Lithuania":[55.17,23.88],
  "Russia":[61.52,105.32],"Ukraine":[48.38,31.17],"Serbia":[44.02,21.01],"Bosnia":[43.92,17.68],
  "Albania":[41.15,20.17],"Moldova":[47.41,28.37],"Belarus":[53.71,27.95],"Luxembourg":[49.81,6.13],"Malta":[35.94,14.38],
  "USA":[37.09,-95.71],"Canada":[56.13,-106.35],"Mexico":[23.63,-102.55],"Cuba":[21.52,-77.78],
  "Jamaica":[18.11,-77.30],"Bahamas":[25.03,-77.40],"Costa Rica":[9.75,-83.75],"Panama":[8.54,-80.78],
  "Guatemala":[15.78,-90.23],"Honduras":[15.20,-86.24],"Brazil":[-14.24,-51.93],"Argentina":[-38.42,-63.62],
  "Chile":[-35.68,-71.54],"Peru":[-9.19,-75.02],"Colombia":[4.57,-74.30],"Venezuela":[6.42,-66.59],
  "Ecuador":[-1.83,-78.18],"Bolivia":[-16.29,-63.59],"Uruguay":[-32.52,-55.77],"Paraguay":[-23.44,-58.44],
  "Galápagos":[-0.95,-90.97],
  "South Africa":[-30.56,22.94],"Egypt":[26.82,30.80],"Morocco":[31.79,-7.09],"Tunisia":[33.89,9.54],
  "Algeria":[28.03,1.66],"Libya":[26.34,17.23],"Nigeria":[9.08,8.68],"Kenya":[-0.02,37.91],
  "Tanzania":[-6.37,34.89],"Uganda":[1.37,32.29],"Ethiopia":[9.15,40.49],"Ghana":[7.95,-1.02],
  "Senegal":[14.50,-14.45],"Madagascar":[-18.77,46.87],"Zimbabwe":[-19.02,29.15],"Botswana":[-22.33,24.68],
  "Namibia":[-22.96,18.49],"Zambia":[-13.13,27.85],"Mozambique":[-18.67,35.53],"Angola":[-11.20,17.87],
  "Cameroon":[7.37,12.35],"Rwanda":[-1.94,29.87],"Sudan":[12.86,30.22],"Mauritius":[-20.35,57.55],"Seychelles":[-4.68,55.49],
  "Australia":[-25.27,133.78],"New Zealand":[-40.90,174.89],"Fiji":[-17.71,178.07],
  "Papua New Guinea":[-6.31,143.96],"Samoa":[-13.76,-172.10],"Solomon Islands":[-9.65,160.16],
  "UAE":[23.42,53.85],"Bahrain":[26.07,50.55],"Yemen":[15.55,48.52],"Afghanistan":[33.94,67.71],
  "Greenland":[71.71,-42.60],"Antarctica":[-75.25,-0.07]
};

while (zoos.length < 280) {
  const country = countries[(extraId - 1) % countries.length];
  const name = zooNames[(extraId - 1) % zooNames.length];
  const c = countryCoords[country];
  const latBase = c ? [c[0] - 5, c[0] + 5] : [-60, 60];
  const lngBase = c ? [c[1] - 5, c[1] + 5] : [-180, 180];
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
