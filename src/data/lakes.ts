export interface LakeData {
  id: string;
  name: string;
  type: 'lake' | 'reservoir' | 'lagoon';
  maxDepth: number; // meters
  avgDepth?: number; // meters
  areaKm2: number;
  location: string;
  coordinates: [number, number]; // [lng, lat]
  description?: string;
}

export const LITHUANIAN_WATERS: LakeData[] = [
  {
    id: 'tauragnas',
    name: 'Tauragnas',
    type: 'lake',
    maxDepth: 62.5,
    avgDepth: 18.4,
    areaKm2: 5.13,
    location: 'Utenos r. (Aukštaitijos NP)',
    coordinates: [25.8617, 55.4461],
    description: 'Giliausias Lietuvos ežeras. Jo didžiausias gylis siekia net 62,5 m.'
  },
  {
    id: 'asveja',
    name: 'Asveja (Radziulė)',
    type: 'lake',
    maxDepth: 50.2,
    avgDepth: 14.7,
    areaKm2: 10.15,
    location: 'Molėtų, Švenčionių, Vilniaus r.',
    coordinates: [25.5014, 55.0319],
    description: 'Ilgiausias Lietuvos ežeras (beveik 22 km ilgio) ir 3-ias pagal gylį.'
  },
  {
    id: 'sartai',
    name: 'Sartai',
    type: 'lake',
    maxDepth: 20.9,
    avgDepth: 5.7,
    areaKm2: 13.32,
    location: 'Rokiškio ir Zarasų r.',
    coordinates: [25.8111, 55.8083],
    description: 'Ilgiausią kranto liniją turintis ežeras Lietuvoje (beveik 79 km).'
  },
  {
    id: 'dusia',
    name: 'Dusia',
    type: 'lake',
    maxDepth: 32.6,
    avgDepth: 15.4,
    areaKm2: 23.34,
    location: 'Lazdijų r. (Dzūkija)',
    coordinates: [23.7000, 54.2961],
    description: 'Vadinama „Dzūkų jūra“ – vienas didžiausių ir švariausių Pietų Lietuvos ežerų.'
  },
  {
    id: 'druksiai',
    name: 'Drūkšiai',
    type: 'lake',
    maxDepth: 33.3,
    avgDepth: 7.6,
    areaKm2: 44.79,
    location: 'Zarasų r. / Ignalinos r.',
    coordinates: [26.6022, 55.6231],
    description: 'Didžiausias Lietuvos ežeras pagal plotą.'
  },
  {
    id: 'plateliai',
    name: 'Platelių ežeras',
    type: 'lake',
    maxDepth: 46.6,
    avgDepth: 12.0,
    areaKm2: 12.05,
    location: 'Plungės r. (Žemaitijos NP)',
    coordinates: [21.8592, 56.0442],
    description: 'Didžiausias ir giliausias Žemaitijos ežeras su 7 salomis.'
  },
  {
    id: 'viesintas',
    name: 'Viešintas',
    type: 'lake',
    maxDepth: 38.3,
    avgDepth: 11.2,
    areaKm2: 2.12,
    location: 'Anykščių r.',
    coordinates: [24.9961, 55.6881],
    description: 'Gilus dubaklone telkšantis ežeras Anykščių rajone.'
  },
  {
    id: 'malkesta',
    name: 'Malkėstaitis',
    type: 'lake',
    maxDepth: 57.0,
    avgDepth: 23.1,
    areaKm2: 0.15,
    location: 'Molėtų r.',
    coordinates: [25.4414, 55.2492],
    description: 'Antras pagal gylį Lietuvos ežeras (57 m), nors plotas vos 15 ha!'
  },
  {
    id: 'galve',
    name: 'Galvė',
    type: 'lake',
    maxDepth: 46.7,
    avgDepth: 13.6,
    areaKm2: 3.61,
    location: 'Trakai',
    coordinates: [24.9333, 54.6625],
    description: 'Istorinis ežeras su 21 sala, kurių vienoje stovi Trakų salos pilis.'
  },
  {
    id: 'kauno-marios',
    name: 'Kauno marios',
    type: 'reservoir',
    maxDepth: 24.6,
    avgDepth: 7.3,
    areaKm2: 63.50,
    location: 'Kauno, Kaišiadorių r.',
    coordinates: [24.1500, 54.8667],
    description: 'Didžiausias dirbtinis vandens telkinys (tvenkinys) Lietuvoje, suformuotas patvenkus Nemuną 1959 m.'
  },
  {
    id: 'antalieptes-marios',
    name: 'Antalieptės marios',
    type: 'reservoir',
    maxDepth: 46.0,
    avgDepth: 7.2,
    areaKm2: 19.11,
    location: 'Zarasų r. (Gražutės RP)',
    coordinates: [25.9667, 55.6500],
    description: 'Antras pagal dydį tvenkinys Lietuvoje, sujungęs net 26 buvusius ežerus ir turintis apie 50 salų.'
  },
  {
    id: 'elektrenu-marios',
    name: 'Elektrėnų marios',
    type: 'reservoir',
    maxDepth: 31.5,
    avgDepth: 7.2,
    areaKm2: 12.64,
    location: 'Elektrėnai (Strėva)',
    coordinates: [24.6739, 54.7667],
    description: 'Trečias pagal dydį tvenkinys Lietuvoje, užtvenkus Strėvos upę 1961 m.'
  },
  {
    id: 'kursiu-marios',
    name: 'Kuršių marios',
    type: 'lagoon',
    maxDepth: 5.8,
    avgDepth: 3.8,
    areaKm2: 413.0,
    location: 'Klaipėda, Neringa, Šilutė',
    coordinates: [21.1500, 55.4500],
    description: 'Didžiausia gėlavandenė Baltijos lagūna, gylis siekia iki 5,8 m prie Klaipėdos sąsiaurio.'
  },
  {
    id: 'balsku-tvenkinys',
    name: 'Balskų tvenkinys',
    type: 'reservoir',
    maxDepth: 15.0,
    avgDepth: 4.8,
    areaKm2: 2.76,
    location: 'Tauragės r. (Jūra)',
    coordinates: [22.1481, 55.3725],
    description: 'Didelis tvenkinys ant Jūros upės Tauragės rajone.'
  },
  {
    id: 'kavarsko-tvenkinys',
    name: 'Kavarsko tvenkinys',
    type: 'reservoir',
    maxDepth: 8.5,
    avgDepth: 3.2,
    areaKm2: 1.62,
    location: 'Anykščių r. (Šventoji)',
    coordinates: [24.9286, 55.4319],
    description: 'Tvenkinys ant Šventosios upės Anykščių rajone prie Kavarsko.'
  },
  {
    id: 'bubiu-tvenkinys',
    name: 'Bubių tvenkinys (Šiaulių jūra)',
    type: 'reservoir',
    maxDepth: 14.0,
    avgDepth: 3.8,
    areaKm2: 4.18,
    location: 'Šiaulių r. (Dubysa)',
    coordinates: [23.1592, 55.8586],
    description: 'Populiarus poilsio ir žūklės tvenkinys ant Dubysos upės.'
  }
];
