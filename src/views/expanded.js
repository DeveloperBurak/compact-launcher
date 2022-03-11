/* eslint-disable no-underscore-dangle */
/* global $, window, alertify */
import { APP_NAME } from '../configs/app.json';
import { errorDevLog } from '../helpers/console';
import { isDev } from '../helpers/env';
import * as ipc from '../strings/ipc';
import './app';

const programPreviewContainer = $('#program-preview-container');
const expandedScene = $('#expandedScene');
const programContainer = $('#program-container');
const programListCover = $('#program-list');
const authButtons = $('.btn-auth-program');

let closingTimeOut = null;
let closeLock = false;

const fetchImagesFromServer = (programName) => {
  window.api.invoke(ipc.fetchImageFromServer, { programName }).then((result) => {
    const { images } = result.data.program;

    // TODO catch the what time left and continue to the timeout after model is closed
    clearTimeout(closingTimeOut); // if user gets there by accidently, don't expand the screen immediatly
    closingTimeOut = null;

    if (images.length > 0) {
      $('#server-image-selector').removeClass('d-none');
    }
    $('#server-image-list').children('li').remove();
    for (let i = 0; i < 10; i++) {
      $('#server-image-list').append(
        `<li>
          <button class="btn btn-server-image" program-name="${programName}" doc-id="${images[i]._id}">
            <img src="${images[i].path}" />
          </button>
        </li>`,
      );
    }
  });
};

const renderList = (payload = {}) => {
  programContainer.html('');
  // TODO loading animation
  setTimeout(() => {
    window.api.invoke(ipc.getProgramsHTML, payload).then((html) => {
      programContainer.append(html);
      $('.dropdown-list').hide();
    });
  }, 10); // Make feel that the list is refreshed to user
};

window.api.receive(ipc.getSteamUser, (e, user) => {
  $('#user-name').html(`Welcome, ${user.account.persona}`);
  const button = $('.auth-steam');
  button.attr('authorized', true);
  button.attr('disabled', true);
});

window.api.receive(ipc.isSteamUserExists, (e, exists) => {
  if (exists) {
    alertify
      .confirm(
        APP_NAME,
        'Steam Found. Do you want to add recent user?',
        () => {
          window.api.send(ipc.getUserAnswer, true);
        },
        () => {
          window.api.send(ipc.getUserAnswer, false);
        },
      )
      .set({
        labels: {
          ok: 'Yes',
          cancel: 'No',
        },
      });
  }
});

