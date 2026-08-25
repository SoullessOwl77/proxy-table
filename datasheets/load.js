/* Loads datasheets/index.js then each faction pack, in order. */
(function () {
  var files = ["index.js", "demo.js", "orks.js", "adepta-sororitas.js", "adeptus-custodes.js", "adeptus-mechanicus.js", "aeldari.js", "astra-militarum.js", "chaos-daemons.js", "chaos-knights.js", "chaos-space-marines.js", "death-guard.js", "drukhari.js", "emperors-children.js", "genestealer-cults.js", "grey-knights.js", "imperial-agents.js", "imperial-knights.js", "leagues-of-votann.js", "necrons.js", "tau-empire.js", "thousand-sons.js", "tyranids.js", "world-eaters.js", "space-marines.js"];
  var src = document.currentScript && document.currentScript.src || "./datasheets/load.js";
  var base = src.replace(/load\.js(\?.*)?$/, "");
  var i;
  for (i = 0; i < files.length; i++) {
    document.write('<script src="' + base + files[i] + '"><\/script>');
  }
})();
