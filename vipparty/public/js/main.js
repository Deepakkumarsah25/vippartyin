// ==========================================================================
// VIP PARTY (विकासशील इंसान पार्टी) - MASTER JAVASCRIPT
// Handles Inspiration Carousel, Mobile Nav, Video Player, Modal & Scroll
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  
  // ------------------------------------------------------------------------
  // 1. Mobile Menu Toggle
  // ------------------------------------------------------------------------
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      mobileMenu.classList.toggle('hidden');
      mobileMenuBtn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      mobileMenuBtn.setAttribute('aria-label', isHidden ? 'मुख्य मेनू बंद करें' : 'मुख्य मेनू खोलें');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        if (isHidden) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });
  }

  // ------------------------------------------------------------------------
  // 2. Search Modal
  // ------------------------------------------------------------------------
  const searchOpenBtn = document.getElementById('searchOpenBtn');
  const searchCloseBtn = document.getElementById('searchCloseBtn');
  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchInput');

  function openSearch() {
    if (searchModal) {
      searchModal.classList.remove('hidden');
      searchModal.classList.add('flex');
      setTimeout(() => {
        if (searchInput) searchInput.focus();
      }, 100);
    }
  }

  function closeSearch() {
    if (searchModal) {
      searchModal.classList.add('hidden');
      searchModal.classList.remove('flex');
    }
  }

  if (searchOpenBtn) searchOpenBtn.addEventListener('click', openSearch);
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', closeSearch);
  if (searchModal) {
    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) closeSearch();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSearch();
  });

  // ------------------------------------------------------------------------
  // 3. Inspiration Carousel Slider (Identical to RJD Mechanics)
  // ------------------------------------------------------------------------
  const slider = document.getElementById('inspiration-slider');
  const prevBtn = document.getElementById('insp-prev');
  const nextBtn = document.getElementById('insp-next');
  const dotsContainer = document.getElementById('insp-dots-container');

  if (slider && dotsContainer) {
    const cards = slider.querySelectorAll('.insp-card');
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    const dragSpeedMultiplier = 1.5;

    function getCardWidthAndGap() {
      if (cards.length === 0) return { width: 0, gap: 0 };
      const firstCard = cards[0];
      const cardWidth = firstCard.offsetWidth;
      const style = window.getComputedStyle(slider);
      const gap = parseInt(style.columnGap || style.gap || '20', 10) || 20;
      return { width: cardWidth, gap: gap };
    }

    function getVisibleCount() {
      const { width, gap } = getCardWidthAndGap();
      if (width === 0) return 1;
      return Math.round(slider.clientWidth / (width + gap)) || 1;
    }

    function getNumDots() {
      const visible = getVisibleCount();
      return Math.max(1, cards.length - visible + 1);
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      const numDots = getNumDots();
      for (let i = 0; i < numDots; i++) {
        const dot = document.createElement('div');
        dot.className = 'insp-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('data-index', i);
        dot.addEventListener('click', () => {
          const { width, gap } = getCardWidthAndGap();
          slider.scrollTo({
            left: i * (width + gap),
            behavior: 'smooth'
          });
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateActiveDot() {
      const { width, gap } = getCardWidthAndGap();
      if (width === 0) return;
      const numDots = getNumDots();
      const currentScroll = slider.scrollLeft;
      const activeIndex = Math.min(numDots - 1, Math.max(0, Math.round(currentScroll / (width + gap))));

      const dots = dotsContainer.querySelectorAll('.insp-dot');
      dots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    buildDots();
    window.addEventListener('resize', () => {
      buildDots();
      updateActiveDot();
    });

    slider.addEventListener('scroll', updateActiveDot);

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', () => {
        const { width, gap } = getCardWidthAndGap();
        slider.scrollBy({
          left: -(width + gap),
          behavior: 'smooth'
        });
      });

      nextBtn.addEventListener('click', () => {
        const { width, gap } = getCardWidthAndGap();
        slider.scrollBy({
          left: (width + gap),
          behavior: 'smooth'
        });
      });
    }

    // Mouse drag scrolling
    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      slider.classList.add('active');
      slider.style.scrollSnapType = 'none';
      slider.style.scrollBehavior = 'auto';
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    const stopDrag = () => {
      if (!isDown) return;
      isDown = false;
      slider.classList.remove('active');
      slider.style.scrollSnapType = 'x mandatory';
      slider.style.scrollBehavior = 'smooth';

      const { width, gap } = getCardWidthAndGap();
      if (width > 0) {
        const targetScroll = Math.round(slider.scrollLeft / (width + gap)) * (width + gap);
        slider.scrollTo({
          left: targetScroll,
          behavior: 'smooth'
        });
      }
    };

    slider.addEventListener('mouseleave', stopDrag);
    slider.addEventListener('mouseup', stopDrag);

    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * dragSpeedMultiplier;
      slider.scrollLeft = scrollLeft - walk;
    });

    // Touch events for mobile
    slider.addEventListener('touchstart', () => {
      slider.style.scrollBehavior = 'auto';
    }, { passive: true });

    slider.addEventListener('touchend', () => {
      slider.style.scrollBehavior = 'smooth';
    }, { passive: true });
  }

  // ------------------------------------------------------------------------
  // 4. Video Click to Play Embed Handler
  // ------------------------------------------------------------------------
  const videoThumb = document.getElementById('videoThumbnail');
  const videoCont = document.getElementById('videoContainer');
  const youtubeVideo = document.getElementById('youtubeVideo');

  if (videoThumb && videoCont && youtubeVideo) {
    videoThumb.addEventListener('click', () => {
      videoThumb.style.display = 'none';
      videoCont.classList.remove('hidden');
      // Embed an inspiring speech video of VIP Party / Mukesh Sahani
      youtubeVideo.src = 'https://www.youtube.com/embed/videoseries?list=PLB31B1BD65DC5BC4D&autoplay=1';
    });
  }

  // ------------------------------------------------------------------------
  // 5. Scroll to Top Floating Button & Sticky Header Shadow
  // ------------------------------------------------------------------------
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    if (scrollToTopBtn) {
      if (scrollPos > 350) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    }
  });

  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
