/* ============================================================
   ЦЕНТР ОЦЕНКИ - скрипт страницы.
   Плиты и золотое сечение (герой: плитки-крышки уходят на интро по --intro,
   сетка тает по --stay; кадры направлений: плитки уходят по --open) · меню ·
   бегущая строка объектов · WhatsApp с текстом по направлению · ленты
   с кнопками листания · лайтбокс писем · счётчики · форма в WhatsApp.
   Библиотек нет. Ссылки tel/wa не перезаписываются в момент клика,
   обработчик кликов - только делегирование в фазе захвата (совместимость с LeadBot).
   ============================================================ */
(function(){
"use strict";

/* ---------------- КОНТАКТЫ (единственное место) ---------------- */
var CONTACT = { wa: "77010269199" };

var RED = matchMedia("(prefers-reduced-motion: reduce)").matches;
var HAS_IO = typeof IntersectionObserver === "function";
var root = document.documentElement;

/* ---------------- КОНВЕРСИИ GOOGLE ADS ----------------
   Ярлыки задаёт index.html (window.CO_CONV) на этапе рекламы. Переход не блокируем. */
function conv(key){
  var id = (window.CO_CONV || {})[key];
  if (!id || typeof window.gtag !== "function") return;
  window.gtag("event", "conversion", {send_to: id, value: 1.0, currency: "USD", transport_type: "beacon"});
}
window.addEventListener("click", function(e){
  var a = e.target.closest ? e.target.closest("a[href]") : null;
  if (!a) return;
  var h = a.getAttribute("href") || "";
  if (h.indexOf("tel:") === 0) conv("phone");
  else if (h.indexOf("wa.me") > -1) conv("contact");
  else if (h.indexOf("mailto:") === 0) conv("mail");
}, true);

/* ---------------- ТЕКСТЫ WhatsApp ПО НАПРАВЛЕНИЯМ ---------------- */
var WA_TXT = {
  hero:         "Здравствуйте! Пишу с сайта Центр Оценки. Нужна оценка. Объект и цель: ",
  biznes:       "Здравствуйте! Пишу с сайта Центр Оценки.\nНаправление: оценка бизнеса, долей и акций.\nОбъект (компания, доля %, пакет акций) и цель оценки: ",
  imushchestvo: "Здравствуйте! Пишу с сайта Центр Оценки.\nНаправление: оценка недвижимого и движимого имущества.\nОбъект (недвижимость, оборудование, транспорт), город и цель оценки: ",
  kompleksy:    "Здравствуйте! Пишу с сайта Центр Оценки.\nНаправление: имущественный комплекс / предприятие.\nОбъект, город и цель оценки: ",
  nma:          "Здравствуйте! Пишу с сайта Центр Оценки.\nНаправление: нематериальные активы и интеллектуальная собственность.\nОбъект (товарный знак, ПО, патент) и цель оценки: ",
  kontakty:     "Здравствуйте! Пишу с сайта Центр Оценки. Вопрос: "
};
document.querySelectorAll("[data-wa]").forEach(function(a){
  var t = WA_TXT[a.dataset.wa] || WA_TXT.hero;
  a.href = "https://wa.me/" + CONTACT.wa + "?text=" + encodeURIComponent(t);
  a.target = "_blank"; a.rel = "noopener";
});

/* ---------------- БЕГУЩИЕ СТРОКИ: объекты (герой) и цели оценки (после направлений) ---------------- */
var TICKS = {
  obj:  ["Доли и акции", "Заводы и фабрики", "Элеваторы", "Склады и логистика", "Нефтебазы и АЗС", "ТЦ и БЦ", "Гостиницы",
         "Оборудование и линии", "Спецтехника", "Автопарки", "Ж/д вагоны", "Товарные знаки", "ПО и базы данных", "Дебиторская задолженность", "Земля"],
  goal: ["Для залога", "Для сделок купли-продажи", "Для изменения уставного капитала", "Для аудита", "Для постановки актива на баланс",
         "Для МСФО", "Для привлечения инвестиций", "Для управленческих решений"]
};
function fillTicker(){
  document.querySelectorAll(".ticker[data-tick]").forEach(function(el){
    var list = TICKS[el.dataset.tick]; if (!list) return;
    var one = list.map(function(t){ return "<b>" + t + "</b>"; }).join("");
    el.innerHTML = one;
    var w = el.scrollWidth || 1000;
    var need = Math.max(2, Math.ceil((innerWidth * 2) / w) + 1);
    var html = "";
    for (var i = 0; i < need; i++) html += one;
    el.innerHTML = html;
    el.style.setProperty("--tkw", w + "px");
    el.style.setProperty("--tkd", Math.max(30, w / 26) + "s");
  });
}

/* дисплейная строка героя в одну строку на десктопе: ужимаем кегль, пока не влезет */
function fitText(){
  document.querySelectorAll(".h1 .big").forEach(function(el){
    el.style.fontSize = "";
    var box = el.parentElement;
    if (getComputedStyle(box).whiteSpace !== "nowrap") return;
    var bw = box.clientWidth; if (!bw) return;
    var size = parseFloat(getComputedStyle(el).fontSize), base = size;
    while (el.scrollWidth > bw + 1 && size > base * 0.5) { size *= 0.95; el.style.fontSize = size + "px"; }
  });
}

var rsTimer;
addEventListener("resize", function(){
  update();
  clearTimeout(rsTimer);
  rsTimer = setTimeout(function(){ fillTicker(); fitText(); update(); updateArrows(); }, 200);
});
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fillTicker(); fitText(); update(); });

