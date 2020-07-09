import "./stylesheets/main.css";
import "./stylesheets/expanded.css";
import {ipcRenderer} from "electron";
import env from "env";
import $ from "jquery";
import {
  addImageFromProgram,
  cacheScannedPrograms,
  closeExpandWindow,
  getSteamUser,
  getUserAnswer,
  isSteamExists,
  isSteamUserExists,
  launchProgram, openSettingWindow, openToolsWindow,
  removeImageFromProgram,
  removeProgram,
  removeProgramCache,
  renderItem
} from "./helpers/ipcActions";
import {cSelector, v_deleteProgramButton, v_dropdownButton, v_dropdownList, v_programButton, v_programCover} from "./configs/object";
import {programName} from "./configs/app";

// noinspection JSUnusedLocalSymbols
const contextMenu = require('jquery-contextmenu');
const alertify = require('alertifyjs');
const {dialog} = require('electron').remote;
const window = require('electron').remote.getCurrentWindow();
// noinspection JSUnusedLocalSymbols
const tooltip = require('bootstrap').Tooltip;

const programPreviewContainer = $('#program-preview-container');
const expandedScene = $('#expandedScene');
const programContainer = $('#program-container');
const programListCover = $('#program-list');

let appUser;

/*if (env.name === 'development') {
  programPreviewContainer.on("click", e => {
    ipcRenderer.send(closeExpandWindow);
  });
} else {*/
  let closingTimeOut = null;
  programListCover.on("mouseleave", e => {
    closingTimeOut = setTimeout(() => {
      if ($('.modal').is(':hidden') && $('.context-menu-list').css('display') === 'none') {
        programListCover.animate({"margin-left": '-' + expandedScene.width() + 'px'}, 1000, () => {
          ipcRenderer.send(closeExpandWindow);
        });
      }
    }, 350);
  }).on("mouseenter", e => {
    clearTimeout(closingTimeOut);
  });
// }


ipcRenderer.on('window:close:expand', () => {
  ipcRenderer.send(closeExpandWindow);
});

ipcRenderer.on(getSteamUser, (e, user) => {
  appUser = user;
  $('#user-name').html("Welcome, " + user.account.persona);
  const button = $('.auth-steam');
  button.attr('authorized', true);
  button.attr('disabled', true);
  button.find('path').attr('fill', button.find('path').attr('secondary'));
});

ipcRenderer.on(renderItem, (e, items) => {
  if (items.hasOwnProperty('cache')) {
    programContainer.append(items.cache);
  } else {
    renderPrograms(items['categories']).then(() => {
      ipcRenderer.send(cacheScannedPrograms, {html: programContainer.html()});
    });
  }
});

