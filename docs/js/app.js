/* 射频计算器（目前仅pa）v1.0.0 — 全局主题、窄屏左右分页 Dock、末页设置式布局、双纵轴、MHz⇄GHz 互显 */

(function () {
  "use strict";

  const STORAGE_KEY = "rf-pa-calculator-records-v1";
  const APPEARANCE_STORAGE_KEY = "rf-pa-appearance-v1";
  const FONT_SCALE_STORAGE_KEY = "rf-pa-font-scale-v1";

  const FREQ_TO_HZ = { hz: 1, khz: 1e3, mhz: 1e6, ghz: 1e9 };

  const PRESET_PRIMARY_HEX = [
    "#6750a4",
    "#006a6b",
    "#7d5260",
    "#0061a4",
    "#7f5800",
    "#b3261e",
    "#386a20",
    "#5c4033",
  ];

  function freqToHz(value, unit) {
    return value * FREQ_TO_HZ[unit];
  }

  function mwToDbm(mw) {
    if (!(mw > 0)) return NaN;
    return 10 * Math.log10(mw);
  }

  function intPartDigitCount(x) {
    if (!isFinite(x)) return 99;
    var ix = Math.floor(Math.abs(x));
    if (ix === 0) return 1;
    return String(ix).length;
  }

  function smartLinearPower(mw) {
    if (!isFinite(mw) || mw <= 0) return { value: 0, unit: "mW" };
    var w = mw / 1000;
    if (w >= 1 && w < 1000) return { value: w, unit: "W" };
    if (mw >= 1 && mw < 1000) return { value: mw, unit: "mW" };
    return { value: mw * 1000, unit: "µW" };
  }

  function preferDbmPrimary(dbm, lin) {
    var d = intPartDigitCount(dbm);
    var l = intPartDigitCount(lin.value);
    if (d < l) return true;
    if (l < d) return false;
    return true;
  }

  function trimFreqNum(v) {
    var av = Math.abs(v);
    if (av >= 100) return v.toFixed(2);
    if (av >= 10) return v.toFixed(3);
    return v.toFixed(4);
  }

  function formatFreqSmart(hz) {
    if (!isFinite(hz)) return "—";
    if (hz === 0) return "0 Hz";
    var sign = hz < 0 ? "-" : "";
    var hzAbs = Math.abs(hz);
    var units = [
      { div: 1e9, s: "GHz" },
      { div: 1e6, s: "MHz" },
      { div: 1e3, s: "kHz" },
      { div: 1, s: "Hz" },
    ];
    var i;
    for (i = 0; i < units.length; i++) {
      var vv = hz / units[i].div;
      if (Math.abs(vv) >= 1 && Math.abs(vv) < 1000) {
        return sign + trimFreqNum(vv) + " " + units[i].s;
      }
    }
    return sign + trimFreqNum(hz / 1e9) + " GHz";
  }

  function formatLinearPower(lin) {
    var v = lin.value;
    var av = Math.abs(v);
    var dec = av >= 100 ? 2 : av >= 10 ? 3 : 4;
    return v.toFixed(dec) + " " + lin.unit;
  }

  function formatPowerDual(mw) {
    if (!isFinite(mw) || mw <= 0) return "—";
    var dbm = mwToDbm(mw);
    if (!isFinite(dbm)) return "—";
    var lin = smartLinearPower(mw);
    var linStr = formatLinearPower(lin);
    var dbmStr = dbm.toFixed(2) + " dBm";
    var primaryLog = preferDbmPrimary(dbm, lin);
    if (primaryLog) return dbmStr + " / " + linStr;
    return linStr + " / " + dbmStr;
  }

  function formatPowerHint(mw, selectedUnit) {
    if (!isFinite(mw) || mw <= 0) return "";
    var isLog = selectedUnit === "dbm" || selectedUnit === "dbw";
    if (isLog) {
      return formatLinearPower(smartLinearPower(mw));
    }
    return mwToDbm(mw).toFixed(2) + " dBm（" + (mwToDbm(mw) - 30).toFixed(2) + " dBW）";
  }

  function powerToMw(value, unit) {
    switch (unit) {
      case "dbm":
        return Math.pow(10, value / 10);
      case "dbw":
        return Math.pow(10, (value + 30) / 10);
      case "uw":
        return value / 1000;
      case "mw":
        return value;
      case "w":
        return value * 1000;
      default:
        return NaN;
    }
  }

  function gainDb(pinMw, poutMw) {
    if (pinMw <= 0 || poutMw <= 0) return NaN;
    return 10 * Math.log10(poutMw / pinMw);
  }

  function drainEfficiency(poutMw, pdcMw) {
    if (pdcMw <= 0 || poutMw < 0) return NaN;
    return poutMw / pdcMw;
  }

  function powerAddedEfficiency(pinMw, poutMw, pdcMw) {
    if (pdcMw <= 0) return NaN;
    var added = poutMw - pinMw;
    if (added < 0) return NaN;
    return added / pdcMw;
  }

  function pct(x) {
    if (x === undefined || x === null || isNaN(x)) return "—";
    return (100 * x).toFixed(2) + " %";
  }

  function fmtDb(x) {
    if (isNaN(x)) return "—";
    return x.toFixed(3) + " dB";
  }

  function powerPrimaryKind(mw) {
    if (!isFinite(mw) || mw <= 0) return "log";
    return preferDbmPrimary(mwToDbm(mw), smartLinearPower(mw)) ? "log" : "lin";
  }

  function convertMwToLinUnit(mw, unit) {
    if (unit === "W") return mw / 1000;
    if (unit === "mW") return mw;
    return mw * 1000;
  }

  function chooseUnifiedLinearUnit(mwList) {
    var maxW = Math.max.apply(
      null,
      mwList.map(function (m) {
        return m / 1000;
      })
    );
    if (maxW >= 1) return { unit: "W", label: "W" };
    var maxMw = Math.max.apply(null, mwList);
    if (maxMw >= 1) return { unit: "mW", label: "mW" };
    return { unit: "µW", label: "µW" };
  }

  function buildPowerAxis(records, getterMw, baseName) {
    if (!records.length) {
      return {
        label: baseName + " (dBm)",
        fn: function (r) {
          return mwToDbm(getterMw(r));
        },
      };
    }
    var kinds = records.map(function (r) {
      return powerPrimaryKind(getterMw(r));
    });
    var allLog = kinds.every(function (k) {
      return k === "log";
    });
    var allLin = kinds.every(function (k) {
      return k === "lin";
    });
    if (allLog) {
      return {
        label: baseName + " (dBm)",
        fn: function (r) {
          return mwToDbm(getterMw(r));
        },
      };
    }
    if (allLin) {
      var mws = records.map(function (r) {
        return getterMw(r);
      });
      var u = chooseUnifiedLinearUnit(mws);
      return {
        label: baseName + " (" + u.label + ")",
        fn: function (r) {
          return convertMwToLinUnit(getterMw(r), u.unit);
        },
      };
    }
    return {
      label: baseName + " (dBm)",
      fn: function (r) {
        return mwToDbm(getterMw(r));
      },
    };
  }

  function chooseFreqChartScale(records) {
    if (!records.length) return { divisor: 1e6, suffix: "MHz", label: "频率 (MHz)" };
    var sorted = records.slice().sort(function (a, b) {
      return a.freqHz - b.freqHz;
    });
    var mid = sorted[Math.floor(sorted.length / 2)].freqHz;
    var a = Math.abs(mid);
    if (a >= 1e9) return { divisor: 1e9, suffix: "GHz", label: "频率 (GHz)" };
    if (a >= 1e6) return { divisor: 1e6, suffix: "MHz", label: "频率 (MHz)" };
    if (a >= 1e3) return { divisor: 1e3, suffix: "kHz", label: "频率 (kHz)" };
    return { divisor: 1, suffix: "Hz", label: "频率 (Hz)" };
  }

  function computeChartMeta(records) {
    var fs = chooseFreqChartScale(records);
    var pinAx = buildPowerAxis(records, function (r) {
      return r.pinMw;
    }, "Pin");
    var poutAx = buildPowerAxis(records, function (r) {
      return r.poutMw;
    }, "Pout");
    var pdcAx = buildPowerAxis(records, function (r) {
      return r.pdcMw;
    }, "PDC");
    return {
      freqDivisor: fs.divisor,
      freqLabel: fs.label,
      pinLabel: pinAx.label,
      pinFn: pinAx.fn,
      poutLabel: poutAx.label,
      poutFn: poutAx.fn,
      pdcLabel: pdcAx.label,
      pdcFn: pdcAx.fn,
    };
  }

  function recordToPoint(rec, meta) {
    return {
      freq: rec.freqHz / meta.freqDivisor,
      pin: meta.pinFn(rec),
      pout: meta.poutFn(rec),
      pdc: meta.pdcFn(rec),
      gainDb: rec.gainDb,
      dePct: isFinite(rec.de) ? 100 * rec.de : NaN,
      paePct: isFinite(rec.pae) ? 100 * rec.pae : NaN,
    };
  }

  const AXIS_ORDER = ["freq", "pin", "pout", "pdc", "gainDb", "dePct", "paePct"];

  function axisLabelFromMeta(key, meta) {
    switch (key) {
      case "freq":
        return meta.freqLabel;
      case "pin":
        return meta.pinLabel;
      case "pout":
        return meta.poutLabel;
      case "pdc":
        return meta.pdcLabel;
      case "gainDb":
        return "增益 G (dB)";
      case "dePct":
        return "DE (%)";
      case "paePct":
        return "PAE (%)";
      default:
        return key;
    }
  }

  function loadRecords() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveRecords(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function rgbToHex(r, g, b) {
    return (
      "#" +
      [r, g, b]
        .map(function (x) {
          var h = Math.round(x).toString(16);
          return h.length === 1 ? "0" + h : h;
        })
        .join("")
    );
  }

  function lighten(r, g, b, t) {
    return [r + (255 - r) * t, g + (255 - g) * t, b + (255 - b) * t];
  }

  function darken(r, g, b, t) {
    return [r * (1 - t), g * (1 - t), b * (1 - t)];
  }

  function relativeLuminance(r, g, b) {
    function lin(c) {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }
    var rs = lin(r),
      gs = lin(g),
      bs = lin(b);
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function buildPaletteFromRgb(r, g, b) {
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    var sat = Math.max(r, g, b) - Math.min(r, g, b);
    if (sat < 28) {
      r = Math.min(255, r + 40);
      b = Math.min(255, b + 60);
    }
    var primary = rgbToHex(r, g, b);
    var lum = relativeLuminance(r, g, b);
    var onPrimary = lum > 0.5 ? rgbToHex.apply(null, darken(r, g, b, 0.85)) : "#ffffff";
    var contRgb = lighten(r, g, b, 0.82);
    var cr = contRgb[0],
      cg = contRgb[1],
      cb = contRgb[2];
    var container = rgbToHex(cr, cg, cb);
    var onContainer =
      relativeLuminance(cr, cg, cb) > 0.5
        ? rgbToHex.apply(null, darken(cr, cg, cb, 0.75))
        : rgbToHex(33, 31, 38);
    return {
      primary: primary,
      onPrimary: onPrimary,
      container: container,
      onContainer: onContainer,
    };
  }

  function extractPaletteFromImage(img) {
    var canvas = document.createElement("canvas");
    var w = 64,
      h = 64;
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unsupported");
    ctx.drawImage(img, 0, 0, w, h);
    var imageData = ctx.getImageData(0, 0, w, h);
    var data = imageData.data;
    var r = 0,
      g = 0,
      b = 0,
      n = 0,
      i;
    for (i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      n++;
    }
    if (n === 0) n = 1;
    r /= n;
    g /= n;
    b /= n;
    return buildPaletteFromRgb(r, g, b);
  }

  function hexPrimaryToRgb(hex) {
    var t = String(hex || "").replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(t)) return null;
    return {
      r: parseInt(t.slice(0, 2), 16),
      g: parseInt(t.slice(2, 4), 16),
      b: parseInt(t.slice(4, 6), 16),
    };
  }

  function mixRgbChannel(a, b, t) {
    return a + (b - a) * t;
  }

  function mixRgbObj(a, b, t) {
    return {
      r: mixRgbChannel(a.r, b.r, t),
      g: mixRgbChannel(a.g, b.g, t),
      b: mixRgbChannel(a.b, b.b, t),
    };
  }

  function effectiveIsDark() {
    var mode = localStorage.getItem(APPEARANCE_STORAGE_KEY) || "system";
    if (mode === "dark") return true;
    if (mode === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function syncAppearanceClasses() {
    var mode = localStorage.getItem(APPEARANCE_STORAGE_KEY) || "system";
    var root = document.documentElement;
    root.classList.remove("appearance-light", "appearance-dark", "appearance-system");
    root.classList.add("appearance-" + mode);
  }

  function applyCustomGlobalTheme(basePalette) {
    var root = document.documentElement;
    var dark = effectiveIsDark();
    var prgb = hexPrimaryToRgb(basePalette.primary);
    if (!prgb) return;
    var white = { r: 255, g: 255, b: 255 };
    var nearBlack = { r: 16, g: 14, b: 20 };
    var surf = dark ? mixRgbObj(nearBlack, prgb, 0.48) : mixRgbObj(white, prgb, 0.07);
    var cont = dark ? mixRgbObj(nearBlack, prgb, 0.3) : mixRgbObj(white, prgb, 0.05);
    var high = dark ? mixRgbObj(surf, prgb, 0.22) : mixRgbObj(surf, white, 0.55);
    var lumS = relativeLuminance(surf.r, surf.g, surf.b);
    var onSurf = lumS > 0.45 ? "#121014" : "#ece8ef";
    var onVar = lumS > 0.45 ? "#4a454e" : "#c4bcc8";
    var outline = dark ? "#9a93a1" : "#79747e";
    root.classList.add("theme-custom");
    root.style.setProperty("--md-sys-color-primary", basePalette.primary);
    root.style.setProperty("--md-sys-color-on-primary", basePalette.onPrimary);
    root.style.setProperty("--md-sys-color-primary-container", basePalette.container);
    root.style.setProperty("--md-sys-color-on-primary-container", basePalette.onContainer);
    root.style.setProperty("--md-sys-color-secondary", basePalette.onContainer);
    root.style.setProperty(
      "--md-sys-color-surface",
      rgbToHex(surf.r, surf.g, surf.b)
    );
    root.style.setProperty(
      "--md-sys-color-surface-container",
      rgbToHex(cont.r, cont.g, cont.b)
    );
    root.style.setProperty(
      "--md-sys-color-surface-container-high",
      rgbToHex(high.r, high.g, high.b)
    );
    root.style.setProperty("--md-sys-color-outline", outline);
    root.style.setProperty("--md-sys-color-on-surface", onSurf);
    root.style.setProperty("--md-sys-color-on-surface-variant", onVar);
  }

  function applyWallpaperTheme(palette) {
    applyCustomGlobalTheme(palette);
  }

  function resetThemeToDefault() {
    var root = document.documentElement;
    root.classList.remove("theme-custom");
    [
      "--md-sys-color-primary",
      "--md-sys-color-on-primary",
      "--md-sys-color-primary-container",
      "--md-sys-color-on-primary-container",
      "--md-sys-color-secondary",
      "--md-sys-color-surface",
      "--md-sys-color-surface-container",
      "--md-sys-color-surface-container-high",
      "--md-sys-color-outline",
      "--md-sys-color-on-surface",
      "--md-sys-color-on-surface-variant",
    ].forEach(function (p) {
      root.style.removeProperty(p);
    });
    syncAppearanceClasses();
  }

  var records = [];
  var chart = null;
  var lastChartMeta = null;
  var lastChartSnapshot = null;

  function parseNumField(el) {
    if (!el) return NaN;
    var t = String(el.value).trim().replace(",", ".");
    if (t === "" || t === "-" || t === "+" || t === "." || t === "-." || t === "+.") return NaN;
    return parseFloat(t);
  }

  function inferDecimalPlaces(text) {
    var t = String(text == null ? "" : text).trim().replace(",", ".");
    var i = t.indexOf(".");
    if (i < 0) return 0;
    return Math.max(0, t.length - i - 1);
  }

  function inferStepFromInputEl(el) {
    var p = inferDecimalPlaces(el.value);
    if (p <= 0) return 1;
    return Math.pow(10, -p);
  }

  function decimalsNeededForNumber(x) {
    if (!isFinite(x)) return 0;
    for (var d = 0; d <= 12; d++) {
      if (Math.abs(x - Number(x.toFixed(d))) < 1e-11) return d;
    }
    return 12;
  }

  function formatWithDecimalPlaces(num, places) {
    if (!isFinite(num)) return "";
    if (places <= 0) return String(Math.round(num));
    return num.toFixed(places);
  }

  function readForm() {
    return {
      freqValue: parseNumField(document.getElementById("freq-value")),
      freqUnit: document.getElementById("freq-unit").value,
      pinValue: parseNumField(document.getElementById("pin-value")),
      pinUnit: document.getElementById("pin-unit").value,
      poutValue: parseNumField(document.getElementById("pout-value")),
      poutUnit: document.getElementById("pout-unit").value,
      pdcValue: parseNumField(document.getElementById("pdc-value")),
      pdcUnit: document.getElementById("pdc-unit").value,
      note: document.getElementById("note").value.trim(),
    };
  }

  function computeFromForm() {
    var f = readForm();
    return {
      freqHz: freqToHz(f.freqValue, f.freqUnit),
      pinMw: powerToMw(f.pinValue, f.pinUnit),
      poutMw: powerToMw(f.poutValue, f.poutUnit),
      pdcMw: powerToMw(f.pdcValue, f.pdcUnit),
      note: f.note,
    };
  }

  /** 当前单位下，另一单位（仅 MHz ↔ GHz）的等价显示，保留小数风格 */
  function formatFreqOppositeHint(freqHz, currentUnit, freqInputEl) {
    if (!isFinite(freqHz)) return "";
    var places = freqInputEl ? inferDecimalPlaces(freqInputEl.value) : 3;
    if (currentUnit === "ghz") {
      var mhz = freqHz / 1e6;
      var pm = Math.min(12, Math.max(places, decimalsNeededForNumber(mhz)));
      return "⇄ " + formatWithDecimalPlaces(mhz, pm) + " MHz";
    }
    if (currentUnit === "mhz") {
      var ghz = freqHz / 1e9;
      var pg = Math.min(12, Math.max(places, decimalsNeededForNumber(ghz)));
      return "⇄ " + formatWithDecimalPlaces(ghz, pg) + " GHz";
    }
    return "⇄ " + formatFreqSmart(freqHz);
  }

  function updateFieldHints(v, freqHz, pinMw, poutMw, pdcMw, ok) {
    var hf = document.getElementById("hint-freq");
    var hp = document.getElementById("hint-pin");
    var ho = document.getElementById("hint-pout");
    var hd = document.getElementById("hint-pdc");
    if (!hf) return;

    var freqEl = document.getElementById("freq-value");
    hf.textContent =
      ok && isFinite(freqHz)
        ? formatFreqOppositeHint(freqHz, v.freqUnit, freqEl)
        : "";

    hp.textContent =
      ok && isFinite(pinMw)
        ? "⇄ " + formatPowerHint(pinMw, v.pinUnit)
        : "";

    ho.textContent =
      ok && isFinite(poutMw)
        ? "⇄ " + formatPowerHint(poutMw, v.poutUnit)
        : "";

    hd.textContent =
      ok && isFinite(pdcMw)
        ? "⇄ " + formatPowerHint(pdcMw, v.pdcUnit)
        : "";
  }

  function updateLiveResults() {
    var v = readForm();
    var freqHz = freqToHz(v.freqValue, v.freqUnit);
    var pinMw = powerToMw(v.pinValue, v.pinUnit);
    var poutMw = powerToMw(v.poutValue, v.poutUnit);
    var pdcMw = powerToMw(v.pdcValue, v.pdcUnit);
    var ok =
      isFinite(freqHz) && isFinite(pinMw) && isFinite(poutMw) && isFinite(pdcMw);

    updateFieldHints(v, freqHz, pinMw, poutMw, pdcMw, ok);

    document.getElementById("res-freq").textContent = ok ? formatFreqSmart(freqHz) : "—";
    var elPin = document.getElementById("res-pin");
    if (elPin) elPin.textContent = ok ? formatPowerDual(pinMw) : "—";
    document.getElementById("res-gain").textContent = ok ? fmtDb(gainDb(pinMw, poutMw)) : "—";
    document.getElementById("res-de").textContent = ok ? pct(drainEfficiency(poutMw, pdcMw)) : "—";
    document.getElementById("res-pae").textContent = ok
      ? pct(powerAddedEfficiency(pinMw, poutMw, pdcMw))
      : "—";
    document.getElementById("res-pout").textContent = ok ? formatPowerDual(poutMw) : "—";
    document.getElementById("res-pdc").textContent = ok ? formatPowerDual(pdcMw) : "—";
  }

  function newId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "r-" + Date.now() + "-" + Math.random().toString(36).slice(2);
  }

  function addRecord() {
    var c = computeFromForm();
    if (!isFinite(c.freqHz) || !isFinite(c.pinMw) || !isFinite(c.poutMw) || !isFinite(c.pdcMw)) {
      alert("请填写有效的频率与功率数值（直流功耗用于效率计算）。");
      return;
    }
    records.push({
      id: newId(),
      freqHz: c.freqHz,
      pinMw: c.pinMw,
      poutMw: c.poutMw,
      pdcMw: c.pdcMw,
      gainDb: gainDb(c.pinMw, c.poutMw),
      de: drainEfficiency(c.poutMw, c.pdcMw),
      pae: powerAddedEfficiency(c.pinMw, c.poutMw, c.pdcMw),
      note: c.note || undefined,
      createdAt: Date.now(),
    });
    saveRecords(records);
    renderHistory();
    renderChart();
  }

  function deleteRecord(id) {
    records = records.filter(function (r) {
      return r.id !== id;
    });
    saveRecords(records);
    renderHistory();
    renderChart();
  }

  function clearAllRecords() {
    if (!records.length) return;
    if (!confirm("确定清空全部记录？")) return;
    records = [];
    saveRecords(records);
    renderHistory();
    renderChart();
  }

  function renderHistory() {
    var tbody = document.getElementById("history-body");
    var empty = document.getElementById("history-empty");
    tbody.innerHTML = "";
    if (!records.length) {
      empty.classList.add("visible");
      return;
    }
    empty.classList.remove("visible");
    records.forEach(function (rec, idx) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" +
        (idx + 1) +
        "</td>" +
        '<td class="num cell-dual">' +
        formatFreqSmart(rec.freqHz) +
        "</td>" +
        '<td class="num cell-dual">' +
        formatPowerDual(rec.pinMw) +
        "</td>" +
        '<td class="num cell-dual">' +
        formatPowerDual(rec.poutMw) +
        "</td>" +
        '<td class="num">' +
        fmtDb(rec.gainDb) +
        "</td>" +
        '<td class="num">' +
        pct(rec.de) +
        "</td>" +
        '<td class="num">' +
        pct(rec.pae) +
        "</td>" +
        '<td><button type="button" class="btn-icon" data-id="' +
        rec.id +
        '">删除</button></td>';
      tbody.appendChild(tr);
    });
    tbody.querySelectorAll(".btn-icon").forEach(function (btn) {
      btn.addEventListener("click", function () {
        deleteRecord(btn.getAttribute("data-id"));
      });
    });
  }

  function getChartColors() {
    var styles = getComputedStyle(document.documentElement);
    return {
      primary: styles.getPropertyValue("--md-sys-color-primary").trim() || "#6750a4",
      secondary: styles.getPropertyValue("--md-sys-color-secondary").trim() || "#625b71",
      onSurface: styles.getPropertyValue("--md-sys-color-on-surface").trim() || "#1d1b20",
      outline: styles.getPropertyValue("--md-sys-color-outline").trim() || "#79747e",
    };
  }

  function escapeXml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function downloadBlob(filename, mime, text) {
    var blob = new Blob([text], { type: mime });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }

  function csvEscape(s) {
    var t = String(s);
    if (/[",\n\r]/.test(t)) return '"' + t.replace(/"/g, '""') + '"';
    return t;
  }

  function numCellXml(v) {
    if (!isFinite(v)) return "<Cell><Data ss:Type=\"String\"></Data></Cell>";
    return "<Cell><Data ss:Type=\"Number\">" + v + "</Data></Cell>";
  }

  function strCellXml(s) {
    return "<Cell><Data ss:Type=\"String\">" + escapeXml(s == null ? "" : s) + "</Data></Cell>";
  }

  function exportRecordsExcelXml() {
    if (!records.length) {
      alert("暂无记录可导出。");
      return;
    }
    var lines = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<?mso-application progid="Excel.Sheet"?>');
    lines.push(
      '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">'
    );
    lines.push('<Worksheet ss:Name="RF_PA">');
    lines.push("<Table>");
    var headers = [
      "#",
      "频率_Hz",
      "频率_显示",
      "Pin_mW",
      "Pout_mW",
      "Pdc_mW",
      "Pin_显示",
      "Pout_显示",
      "Pdc_显示",
      "G_dB",
      "DE_%",
      "PAE_%",
      "备注",
      "时间_ISO",
    ];
    lines.push("<Row>");
    var hi;
    for (hi = 0; hi < headers.length; hi++) {
      lines.push(strCellXml(headers[hi]));
    }
    lines.push("</Row>");
    records.forEach(function (rec, idx) {
      lines.push("<Row>");
      lines.push(strCellXml(String(idx + 1)));
      lines.push(numCellXml(rec.freqHz));
      lines.push(strCellXml(formatFreqSmart(rec.freqHz)));
      lines.push(numCellXml(rec.pinMw));
      lines.push(numCellXml(rec.poutMw));
      lines.push(numCellXml(rec.pdcMw));
      lines.push(strCellXml(formatPowerDual(rec.pinMw)));
      lines.push(strCellXml(formatPowerDual(rec.poutMw)));
      lines.push(strCellXml(formatPowerDual(rec.pdcMw)));
      lines.push(numCellXml(rec.gainDb));
      lines.push(numCellXml(isFinite(rec.de) ? 100 * rec.de : NaN));
      lines.push(numCellXml(isFinite(rec.pae) ? 100 * rec.pae : NaN));
      lines.push(strCellXml(rec.note || ""));
      lines.push(strCellXml(new Date(rec.createdAt).toISOString()));
      lines.push("</Row>");
    });
    lines.push("</Table></Worksheet></Workbook>");
    downloadBlob(
      "rf-pa-records.xml",
      "application/vnd.ms-excel;charset=utf-8",
      "\ufeff" + lines.join("\n")
    );
  }

  function exportRecordsCsv() {
    if (!records.length) {
      alert("暂无记录可导出。");
      return;
    }
    var headers = [
      "#",
      "频率_Hz",
      "频率_显示",
      "Pin_mW",
      "Pout_mW",
      "Pdc_mW",
      "Pin_显示",
      "Pout_显示",
      "Pdc_显示",
      "G_dB",
      "DE_%",
      "PAE_%",
      "备注",
      "时间_ISO",
    ];
    var rows = [headers.map(csvEscape).join(",")];
    records.forEach(function (rec, idx) {
      var row = [
        idx + 1,
        rec.freqHz,
        formatFreqSmart(rec.freqHz),
        rec.pinMw,
        rec.poutMw,
        rec.pdcMw,
        formatPowerDual(rec.pinMw),
        formatPowerDual(rec.poutMw),
        formatPowerDual(rec.pdcMw),
        isFinite(rec.gainDb) ? rec.gainDb : "",
        isFinite(rec.de) ? 100 * rec.de : "",
        isFinite(rec.pae) ? 100 * rec.pae : "",
        rec.note || "",
        new Date(rec.createdAt).toISOString(),
      ];
      rows.push(row.map(csvEscape).join(","));
    });
    downloadBlob("rf-pa-records.csv", "text/csv;charset=utf-8", "\ufeff" + rows.join("\r\n"));
  }

  function formatTickNum(v) {
    if (!isFinite(v)) return "";
    var av = Math.abs(v);
    if (av === 0) return "0";
    if (av < 1e-4 || av >= 1e6) return v.toExponential(2);
    if (av >= 1000) return v.toFixed(0);
    if (av >= 100) return v.toFixed(1);
    if (av >= 10) return v.toFixed(2);
    if (av >= 1) return v.toFixed(3);
    return v.toFixed(4);
  }

  function linspace(min, max, n) {
    var out = [],
      i;
    if (n <= 1) return [min];
    for (i = 0; i < n; i++) out.push(min + ((max - min) * i) / (n - 1));
    return out;
  }

  function buildLineChartSvg(snap) {
    var pts = snap.points;
    if (!pts || !pts.length) return "";
    var xl = snap.xl,
      yl = snap.yl;
    var connect = snap.connect;
    var colors = snap.colors || {
      primary: "#6750a4",
      secondary: "#625b71",
      outline: "#79747e",
      onSurface: "#1d1b20",
    };
    var sec = colors.secondary || "#625b71";
    var W = 920,
      H = 440;
    var ml = 78,
      mr = snap.dual ? 56 : 28,
      mt = 36,
      mb = 62;
    var pw = W - ml - mr,
      ph = H - mt - mb;

    var xs = pts.map(function (p) {
      return p.x;
    });
    var ys = pts.map(function (p) {
      return p.y;
    });
    var xmin = Math.min.apply(null, xs);
    var xmax = Math.max.apply(null, xs);
    var ymin = Math.min.apply(null, ys);
    var ymax = Math.max.apply(null, ys);
    if (xmin === xmax) {
      xmin -= 1;
      xmax += 1;
    }
    if (ymin === ymax) {
      ymin -= 1;
      ymax += 1;
    }
    var xpad = (xmax - xmin) * 0.06 || 0.1;
    var ypad = (ymax - ymin) * 0.06 || 0.1;
    xmin -= xpad;
    xmax += xpad;
    ymin -= ypad;
    ymax += ypad;

    var pts2 = snap.dual && snap.points2 && snap.points2.length === pts.length ? snap.points2 : null;
    var yl2 = snap.yl2 || "";
    var y2min = 0,
      y2max = 1;
    if (pts2) {
      var y2s = pts2.map(function (p) {
        return p.y;
      });
      y2min = Math.min.apply(null, y2s);
      y2max = Math.max.apply(null, y2s);
      if (y2min === y2max) {
        y2min -= 1;
        y2max += 1;
      }
      var y2pad = (y2max - y2min) * 0.06 || 0.1;
      y2min -= y2pad;
      y2max += y2pad;
    }

    function xPx(x) {
      return ml + ((x - xmin) / (xmax - xmin)) * pw;
    }
    function yPx(y) {
      return mt + ph - ((y - ymin) / (ymax - ymin)) * ph;
    }
    function yPx2(y) {
      return mt + ph - ((y - y2min) / (y2max - y2min)) * ph;
    }

    var parts = [];
    parts.push('<?xml version="1.0" encoding="UTF-8"?>');
    parts.push(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
        W +
        " " +
        H +
        '" width="' +
        W +
        '" height="' +
        H +
        '">'
    );
    parts.push(
      '<rect width="' + W + '" height="' + H + '" fill="#ffffff"/>'
    );
    parts.push(
      '<text x="' +
        W / 2 +
        '" y="22" text-anchor="middle" font-family="system-ui,sans-serif" font-size="14" fill="' +
        colors.onSurface +
        '">' +
        escapeXml(pts2 ? yl + " / " + yl2 + " vs " + xl : yl + " vs " + xl) +
        "</text>"
    );

    var nx = 6,
      ny = 6;
    var xticks = linspace(xmin, xmax, nx);
    var yticks = linspace(ymin, ymax, ny);
    var gi;
    parts.push(
      '<g stroke="' +
        colors.outline +
        '" stroke-opacity="0.35" stroke-width="1">'
    );
    for (gi = 0; gi < nx; gi++) {
      var px = xPx(xticks[gi]);
      parts.push(
        '<line x1="' +
          px +
          '" y1="' +
          mt +
          '" x2="' +
          px +
          '" y2="' +
          (mt + ph) +
          '"/>'
      );
    }
    for (gi = 0; gi < ny; gi++) {
      var py = yPx(yticks[gi]);
      parts.push(
        '<line x1="' +
          ml +
          '" y1="' +
          py +
          '" x2="' +
          (ml + pw) +
          '" y2="' +
          py +
          '"/>'
      );
    }
    parts.push("</g>");

    parts.push(
      '<g stroke="' +
        colors.outline +
        '" stroke-width="1.5" fill="none">'
    );
    parts.push(
      '<line x1="' +
        ml +
        '" y1="' +
        (mt + ph) +
        '" x2="' +
        (ml + pw) +
        '" y2="' +
        (mt + ph) +
        '"/>'
    );
    parts.push(
      '<line x1="' + ml + '" y1="' + mt + '" x2="' + ml + '" y2="' + (mt + ph) + '"/>'
    );
    if (pts2) {
      parts.push(
        '<line x1="' +
          (W - 36) +
          '" y1="' +
          mt +
          '" x2="' +
          (W - 36) +
          '" y2="' +
          (mt + ph) +
          '"/>'
      );
    }
    parts.push("</g>");

    for (gi = 0; gi < nx; gi++) {
      var tx = xticks[gi];
      parts.push(
        '<text x="' +
          xPx(tx) +
          '" y="' +
          (H - 18) +
          '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="11" fill="' +
          colors.outline +
          '">' +
          escapeXml(formatTickNum(tx)) +
          "</text>"
      );
    }
    for (gi = 0; gi < ny; gi++) {
      var ty = yticks[gi];
      parts.push(
        '<text x="' +
          (ml - 10) +
          '" y="' +
          (yPx(ty) + 4) +
          '" text-anchor="end" font-family="system-ui,sans-serif" font-size="11" fill="' +
          colors.primary +
          '">' +
          escapeXml(formatTickNum(ty)) +
          "</text>"
      );
    }
    if (pts2) {
      var y2ticks = linspace(y2min, y2max, ny);
      for (gi = 0; gi < ny; gi++) {
        var ty2 = y2ticks[gi];
        parts.push(
          '<text x="' +
            (W - 30) +
            '" y="' +
            (yPx2(ty2) + 4) +
            '" text-anchor="start" font-family="system-ui,sans-serif" font-size="11" fill="' +
            sec +
            '">' +
            escapeXml(formatTickNum(ty2)) +
            "</text>"
        );
      }
    }

    parts.push(
      '<text x="' +
        (ml + pw / 2) +
        '" y="' +
        (H - 4) +
        '" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="' +
        colors.onSurface +
        '">' +
        escapeXml(xl) +
        "</text>"
    );
    parts.push(
      '<text transform="translate(16,' +
        (mt + ph / 2) +
        ') rotate(-90)" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="' +
        colors.primary +
        '">' +
        escapeXml(yl) +
        "</text>"
    );
    if (pts2) {
      parts.push(
        '<text transform="translate(' +
          (W - 14) +
          "," +
          (mt + ph / 2) +
          ') rotate(90)" text-anchor="middle" font-family="system-ui,sans-serif" font-size="12" fill="' +
          sec +
          '">' +
          escapeXml(yl2) +
          "</text>"
      );
    }

    var pi;
    if (connect && pts.length > 1) {
      var d = "M " + xPx(pts[0].x) + " " + yPx(pts[0].y);
      for (pi = 1; pi < pts.length; pi++) {
        d += " L " + xPx(pts[pi].x) + " " + yPx(pts[pi].y);
      }
      parts.push(
        '<path d="' +
          d +
          '" fill="none" stroke="' +
          colors.primary +
          '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
      );
    }
    if (pts2 && connect && pts2.length > 1) {
      var d2 = "M " + xPx(pts2[0].x) + " " + yPx2(pts2[0].y);
      for (pi = 1; pi < pts2.length; pi++) {
        d2 += " L " + xPx(pts2[pi].x) + " " + yPx2(pts2[pi].y);
      }
      parts.push(
        '<path d="' +
          d2 +
          '" fill="none" stroke="' +
          sec +
          '" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>'
      );
    }

    for (pi = 0; pi < pts.length; pi++) {
      var cx = xPx(pts[pi].x),
        cy = yPx(pts[pi].y);
      parts.push(
        '<circle cx="' +
          cx +
          '" cy="' +
          cy +
          '" r="4.5" fill="' +
          colors.primary +
          '" stroke="#ffffff" stroke-width="1"/>'
      );
    }
    if (pts2) {
      for (pi = 0; pi < pts2.length; pi++) {
        var cx2 = xPx(pts2[pi].x),
          cy2 = yPx2(pts2[pi].y);
        parts.push(
          '<circle cx="' +
            cx2 +
            '" cy="' +
            cy2 +
            '" r="4" fill="' +
            sec +
            '" stroke="#ffffff" stroke-width="1"/>'
        );
      }
    }

    parts.push("</svg>");
    return parts.join("\n");
  }

  function exportChartSvg() {
    if (
      !lastChartSnapshot ||
      (!lastChartSnapshot.points.length &&
        !(lastChartSnapshot.points2 && lastChartSnapshot.points2.length))
    ) {
      alert("没有可导出的图表数据。请先保存至少一条记录并确保当前坐标有有效数值。");
      return;
    }
    var svg = buildLineChartSvg(lastChartSnapshot);
    var safe = (lastChartSnapshot.dual
      ? lastChartSnapshot.yl + "_" + lastChartSnapshot.yl2 + "_vs_" + lastChartSnapshot.xl
      : lastChartSnapshot.yl + "_vs_" + lastChartSnapshot.xl
    )
      .replace(/[^\w\u4e00-\u9fff.-]+/g, "_")
      .slice(0, 80);
    if (!safe || !/[\w\u4e00-\u9fff]/.test(safe)) safe = "chart";
    downloadBlob("rf-pa-chart-" + safe + ".svg", "image/svg+xml;charset=utf-8", svg);
  }

  function tooltipExtraLines(xKey, yKey, rec) {
    var lines = [];
    if (yKey === "pin" || yKey === "pout" || yKey === "pdc") {
      var mw =
        yKey === "pin" ? rec.pinMw : yKey === "pout" ? rec.poutMw : rec.pdcMw;
      lines.push("双单位: " + formatPowerDual(mw));
    }
    if (xKey === "freq") {
      lines.push("频率: " + formatFreqSmart(rec.freqHz));
    }
    return lines;
  }

  function tooltipLinesDual(xKey, yKey, y2Key, rec) {
    var a = tooltipExtraLines(xKey, yKey, rec);
    if (y2Key && y2Key !== yKey) {
      var b = tooltipExtraLines(xKey, y2Key, rec);
      return a.concat(b);
    }
    return a;
  }

  function renderChart() {
    if (typeof Chart === "undefined") {
      lastChartSnapshot = null;
      return;
    }
    var canvas = document.getElementById("chart-canvas");
    var xKey = document.getElementById("chart-x").value;
    var yKey = document.getElementById("chart-y").value;
    var y2Key = document.getElementById("chart-y2")
      ? document.getElementById("chart-y2").value
      : yKey;
    var dualOn = document.getElementById("chart-dual")
      ? document.getElementById("chart-dual").checked
      : false;
    var connect = document.getElementById("chart-connect").checked;
    var colors = getChartColors();

    var meta = computeChartMeta(records);
    lastChartMeta = meta;
    updateChartSelectLabels(meta);

    var dual = dualOn && yKey !== y2Key;

    var points = records
      .map(function (r) {
        var p = recordToPoint(r, meta);
        return { x: p[xKey], y: p[yKey], y2: p[y2Key], raw: r };
      })
      .filter(function (p) {
        if (dual) return isFinite(p.x) && isFinite(p.y) && isFinite(p.y2);
        return isFinite(p.x) && isFinite(p.y);
      });
    points.sort(function (a, b) {
      return a.x - b.x;
    });

    if (!points.length) {
      if (chart) {
        chart.destroy();
        chart = null;
      }
      lastChartSnapshot = null;
      return;
    }

    var orderedRecords = points.map(function (p) {
      return p.raw;
    });

    var xl = axisLabelFromMeta(xKey, meta);
    var yl = axisLabelFromMeta(yKey, meta);
    var yl2 = axisLabelFromMeta(y2Key, meta);

    var pts1 = points.map(function (p) {
      return { x: p.x, y: p.y };
    });
    var pts2 = dual
      ? points.map(function (p) {
          return { x: p.x, y: p.y2 };
        })
      : null;

    lastChartSnapshot = {
      points: pts1,
      points2: pts2,
      dual: dual,
      xKey: xKey,
      yKey: yKey,
      y2Key: y2Key,
      xl: xl,
      yl: yl,
      yl2: yl2,
      connect: connect,
      colors: colors,
    };

    var datasets = [
      {
        label: yl + "（左轴）",
        data: pts1,
        yAxisID: "y",
        backgroundColor: colors.primary + "33",
        borderColor: colors.primary,
        borderWidth: connect && pts1.length > 1 ? 2 : 0,
        pointRadius: 5,
        pointHoverRadius: 7,
        showLine: connect && pts1.length > 1,
        tension: 0.15,
        fill: false,
        _orderedRecords: orderedRecords,
        _xKey: xKey,
        _yKey: yKey,
      },
    ];

    if (dual) {
      datasets.push({
        label: yl2 + "（右轴）",
        data: pts2,
        yAxisID: "y1",
        backgroundColor: colors.secondary + "33",
        borderColor: colors.secondary,
        borderWidth: connect && pts2.length > 1 ? 2 : 0,
        pointRadius: 4,
        pointHoverRadius: 6,
        showLine: connect && pts2.length > 1,
        tension: 0.15,
        fill: false,
        _orderedRecords: orderedRecords,
        _xKey: xKey,
        _yKey: y2Key,
      });
    }

    var data = { datasets: datasets };

    var scales = {
      x: {
        type: "linear",
        title: { display: true, text: xl, color: colors.onSurface },
        ticks: { color: colors.outline },
        grid: { color: colors.outline + "44" },
      },
      y: {
        type: "linear",
        position: "left",
        title: { display: true, text: yl, color: colors.primary },
        ticks: { color: colors.primary },
        grid: { color: colors.outline + "44" },
      },
    };

    if (dual) {
      scales.y1 = {
        type: "linear",
        position: "right",
        title: { display: true, text: yl2, color: colors.secondary },
        ticks: { color: colors.secondary },
        grid: { drawOnChartArea: false },
      };
    }

    var options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: { color: colors.onSurface },
        },
        tooltip: {
          callbacks: {
            afterBody: function (items) {
              if (!items.length) return [];
              var chart = items[0].chart;
              var di = items[0].dataIndex;
              var ds0 = chart.data.datasets[0];
              var rec = ds0._orderedRecords && ds0._orderedRecords[di];
              if (!rec) return [];
              return tooltipLinesDual(ds0._xKey, yKey, dual ? y2Key : null, rec);
            },
          },
        },
      },
      scales: scales,
    };

    if (chart) {
      chart.data = data;
      chart.options = options;
      chart.update();
      return;
    }

    chart = new Chart(canvas, {
      type: "line",
      data: data,
      options: options,
    });
  }

  function updateChartSelectLabels(meta) {
    var sx = document.getElementById("chart-x");
    var sy = document.getElementById("chart-y");
    var sy2 = document.getElementById("chart-y2");
    if (!sx || !sy) return;
    [sx, sy].forEach(function (sel) {
      var i;
      for (i = 0; i < sel.options.length; i++) {
        var opt = sel.options[i];
        var k = opt.value;
        opt.textContent = axisLabelFromMeta(k, meta);
      }
    });
    if (sy2) {
      var j;
      for (j = 0; j < sy2.options.length; j++) {
        var o2 = sy2.options[j];
        o2.textContent = axisLabelFromMeta(o2.value, meta);
      }
    }
  }

  function populateChartSelects() {
    var sx = document.getElementById("chart-x");
    var sy = document.getElementById("chart-y");
    var sy2 = document.getElementById("chart-y2");
    sx.innerHTML = "";
    sy.innerHTML = "";
    if (sy2) sy2.innerHTML = "";
    var meta = lastChartMeta || computeChartMeta(records);
    AXIS_ORDER.forEach(function (key) {
      var ox = document.createElement("option");
      ox.value = key;
      ox.textContent = axisLabelFromMeta(key, meta);
      sx.appendChild(ox);
      var oy = document.createElement("option");
      oy.value = key;
      oy.textContent = axisLabelFromMeta(key, meta);
      sy.appendChild(oy);
      if (sy2) {
        var oy2 = document.createElement("option");
        oy2.value = key;
        oy2.textContent = axisLabelFromMeta(key, meta);
        sy2.appendChild(oy2);
      }
    });
    sx.value = "freq";
    sy.value = "gainDb";
    if (sy2) sy2.value = "paePct";
  }

  function clearForm() {
    document.getElementById("freq-value").value = "";
    document.getElementById("pin-value").value = "";
    document.getElementById("pout-value").value = "";
    document.getElementById("pdc-value").value = "";
    document.getElementById("note").value = "";
    updateLiveResults();
  }

  function parseHexToRgb(hex) {
    var t = String(hex).trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{6}$/.test(t)) return null;
    return {
      r: parseInt(t.slice(0, 2), 16),
      g: parseInt(t.slice(2, 4), 16),
      b: parseInt(t.slice(4, 6), 16),
    };
  }

  function applyThemePrimaryHex(hex) {
    var rgb = parseHexToRgb(hex.indexOf("#") === 0 ? hex : "#" + hex);
    if (!rgb) {
      alert("请输入 6 位十六进制色值，例如 #6750a4 或 6750a4。");
      return;
    }
    var pal = buildPaletteFromRgb(rgb.r, rgb.g, rgb.b);
    applyWallpaperTheme(pal);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", pal.primary);
    renderChart();
  }

  function setupPresetSwatches() {
    var host = document.getElementById("preset-swatches");
    if (!host) return;
    host.innerHTML = "";
    PRESET_PRIMARY_HEX.forEach(function (hx) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn-swatch";
      b.style.backgroundColor = hx;
      b.title = hx;
      b.setAttribute("aria-label", "主题色 " + hx);
      b.addEventListener("click", function () {
        document.getElementById("theme-hex-input").value = hx;
        applyThemePrimaryHex(hx);
      });
      host.appendChild(b);
    });
  }

  function setupThemeHex() {
    var inp = document.getElementById("theme-hex-input");
    var btn = document.getElementById("btn-theme-hex-apply");
    if (!inp || !btn) return;
    btn.addEventListener("click", function () {
      applyThemePrimaryHex(inp.value);
    });
  }

  function setupScreenEyeDropper() {
    var btn = document.getElementById("btn-theme-screen");
    if (!btn) return;
    btn.addEventListener("click", function () {
      if (typeof window.EyeDropper !== "function") {
        alert(
          "当前环境不支持屏幕取色 API。请在支持 EyeDropper 的 Chrome/Edge 桌面版使用，或改用「相册/壁纸图」与常用色。"
        );
        return;
      }
      var ed = new window.EyeDropper();
      ed.open()
        .then(function (res) {
          var hex = res.sRGBHex;
          document.getElementById("theme-hex-input").value = hex;
          applyThemePrimaryHex(hex);
        })
        .catch(function () {});
    });
  }

  function setupWallpaperFile() {
    var input = document.getElementById("wallpaper-input");
    var btn = document.getElementById("btn-theme-wallpaper");
    if (!input || !btn) return;
    btn.addEventListener("click", function () {
      input.click();
    });
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = function () {
        try {
          var palette = extractPaletteFromImage(img);
          applyWallpaperTheme(palette);
          document.getElementById("theme-hex-input").value = palette.primary;
          var meta = document.querySelector('meta[name="theme-color"]');
          if (meta) meta.setAttribute("content", palette.primary);
          renderChart();
        } catch (e) {
          console.error(e);
          alert("无法从该图片提取颜色。");
        }
        URL.revokeObjectURL(url);
        input.value = "";
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        alert("图片加载失败。");
        input.value = "";
      };
      img.src = url;
    });
  }

  function setupResetTheme() {
    document.getElementById("btn-reset-theme").addEventListener("click", function () {
      resetThemeToDefault();
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", "#6750a4");
      renderChart();
    });
  }

  function swapFreqMhzGhz() {
    var el = document.getElementById("freq-value");
    var sel = document.getElementById("freq-unit");
    if (!el || !sel) return;
    var unit = sel.value;
    if (unit !== "mhz" && unit !== "ghz") {
      sel.value = "mhz";
      unit = "mhz";
    }
    var v = parseNumField(el);
    if (!isFinite(v)) {
      sel.value = unit === "mhz" ? "ghz" : "mhz";
      updateLiveResults();
      return;
    }
    var hz = freqToHz(v, unit);
    var newUnit = unit === "mhz" ? "ghz" : "mhz";
    var nv = hz / FREQ_TO_HZ[newUnit];
    var oldPlaces = inferDecimalPlaces(el.value);
    var need = decimalsNeededForNumber(nv);
    var newPlaces = Math.min(12, Math.max(oldPlaces, need));
    el.value = formatWithDecimalPlaces(nv, newPlaces);
    sel.value = newUnit;
    updateLiveResults();
  }

  function setupFreqSwap() {
    var btn = document.getElementById("btn-freq-swap");
    if (btn) btn.addEventListener("click", swapFreqMhzGhz);
  }

  function applyStepToField(fieldId, dir) {
    var el = document.getElementById(fieldId);
    if (!el) return;
    var step = inferStepFromInputEl(el);
    var v = parseNumField(el);
    if (!isFinite(v)) {
      updateLiveResults();
      return;
    }
    var places = inferDecimalPlaces(el.value);
    if (places <= 0) places = 0;
    var nv = v + dir * step;
    el.value = formatWithDecimalPlaces(nv, Math.max(places, decimalsNeededForNumber(nv)));
    updateLiveResults();
  }

  function setupStepButtons() {
    document.body.addEventListener("click", function (ev) {
      var t = ev.target;
      if (!t || !t.getAttribute) return;
      var fid = t.getAttribute("data-step-for");
      if (!fid) return;
      var d = t.getAttribute("data-dir");
      if (d !== "+" && d !== "-") return;
      ev.preventDefault();
      applyStepToField(fid, d === "+" ? 1 : -1);
    });
  }

  function refreshNarrowPager() {
    setupPagerDots();
    refreshPagerDotActive();
  }

  function setupPagerResize() {
    window.addEventListener("resize", function () {
      refreshNarrowPager();
      if (chart) chart.resize();
    });
  }

  function setupPagerDots() {
    var host = document.getElementById("pager-dots");
    var vp = document.getElementById("pager-viewport");
    if (!host || !vp) return;
    var slides = document.querySelectorAll(".pager-slide");
    host.innerHTML = "";
    var n = slides.length;
    var i;
    for (i = 0; i < n; i++) {
      (function (idx) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "pager-dot";
        b.setAttribute("role", "tab");
        b.setAttribute("aria-label", "第 " + (idx + 1) + " 页");
        b.addEventListener("click", function () {
          var w = vp.clientWidth;
          vp.scrollTo({ left: idx * w, behavior: "smooth" });
        });
        host.appendChild(b);
      })(i);
    }
  }

  function updateDockActive(idx) {
    document.querySelectorAll("#app-dock .dock-item").forEach(function (d, i) {
      d.classList.toggle("is-active", i === idx);
    });
  }

  function refreshPagerDotActive() {
    var vp = document.getElementById("pager-viewport");
    var host = document.getElementById("pager-dots");
    if (!vp || !host) return;
    var dots = host.querySelectorAll(".pager-dot");
    if (!dots.length) return;
    var w = vp.clientWidth || 1;
    var idx = Math.round(vp.scrollLeft / w);
    dots.forEach(function (d, i) {
      d.classList.toggle("is-active", i === idx);
    });
    updateDockActive(idx);
  }

  function setupPagerScrollSync() {
    var vp = document.getElementById("pager-viewport");
    if (!vp) return;
    vp.addEventListener("scroll", function () {
      refreshPagerDotActive();
    });
  }

  function setupDockNavigation() {
    var vp = document.getElementById("pager-viewport");
    document.querySelectorAll("#app-dock .dock-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-dock-idx"), 10);
        if (!vp || isNaN(idx)) return;
        var w = vp.clientWidth || 1;
        vp.scrollTo({ left: idx * w, behavior: "smooth" });
      });
    });
  }

  function refreshCustomThemeIfAny() {
    var root = document.documentElement;
    if (!root.classList.contains("theme-custom")) return;
    var inp = document.getElementById("theme-hex-input");
    if (!inp || !String(inp.value).trim()) return;
    var raw = String(inp.value).trim();
    var hex = raw.indexOf("#") === 0 ? raw : "#" + raw;
    var rgb = parseHexToRgb(hex);
    if (!rgb) return;
    applyCustomGlobalTheme(buildPaletteFromRgb(rgb.r, rgb.g, rgb.b));
  }

  function syncAppearanceSegActive() {
    var mode = localStorage.getItem(APPEARANCE_STORAGE_KEY) || "system";
    ["light", "dark", "system"].forEach(function (m) {
      var b = document.getElementById("btn-appearance-" + m);
      if (b) b.classList.toggle("is-active", mode === m);
    });
  }

  function setupAppearanceButtons() {
    syncAppearanceClasses();
    syncAppearanceSegActive();
    ["light", "dark", "system"].forEach(function (m) {
      var b = document.getElementById("btn-appearance-" + m);
      if (!b) return;
      b.addEventListener("click", function () {
        localStorage.setItem(APPEARANCE_STORAGE_KEY, m);
        syncAppearanceClasses();
        syncAppearanceSegActive();
        refreshCustomThemeIfAny();
        renderChart();
      });
    });
    try {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", function () {
          if ((localStorage.getItem(APPEARANCE_STORAGE_KEY) || "system") === "system") {
            refreshCustomThemeIfAny();
            renderChart();
          }
        });
    } catch (e) {}
  }

  function applyFontScaleFromStorage() {
    var v = parseInt(localStorage.getItem(FONT_SCALE_STORAGE_KEY) || "100", 10);
    if (isNaN(v)) v = 100;
    v = Math.max(85, Math.min(130, v));
    document.documentElement.style.setProperty("--app-font-scale", String(v / 100));
    var rng = document.getElementById("font-scale-range");
    var lab = document.getElementById("font-scale-value");
    if (rng) rng.value = String(v);
    if (lab) lab.textContent = v + "%";
  }

  function setupFontRange() {
    var rng = document.getElementById("font-scale-range");
    var lab = document.getElementById("font-scale-value");
    if (!rng) return;
    rng.addEventListener("input", function () {
      var v = parseInt(rng.value, 10);
      localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(v));
      document.documentElement.style.setProperty("--app-font-scale", String(v / 100));
      if (lab) lab.textContent = v + "%";
    });
  }

  function bindEvents() {
    var numericIds = [
      "freq-value",
      "freq-unit",
      "pin-value",
      "pin-unit",
      "pout-value",
      "pout-unit",
      "pdc-value",
      "pdc-unit",
    ];
    numericIds.forEach(function (id) {
      var el = document.getElementById(id);
      el.addEventListener("input", updateLiveResults);
      el.addEventListener("change", updateLiveResults);
    });

    document.getElementById("btn-add").addEventListener("click", addRecord);
    document.getElementById("btn-clear-form").addEventListener("click", clearForm);
    document.getElementById("btn-clear-all").addEventListener("click", clearAllRecords);
    document.getElementById("btn-export-excel-xml").addEventListener("click", exportRecordsExcelXml);
    document.getElementById("btn-export-csv").addEventListener("click", exportRecordsCsv);
    document.getElementById("btn-export-chart-svg").addEventListener("click", exportChartSvg);

    ["chart-x", "chart-y", "chart-y2", "chart-connect", "chart-dual"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("change", renderChart);
    });
  }

  function init() {
    records = loadRecords();
    lastChartMeta = computeChartMeta(records);
    setupAppearanceButtons();
    applyFontScaleFromStorage();
    populateChartSelects();
    bindEvents();
    setupPresetSwatches();
    setupThemeHex();
    setupScreenEyeDropper();
    setupWallpaperFile();
    setupResetTheme();
    setupFreqSwap();
    setupStepButtons();
    setupDockNavigation();
    setupFontRange();
    setupPagerResize();
    setupPagerScrollSync();
    refreshNarrowPager();
    updateLiveResults();
    renderHistory();
    renderChart();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
