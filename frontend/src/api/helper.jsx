export const getUnitName = (unitId) => {
  switch (unitId) {
    case 1:
      return "Restaurant";
    case 2:
      return "Grocery Store";
    case 3:
      return "Bottled Water Industry";
    case 4:
      return "Bookshop";
    default:
      return "Unknown";
  }
};


export const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