$(document).ready(() => {
  $('[data-toggle="tooltip"]').tooltip();
  const body = $('body');
  expandedScene.css('margin-left', '-' + expandedScene.width() + 'px');
  expandedScene.animate({"margin-left": '+=' + expandedScene.width() + 'px'}, 500);

  body.on('click', cSelector(v_dropdownButton), e => {
    const button = $(e.currentTarget);
    const dropdownList = button.siblings('.dropdown-list');
    // TODO improve there
    if (dropdownList.is(':hidden')) {
      if (!dropdownList.hasClass('inner')) {
        const otherDropdowns = button.closest('#program-container').children('li').children(cSelector(v_dropdownList));
        otherDropdowns.slideUp(500);
        otherDropdowns.removeClass('active');
      }
      button.parent().siblings('li').children('button').removeClass('active');
      button.addClass('active');
      dropdownList.slideDown(500);
      dropdownList.addClass('active');
    } else {
      dropdownList.slideUp(500);
      dropdownList.removeClass('active');
      button.removeClass('active');
    }
  });
  body.on('mouseenter', cSelector(v_programCover), e => {
    const cover = $(e.currentTarget);
    const button = cover.children(cSelector(v_programButton));
    programPreviewContainer.removeClass('appearing');
    programPreviewContainer.children('img').attr('src', button.attr('image'));
    if (button.attr('image') != null) {
      programPreviewContainer.removeClass('d-none');
      programPreviewContainer.addClass('appearing');
    } else {
      programPreviewContainer.addClass('d-none');
    }
    cover.children(cSelector(v_deleteProgramButton)).show();
  }).on('mouseleave', cSelector(v_programCover), e => {
    const cover = $(e.currentTarget);
    programPreviewContainer.removeClass('appearing');
    cover.children(cSelector(v_deleteProgramButton)).hide();
  });

  programPreviewContainer.on('webkitAnimationEnd animationend', () => {
    programPreviewContainer.removeClass('appearing');
  });

  body.on('click', cSelector(v_deleteProgramButton), (e) => {
    const button = $(e.currentTarget);
    ipcRenderer.send(removeProgram, button.attr('del'));
    // TODO check is deleted for more stability
    button.parent().remove();
  });
  body.on('click', cSelector(v_programButton), e => {
    const button = $(e.currentTarget);
    ipcRenderer.send(launchProgram, button.attr('execute'));
  });
  $('.btn-user').on('click', () => {
    $('.modal.user').show();
  });
  $('.modal .close').on('click', (e) => {
    const button = $(e.currentTarget);
    button.closest('.modal').hide();
  });
  $('.btn-auth-program').on('mouseenter', (e) => {
    const button = $(e.currentTarget);
    if (button.attr('authorized') !== true) {
      button.find('path').attr('fill', button.find('path').attr('secondary'));
    }
  }).on('mouseleave', (e) => {
    const button = $(e.currentTarget);
    if (button.attr('authorized') !== true) {
      button.find('path').attr('fill', button.find('path').attr('primary'));
    }
  });
  $('.auth-steam').on('click', () => {
    ipcRenderer.send(isSteamExists);
  });

  $('.btn-refresh-programs').on('click', () => {
    ipcRenderer.send(removeProgramCache);
    ipcRenderer.send(closeExpandWindow);
  });
  $.contextMenu({
    selector: cSelector(v_programCover),
    items: {
      image: {
        name: 'Image',
        items: {
          add: {
            name: "New Image",
            callback: function (key, opt) {
              dialog.showOpenDialog(window, {
                properties: ['openFile']
              }, function (file) {
                if (file !== undefined) {
                  const button = $(opt.$trigger).children(cSelector(v_programButton));
                  ipcRenderer.send(addImageFromProgram, {file: file[0], name: button.attr('programName')});
                }
              });
            }
          },
          remove: {
            name: "Remove",
            callback: (key, opt) => {
              const button = $(opt.$trigger).children(cSelector(v_programButton));
              const imagePath = button.attr('image');
              // TODO check is deleted for more stability
              ipcRenderer.send(removeImageFromProgram, imagePath);
              button.removeAttr('image');
              programPreviewContainer.addClass('d-none');
            }
          }
        }
      },
    }
  });
});

ipcRenderer.on(isSteamUserExists, (e, exists) => {
  if (exists) {
    alertify.confirm(programName, 'Steam Found. Do you want to add recent user?', () => {
      ipcRenderer.send(getUserAnswer, true);
    }, () => {
      ipcRenderer.send(getUserAnswer, false);
    }).set({labels: {ok: 'Yes', cancel: 'No'}});
  }
});

const renderPrograms = async (programs) => {
  $.each(programs, (index, value) => {
    programContainer.append(generateList(value));
  });
};

const generateList = (list, inner = false) => {
  let programListCover = $('<li key="' + list.name + '">' +
    '<button class="' + v_dropdownButton + '">' + list.name + '</button>' +
    '</li>');
  let programList = $('<ul class=' + v_dropdownList + '></ul>');
  if (inner) {
    programList.addClass('inner');
  }

  // TODO add user preferences
  if (true) {
    programList.hide();
  }
  $.each(list['programs'], (index, value) => {
    programList.append(renderButton(value));
  });
  $.each(list, (index, value) => {
    if (value.hasOwnProperty('folder')) {
      programList.append(generateList(value, true));
    }
  });
  programListCover.append(programList);
  return programListCover;
};

const renderButton = (value) => {
  if (value.hasOwnProperty('file')) {
    return '<li class="' + v_programCover + '">' +
      '<button class="' + v_programButton + ' col-sm-11" programName="' + value.name + '" image="' + value.image + '" execute="' + value.exePath + '">' +
      '<p class="float-left">' + value.name + '</p> ' +
      '</button>' +
      '<button  class="' + v_deleteProgramButton + ' col-sm-1  float-right" del="' + value.exePath + '">X</button>' +
      '</li>';
  }
};

$('#btn-openSettingsWindow').on('click', function () {
  ipcRenderer.send(openSettingWindow);
});

$('#btn-openToolsWindow').on('click', function () {
  ipcRenderer.send(openToolsWindow);
});
