
 // Disable browser automatic scroll restoration to ensure refreshing always opens the first landing page
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

// Reset scroll to top before unloading
window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});

// Reset scroll to top immediately on load
window.scrollTo(0, 0);

document.addEventListener('DOMContentLoaded', () => {
    console.log("Job Portal landing page loaded successfully.");

    // Clear any hash in the URL to prevent automatic jumping on reload
    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
    }
    window.scrollTo(0, 0);

    // Smooth scroll for in-page navigation links without modifying URL hash
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Success stories carousel: page through cards at every screen size.
    const successTrack = document.getElementById('successStoriesTrack');
    const successDots = document.getElementById('successCarouselDots');
    const successPrev = document.querySelector('.success-prev');
    const successNext = document.querySelector('.success-next');

    if (successTrack && successDots && successPrev && successNext) {
        const successCards = Array.from(successTrack.querySelectorAll('.success-story-card'));
        let successCurrentIndex = 0;

        const cardsPerPage = () => {
            if (window.matchMedia('(max-width: 600px)').matches) return 1;
            if (window.matchMedia('(max-width: 1100px)').matches) return 2;
            return 3;
        };
        const maxStartIndex = () => Math.max(0, successCards.length - cardsPerPage());
        const pageStarts = () => {
            const lastStart = maxStartIndex();
            const step = cardsPerPage();
            const starts = [];
            for (let index = 0; index <= lastStart; index += step) starts.push(index);
            if (starts[starts.length - 1] !== lastStart) starts.push(lastStart);
            return starts;
        };
        const cardScrollLeft = index => successCards[index].offsetLeft - successTrack.offsetLeft;
        const nearestCardIndex = () => {
            let nearest = 0;
            let nearestDistance = Infinity;
            successCards.forEach((card, index) => {
                const distance = Math.abs(cardScrollLeft(index) - successTrack.scrollLeft);
                if (distance < nearestDistance) {
                    nearest = index;
                    nearestDistance = distance;
                }
            });
            return nearest;
        };
        const currentPageIndex = starts => {
            let pageIndex = 0;
            starts.forEach((start, index) => {
                if (start <= successCurrentIndex) pageIndex = index;
            });
            return pageIndex;
        };
        const updateSuccessControls = (readTrackPosition = true) => {
            if (!successCards.length) return;
            if (readTrackPosition) successCurrentIndex = nearestCardIndex();
            const activePage = currentPageIndex(pageStarts());
            successDots.querySelectorAll('.success-dot').forEach((dot, index) => {
                const isActive = index === activePage;
                dot.classList.toggle('active', isActive);
                dot.setAttribute('aria-current', isActive ? 'true' : 'false');
            });
        };
        const goToSuccessCard = index => {
            if (!successCards.length) return;
            successCurrentIndex = Math.max(0, Math.min(index, maxStartIndex()));
            successTrack.scrollTo({
                left: cardScrollLeft(successCurrentIndex),
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
            });
            updateSuccessControls(false);
        };
        const renderSuccessDots = () => {
            successDots.replaceChildren();
            pageStarts().forEach((start, index) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'success-dot';
                dot.setAttribute('aria-label', 'Show success stories page ' + (index + 1));
                dot.setAttribute('aria-current', 'false');
                dot.addEventListener('click', () => goToSuccessCard(start));
                successDots.appendChild(dot);
            });
        };
        const moveSuccessPage = direction => {
            const starts = pageStarts();
            const page = currentPageIndex(starts);
            const nextPage = (page + direction + starts.length) % starts.length;
            goToSuccessCard(starts[nextPage]);
        };

        successPrev.addEventListener('click', () => moveSuccessPage(-1));
        successNext.addEventListener('click', () => moveSuccessPage(1));
        successTrack.addEventListener('scroll', () => window.requestAnimationFrame(updateSuccessControls), { passive: true });
        window.addEventListener('resize', () => {
            successCurrentIndex = Math.min(successCurrentIndex, maxStartIndex());
            renderSuccessDots();
            goToSuccessCard(successCurrentIndex);
        });

        renderSuccessDots();
        updateSuccessControls();
    }

    // FAQ Accordion Toggle Interaction
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (!questionBtn) return;

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const btn = otherItem.querySelector('.faq-question');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                questionBtn.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('active');
                questionBtn.setAttribute('aria-expanded', 'true');
            }
        });
    });
});
