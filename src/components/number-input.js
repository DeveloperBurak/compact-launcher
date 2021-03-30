import $ from "jquery";

(function () {

  window.inputNumber = function (el) {

    let min = el.attr('min') || false;
    let max = el.attr('max') || false;

    let els = {};

    els.dec = el.prev();
    els.inc = el.next();

    el.each(function () {
      init($(this));
    });


    function init(el) {

      els.dec.on('click', decrement);
      els.inc.on('click', increment);

      function decrement() {
        let value = el[0].value;
        value--;
        if (!min || value >= min) {
          el[0].value = value;
        }
      }

      el.on('keyup keydown', (e) => {
        let item = e.target; // $(this) selector not working
        if (e.target.value > parseInt($(item).attr('max'))
          && e.keyCode !== 46 // keycode for delete
          && e.keyCode !== 8 // keycode for backspace
        ) {
          e.preventDefault();
          $(item).val($(item).attr('max'));
        }
      });

      function increment() {
        let value = el[0].value;
        value++;
        if (!max || value <= max) {
          el[0].value = value++;
        }
      }
    }
  }
})();

inputNumber($('.input-number'));
