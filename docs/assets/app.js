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

  function el(tag, className, textContent) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (textContent) node.textContent = textContent;
    return node;
  }

  // ========================================================================
  //  LA CARTE
  // ========================================================================
  var VB_W = 400; // largeur du repère SVG
  var X_LEFT = 118, X_RIGHT = 282; // le chemin serpente entre ces deux rives
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

  function renderMap() {
    var map = document.getElementById("map");
    map.textContent = "";
    var states = chapterStates();
    var pts = nodePoints(DATA.chapters.length);
    var height = Y_TOP + (DATA.chapters.length - 1) * Y_STEP + Y_BOTTOM;
    map.style.height = height + "px";

    // le chemin : tracé complet en pointillés, tracé parcouru en or
    var svg = svgEl("svg", {
      viewBox: "0 0 " + VB_W + " " + height,
      preserveAspectRatio: "none",
      "aria-hidden": "true",
    });
    svg.classList.add("map-svg");
    svg.appendChild(svgEl("path", { d: pathThrough(pts), class: "map-path-faint", "vector-effect": "non-scaling-stroke" }));

    var openCount = 0;
    while (openCount < states.length && states[openCount] === "open") openCount++;
    // le chemin doré va jusqu'à la porte où l'on peut frapper
    var litUpTo = Math.min(openCount + 1, pts.length);
    if (litUpTo >= 2) {
      svg.appendChild(
        svgEl("path", { d: pathThrough(pts.slice(0, litUpTo)), class: "map-path-lit", "vector-effect": "non-scaling-stroke" })
      );
    }
    map.appendChild(svg);

    // les étapes
    DATA.chapters.forEach(function (ch, i) {
      var st = states[i];
      var isLink = st !== "far";
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

    var done = openCount === DATA.chapters.length;
    document.getElementById("site-progress").textContent =
      done ? "toutes les portes sont ouvertes ❤" : openCount + " / " + DATA.chapters.length + " portes ouvertes";

    if (done) {
      var fin = el("div", "finale");
      fin.appendChild(el("p", null, "Tu as parcouru toute notre histoire. Chaque mot était déjà à toi. ❤"));
      map.parentNode.appendChild(fin);
    }
  }

  // ========================================================================
  //  LA PAGE D'UN POÈME
  // ========================================================================
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

    function showPoem(text) {
      setTitle(true);
      mainBox.textContent = "";
      var poem = el("div", "poem", text);
      mainBox.appendChild(poem);
      if (n === DATA.chapters.length && chapterStates().every(function (s) { return s === "open"; })) {
        var fin = el("div", "finale");
        fin.appendChild(el("p", null, "Tu as parcouru toute notre histoire. Chaque mot était déjà à toi. ❤"));
        mainBox.appendChild(fin);
      }
      renderNav();
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
            showPoem(text);
            window.scrollTo({ top: 0, behavior: "smooth" });
          },
          function () {
            submit.disabled = false;
            attempts++;
            feedback.textContent = WRONG[Math.min(attempts - 1, WRONG.length - 1)];
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
      tryUnlock(ch, saved).then(showPoem, function () {
        // clé obsolète (devinette changée depuis) : on repose la question
        showRiddle();
      });
    } else {
      showRiddle();
    }
  }

  // ========================================================================
  //  DÉMARRAGE
  // ========================================================================
  function boot() {
    var onMap = !!document.getElementById("map");

    if (onMap) {
      document.getElementById("site-title").textContent = DATA.title;
      document.getElementById("site-dedication").textContent = DATA.dedication;
      document.title = DATA.title;
      document.getElementById("reset").addEventListener("click", function () {
        if (confirm("Tout verrouiller à nouveau et recommencer le voyage ?")) {
          localStorage.removeItem(STORAGE_KEY);
          location.reload();
        }
      });
      renderMap();
    } else {
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
