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
      const icon = mobileMenuBtn.querySelector('[data-mobile-menu-icon]');
      if (icon) icon.classList.toggle('is-open', isHidden);
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'मुख्य मेनू खोलें');
        const icon = mobileMenuBtn.querySelector('[data-mobile-menu-icon]');
        if (icon) icon.classList.remove('is-open');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenuBtn.setAttribute('aria-label', 'मुख्य मेनू खोलें');
        const icon = mobileMenuBtn.querySelector('[data-mobile-menu-icon]');
        if (icon) icon.classList.remove('is-open');
        mobileMenuBtn.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.matchMedia('(min-width: 1536px)').matches) {
        mobileMenu.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        const icon = mobileMenuBtn.querySelector('[data-mobile-menu-icon]');
        if (icon) icon.classList.remove('is-open');
      }
    });
  }

  // ------------------------------------------------------------------------
  // 2.5 Hero Banner Carousel (Synced with vip-a Admin Panel & Mobile App)
  // ------------------------------------------------------------------------
  const heroCarousel = document.getElementById('heroCarousel');
  if (heroCarousel) {
    const slides = heroCarousel.querySelectorAll('.hero-slide');
    const dots = heroCarousel.querySelectorAll('.hero-dot');
    const prevBtn = document.getElementById('heroPrevBtn');
    const nextBtn = document.getElementById('heroNextBtn');
    let currentSlide = 0;
    let autoPlayTimer = null;
    const totalSlides = slides.length;

    function goToSlide(index) {
      if (totalSlides <= 1) return;
      currentSlide = (index + totalSlides) % totalSlides;

      slides.forEach((slide, idx) => {
        if (idx === currentSlide) {
          slide.classList.remove('opacity-0', 'pointer-events-none', 'z-0');
          slide.classList.add('opacity-100', 'z-10');
        } else {
          slide.classList.remove('opacity-100', 'z-10');
          slide.classList.add('opacity-0', 'pointer-events-none', 'z-0');
        }
      });

      dots.forEach((dot, idx) => {
        if (idx === currentSlide) {
          dot.className = 'hero-dot h-2 sm:h-2.5 transition-all duration-300 rounded-full shadow-md w-8 sm:w-10 bg-primary border border-white/60';
        } else {
          dot.className = 'hero-dot h-2 sm:h-2.5 transition-all duration-300 rounded-full shadow-md w-2.5 sm:w-3 bg-white/70 hover:bg-white';
        }
      });
    }

    function startAutoPlay() {
      if (totalSlides > 1 && !autoPlayTimer) {
        autoPlayTimer = setInterval(() => {
          goToSlide(currentSlide + 1);
        }, 5000);
      }
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        stopAutoPlay();
        goToSlide(currentSlide + 1);
        startAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        stopAutoPlay();
        goToSlide(currentSlide - 1);
        startAutoPlay();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        stopAutoPlay();
        goToSlide(idx);
        startAutoPlay();
      });
    });

    heroCarousel.addEventListener('mouseenter', stopAutoPlay);
    heroCarousel.addEventListener('mouseleave', startAutoPlay);

    // Mobile touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    heroCarousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    heroCarousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          goToSlide(currentSlide + 1);
        } else {
          goToSlide(currentSlide - 1);
        }
      }
      startAutoPlay();
    }, { passive: true });

    startAutoPlay();
  }

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
  const videoSection = document.getElementById('video-showcase-section');
  const videoThumb = document.getElementById('videoThumbnail');
  const videoCont = document.getElementById('videoContainer');
  const youtubeVideo = document.getElementById('youtubeVideo');

  if (videoThumb && videoCont && youtubeVideo) {
    let videoStarted = false;
    const startShowcaseVideo = () => {
      if (videoStarted) return;
      videoStarted = true;
      videoThumb.style.display = 'none';
      videoCont.classList.remove('hidden');
      youtubeVideo.src = 'https://www.youtube.com/embed/AETFvQonfV8?autoplay=1&mute=1&playsinline=1';
    };
    const stopShowcaseVideo = () => {
      if (!videoStarted) return;
      videoStarted = false;
      youtubeVideo.src = '';
      videoCont.classList.add('hidden');
      videoThumb.style.display = '';
    };

    videoThumb.addEventListener('click', startShowcaseVideo);

    if (videoSection && 'IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) startShowcaseVideo();
          else stopShowcaseVideo();
        });
      }, { threshold: 0.1 });
      videoObserver.observe(videoSection);
    }
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

  // ------------------------------------------------------------------------
  // 6. Login / SignUp Auth Modal (Menu 2)
  // ------------------------------------------------------------------------
  const authModal = document.getElementById('authModal');
  const openAuthModalBtn = document.getElementById('openAuthModalBtn');
  const mobileAuthBtn = document.getElementById('mobileAuthBtn');
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  const authTabLogin = document.getElementById('authTabLogin');
  const authTabSignup = document.getElementById('authTabSignup');
  const signupNameField = document.getElementById('signupNameField');
  const authSubmitText = document.getElementById('authSubmitText');

  function openAuthModal(mode = 'login') {
    if (!authModal) return;
    authModal.classList.remove('hidden');
    authModal.classList.add('flex');
    setAuthMode(mode);
  }

  function closeAuthModal() {
    if (!authModal) return;
    authModal.classList.add('hidden');
    authModal.classList.remove('flex');
  }

  function setAuthMode(mode) {
    if (mode === 'signup') {
      authTabSignup?.classList.add('bg-white', 'text-primary', 'shadow-sm');
      authTabSignup?.classList.remove('text-gray-600');
      authTabLogin?.classList.remove('bg-white', 'text-primary', 'shadow-sm');
      authTabLogin?.classList.add('text-gray-600');
      signupNameField?.classList.remove('hidden');
      if (authSubmitText) authSubmitText.textContent = 'साइन अप करें (Register)';
    } else {
      authTabLogin?.classList.add('bg-white', 'text-primary', 'shadow-sm');
      authTabLogin?.classList.remove('text-gray-600');
      authTabSignup?.classList.remove('bg-white', 'text-primary', 'shadow-sm');
      authTabSignup?.classList.add('text-gray-600');
      signupNameField?.classList.add('hidden');
      if (authSubmitText) authSubmitText.textContent = 'ओटीपी प्राप्त करें (Send OTP)';
    }
  }

  if (openAuthModalBtn) openAuthModalBtn.addEventListener('click', () => openAuthModal('login'));
  if (mobileAuthBtn) mobileAuthBtn.addEventListener('click', () => openAuthModal('login'));
  if (closeAuthModalBtn) closeAuthModalBtn.addEventListener('click', closeAuthModal);
  if (authTabLogin) authTabLogin.addEventListener('click', () => setAuthMode('login'));
  if (authTabSignup) authTabSignup.addEventListener('click', () => setAuthMode('signup'));
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }

  // ------------------------------------------------------------------------
  // 7. Contact Form AJAX Submission (Inspired by rjd.co.in/contact)
  // ------------------------------------------------------------------------
  const contactForm = document.getElementById('contactForm');
  const contactSuccessAlert = document.getElementById('contactSuccessAlert');
  const contactErrorAlert = document.getElementById('contactErrorAlert');
  const contactErrorMsg = document.getElementById('contactErrorMsg');
  const contactSubmitBtn = document.getElementById('contactSubmitBtn');
  const contactBtnText = document.getElementById('contactBtnText');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (contactErrorAlert) contactErrorAlert.classList.add('hidden');
      if (contactSuccessAlert) contactSuccessAlert.classList.add('hidden');

      const name = document.getElementById('contactName')?.value.trim();
      const phone = document.getElementById('contactPhone')?.value.trim();
      const email = document.getElementById('contactEmail')?.value.trim();
      const subject = document.getElementById('contactSubject')?.value.trim();
      const message = document.getElementById('contactMessage')?.value.trim();

      if (!name || !phone || !message) {
        if (contactErrorAlert) {
          if (contactErrorMsg) contactErrorMsg.textContent = 'कृपया पूरा नाम, मोबाइल नंबर और संदेश अनिवार्य रूप से भरें।';
          contactErrorAlert.classList.remove('hidden');
        }
        return;
      }

      if (contactSubmitBtn) {
        contactSubmitBtn.disabled = true;
        if (contactBtnText) contactBtnText.textContent = 'संदेश भेजा जा रहा है...';
      }

      try {
        const response = await fetch('/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ name, phone, email, subject, message })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const success = {
            formType: 'contact',
            id: data.referenceId || `VIP-CON-${Date.now().toString().slice(-8)}`,
            name,
            phone,
            from: '/contact',
            date: new Date().toISOString()
          };
          try { sessionStorage.setItem('vip_form_success', JSON.stringify(success)); } catch (err) {}
          window.location.replace('/forms/success');
          return;
        } else {
          if (contactErrorAlert) {
            if (contactErrorMsg) contactErrorMsg.textContent = data.message || 'त्रुटि हुई। कृपया पुनः प्रयास करें।';
            contactErrorAlert.classList.remove('hidden');
          }
        }
      } catch (err) {
        if (contactErrorAlert) {
          if (contactErrorMsg) contactErrorMsg.textContent = 'सर्वर से कनेक्ट करने में त्रुटि हुई। कृपया इंटरनेट कनेक्शन जांचें।';
          contactErrorAlert.classList.remove('hidden');
        }
      } finally {
        if (contactSubmitBtn) {
          contactSubmitBtn.disabled = false;
          if (contactBtnText) contactBtnText.textContent = 'संदेश भेजें';
        }
      }
    });
  }
});
