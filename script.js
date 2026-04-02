/* ============================================
   THE VITALITY WORKBOOK — Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // --- Scroll Reveal ---
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        let delay = 0;
        siblings.forEach((sib, idx) => {
          if (sib === entry.target) delay = idx * 80;
        });
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, Math.min(delay, 400));
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => revealObserver.observe(el));

  // --- Navbar scroll state ---
  const nav = document.getElementById('nav');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // --- Mobile menu toggle ---
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      toggle.classList.toggle('open');
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        toggle.classList.remove('open');
      });
    });
  }

  // --- FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      faqItems.forEach(i => i.classList.remove('open'));
      // Toggle current
      if (!isOpen) item.classList.add('open');
    });
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = 80; // nav height
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Pillar card hover parallax (subtle) ---
  const pillarCards = document.querySelectorAll('.pillar-card');
  pillarCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const icon = card.querySelector('.pillar-icon-wrap');
      if (icon) {
        icon.style.transform = `translate(${x * 8}px, ${y * 8}px)`;
      }
    });
    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.pillar-icon-wrap');
      if (icon) {
        icon.style.transform = 'translate(0, 0)';
        icon.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
      }
    });
  });

  // --- Counter animation for pillar stats ---
  const statNums = document.querySelectorAll('.hero-stat-number');
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent;
        const num = parseInt(text);
        if (!isNaN(num) && num <= 100) {
          let current = 0;
          const frames = 30;
          const suffix = text.replace(/[0-9]/g, '');
          const interval = setInterval(() => {
            current++;
            const progress = current / frames;
            const value = Math.round(num * progress);
            el.textContent = value + suffix;
            if (current >= frames) {
              el.textContent = num + suffix;
              clearInterval(interval);
            }
          }, 30);
        }
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => countObserver.observe(el));

  // --- Intake Form → Google Apps Script (auto-email) + Kit (subscriber list) ---
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyUXdrmtlaAknLFrt00uUcRG_zs9_xhClR6SIi9xOmvbovKRXoSmkrpkmfYDpirx-8lcg/exec';
  const KIT_API_KEY = '6cWlVer1x9yz_uoHTEMWAg';
  const KIT_TAG_ID = '18718148';

  const intakeForm = document.getElementById('intake-form');
  const intakeSuccess = document.getElementById('intake-success');
  const intakeSubmit = document.getElementById('intake-submit');

  if (intakeForm) {
    intakeForm.addEventListener('submit', function(e) {
      e.preventDefault();

      const firstName = document.getElementById('intake-first').value.trim();
      const lastName = document.getElementById('intake-last').value.trim();
      const email = document.getElementById('intake-email').value.trim();

      // Validate all fields
      if (!firstName || !lastName) {
        alert('Please enter your first and last name.');
        return;
      }

      // Real email validation
      var emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
      if (!email || !emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Disable button while submitting
      intakeSubmit.disabled = true;
      intakeSubmit.textContent = 'Sending...';

      // Send to Google Apps Script (adds to sheet + sends email)
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          email: email
        })
      })
      .finally(function() {
        // Show success message
        intakeForm.style.display = 'none';
        intakeSuccess.style.display = 'block';
      });

      // Also send to Kit for subscriber list (fire and forget)
      fetch('https://api.convertkit.com/v3/tags/' + KIT_TAG_ID + '/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: KIT_API_KEY,
          email: email,
          first_name: firstName,
          fields: { last_name: lastName }
        })
      }).catch(function() {});
    });
  }

});
