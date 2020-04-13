/* global $ */

const decrement = (el, min) => {
  const value = Number.parseInt(el[0].value, 10);
  if (!min || value > min) {
    // eslint-disable-next-line no-param-reassign
    el[0].value = value - 1;
  }
};

const increment = (el, max) => {
  const value = Number.parseInt(el[0].value, 10);
  if (!max || value < max) {
    // eslint-disable-next-line no-param-reassign
    el[0].value = value + 1;
  }
};

const init = (el, els, min, max) => {
  els.dec.on('click', () => {
    decrement(el, min);
  });
  els.inc.on('click', () => {
    increment(el, max);
  });

  el.on('keyup keydown', (e) => {
    if (e.keyCode === 189) {
      e.preventDefault();
      return;
    }

    const item = e.target;
    const value = Number.parseInt(item.value, 10);
    if (
      e.keyCode !== 46 && // keycode for delete
      e.keyCode !== 8 // keycode for backspace
    ) {
      if (value > Number.parseInt($(item).attr('max'), 10)) {
        e.preventDefault();
        $(item).val($(item).attr('max'));
      } else if (value < Number.parseInt($(item).attr('min'), 10) || Number.isNaN(value)) {
        e.preventDefault();
        $(item).val($(item).attr('min'));
      }
    }
  });
};

export const inputNumber = (el) => {
  const min = el.attr('min') || false;
  const max = el.attr('max') || false;
  const els = {};

  els.dec = el.prev();
  els.inc = el.next();

  el.each(() => init(el, els, min, max));
};
