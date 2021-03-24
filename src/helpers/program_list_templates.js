export const generateList = (list, inner = false, level = 0) => {
  let programListCover = $(
    `<li key="${list.name}" style="padding-left: ${20 * level}px">
      <button class="btn list dropdown-button">${list.name}</button>
    </li>`
  );
  let programList = $(
    `<ul class="dropdown-list" style="padding-left:"${15 * level}px">
    </ul>`
  );
  if (inner) {
    programList.addClass("inner");
  }

  // TODO add user preferences
  if (true) {
    programList.hide();
  }
  $.each(list["programs"], (index, value) => {
    programList.append(renderButton(value));
  });
  $.each(list, (index, value) => {
    if (value.hasOwnProperty("folder")) {
      programList.append(generateList(value, true, level + 1));
    }
  });
  programListCover.append(programList);
  return programListCover;
};

export const renderButton = (value) => {
  if (value.hasOwnProperty("file")) {
    return (
      '<li class="' +
      classProgramCover +
      '">' +
      '<button class="' +
      classProgramButton +
      ' col-sm-11" programName="' +
      value.name +
      '" image="' +
      value.image +
      '" execute="' +
      value.exePath +
      '">' +
      '<p class="float-left">' +
      value.name +
      "</p> " +
      "</button>" +
      '<button  class="' +
      classDeleteProgramButton +
      ' col-sm-1  float-right" del="' +
      value.exePath +
      '">X</button>' +
      "</li>"
    );
  }
};
