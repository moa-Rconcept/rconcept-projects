// ================= Base =================

// Année du footer
$('#year').text(new Date().getFullYear());

// Burger mobile
$('.burger').on('click', function(){
  const $nav = $('#nav');
  const open = !$nav.hasClass('open');
  $nav.toggleClass('open', open);
  $(this).attr('aria-expanded', open ? 'true' : 'false');
});

// Smooth scroll
$('a[href^="#"]').on('click', function(e){
  const target = $($(this).attr('href'));
  if(!target.length) return;
  e.preventDefault();
  $('html, body').animate({ scrollTop: target.offset().top - 70 }, 500);
  $('#nav').removeClass('open');
  $('.burger').attr('aria-expanded', 'false');
});

// Forcer la lightbox fermée au chargement (sécurité)
$('#lightbox').removeClass('open').attr('aria-hidden', 'true');
$('body').css('overflow','');


// ================= Hero (option slider fondu si .slides existe) =================
(function(){
  const $slides = $('.slides li');
  if(!$slides.length) return;

  let i = 0;
  $slides.eq(0).addClass('show');
  setInterval(() => {
    const next = (i + 1) % $slides.length;
    $slides.eq(i).removeClass('show');
    $slides.eq(next).addClass('show');
    i = next;
  }, 5000);
})();


// ================= Actus (JSON local) =================
$.getJSON('assets/news.json')
 .done(function(items){
   const $grid = $('#newsGrid');
   if(!items || !items.length) return;
   items.sort((a,b)=> new Date(b.date) - new Date(a.date));
   items.forEach(it=>{
     const card = `
       <article class="news-card">
         ${it.image ? `<img src="${it.image}" alt="">` : ``}
         <div class="news-body">
           <div class="news-meta">${new Date(it.date).toLocaleDateString('fr-FR')}</div>
           <h3 class="news-title">${it.title}</h3>
           <p>${it.text}</p>
           ${it.link ? `<p style="margin-top:8px"><a class="link" href="${it.link}">En savoir plus</a></p>` : ``}
         </div>
       </article>`;
     $grid.append(card);
   });
 });


// ================= Installations (boutons -> slider + texte) =================
const installTexts = [
  "Un club convivial, au cœur de la nature, avec des espaces adaptés pour tous les cavaliers.",
  "Un manège couvert de 60x30m, idéal pour les entraînements par tous les temps.",
  "Paddocks sécurisés, caméras, éclairage et abris pour le confort des chevaux.",
  "Un grand parking ombragé et éclairé pour accueillir cavaliers et visiteurs.",
  "Balades uniques dans la rivière du Ribéral, au plus près de la nature."
];

$('.install-btn').on('click', function(){
  const index = $(this).data('index');
  $('.install-btn').removeClass('active');
  $(this).addClass('active');

  const $slides = $('.install-slider img');
  $slides.removeClass('active').eq(index).addClass('active');
  $('#installDesc').fadeOut(150, function(){
    $(this).text(installTexts[index]).fadeIn(200);
  });
});


// ================= Lightbox globale (Galerie + Installations + autres) =================
(function($){
  // 1) Marquer toutes les images ouvrables (ajoute d'autres sélecteurs au besoin)
  $('.gallery img, .install-slider img').addClass('js-lightbox').css('cursor','zoom-in');

  let $lb = $('#lightbox'),
      $img = $lb.find('.lb-img'),
      $cap = $lb.find('.lb-caption'),
      group = [],    // images du groupe courant (conteneur le plus proche)
      index = 0;

  function getGroup($el){
    // priorités de conteneur (ajoute d'autres blocs si tu veux activer la lightbox dessus)
    if ($el.closest('.install-slider').length) return $el.closest('.install-slider').find('img.js-lightbox');
    if ($el.closest('.gallery').length)        return $el.closest('.gallery').find('img.js-lightbox');
    // fallback global : toutes les images lightboxables de la page
    return $('img.js-lightbox');
  }

  function openFrom($el){
    const $group = getGroup($el);
    group = $group.toArray();
    index = group.indexOf($el.get(0));
    show(index);
    $lb.addClass('open').attr('aria-hidden', 'false');
    $('body').css('overflow','hidden');
  }

  function show(i){
    if(!group.length) return;
    index = (i + group.length) % group.length; // boucle
    const el  = group[index];
    const src = $(el).attr('src');
    const alt = $(el).attr('alt') || '';
    $img.attr({ src: src, alt: alt });
    $cap.text(alt);
  }

  function next(){ show(index + 1); }
  function prev(){ show(index - 1); }
  function close(){
    $lb.removeClass('open').attr('aria-hidden', 'true');
    $('body').css('overflow','');
    setTimeout(() => { $img.attr('src',''); $cap.text(''); }, 150);
  }

  // Ouvrir
  $(document).on('click', 'img.js-lightbox', function(){ openFrom($(this)); });
  // Contrôles
  $lb.on('click', '[data-lb-close]', close);
  $lb.find('.lb-next').on('click', next);
  $lb.find('.lb-prev').on('click', prev);
  // Clavier
  $(document).on('keydown', function(e){
    if(!$lb.hasClass('open')) return;
    if(e.key === 'Escape') close();
    if(e.key === 'ArrowRight') next();
    if(e.key === 'ArrowLeft') prev();
  });

})(jQuery);
