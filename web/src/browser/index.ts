import { app } from "./app";

// @ts-ignore
window.process = {
  nextTick: function nextTick(fn) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    setTimeout(function () {
      fn.apply(null, args);
    }, 0);
  },
};

app.listen({}, () => {
  console.log(`Browser app running`);
});
