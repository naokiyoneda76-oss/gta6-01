export const CONFIG = {
  width: 1280, height: 800, STEP: 1 / 60, city: { width: 4800, height: 3600 },
  palette: { sky: '#ffd9a0', sun: '#ffe8b6', sea: '#2e8f86', sand: '#ecd29a', asphalt: '#4a4a52', sidewalk: '#b9b3a4', grass: '#788b62', text: '#fff3d4', gold: '#ffd05a' },
  districts: {
    coral: { name: 'Coral Beach', rect: [500, 180, 1050, 1260], color: '#e9b68b', roof: '#d98768', heights: [40, 90], kind: 'hotel' },
    downtown: { name: 'Downtown Palmera', rect: [1700, 300, 1700, 1350], color: '#c7b9a0', roof: '#ad9c83', heights: [90, 220], kind: 'tower' },
    marina: { name: 'Marina del Sol', rect: [520, 1740, 1120, 860], color: '#dfbf8d', roof: '#c79f70', heights: [18, 48], kind: 'marina' },
    porto: { name: 'Porto Azul', rect: [2260, 1950, 1350, 1120], color: '#b9aa8c', roof: '#9b8d74', heights: [20, 40], kind: 'warehouse' },
    laspalmas: { name: 'Las Palmas', rect: [3480, 220, 1200, 1430], color: '#d9c7a2', roof: '#a96e57', heights: [12, 25], kind: 'house' },
    airport: { name: 'Palmera International Airport', rect: [3590, 2030, 1120, 1400], color: '#c9b99b', roof: '#a89c86', heights: [20, 38], kind: 'airport' }
  }, entityCaps: { buildings: 900, palms: 260, piers: 12 }
};