/* ---------------- МЕНЮ ---------------- */
var burger = document.getElementById("burger");
var mnav = document.getElementById("mnav");
function closeMenu(){
  document.body.classList.remove("menu-open");
  if (burger) burger.setAttribute("aria-expanded", "false");
}
if (burger) burger.addEventListener("click", function(){
  var open = document.body.classList.toggle("menu-open");
  burger.setAttribute("aria-expanded", open ? "true" : "false");
});
if (mnav) mnav.addEventListener("click", function(e){ if (e.target.closest("a")) closeMenu(); });
addEventListener("keydown", function(e){ if (e.key === "Escape") { closeMenu(); closeLb(); } });

/* ---------------- ЯКОРЯ ---------------- */
var HH = function(){ return parseFloat(getComputedStyle(root).getPropertyValue("--hh")) || 72; };
document.addEventListener("click", function(e){
  var a = e.target.closest('a[href^="#"]'); if (!a) return;
  var id = a.getAttribute("href").slice(1); if (!id) return;
  var t = document.getElementById(id); if (!t) return;
  e.preventDefault();
  closeMenu();
  var top = t.getBoundingClientRect().top + scrollY - (t.classList.contains("pw") ? 0 : HH() + 10);
  scrollTo({ top: Math.max(0, top), behavior: RED ? "auto" : "smooth" });
  try { history.pushState(null, "", "#" + id); } catch(err){}
});

/* ---------------- ШАПКА ---------------- */
var hdr = document.getElementById("hdr");
function hdrState(){ if (hdr) hdr.classList.toggle("solid", scrollY > 40); }

/* ---------------- ПЛИТЫ, ИНТРО ГЕРОЯ, КАДРЫ ----------------
   Один слушатель scroll через rAF. На .pw пишем --enter/--exit/--stay;
   на герое --intro (плитки-крышки уходят), на каждом .fr - --open по его положению. */
