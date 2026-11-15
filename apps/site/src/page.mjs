// Renders one language version of the public page as a complete static HTML document.

const esc = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const ORIGIN = "https://areopagus.world";
export const pathFor = (lang, defaultLang) => (lang === defaultLang ? "/" : `/${lang}/`);

export function countLit(roadmap) {
  const all = roadmap.stages.flat();
  return { done: all.filter((state) => state === "done").length, total: all.length };
}

function renderPath(t, roadmap) {
  let index = 0;
  let out = '<div class="lit"></div>';
  roadmap.stages.forEach((states, stage) => {
    out += `<div class="stage">${esc(t.stages[stage])}</div>`;
    for (const state of states) {
      out += `<div class="node ${state}"><b>${esc(t.nodes[index])}</b><small>${esc(t.state[state])}</small></div>`;
      index += 1;
    }
  });
  return out;
}

// The station loop and its still. The version is in the file name so the files can be cached for good.
export const HERO = "station-v2";
export const heroBase = (app) => (app ? "/site/hero" : "/hero");

export function renderPage({ lang, t, langs, names = {}, defaultLang, roadmap, css, app = false }) {
  const media = heroBase(app);
  const { done, total } = countLit(roadmap);
  const count = t.count.replace("{a}", done).replace("{b}", total);
  const alternates = langs
    .map(
      (code) =>
        `<link rel="alternate" hreflang="${code}" href="${ORIGIN}${pathFor(code, defaultLang)}" />`,
    )
    .join("\n    ");
  // Languages fold into one list: the current one shows, the rest open on demand, without JavaScript.
  const nav = langs
    .map((code) => {
      const current = code === lang ? ' aria-current="page"' : "";
      return `<a href="${pathFor(code, defaultLang)}" hreflang="${code}" lang="${code}"${current}><span>${esc(names[code] ?? code)}</span><small>${code.toUpperCase()}</small></a>`;
    })
    .join("");
  const ways = t.ways
    .map(([h, p]) => `<li><div><h3>${esc(h)}</h3><p>${esc(p)}</p></div></li>`)
    .join("");
  const rules = t.rules.map((rule) => `<li>${esc(rule)}</li>`).join("");

  return `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Areopagus</title>
    <meta name="description" content="${esc(t.meta)}" />
    <link rel="canonical" href="${ORIGIN}${pathFor(lang, defaultLang)}" />
    ${alternates}
    <link rel="alternate" hreflang="x-default" href="${ORIGIN}/" />
    <link rel="preconnect" href="https://fonts.bunny.net" />
    <link href="https://fonts.bunny.net/css?family=unbounded:500,800|golos-text:400,600" rel="stylesheet" />
    <style>
${css}
    </style>
  </head>
  <body>
    <div class="space">
      <picture class="sky" aria-hidden="true">
        <source media="(max-width: 760px)" srcset="${media}/${HERO}-1280.webp" type="image/webp" />
        <img
          src="${media}/${HERO}-1920.webp"
          srcset="${media}/${HERO}-1920.webp 1920w, ${media}/${HERO}-2560.webp 2560w"
          sizes="100vw"
          alt=""
          width="1920"
          height="1080"
          fetchpriority="high"
          decoding="async"
        />
      </picture>
      <video class="sky" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1">
        <source data-src="${media}/${HERO}-1920.webm" data-hd="${media}/${HERO}-2560.webm" type='video/webm; codecs="av01.0.08M.08"' />
        <source data-src="${media}/${HERO}-1920.mp4" data-hd="${media}/${HERO}-2560.mp4" type="video/mp4" />
      </video>
      <div class="shade" aria-hidden="true"></div>
      <div class="wrap">
      <header class="top">
        <a class="mark" href="${pathFor(lang, defaultLang)}"><i></i>AREOPAGUS</a>
        <details class="langs">
          <summary aria-label="Language: ${esc(names[lang] ?? lang)}">${lang.toUpperCase()}</summary>
          <nav aria-label="Language">${nav}</nav>
        </details>
      </header>

      <div class="hero">
        <div class="kicker">${esc(t.kicker)}</div>
        <h1>${esc(t.titleA)} <em>${esc(t.titleB)}</em></h1>
        <p class="lead">${esc(t.lead)}</p>
        <div class="row">
          <a class="btn fill" href="#path">${esc(t.ctaPath)}</a>
          <a class="btn" href="#join">${esc(t.ctaJoin)}</a>${
            app
              ? `
          <a class="btn" href="${["en", "fr", "ru"].includes(lang) ? `/api/lang/${lang}?next=/map` : "/map"}">${esc(t.ctaMap)}</a>`
              : ""
          }
          <span class="count">${esc(count)}</span>
        </div>
      </div>
      </div>
      <p class="credit">Earth: NASA Earth Observatory (Blue Marble, Black Marble)</p>
    </div>

    <div class="wrap">
      <section id="station">
        <div class="head">
          <h2>${esc(t.stationTitle)}</h2>
          <p class="sub">${esc(t.stationText)}</p>
        </div>
        <div class="body">
          <div class="realms">
            <div class="realm earth">
              <h3>${esc(t.earthTitle)}</h3>
              <p>${esc(t.earthText)}</p>
            </div>
            <div class="realm aboard">
              <h3>${esc(t.aboardTitle)}</h3>
              <p>${esc(t.aboardText)}</p>
            </div>
          </div>
          <p class="note">${esc(t.stationNote)}</p>
        </div>
      </section>

      <section id="path">
        <div class="head">
          <h2>${esc(t.pathTitle)}</h2>
          <p class="sub">${esc(t.pathText)}</p>
        </div>
        <div class="body">
          <div class="path" id="nodes">${renderPath(t, roadmap)}</div>
        </div>
      </section>

      <section id="join">
        <div class="head">
          <h2>${esc(t.joinTitle)}</h2>
          <p class="sub">${esc(t.joinText)}</p>
        </div>
        <div class="body">
          <ol class="ways">${ways}</ol>
          <div class="row">
            <a class="btn fill" href="https://github.com/areopagus-world/areopagus/issues">${esc(t.ctaIdea)}</a>
          </div>
        </div>
      </section>

      <section id="support">
        <div class="head">
          <h2>${esc(t.supTitle)}</h2>
          <p class="sub">${esc(t.supText)}</p>
        </div>
        <div class="body paid">
          <div class="until">
            <span>${esc(t.untilLabel)}</span>
            <strong>${esc(t.untilValue)}</strong>
            <a class="btn" aria-disabled="true">${esc(t.ctaGive)}</a>
            <div class="ledger">
              ${esc(t.ledger)}: 0<br />
              head: ${"0".repeat(64)}
            </div>
          </div>
          <ul class="rules">${rules}</ul>
        </div>
      </section>

      <section id="engine">
        <div class="head">
          <h2>${esc(t.engTitle)}</h2>
          <p class="sub">${esc(t.engText)}</p>
        </div>
        <div class="body engine">
          <div class="domain"><u>${esc(t.engDomain)}</u></div>
        </div>
      </section>

      <footer>${esc(t.foot)}${app ? `<br /><a href="/legal">${esc(t.legal)}</a> · <a href="/privacy">${esc(t.privacy)}</a>` : ""}</footer>
    </div>

    <script>
      // Draw the lit part of the path down to the last finished or current step.
      function light() {
        const rows = document.querySelectorAll("#nodes .node.done, #nodes .node.now");
        const last = rows[rows.length - 1];
        if (last) document.querySelector("#nodes .lit").style.height = last.offsetTop + 12 + "px";
      }
      light();
      addEventListener("resize", light);

      // The language list closes on a click elsewhere or on Escape.
      (() => {
        const menu = document.querySelector("details.langs");
        if (!menu) return;
        addEventListener("click", (event) => {
          if (menu.open && !menu.contains(event.target)) menu.open = false;
        });
        addEventListener("keydown", (event) => {
          if (event.key === "Escape" && menu.open) {
            menu.open = false;
            menu.querySelector("summary").focus();
          }
        });
      })();

      // The station moves only where it costs nothing: wide screens, no reduced motion, no data saving.
      // Everyone else, and every browser without JavaScript, keeps the still picture.
      (() => {
        const video = document.querySelector("video.sky");
        const net = navigator.connection || {};
        const still =
          !video ||
          matchMedia("(prefers-reduced-motion: reduce)").matches ||
          !matchMedia("(min-width: 761px)").matches ||
          net.saveData ||
          /2g$/.test(net.effectiveType || "");
        if (still) return;
        // Screens that show more than about 2000 real pixels across get the 2560 loop.
        const hd = innerWidth * (devicePixelRatio || 1) > 2000;
        for (const source of video.querySelectorAll("source[data-src]")) {
          source.src = hd ? source.dataset.hd : source.dataset.src;
        }
        video.muted = true;
        video.load();
        video.addEventListener("playing", () => video.classList.add("on"), { once: true });
        new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        }).observe(video);
      })();
    </script>
  </body>
</html>
`;
}
