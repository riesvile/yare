function format(fmt) {
  let re = /(%([oOjdifs%]))/g;
  let args = Array.prototype.slice.call(arguments, 1);
  fmt = "" + fmt;
  if (args.length) {
    fmt = fmt.replace(re, function (_, _, flag) {
      if (flag == "%") {
        return "%";
      }
      let arg = args.shift();
      switch (flag) {
        case "o":
        case "O":
        case "j":
          arg = JSON.stringify(arg);
          break;
        case "s":
          arg = "" + arg;
          break;
        case "d":
        case "i":
        case "f":
          arg = Number(arg);
          break;
      }
      return arg;
    });
  }

  if (args.length) {
    fmt += " " + args.join(" ");
  }

  return "" + fmt;
}

var log = channels.get("log");

global.console = {
  log: function (...args) {
    log.send(format(...args));
  },
};