function clamp(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
function easeOut(t){ return 1 - Math.pow(1 - t, 3); }
var pws = [].slice.call(document.querySelectorAll(".pw"));
var frames = [].slice.call(document.querySelectorAll(".fr"));
var heroPw = document.getElementById("top");
var hero = document.getElementById("hero");
var bar = document.getElementById("bar");
var kont = document.getElementById("kontakty");
var introK = 1, introDone = true;
/* ?intro=0.4 / ?open=0.5 в URL - только для проверки промежуточных фаз (checks/) */
var DBG = new URLSearchParams(location.search);
var dbgIntro = parseFloat(DBG.get("intro")), dbgOpen = parseFloat(DBG.get("open"));

function update(){
  var H = innerHeight || root.clientHeight;
  if (root.classList.contains("no-plate")) {
    hdrState();
    if (bar) bar.classList.toggle("show", scrollY > H * 0.55 && !(kont && kont.getBoundingClientRect().top < H * 0.6));
    return;
  }
  pws.forEach(function(pw){
    var r = pw.getBoundingClientRect();
    var enter = clamp(1 - r.top / H);
    var exit  = clamp(1 - r.bottom / H);
    var stay  = r.height > H + 1 ? clamp(-r.top / (r.height - H)) : enter;
    pw.style.setProperty("--enter", enter.toFixed(3));
    pw.style.setProperty("--exit",  exit.toFixed(3));
    pw.style.setProperty("--stay",  stay.toFixed(3));
    pw.classList.toggle("gone", exit >= 1);
    pw.classList.toggle("on", enter > 0.6);
    if (pw === heroPw) {
      var ip = introDone ? 1 : easeOut(introK);
      if (!isNaN(dbgIntro)) ip = dbgIntro;
      pw.style.setProperty("--intro", ip.toFixed(4));
    }
  });
  frames.forEach(function(f){
    var r = f.getBoundingClientRect();
    var e = clamp(1 - r.top / H);                       /* верх кадра вошёл во вьюпорт */
    var open = !isNaN(dbgOpen) ? dbgOpen : easeOut(clamp((e - .2) / .55));
    f.style.setProperty("--open", open.toFixed(3));
  });
  hdrState();
  var onKont = kont && kont.getBoundingClientRect().top < H * 0.6;
  if (bar) bar.classList.toggle("show", scrollY > H * 0.55 && !onKont);
}
if (RED) {
  root.classList.add("no-plate");
  root.classList.add("no-intro");
  if (hero) hero.classList.add("on");
  addEventListener("scroll", function(){ hdrState(); if (bar) bar.classList.toggle("show", scrollY > innerHeight * 0.55); }, {passive:true});
  hdrState();
} else {
  var tick = false;
  addEventListener("scroll", function(){
    if (tick) return; tick = true;
    requestAnimationFrame(function(){ tick = false; update(); });
  }, {passive:true});
  addEventListener("load", update);
  /* интро 1250 мс: плитки сечения уходят по спирали и открывают кадр, текст поднимается.
     Пропускаем при хэше / прокрутке - человек из рекламы сразу видит собранный экран. */
  var skip = location.hash || scrollY > 80;
  if (skip) {
    root.classList.add("no-intro");
    if (hero) hero.classList.add("on");
    update();
  } else {
    introK = 0; introDone = false; update();
    var t0 = null;
    var step = function(ts){
      if (introDone) return;
      if (t0 === null) t0 = ts;
      var p = clamp((ts - t0) / 1250);
      introK = p;
      if (p > .3 && hero) hero.classList.add("on");
      update();
      if (p < 1) requestAnimationFrame(step);
      else { introDone = true; update(); }
    };
    requestAnimationFrame(function(){ requestAnimationFrame(step); });
    setTimeout(function(){ if (hero) hero.classList.add("on"); }, 700);
    setTimeout(function(){ if (!introDone) { introDone = true; introK = 1; update(); } }, 2400);
  }
}
[1500, 3000, 5000].forEach(function(ms){ setTimeout(update, ms); });
window.plateSync = function(){ introDone = true; introK = 1; if (hero) hero.classList.add("on"); update(); };
addEventListener("hashchange", function(){ root.classList.add("no-intro"); });

/* ---------------- ПОЯВЛЕНИЕ В КАТАЛОЖНЫХ СЕКЦИЯХ + СЧЁТЧИКИ ---------------- */
function runCount(b){
  var to = parseInt(b.dataset.count, 10), suf = b.dataset.suffix || "", t0 = null;
  if (RED || !to) return;
  var fmt = function(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "); };
  var step = function(ts){
    if (t0 === null) t0 = ts;
    var p = clamp((ts - t0) / 1400), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
    b.textContent = fmt(v) + (p >= 1 ? suf : "");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
if (HAS_IO) {
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      e.target.querySelectorAll("[data-count]").forEach(runCount);
      io.unobserve(e.target);
    });
  }, {threshold:.08, rootMargin:"0px 0px -6% 0px"});
  document.querySelectorAll(".rv").forEach(function(el){ io.observe(el); });
  setTimeout(function(){ document.querySelectorAll(".rv:not(.in)").forEach(function(el){
    if (el.getBoundingClientRect().top < innerHeight) { el.classList.add("in"); el.querySelectorAll("[data-count]").forEach(runCount); io.unobserve(el); }
  }); }, 1500);
} else {
  document.querySelectorAll(".rv").forEach(function(el){ el.classList.add("in"); });
}

