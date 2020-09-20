export const htmlClassToSelector = (element = '', isClass = true) => { // converts the html class name to selector
    if (typeof element === 'string') {
      if (isClass) {
        return '.' + element.replace(/ /g, '.');
      } else {
        return '#' + element;
      }
    } else {
      return null;
    }
  };
  