export const isValidObject = (object) => {
  return typeof object === 'object' && Object.keys(object).length > 0;
};