/* ---------------- ЛЕНТЫ С КНОПКАМИ ЛИСТАНИЯ ----------------
   Шаг - ровно одна карточка (ширина + gap из стилей), крайняя кнопка гаснет,
   обе прячутся, если всё влезло без прокрутки. */
function trackStep(track){
  var li = track.querySelector("li"); if (!li) return track.clientWidth * .8;
  var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 16;
  return li.getBoundingClientRect().width + gap;
}
function updateArrows(){
  document.querySelectorAll(".track").forEach(function(track){
    var id = "#" + track.id;
    var prev = document.querySelector('[data-prev="' + id + '"]'), next = document.querySelector('[data-next="' + id + '"]');
    if (!prev || !next) return;
    var max = track.scrollWidth - track.clientWidth;
    var none = max <= 1;
    prev.hidden = none; next.hidden = none;
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= max - 1;
  });
}
document.querySelectorAll("[data-prev],[data-next]").forEach(function(b){
  b.addEventListener("click", function(){
    var sel = b.dataset.prev || b.dataset.next;
    var track = document.querySelector(sel); if (!track) return;
    track.scrollBy({left: (b.dataset.prev ? -1 : 1) * trackStep(track), behavior: RED ? "auto" : "smooth"});
  });
});
document.querySelectorAll(".track").forEach(function(track){
  var st;
  track.addEventListener("scroll", function(){ clearTimeout(st); st = setTimeout(updateArrows, 80); }, {passive:true});
});
updateArrows();
addEventListener("load", updateArrows);

/* ---------------- ЛАЙТБОКС ПИСЕМ ---------------- */
var lb = document.getElementById("lb"), lbImg = document.getElementById("lb-img");
var thumbs = [].slice.call(document.querySelectorAll(".rimg[data-full]"));
var lbIdx = -1;
function openLb(i){
  if (!lb || !thumbs.length) return;
  lbIdx = (i + thumbs.length) % thumbs.length;
  var b = thumbs[lbIdx];
  lbImg.src = b.dataset.full;
  lbImg.alt = b.querySelector("img") ? b.querySelector("img").alt : "Скан письма";
  lb.hidden = false;
  document.body.classList.add("menu-open");   /* тот же запрет прокрутки */
  document.getElementById("lb-x").focus();
}
function closeLb(){
  if (!lb || lb.hidden) return;
  lb.hidden = true;
  document.body.classList.remove("menu-open");
  if (lbIdx > -1 && thumbs[lbIdx]) thumbs[lbIdx].focus();
}
thumbs.forEach(function(b, i){ b.addEventListener("click", function(){ openLb(i); }); });
if (lb) {
  document.getElementById("lb-x").addEventListener("click", closeLb);
  document.getElementById("lb-prev").addEventListener("click", function(){ openLb(lbIdx - 1); });
  document.getElementById("lb-next").addEventListener("click", function(){ openLb(lbIdx + 1); });
  lb.addEventListener("click", function(e){ if (e.target === lb) closeLb(); });
  addEventListener("keydown", function(e){
    if (lb.hidden) return;
    if (e.key === "ArrowLeft") openLb(lbIdx - 1);
    if (e.key === "ArrowRight") openLb(lbIdx + 1);
  });
}

/* ---------------- ФОРМА → WhatsApp ---------------- */
var form = document.getElementById("form");
if (form) form.addEventListener("submit", function(e){
  e.preventDefault();
  var ok = document.getElementById("fmok"), err = document.getElementById("fmerr");
  if (form.website && form.website.value) return;          /* honeypot */
  var name = form.name.value.trim(), phone = form.phone.value.trim(), msg = form.msg.value.trim();
  if (!name || phone.replace(/\D/g, "").length < 10 || !msg) { err.hidden = false; ok.hidden = true; return; }
  err.hidden = true;
  var t = "Здравствуйте! Заявка с сайта Центр Оценки.\nИмя: " + name + "\nТелефон: " + phone + "\nОбъект и цель оценки: " + msg;
  ok.hidden = false;
  conv("lead");
  window.open("https://wa.me/" + CONTACT.wa + "?text=" + encodeURIComponent(t), "_blank", "noopener");
});

/* ---------------- СТАРТ ---------------- */
fillTicker();
fitText();
hdrState();
})();
