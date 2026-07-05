/* ============================================================
   PSAUMES — application
   Deux pages : la carte (index.html) et le poème (poeme.html).
   Chaque texte se déchiffre avec la réponse à sa devinette.
   ============================================================ */

(function () {
  "use strict";

  var DATA = window.PSAUMES;
  var STORAGE_KEY = "psaumes.keys.v1";
  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];

  // --- normalisation (identique à tools/build.mjs) ----------------------
  var DIACRITICS = new RegExp(
    "[" + String.fromCharCode(0x300) + "-" + String.fromCharCode(0x36f) + "]",
    "g"
  );
  function normalize(s) {
    return s
      .normalize("NFD")
      .replace(DIACRITICS, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  }

  // --- base64 -> Uint8Array ---------------------------------------------
  function b64(str) {
    var bin = atob(str);
    var buf = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    return buf;
  }

  // --- déchiffrement WebCrypto ------------------------------------------
  function deriveKey(answer, salt) {
    return crypto.subtle
      .importKey("raw", new TextEncoder().encode(answer), "PBKDF2", false, ["deriveKey"])
      .then(function (material) {
        return crypto.subtle.deriveKey(
          { name: "PBKDF2", salt: salt, iterations: DATA.iterations, hash: "SHA-256" },
          material,
          { name: "AES-GCM", length: 256 },
          false,
          ["decrypt"]
        );
      });
  }

  // Essaie de déchiffrer un chapitre avec une réponse. Résout avec le texte
  // en clair, ou rejette si la réponse est mauvaise (échec d'authentification GCM).
  function tryUnlock(chapter, rawAnswer) {
    var answer = normalize(rawAnswer);
    if (!answer) return Promise.reject(new Error("empty"));
    var attempt = Promise.reject();
    chapter.locks.forEach(function (lock) {
      attempt = attempt.catch(function () {
        return deriveKey(answer, b64(lock.s)).then(function (key) {
          return crypto.subtle
            .decrypt({ name: "AES-GCM", iv: b64(lock.i) }, key, b64(lock.d))
            .then(function (plain) {
              return new TextDecoder().decode(plain);
            });
        });
      });
    });
    return attempt;
  }

  // --- progression (réponses déjà trouvées, sur cet appareil) -----------
  function loadKeys() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }
  function saveKey(n, answer) {
    var keys = loadKeys();
    keys[n] = answer;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
    } catch (e) { /* mode privé : la progression ne survivra pas, tant pis */ }
  }

  // État de chaque porte : "open" (clé mémorisée), "current" (on peut y
  // frapper) ou "far" (les portes précédentes sont encore closes).
  function chapterStates() {
    var keys = loadKeys();
    var states = [];
    var blocked = false;
    DATA.chapters.forEach(function (ch) {
      if (keys[ch.n]) {
        states.push("open");
      } else if (!DATA.sequential || !blocked) {
        states.push("current");
        blocked = true;
      } else {
        states.push("far");
      }
    });
    return states;
  }

  // --- verrous temporels --------------------------------------------------
  function siteOpensAt() {
    if (!DATA.opensAt) return null;
    var d = new Date(DATA.opensAt);
    return isNaN(d.getTime()) ? null : d;
  }

  // Une porte par jour : la porte n s'ouvre à minuit, n-1 jours après dailyFrom.
  function doorOpensAt(n) {
    if (!DATA.dailyFrom) return null;
    var d = new Date(DATA.dailyFrom + "T00:00:00");
    if (isNaN(d.getTime())) return null;
    return new Date(d.getTime() + (n - 1) * 86400000);
  }

  function doorIsWaiting(n) {
    var at = doorOpensAt(n);
    return at !== null && at.getTime() > Date.now();
  }

  function fmtDelta(ms) {
    var s = Math.max(0, Math.ceil(ms / 1000));
    var j = Math.floor(s / 86400); s -= j * 86400;
    var h = Math.floor(s / 3600); s -= h * 3600;
    var m = Math.floor(s / 60); s -= m * 60;
    var parts = [];
    if (j) parts.push(j + " j");
    if (j || h) parts.push(h + " h");
    if (j || h || m) parts.push(m + " min");
    parts.push(s + " s");
    return parts.join(" ");
  }

  function greeting() {
    var h = new Date().getHours();
    var word = h >= 18 || h < 5 ? "bonsoir" : "bonjour";
    return DATA.beloved ? word + ", " + DATA.beloved.toLowerCase() : "pour toi, seulement pour toi";
  }

  function vibrate(pattern) {
    if (navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch (e) { /* pas grave */ }
    }
  }

  function el(tag, className, textContent) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (textContent) node.textContent = textContent;
    return node;
  }

  // ========================================================================
  //  LE VRAI CIEL — les étoiles brillantes à leur position du soir choisi
  // ========================================================================
  // Catalogue : [ascension droite (h), déclinaison (°), magnitude]
  var STARS = [
    [6.752, -16.72, -1.46], [6.4, -52.7, -0.74], [14.66, -60.83, -0.27],
    [14.261, 19.18, -0.05], [18.615, 38.78, 0.03], [5.278, 45.99, 0.08],
    [5.242, -8.2, 0.13], [7.655, 5.22, 0.34], [5.919, 7.41, 0.5],
    [1.629, -57.24, 0.46], [14.064, -60.37, 0.61], [19.846, 8.87, 0.76],
    [4.599, 16.51, 0.86], [16.49, -26.43, 0.96], [13.42, -11.16, 0.97],
    [7.755, 28.03, 1.14], [22.961, -29.62, 1.16], [20.69, 45.28, 1.25],
    [12.795, -59.69, 1.25], [10.139, 11.97, 1.4], [6.977, -28.97, 1.5],
    [7.577, 31.89, 1.58], [17.56, -37.1, 1.63], [12.519, -57.11, 1.64],
    [5.419, 6.35, 1.64], [5.438, 28.61, 1.68], [9.22, -69.72, 1.69],
    [5.603, -1.2, 1.69], [22.137, -46.96, 1.74], [5.679, -1.94, 1.77],
    [12.9, 55.96, 1.77], [11.062, 61.75, 1.79], [3.405, 49.86, 1.79],
    [7.14, -26.39, 1.84], [17.622, -43.0, 1.87], [18.403, -34.38, 1.85],
    [8.375, -59.51, 1.86], [13.792, 49.31, 1.86], [5.995, 44.95, 1.9],
    [16.811, -69.03, 1.92], [6.628, 16.4, 1.92], [20.427, -56.74, 1.94],
    [8.745, -54.71, 1.96], [6.378, -17.96, 1.98], [9.46, -8.66, 1.98],
    [2.53, 89.26, 1.98], [2.12, 23.46, 2.0], [0.726, -17.99, 2.02],
    [13.399, 54.93, 2.04], [14.111, -36.37, 2.06], [5.533, -0.3, 2.23],
    [5.796, -9.67, 2.09], [0.14, 29.09, 2.06], [23.079, 15.21, 2.48],
    [23.063, 28.08, 2.42], [21.736, 9.88, 2.39], [17.582, 12.56, 2.07],
    [14.845, 74.16, 2.08], [11.818, 14.57, 2.14], [10.333, 19.84, 2.28],
    [15.578, 26.71, 2.23], [15.737, 6.43, 2.65], [20.371, 40.26, 2.23],
    [19.512, 27.96, 3.18], [17.943, 51.49, 2.23], [0.675, 56.54, 2.24],
    [0.153, 59.15, 2.27], [1.43, 60.24, 2.68], [3.136, 40.96, 2.12],
    [2.065, 42.33, 2.26], [1.162, 35.62, 2.05], [18.921, -26.3, 2.05],
  ];

  function drawRealSky() {
    if (!DATA.sky || !DATA.sky.date) return;
    var when = new Date(DATA.sky.date);
    if (isNaN(when.getTime())) return;
    var lat = (DATA.sky.lat || 0) * Math.PI / 180;
    var lonDeg = DATA.sky.lon || 0;

    var canvas = document.createElement("canvas");
    canvas.className = "sky-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    var deco = document.querySelector(".stars");
    if (deco) deco.classList.add("is-dimmed");

    // temps sidéral local (précision largement suffisante pour un ciel d'amour)
    var jd = when.getTime() / 86400000 + 2440587.5;
    var gmst = (280.46061837 + 360.98564736629 * (jd - 2451545.0)) % 360;
    var lst = ((gmst + lonDeg) % 360 + 360) % 360;

    function draw() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = window.innerWidth, h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      var ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);
      var cx = w / 2, cy = h * 0.46;
      var R = Math.max(w, h) * 0.72;

      STARS.forEach(function (star) {
        var ra = star[0] * 15, dec = star[1] * Math.PI / 180, mag = star[2];
        var ha = (lst - ra) * Math.PI / 180;
        var sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
        var alt = Math.asin(sinAlt);
        if (alt < 0.06) return; // sous l'horizon
        var az = Math.atan2(
          -Math.sin(ha) * Math.cos(dec),
          Math.sin(dec) * Math.cos(lat) - Math.sin(lat) * Math.cos(dec) * Math.cos(ha)
        );
        var r = (1 - alt / (Math.PI / 2)) * R;
        var x = cx + r * Math.sin(az);
        var y = cy - r * Math.cos(az);
        if (x < -10 || x > w + 10 || y < -10 || y > h + 10) return;
        var size = Math.min(3.1, Math.max(0.7, 2.7 - 0.5 * mag));
        var alpha = Math.min(1, Math.max(0.3, 1.05 - 0.22 * mag));
        ctx.beginPath();
        ctx.fillStyle = "rgba(245, 236, 210, " + alpha.toFixed(2) + ")";
        ctx.shadowColor = "rgba(212, 175, 106, .8)";
        ctx.shadowBlur = size * 3;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    draw();
    window.addEventListener("resize", draw);

    var footer = document.querySelector(".footer");
    if (footer) {
      footer.insertBefore(el("p", "sky-caption", "☾ le ciel de ce soir-là"), footer.firstChild);
    }
  }

  // ========================================================================
  //  LA CARTE
  // ========================================================================
  var VB_W = 400;
  var X_LEFT = 118, X_RIGHT = 282;
  var Y_STEP = 168, Y_TOP = 70, Y_BOTTOM = 90;

  function nodePoints(count) {
    var pts = [];
    for (var i = 0; i < count; i++) {
      pts.push({ x: i % 2 === 0 ? X_LEFT : X_RIGHT, y: Y_TOP + i * Y_STEP });
    }
    return pts;
  }

  function pathThrough(pts) {
    if (pts.length < 2) return "";
    var d = "M " + pts[0].x + " " + pts[0].y;
    for (var i = 1; i < pts.length; i++) {
      var midY = (pts[i - 1].y + pts[i].y) / 2;
      d += " C " + pts[i - 1].x + " " + midY + ", " + pts[i].x + " " + midY + ", " + pts[i].x + " " + pts[i].y;
    }
    return d;
  }

  function svgEl(name, attrs) {
    var node = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  // La constellation finale : les onze étoiles se relient en cœur,
  // et son prénom s'écrit dans le ciel.
  function heartPoints(count) {
    var pts = [];
    for (var i = 0; i < count; i++) {
      var t = (2 * Math.PI * i) / count + Math.PI; // départ à la pointe du cœur
      var x = 16 * Math.pow(Math.sin(t), 3);
      var y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      pts.push({ x: 130 + x * 6.4, y: 118 - y * 6.4 });
    }
    return pts;
  }

  function renderConstellation(container) {
    var box = el("div", "constellation");
    var svg = svgEl("svg", { viewBox: "0 0 260 260", "aria-hidden": "true" });
    var pts = heartPoints(DATA.chapters.length);

    var d = "M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
    for (var i = 1; i < pts.length; i++) d += " L " + pts[i].x.toFixed(1) + " " + pts[i].y.toFixed(1);
    d += " Z";
    svg.appendChild(svgEl("path", { d: d, class: "const-path" }));

    pts.forEach(function (p, i) {
      var star = svgEl("circle", { cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 2.6, class: "const-star" });
      star.style.animationDelay = (i * 0.28) + "s";
      svg.appendChild(star);
    });

    box.appendChild(svg);
    if (DATA.beloved) box.appendChild(el("p", "const-name", DATA.beloved));
    box.appendChild(el("p", "const-note", "Onze étoiles. Une seule histoire. La nôtre."));
    container.appendChild(box);

    try {
      if (!sessionStorage.getItem("psaumes.finale")) {
        sessionStorage.setItem("psaumes.finale", "1");
        setTimeout(function () { box.scrollIntoView({ behavior: "smooth", block: "center" }); }, 800);
      }
    } catch (e) { /* mode privé */ }
  }

  function renderMap() {
    var map = document.getElementById("map");
    map.textContent = "";
    var states = chapterStates();
    var pts = nodePoints(DATA.chapters.length);
    var height = Y_TOP + (DATA.chapters.length - 1) * Y_STEP + Y_BOTTOM;
    map.style.height = height + "px";

    var svg = svgEl("svg", {
      viewBox: "0 0 " + VB_W + " " + height,
      preserveAspectRatio: "none",
      "aria-hidden": "true",
    });
    svg.classList.add("map-svg");
    svg.appendChild(svgEl("path", { d: pathThrough(pts), class: "map-path-faint", "vector-effect": "non-scaling-stroke" }));

    var openCount = 0;
    while (openCount < states.length && states[openCount] === "open") openCount++;
    var litUpTo = Math.min(openCount + 1, pts.length);
    if (litUpTo >= 2) {
      svg.appendChild(
        svgEl("path", { d: pathThrough(pts.slice(0, litUpTo)), class: "map-path-lit", "vector-effect": "non-scaling-stroke" })
      );
    }
    map.appendChild(svg);

    var tickTargets = [];

    DATA.chapters.forEach(function (ch, i) {
      var st = states[i];
      var waiting = st === "current" && doorIsWaiting(ch.n);
      var isLink = st !== "far" && !waiting;
      var node = el(isLink ? "a" : "div", "map-node is-" + st + (pts[i].x === X_LEFT ? " on-left" : " on-right"));
      if (isLink) node.href = "poeme.html?p=" + ch.n;

      var marker = el("span", "map-marker");
      marker.appendChild(el("span", "map-marker-num", ROMAN[i] || String(ch.n)));
      node.appendChild(marker);

      var label = el("span", "map-label");
      label.appendChild(el("span", "map-stage", ch.stage));
      if (st === "open") {
        label.appendChild(el("span", "map-title", ch.title));
        if (ch.mapNote) label.appendChild(el("span", "map-note", ch.mapNote));
      } else if (st === "current" && waiting) {
        var wait = el("span", "map-title is-cta");
        label.appendChild(wait);
        tickTargets.push({ node: wait, n: ch.n });
      } else if (st === "current") {
        label.appendChild(el("span", "map-title is-cta", "frapper à la porte…"));
        if (ch.mapNote) label.appendChild(el("span", "map-note", ch.mapNote));
      } else {
        label.appendChild(el("span", "map-title is-sealed-note", "encore scellée"));
      }
      node.appendChild(label);

      node.style.top = pts[i].y + "px";
      node.style.left = (pts[i].x / VB_W) * 100 + "%";
      map.appendChild(node);
    });

    // compte à rebours des portes en attente de leur jour
    if (tickTargets.length) {
      var tick = function () {
        var stillWaiting = false;
        tickTargets.forEach(function (t) {
          var ms = doorOpensAt(t.n).getTime() - Date.now();
          if (ms > 0) {
            t.node.textContent = "s'ouvre dans " + fmtDelta(ms);
            stillWaiting = true;
          }
        });
        if (!stillWaiting) {
          clearInterval(timer);
          renderMap();
        }
      };
      var timer = setInterval(tick, 1000);
      tick();
    }

    var done = openCount === DATA.chapters.length;
    document.getElementById("site-progress").textContent =
      done ? "toutes les portes sont ouvertes ❤" : openCount + " / " + DATA.chapters.length + " portes ouvertes";

    if (done) renderConstellation(map.parentNode);
  }

  // Le voile du compte à rebours : le recueil ne s'ouvre qu'au moment choisi.
  function renderCountdownVeil(opensAt) {
    var map = document.getElementById("map");
    map.textContent = "";
    map.style.height = "auto";
    var help = document.querySelector(".hero-help");
    if (help) help.style.display = "none";

    var veil = el("div", "veil");
    veil.appendChild(el("p", "veil-word", "Patience" + (DATA.beloved ? ", " + DATA.beloved : "") + "…"));
    var count = el("p", "veil-count", "");
    veil.appendChild(count);
    veil.appendChild(el("p", "veil-note", "Le voyage commencera à l'heure dite. Chaque chose, en son temps."));
    map.appendChild(veil);

    var timer = setInterval(function () {
      var ms = opensAt.getTime() - Date.now();
      if (ms <= 0) {
        clearInterval(timer);
        if (help) help.style.display = "";
        renderMap();
      } else {
        count.textContent = fmtDelta(ms);
      }
    }, 1000);
    count.textContent = fmtDelta(opensAt.getTime() - Date.now());
  }

  // ========================================================================
  //  LA PAGE D'UN POÈME
  // ========================================================================

  // La cérémonie : le sceau tremble, se brise en étincelles, la porte s'ouvre.
  function ceremony(box) {
    return new Promise(function (resolve) {
      vibrate([18, 70, 28]);
      var ov = el("div", "ceremony");
      var seal = el("div", "ceremony-seal", "🔐");
      ov.appendChild(seal);
      for (var i = 0; i < 12; i++) {
        var spark = el("span", "ceremony-spark");
        spark.style.setProperty("--angle", (i * 30 + Math.random() * 14) + "deg");
        spark.style.setProperty("--dist", (60 + Math.random() * 60) + "px");
        spark.style.animationDelay = (0.85 + Math.random() * 0.15) + "s";
        ov.appendChild(spark);
      }
      box.textContent = "";
      box.appendChild(ov);
      setTimeout(function () {
        seal.textContent = "🕊️";
        seal.classList.add("is-free");
        ov.classList.add("is-burst");
        vibrate(12);
      }, 900);
      setTimeout(resolve, 2200);
    });
  }

  function renderPoemPage() {
    var mainBox = document.getElementById("poem-main");
    var navBox = document.getElementById("poem-nav");
    var params = new URLSearchParams(location.search);
    var n = parseInt(params.get("p"), 10);

    if (!n || n < 1 || n > DATA.chapters.length) {
      location.replace("./");
      return;
    }

    var ch = DATA.chapters[n - 1];
    var states = chapterStates();
    var st = states[n - 1];

    document.getElementById("poem-stage").textContent = ch.stage;
    document.getElementById("poem-num").textContent =
      "porte " + (ROMAN[n - 1] || n) + " sur " + DATA.chapters.length;

    function setTitle(open) {
      var t = open ? ch.title : "Porte scellée";
      document.getElementById("poem-title").textContent = t;
      document.title = DATA.title + " — " + (open ? ch.title : ch.stage);
      document.getElementById("poem-title").classList.toggle("is-sealed-title", !open);
    }

    function renderNav() {
      navBox.textContent = "";
      var freshStates = chapterStates();
      if (n > 1) {
        var prev = el("a", "nav-link", "← " + DATA.chapters[n - 2].stage);
        prev.href = "poeme.html?p=" + (n - 1);
        navBox.appendChild(prev);
      }
      var mapLink = el("a", "nav-link is-center", "la carte");
      mapLink.href = "./";
      navBox.appendChild(mapLink);
      if (n < DATA.chapters.length && freshStates[n] !== "far") {
        var next = el("a", "nav-link", DATA.chapters[n].stage + " →");
        next.href = "poeme.html?p=" + (n + 1);
        navBox.appendChild(next);
      }
    }

    // Le poème, vers par vers — au rythme d'une respiration.
    function showPoem(text, animated) {
      setTitle(true);
      mainBox.textContent = "";
      var poem = el("div", "poem");

      if (!animated) {
        poem.textContent = text;
        mainBox.appendChild(poem);
      } else {
        poem.classList.add("is-lines");
        var lines = text.split("\n");
        var last = 0;
        lines.forEach(function (line, i) {
          var row = el("div", "poem-line");
          if (line.trim() === "") {
            row.classList.add("is-blank");
          } else {
            row.textContent = line;
          }
          // les douze premiers vers respirent, la suite s'accélère doucement
          last = 0.6 + (i < 12 ? i * 0.55 : 12 * 0.55 + (i - 12) * 0.2);
          row.style.animationDelay = last.toFixed(2) + "s";
          poem.appendChild(row);
        });
        mainBox.appendChild(poem);

        var skip = el("button", "poem-skip", "✦ tout afficher");
        skip.type = "button";
        skip.addEventListener("click", function () {
          poem.classList.add("is-instant");
          skip.remove();
        });
        mainBox.appendChild(skip);
        setTimeout(function () { skip.remove(); }, (last + 1.2) * 1000);
      }

      if (n === DATA.chapters.length && chapterStates().every(function (s) { return s === "open"; })) {
        var fin = el("div", "finale");
        fin.appendChild(
          el("p", null, "Tu as parcouru toute notre histoire" + (DATA.beloved ? ", " + DATA.beloved : "") + ". Retourne voir la carte, le ciel a quelque chose à te dire… ❤")
        );
        mainBox.appendChild(fin);
      }
      renderNav();
    }

    // La porte n'a pas encore atteint son jour : compte à rebours.
    function showDoorCountdown() {
      setTitle(false);
      mainBox.textContent = "";
      var box = el("div", "riddle chapter is-open door-wait");
      box.appendChild(el("p", "riddle-q", "Chaque porte a son jour" + (DATA.beloved ? ", " + DATA.beloved : "") + ". Celle-ci s'ouvrira dans…"));
      var count = el("p", "veil-count", "");
      box.appendChild(count);
      if (ch.mapNote) box.appendChild(el("p", "locked-note", ch.mapNote));
      mainBox.appendChild(box);
      renderNav();

      var timer = setInterval(function () {
        var ms = doorOpensAt(n).getTime() - Date.now();
        if (ms <= 0) {
          clearInterval(timer);
          showRiddle();
        } else {
          count.textContent = fmtDelta(ms);
        }
      }, 1000);
      count.textContent = fmtDelta(doorOpensAt(n).getTime() - Date.now());
    }

    function showRiddle() {
      setTitle(false);
      mainBox.textContent = "";
      var box = el("div", "riddle chapter is-open");
      box.appendChild(el("p", "riddle-q", ch.riddle));

      var form = el("form", "riddle-form");
      var input = el("input", "riddle-input");
      input.type = "text";
      input.placeholder = "ta réponse…";
      input.autocomplete = "off";
      input.setAttribute("aria-label", "Réponse à la devinette");
      var submit = el("button", "riddle-submit", "Ouvrir");
      submit.type = "submit";
      form.appendChild(input);
      form.appendChild(submit);
      box.appendChild(form);

      var feedback = el("p", "riddle-feedback", "");
      box.appendChild(feedback);

      if (ch.hint) {
        var hintBtn = el("button", "riddle-hint-btn", "un indice ?");
        hintBtn.type = "button";
        var hint = el("p", "riddle-hint", "");
        hintBtn.addEventListener("click", function () {
          hint.textContent = "✧ " + ch.hint;
          hintBtn.style.display = "none";
        });
        box.appendChild(hintBtn);
        box.appendChild(hint);
      }

      var attempts = 0;
      var WRONG = [
        "Non… cherche encore.",
        "Ce n’est pas ça. Ferme les yeux, souviens-toi.",
        "Toujours pas. Tu me connais mieux que ça…",
        "Essaie encore. L’indice peut t’aider.",
      ];

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var value = input.value;
        if (!normalize(value)) return;
        submit.disabled = true;
        feedback.textContent = "";

        tryUnlock(ch, value).then(
          function (text) {
            saveKey(ch.n, normalize(value));
            ceremony(box).then(function () {
              showPoem(text, true);
              window.scrollTo({ top: 0, behavior: "smooth" });
            });
          },
          function () {
            submit.disabled = false;
            attempts++;
            feedback.textContent = WRONG[Math.min(attempts - 1, WRONG.length - 1)];
            vibrate([40, 40, 40]);
            box.classList.remove("shake");
            void box.offsetWidth; // relance l'animation
            box.classList.add("shake");
            input.select();
          }
        );
      });

      mainBox.appendChild(box);
      renderNav();
      input.focus();
    }

    if (st === "far") {
      setTitle(false);
      mainBox.textContent = "";
      mainBox.appendChild(
        el("p", "locked-note is-center", "Cette porte s’ouvrira après les précédentes. Le chemin se parcourt pas à pas…")
      );
      renderNav();
      return;
    }

    if (st === "open") {
      var saved = loadKeys()[ch.n];
      tryUnlock(ch, saved).then(
        function (text) { showPoem(text, false); },
        function () {
          // clé obsolète (devinette changée depuis) : on repose la question
          if (doorIsWaiting(n)) showDoorCountdown();
          else showRiddle();
        }
      );
    } else if (doorIsWaiting(n)) {
      showDoorCountdown();
    } else {
      showRiddle();
    }
  }

  // ========================================================================
  //  DÉMARRAGE
  // ========================================================================
  function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () { /* hors ligne indisponible, tant pis */ });
    }
  }

  function boot() {
    var onMap = !!document.getElementById("map");
    var eyebrow = document.querySelector(".hero-eyebrow");
    if (eyebrow) eyebrow.textContent = greeting();

    drawRealSky();
    registerServiceWorker();

    if (onMap) {
      document.getElementById("site-title").textContent = DATA.title;
      document.getElementById("site-dedication").textContent = DATA.dedication;
      document.title = DATA.title;
      document.getElementById("reset").addEventListener("click", function () {
        if (confirm("Tout verrouiller à nouveau et recommencer le voyage ?")) {
          localStorage.removeItem(STORAGE_KEY);
          try { sessionStorage.removeItem("psaumes.finale"); } catch (e) { /* rien */ }
          location.reload();
        }
      });

      var opensAt = siteOpensAt();
      if (opensAt && opensAt.getTime() > Date.now()) {
        document.getElementById("site-progress").textContent = "";
        renderCountdownVeil(opensAt);
      } else {
        renderMap();
      }
    } else {
      var siteAt = siteOpensAt();
      if (siteAt && siteAt.getTime() > Date.now()) {
        location.replace("./"); // le recueil n'est pas encore ouvert
        return;
      }
      renderPoemPage();
    }
  }

  if (!window.isSecureContext || !window.crypto || !window.crypto.subtle) {
    var box = document.getElementById("map") || document.getElementById("poem-main");
    if (box) {
      box.textContent = "";
      box.appendChild(
        el(
          "p",
          "locked-note is-center",
          "Ce recueil doit être ouvert via une adresse sécurisée (https). Demande le bon lien à celui qui te l’a offert…"
        )
      );
    }
  } else {
    boot();
  }
})();
