import "./system-wide";
import "../stylesheets/main.css";
import "../stylesheets/expanded.css";
import { ipcRenderer } from "electron";
import $ from "jquery";
import * as ipc from "../helpers/ipcActions";
import { programName } from "../configs/global_variables";

import { htmlClassToSelector } from "./../helpers/html";

// noinspection JSUnusedLocalSymbols
const contextMenu = require("jquery-contextmenu");
const alertify = require("alertifyjs");
const { dialog } = require("electron").remote;
const window = require("electron").remote.getCurrentWindow();
// noinspection JSUnusedLocalSymbols
const tooltip = require("bootstrap").Tooltip;

const programPreviewContainer = $("#program-preview-container");
const expandedScene = $("#expandedScene");
const programContainer = $("#program-container");
const programListCover = $("#program-list");
const authButtons = $(".btn-auth-program");

// class names of elements that generated later
const classDropdownButton = "btn list dropdown-button";
const classDropdownList = "dropdown-list";
const classProgramCover = "program-cover";
const classDeleteProgramButton = "btn delete-program";
const classProgramButton = "btn program";

let appUser;

let closingTimeOut = null;
programListCover
  .on("mouseleave", (e) => {
    closingTimeOut = setTimeout(() => {
      if (
        $(".modal").is(":hidden") &&
        $(".context-menu-list").css("display") === "none"
      ) {
        programListCover.animate(
          {
            "margin-left": "-" + expandedScene.width() + "px",
          },
          1000,
          () => {
            ipcRenderer.send(ipc.closeExpandWindow);
          }
        );
      }
    }, 350);
  })
  .on("mouseenter", (e) => {
    clearTimeout(closingTimeOut);
  });

$(() => {
  $('[data-toggle="tooltip"]').tooltip();
  const body = $("body");
  expandedScene.css("margin-left", "-" + expandedScene.width() + "px");
  expandedScene.animate(
    {
      "margin-left": "+=" + expandedScene.width() + "px",
    },
    500
  );

  body.on("click", htmlClassToSelector(classDropdownButton), (e) => {
    const button = $(e.currentTarget);
    const dropdownLists = button.siblings(
      htmlClassToSelector(classDropdownList)
    );
    // TODO improve there
    if (dropdownLists.is(":hidden")) {
      if (!dropdownLists.hasClass("inner")) {
        const otherDropdowns = button
          .closest("#program-container")
          .children("li")
          .children(htmlClassToSelector(classDropdownList));
        otherDropdowns.slideUp(500);
        otherDropdowns.removeClass("active");
      }
      button.parent().siblings("li").children("button").removeClass("active");
      button.addClass("active");
      dropdownLists.slideDown(500);
      dropdownLists.addClass("active");
    } else {
      dropdownLists.slideUp(500);
      dropdownLists.removeClass("active");
      button.removeClass("active");
    }
  });
  body
    .on("mouseenter", htmlClassToSelector(classProgramCover), (e) => {
      const cover = $(e.currentTarget);
      const button = cover.children(htmlClassToSelector(classProgramButton));
      programPreviewContainer.removeClass("appearing");
      programPreviewContainer.children("img").attr("src", button.attr("image"));
      if (button.attr("image") != null) {
        programPreviewContainer.removeClass("d-none");
        programPreviewContainer.addClass("appearing");
      } else {
        programPreviewContainer.addClass("d-none");
      }
      cover.children(htmlClassToSelector(classDeleteProgramButton)).show();
    })
    .on("mouseleave", htmlClassToSelector(classProgramCover), (e) => {
      const cover = $(e.currentTarget);
      programPreviewContainer.removeClass("appearing");
      cover.children(htmlClassToSelector(classDeleteProgramButton)).hide();
    });

  programPreviewContainer.on("webkitAnimationEnd animationend", () => {
    programPreviewContainer.removeClass("appearing");
  });
  body.on("click", htmlClassToSelector(classDeleteProgramButton), (e) => {
    const button = $(e.currentTarget);
    ipcRenderer.send(ipc.removeProgram, button.attr("del"));
    button.parent().remove(); // TODO check is deleted for more stability
  });
  body.on("click", htmlClassToSelector(classProgramButton), (e) => {
    const button = $(e.currentTarget);
    ipcRenderer.send(ipc.launchProgram, button.attr("execute"));
  });

  $(".btn-user").on("click", () => {
    $(".modal.user").show();
    authButtons.each((index, authButton) => {
      $(authButton)
        .find("path")
        .attr("fill", $(authButton).find("path").attr("secondary"));
      if ($(authButton).attr("authorized") == "true") {
        $(authButton).children(".btn-disconnect-user").show();
      }
    });
  });
  $(".modal .close").on("click", (e) => {
    const button = $(e.currentTarget);
    button.closest(".modal").hide();
  });
  authButtons
    .on("mouseenter", (e) => {
      const button = $(e.currentTarget);
      if (button.attr("authorized") !== true) {
        button.find("path").attr("fill", button.find("path").attr("secondary"));
      }
    })
    .on("mouseleave", (e) => {
      const button = $(e.currentTarget);
      if (button.attr("authorized") !== true) {
        button.find("path").attr("fill", button.find("path").attr("primary"));
      }
    });

  $.contextMenu({
    selector: htmlClassToSelector(classProgramCover),
    items: {
      image: {
        name: "Image",
        items: {
          add: {
            name: "New Image",
            callback: function (key, opt) {
              dialog.showOpenDialog(
                window,
                {
                  properties: ["openFile"],
                },
                function (file) {
                  if (file !== undefined) {
                    const button = $(opt.$trigger).children(
                      htmlClassToSelector(classProgramButton)
                    );
                    ipcRenderer.send(ipc.addImageFromProgram, {
                      file: file[0],
                      name: button.attr("programName"),
                    });
                  }
                }
              );
            },
          },
          remove: {
            name: "Remove",
            callback: (key, opt) => {
              const button = $(opt.$trigger).children(
                htmlClassToSelector(classProgramButton)
              );
              const imagePath = button.attr("image");
              // TODO check is deleted for more stability
              ipcRenderer.send(ipc.removeImageFromProgram, imagePath);
              button.removeAttr("image");
              programPreviewContainer.addClass("d-none");
            },
          },
        },
      },
    },
  });
});

