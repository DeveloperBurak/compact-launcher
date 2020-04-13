/* global window, document */

import { getSetting, moveFile, openExpandWindow } from '../strings/ipc';
import { expandOnHover } from '../strings/settings';
import './app';

const expandButton = document.getElementById('expandButton');

const expand = () => {
  document.getElementById('rocket').classList.add('launch'); // rocket launch animation
  window.api.send(openExpandWindow);
};

const moveFileHandler = (event) => {
  // file drop handler
  event.preventDefault();
  event.stopPropagation();
  const files = [];
  for (const f of event.dataTransfer.files) {
    // get the
    files.push(f.path);
  }
  window.api.send(moveFile, files); // send the absolute paths of files to node server for moving
  return false;
};

const expandOnHoverHandler = async () => {
  const isExpandOnHover = await window.api.invoke(getSetting, expandOnHover);
  if (isExpandOnHover) {
    let openingTimeout = null;
    expandButton.addEventListener('mouseleave', () => {
      clearTimeout(openingTimeout); // if user gets there by accidently, don't expand the screen immediatly
      openingTimeout = null;
    });
    expandButton.addEventListener('mouseenter', () => {
      openingTimeout = setTimeout(() => {
        expand();
      }, 250);
    });
  } else {
    expandButton.addEventListener('click', () => expand());
  }
};

expandOnHoverHandler();

expandButton.addEventListener('drop', (event) => moveFileHandler(event));

expandButton.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});
