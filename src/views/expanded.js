import './app'
import '../stylesheets/main.css'
import '../stylesheets/expanded.css'
import { ipcRenderer } from 'electron'
import $ from 'jquery'
import * as ipc from '../helpers/ipcActions'
import { programName } from '../configs/global_variables'
import { Tooltip } from 'bootstrap'
import { htmlClassToSelector } from './../helpers/html'
import { remote } from 'electron'
import contextMenu from 'jquery-contextmenu'
import { alertify } from 'alertifyjs'
const window = remote.getCurrentWindow()

const programPreviewContainer = $('#program-preview-container')
const expandedScene = $('#expandedScene')
const programContainer = $('#program-container')
const programListCover = $('#program-list')
const authButtons = $('.btn-auth-program')

// class names of elements that generated later
const classProgramCover = 'program-cover'
const classDeleteProgramButton = 'btn delete-program'
const classProgramButton = 'btn program'

let closingTimeOut = null

const renderPrograms = async (programs) => {
  $.each(programs, (index, value) => {
    programContainer.append(generateList(value))
  })
}

ipcRenderer.on(ipc.getSteamUser, (e, user) => {
  $('#user-name').html('Welcome, ' + user.account.persona)
  const button = $('.auth-steam')
  button.attr('authorized', true)
  button.attr('disabled', true)
})

ipcRenderer
  .invoke(ipc.getProgramsHTML)
  .then((html) => {
    programContainer.html('')
    programContainer.append(html)
  })
  .catch()

ipcRenderer.on(ipc.isSteamUserExists, (e, exists) => {
  if (exists) {
    alertify
      .confirm(
        programName,
        'Steam Found. Do you want to add recent user?',
        () => {
          ipcRenderer.send(ipc.getUserAnswer, true)
        },
        () => {
          ipcRenderer.send(ipc.getUserAnswer, false)
        },
      )
      .set({
        labels: {
          ok: 'Yes',
          cancel: 'No',
        },
      })
  }
})

// User UI behavours
programListCover
  .on('mouseleave', (e) => {
    closingTimeOut = setTimeout(() => {
      if ($('.modal').is(':hidden') && $('.context-menu-list').css('display') === 'none') {
        programListCover.animate(
          {
            'margin-left': '-' + expandedScene.width() + 'px',
          },
          1000,
          () => {
            ipcRenderer.send(ipc.closeExpandWindow)
          },
        )
      }
    }, 350)
  })
  .on('mouseenter', (e) => {
    clearTimeout(closingTimeOut)
  })

$(() => {
  $('[data-toggle="tooltip"]').tooltip()
  expandedScene.css('margin-left', '-' + expandedScene.width() + 'px') // init animation
  expandedScene.animate({ 'margin-left': '+=' + expandedScene.width() + 'px' }, 500) // init animation

  $('.btn-disconnect-user').on('click', (e) => {
    const button = e.currentTarget
    const platform = $(button).parent().attr('platform')
    ipcRenderer.send(ipc.disconnectUser, {
      platform: platform,
    })
  })
  $('.auth-steam').on('click', () => {
    ipcRenderer.send(ipc.isSteamExists)
  })

  $('.btn-refresh-programs').on('click', () => {
    ipcRenderer.send(ipc.removeProgramCache)
    ipcRenderer.send(ipc.closeExpandWindow)
  })

  $('#btn-openSettingsWindow').on('click', function () {
    ipcRenderer.send(ipc.openSettingWindow)
  })

  $('#btn-openToolsWindow').on('click', function () {
    ipcRenderer.send(ipc.openToolsWindow)
  })

  const body = $('body')
  body.on('click', '.btn.list.dropdown-button', (e) => {
    const button = $(e.currentTarget)
    const dropdownLists = button.siblings('.dropdown-list')
    if (dropdownLists.is(':hidden')) {
      if (!dropdownLists.hasClass('inner')) {
        button.closest('#program-container').children('li').children('.dropdown-list').slideUp(500).removeClass('active')
      }
      button.parent().siblings('li').children('button').removeClass('active')
      button.addClass('active')
      dropdownLists.slideDown(500)
      dropdownLists.addClass('active')
    } else {
      dropdownLists.slideUp(500)
      dropdownLists.removeClass('active')
      button.removeClass('active')
    }
  })
  body
    .on('mouseenter', htmlClassToSelector(classProgramCover), (e) => {
      const cover = $(e.currentTarget)
      const button = cover.children(htmlClassToSelector(classProgramButton))
      programPreviewContainer.removeClass('appearing')
      programPreviewContainer.children('img').attr('src', button.attr('image'))
      if (button.attr('image') != null) {
        programPreviewContainer.removeClass('d-none')
        programPreviewContainer.addClass('appearing')
      } else {
        programPreviewContainer.addClass('d-none')
      }
      cover.children(htmlClassToSelector(classDeleteProgramButton)).show()
    })
    .on('mouseleave', htmlClassToSelector(classProgramCover), (e) => {
      const cover = $(e.currentTarget)
      programPreviewContainer.removeClass('appearing')
      cover.children(htmlClassToSelector(classDeleteProgramButton)).hide()
    })

  programPreviewContainer.on('webkitAnimationEnd animationend', () => {
    programPreviewContainer.removeClass('appearing')
  })
  body.on('click', htmlClassToSelector(classDeleteProgramButton), (e) => {
    const button = $(e.currentTarget)
    ipcRenderer.send(ipc.removeProgram, button.attr('del'))
    button.parent().remove() // TODO check is deleted for more stability
  })
  body.on('click', htmlClassToSelector(classProgramButton), (e) => {
    const button = $(e.currentTarget)
    ipcRenderer.send(ipc.launchProgram, button.attr('execute'))
  })

  $('.btn-user').on('click', () => {
    $('.modal.user').show()
    authButtons.each((index, authButton) => {
      $(authButton).find('path').attr('fill', $(authButton).find('path').attr('secondary'))
      if ($(authButton).attr('authorized') == 'true') {
        $(authButton).children('.btn-disconnect-user').show()
      }
    })
  })
  $('.modal .close').on('click', (e) => {
    const button = $(e.currentTarget)
    button.closest('.modal').hide()
  })
  authButtons
    .on('mouseenter', (e) => {
      const button = $(e.currentTarget)
      if (button.attr('authorized') !== true) {
        button.find('path').attr('fill', button.find('path').attr('secondary'))
      }
    })
    .on('mouseleave', (e) => {
      const button = $(e.currentTarget)
      if (button.attr('authorized') !== true) {
        button.find('path').attr('fill', button.find('path').attr('primary'))
      }
    })

  $.contextMenu({
    selector: htmlClassToSelector(classProgramCover),
    items: {
      image: {
        name: 'Image',
        items: {
          add: {
            name: 'New Image',
            callback: function (key, opt) {
              remote.dialog.showOpenDialog(
                window,
                {
                  properties: ['openFile'],
                },
                function (file) {
                  if (file !== undefined) {
                    const button = $(opt.$trigger).children(htmlClassToSelector(classProgramButton))
                    ipcRenderer.send(ipc.addImageFromProgram, {
                      file: file[0],
                      name: button.attr('programName'),
                    })
                  }
                },
              )
            },
          },
          remove: {
            name: 'Remove',
            callback: (key, opt) => {
              const button = $(opt.$trigger).children(htmlClassToSelector(classProgramButton))
              const imagePath = button.attr('image')
              // TODO check is deleted for more stability
              ipcRenderer.send(ipc.removeImageFromProgram, imagePath)
              button.removeAttr('image')
              programPreviewContainer.addClass('d-none')
            },
          },
        },
      },
    },
  })
})