const renderPrograms = async (programs) => {
  $.each(programs, (index, value) => {
    programContainer.append(generateList(value));
  });
};

const generateList = (list, inner = false) => {
  let programListCover = $(
    '<li key="' +
      list.name +
      '">' +
      '<button class="' +
      classDropdownButton +
      '">' +
      list.name +
      "</button>" +
      "</li>"
  );
  let programList = $("<ul class=" + classDropdownList + "></ul>");
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
      programList.append(generateList(value, true));
    }
  });
  programListCover.append(programList);
  return programListCover;
};

const renderButton = (value) => {
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

$(".btn-disconnect-user").on("click", (e) => {
  const button = e.currentTarget;
  const platform = $(button).parent().attr("platform");
  ipcRenderer.send(ipc.disconnectUser, {
    platform: platform,
  });
});

$("#btn-openSettingsWindow").on("click", function () {
  ipcRenderer.send(ipc.openSettingWindow);
});

$("#btn-openToolsWindow").on("click", function () {
  ipcRenderer.send(ipc.openToolsWindow);
});

ipcRenderer.on(ipc.closeExpandWindow, () => {
  ipcRenderer.send(ipc.closeExpandWindow);
});

ipcRenderer.on(ipc.getSteamUser, (e, user) => {
  appUser = user;
  $("#user-name").html("Welcome, " + user.account.persona);
  const button = $(".auth-steam");
  button.attr("authorized", true);
  button.attr("disabled", true);
});

ipcRenderer.on(ipc.renderItem, (e, items) => {
  if (items.hasOwnProperty("cache")) {
    programContainer.append(items.cache);
  } else {
    renderPrograms(items["categories"]).then(() => {
      ipcRenderer.send(ipc.cacheScannedPrograms, {
        html: programContainer.html(),
      });
    });
  }
});

ipcRenderer.on(ipc.isSteamUserExists, (e, exists) => {
  if (exists) {
    alertify
      .confirm(
        programName,
        "Steam Found. Do you want to add recent user?",
        () => {
          ipcRenderer.send(ipc.getUserAnswer, true);
        },
        () => {
          ipcRenderer.send(ipc.getUserAnswer, false);
        }
      )
      .set({
        labels: {
          ok: "Yes",
          cancel: "No",
        },
      });
  }
});

$(".auth-steam").on("click", () => {
  ipcRenderer.send(ipc.isSteamExists);
});

$(".btn-refresh-programs").on("click", () => {
  ipcRenderer.send(ipc.removeProgramCache);
  ipcRenderer.send(ipc.closeExpandWindow);
});
