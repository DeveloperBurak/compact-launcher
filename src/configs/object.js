// we means variable, it makes the unique
export const v_dropdownButton = 'btn list dropdown-button';
export const v_dropdownList = 'dropdown-list';

export const v_programCover = 'program-cover';

export const v_programButton = 'btn program';
export const v_deleteProgramButton = 'btn delete-program';


export const cSelector = (element = '', isClass = true) => { // custom selector
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
