import "./stylesheets/main.css";
import "./stylesheets/expanded.css";
import {ipcRenderer} from "electron";
import env from "env";
import $ from "jquery";
const alertify = require('alertifyjs');

const programPreviewContainer = $('#program-preview-container');
const expandedScene = $('#expandedScene');
const programContainer = $('#program-container');
const programListCover = $('#program-list');

let appUser;

if (env.name === 'development') {
  programPreviewContainer.on("click", e => {
    ipcRenderer.send("window:close:expanded");
  });
} else {
  programListCover.on("mouseleave", e => {
    if($('.modal').is(':hidden')){
      programListCover.animate({"margin-left": '-' + expandedScene.width() + 'px'}, 1000, () => {
        ipcRenderer.send("window:close:expanded");
      });
    }
  });
}


ipcRenderer.on('window:close:expand', (e, items) => {
  ipcRenderer.send("window:close:expanded");
});

ipcRenderer.on('steam:user:get', (e, user) => {
  appUser = user;
  $('#user-name').html("Welcome, " + user.account.persona);
  const button = $('.auth-steam');
  button.attr('authorized', true);
  button.attr('disabled',true);
  button.find('path').attr('fill', button.find('path').attr('secondary'));
});

ipcRenderer.on('items:render', (e, items) => {
  if (items.hasOwnProperty('cache')) {
    programContainer.append(items.cache);
  } else {
    renderPrograms(items['categories']).then(() => {
      ipcRenderer.send('cache:programs', {html: programContainer.html()});
    });
  }
});

$(document).ready(() => {
  const body = $('body');
  expandedScene.css('margin-left', '-' + expandedScene.width() + 'px');
  expandedScene.animate({"margin-left": '+=' + expandedScene.width() + 'px'}, 500);

  body.on('click', '.dropdown-button', e => {
    const button = $(e.currentTarget);
    const dropdownList = button.siblings('.dropdown-list');
    // TODO improve there
    if (dropdownList.is(':hidden')) {
      if (!dropdownList.hasClass('inner')) {
        const otherDropdowns = button.closest('#program-container').children('li').children('.dropdown-list');
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
  body.on('mouseenter', '.btn.program', e => {
    const button = $(e.currentTarget);
    programPreviewContainer.children('img').attr('src', button.attr('image'));
    programPreviewContainer.removeClass('d-none');
  });
  body.on('click', '.btn.program', e => {
    const button = $(e.currentTarget);
    ipcRenderer.send('program:launch', button.attr('execute'));
  });
  $('.btn-user').on('click', () => {
    $('.modal.user').show();
  });
  $('.modal .close').on('click', (e) => {
    console.log('clicked');
    const button = $(e.currentTarget);
    console.log(button.closest('.modal').attr('class'));
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
  $('.auth-steam').on('click', (e) => {
    ipcRenderer.send('steam:check:exists');
  });
});

ipcRenderer.on('steam:exists', (e, exists) => {
  if (exists) {
    alertify.confirm('Compact Launcher', 'Steam Found. Do you want to add recent user?', () => {
        ipcRenderer.send('stem:user:answer', true);
      }
      , () => {
        ipcRenderer.send('stem:user:answer', false);
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
    '<button class="btn list dropdown-button">' + list.name + '</button>' +
    '</li>');
  let programList = $('<ul class="dropdown-list"></ul>');
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
    return '<li><button class="btn program" image="' + value.image + '" execute="' + value.exePath + '">' + value.name + '</button></li>';
  }
};
