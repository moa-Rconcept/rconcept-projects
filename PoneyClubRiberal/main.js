/* ===========================================================
   PONEY CLUB DU RIBERAL — main.js
   jQuery only — Burger, Smooth scroll, Actus JSON, Installations slider,
   Lightbox globale (multi-blocs), Hero diaporama
   =========================================================== */

(function ($) {
  'use strict';

  /* ================= Base ================= */

  // Exécuté quand le DOM est prêt
  $(function () {

    // Année du footer
    $('#year').text(new Date().getFullYear());

    // Burger mobile
    $('.burger').on('click', function () {
      const $nav = $('#nav');
      const open = !$nav.hasClass('open');
      $nav.toggleClass('open', open);
      $(this).attr('aria-expanded', open ? 'true' : 'false');
    });

    // Smooth scroll (ancres internes)
    $('a[href^="#"]').on('click', function (e) {
      const target = $($(this).attr('href'));
      if (!target.length) return;
      e.preventDefault();
      $('html, body').animate({ scrollTop: target.offset().top - 70 }, 500);
      $('#nav').removeClass('open');
      $('.burger').attr('aria-expanded', 'false');
    });

    // Forcer la lightbox fermée au chargement (sécurité)
    $('#lightbox').removeClass('open').attr('aria-hidden', 'true');
    $('body').css('overflow', '');

    /* ================= Hero (slider <ul class="slides"> facultatif) ================= */
    (function () {
      const $slides = $('.slides li');
      if (!$slides.length) return;

      let i = 0;
      $slides.eq(0).addClass('show');
      setInterval(() => {
        const next = (i + 1) % $slides.length;
        $slides.eq(i).removeClass('show');
        $slides.eq(next).addClass('show');
        i = next;
      }, 5000);
    })();

    /* ================= Actus (JSON local) ================= */
    (function () {
      const $grid = $('#newsGrid');
      if (!$grid.length) return;

      $.getJSON('assets/news.json').done(function (payload) {
        // Accepte un tableau brut OU un objet { items: [...] }
        const items = Array.isArray(payload) ? payload : (payload && payload.items) ? payload.items : [];
        if (!items.length) return;

        // Tri par date desc
        items.sort((a, b) => new Date(b.date) - new Date(a.date));

        items.forEach(it => {
          const date = it.date ? new Date(it.date).toLocaleDateString('fr-FR') : '';
          const img = it.image ? `<img src="${it.image}" alt="">` : '';
          const link = it.link ? `<p style="margin-top:8px"><a class="link" href="${it.link}">En savoir plus</a></p>` : '';
          const card = `
            <article class="news-card">
              ${img}
              <div class="news-body">
                <div class="news-meta">${date}</div>
                <h3 class="news-title">${it.title || ''}</h3>
                <p>${it.text || ''}</p>
                ${link}
              </div>
            </article>`;
          $grid.append(card);
        });
      });
    })();

    /* ================= Installations (boutons -> slider + texte) ================= */
    (function () {
      const texts = [
        'Un club convivial, au cœur de la nature, avec des espaces adaptés pour tous les cavaliers.',
        'Un manège couvert de 60x30m, idéal pour les entraînements par tous les temps.',
        'Paddocks sécurisés, caméras, éclairage et abris pour le confort des chevaux.',
        'Un grand parking ombragé et éclairé pour accueillir cavaliers et visiteurs.',
        'Balades uniques dans la rivière du Ribéral, au plus près de la nature.'
      ];

      $('.install-btn').on('click', function () {
        const index = Number($(this).data('index')) || 0;

        $('.install-btn').removeClass('active');
        $(this).addClass('active');

        const $slides = $('.install-slider img');
        $slides.removeClass('active').eq(index).addClass('active');

        $('#installDesc').fadeOut(150, function () {
          $(this).text(texts[index] || '').fadeIn(200);
        });
      });
    })();

    /* ================= Lightbox globale (Galerie + Installations + autres) ================= */
    (function () {
      // Marquer les images ouvrables (ajouter d'autres blocs si besoin)
      $('.gallery img, .install-slider img')
        .addClass('js-lightbox')
        .css('cursor', 'zoom-in');

      const $lb = $('#lightbox');
      const $img = $lb.find('.lb-img');
      const $cap = $lb.find('.lb-caption');
      let group = []; // images du groupe courant
      let index = 0;  // index courant

      // Détermine le "groupe" le plus pertinent (conteneur)
      function getGroup($el) {
        if ($el.closest('.install-slider').length) return $el.closest('.install-slider').find('img.js-lightbox');
        if ($el.closest('.gallery').length)        return $el.closest('.gallery').find('img.js-lightbox');
        return $('img.js-lightbox'); // fallback global
      }

      // Ouvrir à partir d'un élément
      function openFrom($el) {
        const $group = getGroup($el);
        group = $group.toArray();

        // Si on est dans un slider, on démarre sur l'image .active
        const $slider = $el.closest('.install-slider');
        if ($slider.length) {
          const $active = $slider.find('img.active.js-lightbox').first();
          index = group.indexOf($active.get(0));
        } else {
          index = group.indexOf($el.get(0));
        }

        show(index);
        $lb.addClass('open').attr('aria-hidden', 'false');
        $('body').css('overflow', 'hidden');
      }

      // Afficher l'image d'index i
      function show(i) {
        if (!group.length) return;
        index = (i + group.length) % group.length;
        const el = group[index];
        const src = $(el).attr('src');
        const alt = $(el).attr('alt') || '';
        $img.attr({ src, alt });
        $cap.text(alt);
      }

      function next() { show(index + 1); }
      function prev() { show(index - 1); }
      function close() {
        $lb.removeClass('open').attr('aria-hidden', 'true');
        $('body').css('overflow', '');
        setTimeout(() => { $img.attr('src', ''); $cap.text(''); }, 150);
      }

      // Ouvrir (normalise le clic sur slider => prend toujours l'image .active)
      $(document).on('click', 'img.js-lightbox', function () {
        const $clicked = $(this);
        const $slider = $clicked.closest('.install-slider');

        const $target = $slider.length
          ? $slider.find('img.active.js-lightbox').first()
          : $clicked;

        openFrom($target);
      });

      // Contrôles & clavier
      $lb.on('click', '[data-lb-close]', close);
      $lb.find('.lb-next').on('click', next);
      $lb.find('.lb-prev').on('click', prev);
      $(document).on('keydown', function (e) {
        if (!$lb.hasClass('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowRight') next();
        if (e.key === 'ArrowLeft') prev();
      });
    })();

    /* ================= Hero diaporama (utilise .hero > img existants) ================= */
    (function () {
      const $imgs = $('.hero > img');
      if (!$imgs.length) return;

      let i = 0;
      let timer = null;
      let paused = false;

      // Init
      $imgs.removeClass('show').eq(0).addClass('show');

      // Pagination (points)
      const $dotsWrap = $('<div class="hero-dots" aria-label="Navigation diaporama"></div>').appendTo('.hero');
      $imgs.each((idx) => {
        $('<button class="hero-dot" aria-label="Aller à l’image ' + (idx + 1) + '"></button>')
          .toggleClass('active', idx === 0)
          .on('click', () => go(idx))
          .appendTo($dotsWrap);
      });
      const $dots = $dotsWrap.find('.hero-dot');

      function show(idx) {
        $imgs.removeClass('show').eq(idx).addClass('show');
        $dots.removeClass('active').eq(idx).addClass('active');
      }
      function next() { i = (i + 1) % $imgs.length; show(i); }
      function go(idx) { i = idx; show(i); restart(); }

      function start() { timer = setInterval(next, 5000); }
      function stop() { clearInterval(timer); timer = null; }
      function restart() { stop(); if (!paused) start(); }

      // Pause au survol
      $('.hero').on('mouseenter', () => { paused = true; stop(); })
                .on('mouseleave', () => { paused = false; start(); });

      start();
    })();

  });

})(jQuery);