$(() => {
  // init
  renderList();
  $('[data-toggle="tooltip"]').tooltip();
  expandedScene.css('margin-left', `-${expandedScene.width()}px`);
  expandedScene.animate({ 'margin-left': `+=${expandedScene.width()}px` }, 250);
  const body = $('body');

  // User behavours
  programListCover.on('mouseenter', () => clearTimeout(closingTimeOut));
  $('.auth-steam').on('click', () => window.api.send(ipc.isSteamExists));
  $('.btn-refresh-programs').on('click', () => renderList({ refreshCache: true }));
  $('#btn-openSettingsWindow').on('click', () => window.api.send(ipc.openSettingWindow));
  $('#btn-openToolsWindow').on('click', () => window.api.send(ipc.openToolsWindow));
  $('#program-preview').on('error', (e) => $(e.currentTarget).hide());
  $('#program-preview').on('load', (e) => $(e.currentTarget).show());
  programPreviewContainer.on('webkitAnimationEnd animationend', () => programPreviewContainer.removeClass('appearing'));

  programListCover.on('mouseleave', () => {
    closingTimeOut = setTimeout(
      () => {
        if (closeLock) {
          return;
        }
        if ($('.modal').is(':hidden') && $('.context-menu-list').css('display') === 'none') {
          programListCover.animate(
            {
              'margin-left': `-${expandedScene.width()}px`,
            },
            1000,
            () => {
              window.api.send(ipc.closeExpandWindow);
            },
          );
        }
      },
      isDev() ? 2000 : 350,
    );
  });

  $('.btn-disconnect-user').on('click', (e) => {
    const button = e.currentTarget;
    const platform = $(button).parent().attr('platform');
    window.api.send(ipc.disconnectUser, { platform });
  });

  body.on('click', '.btn-server-image', (e) => {
    const button = $(e.currentTarget);
    window.api.invoke(ipc.selectImageServer, { docId: button.attr('doc-id'), programName: button.attr('program-name') }).then((downloadedPath) => {
      if (downloadedPath != null) {
        $(`button.program[programname="${button.attr('program-name')}"]`).attr('image', downloadedPath);
        $('#program-preview').show(); // it may hidden because of gets error, look for on('error') for this element
      }
      $('#server-image-selector').addClass('d-none');
    });
  });

  body.on('click', '.btn.list.dropdown-button', (e) => {
    const button = $(e.currentTarget);
    const dropdownLists = button.siblings('.dropdown-list');
    if (dropdownLists.is(':hidden')) {
      // open the list

      // TODO bind this to user preference
      const otherBrothers = button.closest('ul').children(`li[key!="${button.siblings('li').attr('key')}"]`);
      otherBrothers.children('.btn.list.dropdown-button').removeClass('active');
      otherBrothers.children('.dropdown-list').slideUp(500);
      otherBrothers.children('.dropdown-list').removeClass('active');

      button.addClass('active');
      dropdownLists.slideDown(500);
      dropdownLists.addClass('active');
    } else {
      // close the list
      dropdownLists.slideUp(500);
      dropdownLists.removeClass('active');
      button.removeClass('active');
    }
  });

  body.on('mouseenter', '.program-cover', (e) => {
    const cover = $(e.currentTarget);
    const button = cover.children('.btn.program');
    programPreviewContainer.removeClass('appearing');
    programPreviewContainer.children('img').attr('src', button.attr('image'));
    if (button.attr('image') != null) {
      programPreviewContainer.removeClass('d-none');
      programPreviewContainer.addClass('appearing');
    } else {
      programPreviewContainer.addClass('d-none');
    }
    cover.children('.btn.delete-program').show();
  });

  body.on('mouseleave', '.program-cover', (e) => {
    const cover = $(e.currentTarget);
    programPreviewContainer.removeClass('appearing');
    cover.children('.btn.delete-program').hide();
  });

  body.on('click', '.btn.delete-program', (e) => {
    const button = $(e.currentTarget);
    window.api.send(ipc.removeProgram, button.attr('del'));
    button.parent().remove(); // TODO check is deleted for more stability
  });

  body.on('click', '.btn.program', (e) => {
    const button = $(e.currentTarget);
    window.api.send(ipc.launchProgram, button.attr('execute'));
  });

  $('.btn-user').on('click', () => {
    $('.modal.user').show();
    authButtons.each((index, authButton) => {
      $(authButton).find('path').attr('fill', $(authButton).find('path').attr('secondary'));
      if ($(authButton).attr('authorized') === 'true' || $(authButton).attr('authorized') === true) {
        $(authButton).children('.btn-disconnect-user').show();
      }
    });
  });

  $('.modal .close').on('click', (e) => {
    const button = $(e.currentTarget);
    button.closest('.modal').hide();
  });

  authButtons.on('mouseenter', (e) => {
    const button = $(e.currentTarget);
    if (button.attr('authorized') !== true) {
      button.find('path').attr('fill', button.find('path').attr('secondary'));
    }
  });

  authButtons.on('mouseleave', (e) => {
    const button = $(e.currentTarget);
    if (button.attr('authorized') !== true) {
      button.find('path').attr('fill', button.find('path').attr('primary'));
    }
  });
  $.contextMenu({
    selector: '.program-cover',
    items: {
      image: {
        name: 'Image',
        items: {
          newImage: {
            name: 'New Image',
            items: {
              server: {
                name: 'From Server',
                callback: (key, opt) => {
                  const button = $(opt.$trigger).children('.btn.program');
                  const programName = button.attr('programname');
                  fetchImagesFromServer(programName);
                },
              },
              local: {
                name: 'From PC',
                callback: (key, opt) => {
                  closeLock = true;
                  window.remote
                    .openDialog({ properties: ['openFile'] })
                    .then((file) => {
                      window.api.send(ipc.systemLog, file);
                      if (file !== undefined) {
                        const button = $(opt.$trigger).children('.btn.program');
                        window.api.send(ipc.addImageFromProgram, {
                          file,
                          name: button.attr('programName'),
                        });
                        closeLock = false;
                      }
                    })
                    .catch((err) => {
                      errorDevLog(err);
                      closeLock = false;
                    });
                },
              },
            },
          },
          remove: {
            name: 'Remove',
            callback: (key, opt) => {
              const button = $(opt.$trigger).children('.btn.program');
              const imagePath = button.attr('image');
              // TODO check is deleted for more stability
              window.api.send(ipc.removeImageFromProgram, imagePath);
              button.removeAttr('image');
              programPreviewContainer.addClass('d-none');
            },
          },
        },
      },
    },
  });
});
