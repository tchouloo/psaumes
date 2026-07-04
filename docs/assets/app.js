/* ============================================================
   PSAUMES — application
   Déchiffre chaque texte avec la réponse à sa devinette.
   ============================================================ */

(function () {
  "use strict";

  var DATA = window.PSAUMES;
  var STORAGE_KEY = "psaumes.keys.v1";

  // --- normalisation (identique à tools/build.mjs) ---------------------
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

  // --- base64 -> ArrayBuffer -------------------------------------------
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

  // --- rendu -------------------------------------------------------------
  var ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];
  var main = document.getElementById("chapters");
  var state = { unlocked: {}, texts: {} }; // n -> true / n -> texte déchiffré

  function el(tag, className, textContent) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (textContent) node.textContent = textContent;
    return node;
  }

  function unlockedCount() {
    return Object.keys(state.unlocked).length;
  }

  function render() {
    main.textContent = "";
    var firstLockedShown = false;

    DATA.chapters.forEach(function (ch) {
      var isOpen = !!state.unlocked[ch.n];
      var card = el("article", "chapter" + (isOpen ? " is-open" : ""));
      var head = el("div", "chapter-head");
      head.appendChild(el("span", "chapter-num", ROMAN[ch.n - 1] || String(ch.n)));

      if (isOpen) {
        head.appendChild(el("h2", "chapter-title", ch.title));
        head.appendChild(el("span", "seal", "🕊️"));
        card.appendChild(head);
        card.appendChild(buildPoemSection(ch));
      } else {
        head.appendChild(el("h2", "chapter-title is-sealed", "scellé"));
        head.appendChild(el("span", "seal", "🔐"));
        card.appendChild(head);

        var reachable = !DATA.sequential || !firstLockedShown;
        if (reachable) {
          card.appendChild(buildRiddle(ch, card));
        } else {
          card.classList.add("is-far");
          card.appendChild(
            el("p", "locked-note", "Cette porte s’ouvrira après la précédente…")
          );
        }
        firstLockedShown = true;
      }

      main.appendChild(card);
    });

    if (unlockedCount() === DATA.chapters.length) {
      var fin = el("div", "finale");
      fin.appendChild(el("p", null, "Tu as ouvert toutes les portes. Chaque mot était déjà à toi. ❤"));
      main.appendChild(fin);
    }

    document.getElementById("site-progress").textContent =
      unlockedCount() + " / " + DATA.chapters.length + " portes ouvertes";
  }

  function buildPoemSection(ch) {
    var wrap = el("div");
    var poem = el("div", "poem", state.texts[ch.n]);
    var btn = el("button", "poem-toggle", "refermer le texte");
    btn.type = "button";
    var visible = true;
    btn.addEventListener("click", function () {
      visible = !visible;
      poem.style.display = visible ? "" : "none";
      btn.textContent = visible ? "refermer le texte" : "relire le texte";
    });
    wrap.appendChild(poem);
    wrap.appendChild(btn);
    return wrap;
  }

  function buildRiddle(ch, card) {
    var box = el("div", "riddle");
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
          state.unlocked[ch.n] = true;
          state.texts[ch.n] = text;
          saveKey(ch.n, normalize(value));
          render();
        },
        function () {
          submit.disabled = false;
          attempts++;
          feedback.textContent = WRONG[Math.min(attempts - 1, WRONG.length - 1)];
          card.classList.remove("shake");
          void card.offsetWidth; // relance l'animation
          card.classList.add("shake");
          input.select();
        }
      );
    });

    return box;
  }

  // --- démarrage : re-déchiffre avec les clés mémorisées -----------------
  function boot() {
    document.getElementById("site-title").textContent = DATA.title;
    document.getElementById("site-dedication").textContent = DATA.dedication;
    document.title = DATA.title;

    document.getElementById("reset").addEventListener("click", function () {
      if (confirm("Tout verrouiller à nouveau et recommencer le voyage ?")) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
      }
    });

    var keys = loadKeys();
    var jobs = DATA.chapters.map(function (ch) {
      var saved = keys[ch.n];
      if (!saved) return Promise.resolve();
      return tryUnlock(ch, saved).then(
        function (text) {
          state.unlocked[ch.n] = true;
          state.texts[ch.n] = text;
        },
        function () { /* clé obsolète (devinette changée) : on re-verrouille */ }
      );
    });

    Promise.all(jobs).then(render);
  }

  if (!window.isSecureContext || !window.crypto || !window.crypto.subtle) {
    main.textContent = "";
    main.appendChild(
      el(
        "p",
        "locked-note",
        "Ce recueil doit être ouvert via une adresse sécurisée (https). Demande le bon lien à celui qui te l’a offert…"
      )
    );
  } else {
    boot();
  }
})();
