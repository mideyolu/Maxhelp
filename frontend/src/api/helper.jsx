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
