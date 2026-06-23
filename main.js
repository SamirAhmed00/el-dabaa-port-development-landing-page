// ===== SECTION 1 =====
// ===== END SECTION 1 =====
// ===== GLOBAL NAVIGATION & SECTION TRANSITION (Curtain System) =====
(function () {
    // 1. Create the solid anti-flash overlay
    const solidOverlay = document.createElement('div');
    solidOverlay.className = 'curtain-solid-overlay';
    document.body.appendChild(solidOverlay);
    /* ---------- بناء عناصر الـ Curtain ---------- */
    const curtain = document.createElement('div');
    curtain.className = 'section-curtain';
    curtain.innerHTML = `
        <div class="section-curtain__stars"></div>
        <div class="section-curtain__line"></div>
        <div class="section-curtain__label">
            <div class="section-curtain__dots">
                <span></span><span></span><span></span>
            </div>
            <div class="section-curtain__text">جاري الانتقال</div>
        </div>
    `;
    document.body.appendChild(curtain);

    const curtainLabel = curtain.querySelector('.section-curtain__text');

    /* ---------- خريطة أسماء السكشنز ---------- */
    const sectionNames = {
        '#s1-container': 'الرئيسية',
        '#s2-container': 'عن المشروع',
        '#s3-container': 'التحليلات المكانية',
        '#s4-container': 'التصميم الهندسي',
        '#s5-container': 'النموذج ثلاثي الأبعاد',
        '#s6-container': 'النتائج',
        '#s7-screenNames': 'فريق العمل',
        '#s7-container': 'الخاتمة'
    };

    /* ---------- حالة الانتقال ---------- */
    let isTransitioning = false;

    function getTargetTop(target) {
        return target.getBoundingClientRect().top + window.scrollY;
    }

    /* ---------- دخول الستارة (من الأسفل للأعلى) ---------- */
    function curtainIn(label, onMidpoint) {
        isTransitioning = true;
        curtainLabel.textContent = label || 'جاري الانتقال';
        curtain.classList.add('is-active');

        gsap.killTweensOf(curtain);
        gsap.set(curtain, { yPercent: 100 });

        gsap.to(curtain, {
            yPercent: 0,
            duration: 0.55,
            ease: 'power3.inOut',
            onComplete: () => {
                curtain.classList.add('is-covering');
                if (onMidpoint) onMidpoint();
            }
        });
    }

    /* ---------- خروج الستارة (من الأعلى للأسفل) ---------- */
    function curtainOut(onDone) {
        curtain.classList.remove('is-covering');

        gsap.to(curtain, {
            yPercent: -100,
            duration: 0.5,
            ease: 'power3.inOut',
            delay: 0.08,
            onComplete: () => {
                curtain.classList.remove('is-active');
                gsap.set(curtain, { yPercent: 100 }); // reset للأسفل للاستخدام القادم
                isTransitioning = false;
                if (onDone) onDone();
            }
        });
    }

    /* ---------- ربط الروابط ---------- */
    const internalLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

    internalLinks.forEach(link => {
        link.addEventListener('click', event => {
            if (isTransitioning) return;

            const hash = link.getAttribute('href');
            const target = document.querySelector(hash);
            if (!target) return;

            event.preventDefault();

            const label = sectionNames[hash] || '';

            // 1. Activate the solid overlay instantly on click to prevent flashing
            solidOverlay.classList.add('is-active');

            document.body.classList.add('is-section-jumping');

            /*
             * نخبّي الـ target فوراً — لو البراوزر عمل scroll مبكر ميبانش
             */
            target.style.visibility = 'hidden';

            curtainIn(label, () => {
                /* الستارة غطّت الشاشة 100% ← رجّع الـ visibility قبل الـ scroll */
                target.style.visibility = '';

                const top = Math.max(0, getTargetTop(target));
                window.scrollTo({ top, behavior: 'instant' });
                window.history.replaceState(null, '', hash);

                if (typeof ScrollTrigger !== 'undefined') {
                    ScrollTrigger.refresh();
                }

                /* فريمين للبراوزر يرسم الصفحة، بعدين اكشف */
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        curtainOut(() => {
                            document.body.classList.remove('is-section-jumping');

                            // 2. Hide the solid overlay after the transition fully completes
                            solidOverlay.classList.remove('is-active');
                        });
                    });
                });
            });
        });
    });
    /* ---------- Active nav via ScrollTrigger ---------- */
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const topSections = gsap.utils.toArray(
            '#s1-container, #s2-container, #s3-container, #s4-container, #s5-container, #s6-container, #s7-container'
        );

        const navLinks = document.querySelectorAll('#s1-container .nav a[href^="#"]');
        topSections.forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top center',
                end: 'bottom center',
                onToggle: self => {
                    if (!self.isActive) return;
                    navLinks.forEach(link => {
                        link.classList.toggle(
                            'active',
                            link.getAttribute('href') === `#${section.id}`
                        );
                    });
                }
            });
        });

        window.addEventListener('load', () => {
            window.setTimeout(() => ScrollTrigger.refresh(), 250);
        });
    }

})();

// ===== SECTION 2 =====
/* =========================================================
   DABAA PORT — Animation & Custom Interactive Zoom Engine
   ========================================================= */

(function () {
    const section = document.getElementById('dabaa-strategic-location');
    if (!section) return;
    // --- كود حركة الماوس الجديد ---
    const glow = section.querySelector('.sea-glow-effect');
    if (glow) {
        section.addEventListener('mousemove', (e) => {
            const rect = section.getBoundingClientRect();
            // حساب أبعاد الماوس بدقة بالنسبة للسكشن
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // تمرير الإحداثيات إلى الـ CSS لتحديث تأثير الإضاءة
            glow.style.setProperty('--mouse-x', `${x}px`);
            glow.style.setProperty('--mouse-y', `${y}px`);
        });
    }
    const wrapper = section.querySelector('.story-wrapper');
    const viewport = section.querySelector('.story-viewport');

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. Pacing Optimization (Shorter Scroll)
    function syncLayoutHeight() {
        wrapper.style.height = window.innerWidth < 900 ? '380vh' : '480vh';
    }
    syncLayoutHeight();
    window.addEventListener('resize', syncLayoutHeight);

    const progressFill = section.querySelector('.frame-progress__fill');

    // ثبّت حالة المشهد الأول فورًا (قبل أي سكرول) — ده العنصر اللي masterTimeline هيتحكم فيه
    // بعدين، عشان منعملش تعارض بين انيميشن الـ load وانيميشن السكرول على نفس الخاصية
    gsap.set('.scene--1', { autoAlpha: 1, visibility: 'visible' });

    // Intro Animation — بنحرك العناصر الداخلية بس (العنوان) مش الـ .scene نفسه
    window.addEventListener('load', () => {
        gsap.set('.scene:not(.scene--1)', { clearProps: 'transform' });
        gsap.fromTo('.scene--1 .s2-title-line',
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out', delay: 0.2 }
        );
    });

    // 2. Master Scroll Timeline (Faster & Cleaner)
    const masterTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: wrapper,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            pin: viewport,
            anticipatePin: 1,
            onUpdate: (self) => {
                if (progressFill) progressFill.style.height = (self.progress * 100) + '%';
            }
        }
    });

    function activateScene() { return { autoAlpha: 1, visibility: 'visible', duration: 0.5 }; }
    function deactivateScene() { return { autoAlpha: 0, visibility: 'hidden', duration: 0.5 }; }

    // Scene 1 to 2
    masterTimeline.to('.scene--1', { autoAlpha: 0, y: -30, duration: 1 })
        .to('.scene--2', activateScene(), '>')
        .fromTo('.scene--2 .s2-map-container', { scale: 1.05, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5 }, '<')
        .fromTo('.scene--2 .text-stage', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5 }, '-=1')
        .to('.scene--2', deactivateScene(), '+=2');

    // Scene 3: Fast Advantages
    masterTimeline.to('.scene--3', activateScene(), '>')
        .fromTo('.advantage-item', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: 'back.out(1.2)' }, '<')
        .to('.scene--3', deactivateScene(), '+=2');

    // Scene 4: Macro Map
    masterTimeline.to('.scene--4', activateScene(), '>')
        .fromTo('.scene--4 .target-zoom-asset', { scale: 1.05, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5 }, '<')
        .to('.scene--4', deactivateScene(), '+=2.5');

    // Scene 5: Conclusion
    masterTimeline.to('.scene--5', activateScene(), '>')
        .fromTo('.story-conclusion', { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.5 }, '<');

    /* =========================================================
       3. Custom Interactive Zoom & Pan Logic (Lightbox)
       ========================================================= */
    const s2Modal = document.getElementById('s2-zoomModal');
    const s2ZoomImg = document.getElementById('s2-zoomImage');
    const s2CloseBtn = document.getElementById('s2-zoomCloseBtn');
    const s2ZoomContainer = document.getElementById('s2-zoomContainer');

    let s2CurrentScale = 1;
    let s2IsDragging = false;
    let s2StartX, s2StartY, s2TranslateX = 0, s2TranslateY = 0;

    // Open Modal
    document.querySelectorAll('.zoomable').forEach(img => {
        img.addEventListener('click', (e) => {
            s2ZoomImg.src = e.target.src;
            s2Modal.classList.add('is-active');
            document.body.style.overflow = 'hidden'; // Prevent page scrolling
            // Reset Transform
            s2CurrentScale = 1; s2TranslateX = 0; s2TranslateY = 0;
            s2UpdateTransform();
        });
    });

    // Close Modal
    function s2CloseModal() {
        s2Modal.classList.remove('is-active');
        document.body.style.overflow = '';
    }
    s2CloseBtn.addEventListener('click', s2CloseModal);
    s2Modal.addEventListener('click', (e) => {
        if (e.target === s2ZoomContainer || e.target === s2Modal) s2CloseModal();
    });

    // Zoom (Wheel)
    s2ZoomContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = 0.15;
        s2CurrentScale += e.deltaY < 0 ? zoomSpeed : -zoomSpeed;
        s2CurrentScale = Math.max(0.5, Math.min(s2CurrentScale, 6)); // Limit 0.5x to 6x
        s2UpdateTransform();
    });

    // Pan (Mouse Drag)
    s2ZoomContainer.addEventListener('mousedown', (e) => {
        s2IsDragging = true;
        s2StartX = e.clientX - s2TranslateX;
        s2StartY = e.clientY - s2TranslateY;
    });
    window.addEventListener('mouseup', () => s2IsDragging = false);
    window.addEventListener('mousemove', (e) => {
        if (!s2IsDragging) return;
        s2TranslateX = e.clientX - s2StartX;
        s2TranslateY = e.clientY - s2StartY;
        s2UpdateTransform();
    });

    // Pan (Touch Drag for Mobile)
    s2ZoomContainer.addEventListener('touchstart', (e) => {
        s2IsDragging = true;
        s2StartX = e.touches[0].clientX - s2TranslateX;
        s2StartY = e.touches[0].clientY - s2TranslateY;
    });
    window.addEventListener('touchend', () => s2IsDragging = false);
    window.addEventListener('touchmove', (e) => {
        if (!s2IsDragging || e.touches.length > 1) return; // ignore multi-touch for now
        s2TranslateX = e.touches[0].clientX - s2StartX;
        s2TranslateY = e.touches[0].clientY - s2StartY;
        s2UpdateTransform();
    });

    function s2UpdateTransform() {
        s2ZoomImg.style.transform = `translate(${s2TranslateX}px, ${s2TranslateY}px) scale(${s2CurrentScale})`;
    }

})();
// ===== END SECTION 2 =====

// ===== SECTION 3 =====
(function () {
    gsap.registerPlugin(ScrollTrigger);

    const s3Stage = document.querySelector(".study-stage");
    const s3Backdrop = document.querySelector(".stage-backdrop");
    const s3Cards = gsap.utils.toArray(".stage-card");
    const s3DockSlots = gsap.utils.toArray(".dock-slot");
    const s3FinaleCards = gsap.utils.toArray(".finale-card");
    const s3Finale = document.querySelector(".study-finale");
    const s3Stamp = document.querySelector(".verdict-stamp");
    const s3ProgressFill = document.querySelector(".stage-progress-fill");
    const s3ProgressText = document.querySelector(".stage-progress-text");
    const s3StageVisuals = gsap.utils.toArray(".stage-visual");

    const s3TotalStages = s3Cards.length;          // 7
    const s3StageUnit = 1;                     // scroll "units" per stage
    const s3FinaleUnits = 1.6;                   // extra units for the dashboard assembly
    const s3TotalUnits = s3TotalStages * s3StageUnit + s3FinaleUnits;
    const s3Vh = () => window.innerHeight;

    // position verdict stamp roughly centered under the grid
    gsap.set(s3Stamp, { top: "auto", left: "50%", bottom: "6%", xPercent: -50 });

    const s3Master = gsap.timeline({
        scrollTrigger: {
            trigger: s3Stage,
            start: "top top",
            end: () => "+=" + s3Vh() * s3TotalUnits,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
        },
    });

    // ---------------------------------------------------------------
    // PER-STAGE SEQUENCE: image reveal -> tag-by-tag data -> dock fill
    // ---------------------------------------------------------------
    s3Cards.forEach((card, i) => {
        const s3Start = i * s3StageUnit;
        const s3Accent = card.dataset.accent;
        const s3Cat = card.querySelector(".stage-category");
        const s3Title = card.querySelector("h3");
        const s3Desc = card.querySelector(".stage-desc");
        const s3Kpis = card.querySelectorAll(".kpi-tag");
        const s3Conclu = card.querySelector(".s3-conclusion");
        const s3DockSlot = s3DockSlots[i];
        const s3Visual = s3StageVisuals[i];
        const s3MainFrame = s3Visual.querySelector(".main-frame");
        const s3SupportFrame = s3Visual.querySelector(".support-frame");
        const s3FrameScan = s3Visual.querySelector(".frame-scan");

        // accent color switch for this stage
        s3Master.to(s3Stage, { "--accent": s3Accent, duration: 0.001 }, s3Start);
        s3Master.to(s3MainFrame, { "--accent": s3Accent, duration: 0.001 }, s3Start);

        // this stage's visual + card become interactive/visible
        s3Master.set(s3Visual, { opacity: 1, pointerEvents: "auto" }, s3Start);
        s3Master.set(card, { pointerEvents: "auto" }, s3Start);

        // image 1: main map sweeps in (clip-path) + scan flash
        s3Master.fromTo(s3MainFrame,
            { clipPath: "inset(0% 0% 0% 100%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 0.16, ease: "power2.out" },
            s3Start + 0.02
        );
        s3Master.fromTo(s3FrameScan,
            { yPercent: -120, opacity: 0.9 },
            { yPercent: 120, opacity: 0, duration: 0.18, ease: "power1.in" },
            s3Start + 0.03
        );

        // image 2: support map drops in AFTER main map ("صورة صورة")
        // (بعض المراحل ملهاش support-frame في الـ HTML، فبنفحص قبل التحريك)
        if (s3SupportFrame) {
            s3Master.fromTo(s3SupportFrame,
                { scale: 0.85, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.14, ease: "back.out(1.4)" },
                s3Start + 0.2
            );
        }

        // card becomes visible container
        s3Master.set(card, { opacity: 1 }, s3Start);

        // tag-by-tag reveal of info
        s3Master.fromTo(s3Cat, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.12 }, s3Start + 0.12);
        s3Master.fromTo(s3Title, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.14 }, s3Start + 0.22);
        s3Master.fromTo(s3Desc, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.16 }, s3Start + 0.32);
        s3Master.fromTo(s3Kpis,
            { opacity: 0, y: 16, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.12, stagger: 0.08 },
            s3Start + 0.46
        );
        s3Master.fromTo(s3Conclu, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.14 }, s3Start + 0.64);

        // hold, then exit + dock the stage into its slot
        const s3ExitAt = s3Start + 0.82;
        s3Master.to(card, { opacity: 0, duration: 0.1, pointerEvents: "none" }, s3ExitAt);
        s3Master.to(s3Visual, { opacity: 0, duration: 0.1, pointerEvents: "none" }, s3ExitAt);

        s3Master.fromTo(s3DockSlot,
            { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.12, ease: "back.out(2)" },
            s3ExitAt + 0.04
        );
    });

    // ---------------------------------------------------------------
    // FINALE: dock expands into the full feasibility dashboard
    // ---------------------------------------------------------------
    const s3FinaleStart = s3TotalStages * s3StageUnit;

    s3Master.to(".stage-viewport", { opacity: 0, duration: 0.2 }, s3FinaleStart);
    s3Master.to(".stage-dock", { opacity: 0, duration: 0.15 }, s3FinaleStart);
    s3Master.to(s3Finale, { opacity: 1, pointerEvents: "auto", duration: 0.2 }, s3FinaleStart + 0.05);

    s3Master.fromTo(".finale-eyebrow", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.15 }, s3FinaleStart + 0.1);
    s3Master.fromTo(".finale-title", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.15 }, s3FinaleStart + 0.2);

    s3Master.fromTo(s3FinaleCards,
        { opacity: 0, y: 24, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.18, stagger: 0.07 },
        s3FinaleStart + 0.35
    );

    // the closing signature: the official suitability stamp drops in
    s3Master.fromTo(s3Stamp,
        { opacity: 0, scale: 2.4, rotate: -22 },
        { opacity: 1, scale: 1, rotate: -10, duration: 0.3, ease: "back.out(1.4)" },
        s3FinaleStart + 1.1
    );

    // ---------------------------------------------------------------
    // PROGRESS RAIL + STATE LABEL (synced independently for snappy text)
    // ---------------------------------------------------------------
    gsap.to(s3ProgressFill, {
        width: "100%",
        ease: "none",
        scrollTrigger: {
            trigger: s3Stage,
            start: "top top",
            end: () => "+=" + s3Vh() * s3TotalUnits,
            scrub: true,
        },
    });

    ScrollTrigger.create({
        trigger: s3Stage,
        start: "top top",
        end: () => "+=" + s3Vh() * s3TotalUnits,
        scrub: true,
        onUpdate: (self) => {
            const s3Unit = self.progress * s3TotalUnits;
            const s3Index = Math.min(s3TotalStages - 1, Math.floor(s3Unit));
            s3ProgressText.textContent =
                s3Unit >= s3TotalStages
                    ? "التقرير المجمّع"
                    : `${String(s3Index + 1).padStart(2, "0")} / 07`;
        },
    });
})();
// ===== END SECTION 3 =====

// ===== SECTION 4 =====
(function () {
    gsap.registerPlugin(ScrollTrigger);

    // 1. كتابة آلية متتابعة: بطاقة 1 -> بطاقة 2 -> الفقرة الافتتاحية (كل عنصر يفضل في مكانه)
    function s4TypeText(el, text, speed) {
        return new Promise(resolve => {
            el.classList.add('is-typing');
            let i = 0;
            (function step() {
                if (i <= text.length) {
                    el.textContent = text.slice(0, i);
                    i++;
                    setTimeout(step, speed);
                } else {
                    el.classList.remove('is-typing');
                    resolve();
                }
            })();
        });
    }

    function s4CountUp(valueEl, progressEl, target, width) {
        return new Promise(resolve => {
            const obj = { v: 0 };
            gsap.to(obj, {
                v: target, duration: 1, ease: "power2.out",
                onUpdate: () => { valueEl.innerHTML = Math.floor(obj.v) + '<span>م</span>'; },
                onComplete: resolve
            });
            gsap.to(progressEl, { width, duration: 1, ease: "power2.out" });
        });
    }

    async function s4RunIntroSequence() {
        const card1 = document.getElementById('dashCard1');
        const card2 = document.getElementById('dashCard2');
        const narrative = document.getElementById('s4-narrativeBlock');

        card1.classList.add('is-active');
        await s4TypeText(document.getElementById('typeTitle1'), 'عمق التصميم المطلوب — قناة الاقتراب', 28);
        await s4CountUp(card1.querySelector('.dash-value'), card1.querySelector('.dash-progress-bar'), 14, '70%');

        card2.classList.add('is-active');
        await s4TypeText(document.getElementById('typeTitle2'), 'عمق الحوض الملاحي — حوض الدوران', 28);
        await s4CountUp(card2.querySelector('.dash-value'), card2.querySelector('.dash-progress-bar'), 20, '100%');

        narrative.classList.add('is-active');
        await s4TypeText(
            document.getElementById('typeNarrative'),
            'استناداً إلى نتائج التحليلات المكانية تم إعداد تصميم هندسي متكامل لميناء الضبعة يضم كواسر الأمواج وقناة الاقتراب والحوض الملاحي والأرصفة وساحات التخزين والمناطق اللوجستية والمرافق الخدمية لدعم سلاسل الإمداد العالمية.',
            12
        );
    }

    ScrollTrigger.create({
        trigger: "#s4-triggerStart",
        start: "top 75%",
        once: true,
        onEnter: s4RunIntroSequence
    });

    // 2. تفعيل تثبيت النص والظهور المتتابع كلمة كلمة + رسم خط النمو المرافق بالتزامن
    const revealText = document.getElementById('s4-revealText');
    const textContent = revealText.textContent.replace(/\s+/g, ' ').trim();
    revealText.innerHTML = textContent.split(/\s+/).map(word => `<span class="reveal-word">${word}</span>`).join(' ');

    const s4Words = document.querySelectorAll('.reveal-word');
    const s4GrowthTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#s4-textPinSection",
            start: "top top",
            end: "+=100%",
            pin: true,
            scrub: 0.5
        }
    });
    s4GrowthTl.to(s4Words, { color: "var(--s4-abyss)", stagger: 0.1 }, 0);
    s4GrowthTl.to("#growthPath", { strokeDashoffset: 0, ease: "none" }, 0);
    s4GrowthTl.to("#growthDot1", { opacity: 1 }, 0.35);
    s4GrowthTl.to("#growthDot2", { opacity: 1 }, 0.6);
    s4GrowthTl.to("#growthDot3", { opacity: 1, scale: 1.3 }, 0.92);

    // 3. 🛠️ الحل الجذري المحكم لبيئة RTL 🛠️
    const s4StripWrapper = document.getElementById('stripWrapper');
    const s4Cards = gsap.utils.toArray('.blueprint-card');
    const s4Thumbs = gsap.utils.toArray('.thumb-node');
    const s4TotalCards = s4Cards.length;

    function s4CalcExactScrollDistance() {
        if (s4TotalCards === 0) return 0;
        const s4CardWidth = s4Cards[0].getBoundingClientRect().width;
        const s4Style = window.getComputedStyle(s4StripWrapper);
        const s4Gap = parseFloat(s4Style.gap) || 0;

        return (s4CardWidth + s4Gap) * (s4TotalCards - 1);
    }

    const s4HorizontalTween = gsap.to(s4StripWrapper, {
        x: () => s4CalcExactScrollDistance(),
        ease: "none",
        scrollTrigger: {
            trigger: "#theatreSection",
            start: "top top",
            end: () => `+=${s4CalcExactScrollDistance()}`,
            pin: true,
            scrub: 1, // يمكنك تقليلها إلى 0.5 أو تزويدها لـ 1.5 لتنعيم الحركة حسب رغبتك

            // 🛠️ يمنع التقطيع والقفزة اللحظية عند بداية التثبيت (مهم جداً!)
            anticipatePin: 1,

            invalidateOnRefresh: true,
            onUpdate: (self) => {
                const progress = self.progress;
                let s4ActiveIndex = Math.floor(progress * s4TotalCards);
                if (s4ActiveIndex >= s4TotalCards) s4ActiveIndex = s4TotalCards - 1;
                if (s4ActiveIndex < 0) s4ActiveIndex = 0;

                // تحديث كلاسات الـ Focus والـ Thumbnails
                // 🛠️ تم استخدام الأسلوب المباشر لتقليل استهلاك الـ CPU أثناء التمرير السريع
                if (s4Cards[s4ActiveIndex] && !s4Cards[s4ActiveIndex].classList.contains('is-focused')) {
                    s4Cards.forEach((card, idx) => {
                        card.classList.toggle('is-focused', idx === s4ActiveIndex);
                        s4Thumbs[idx].classList.toggle('is-active', idx === s4ActiveIndex);
                    });
                    document.getElementById('hudActiveIndex').innerText = s4ActiveIndex + 1;
                }
            }
        }
    });

    // ربط المصغرات (Thumbnails) بالسكرول
    s4Thumbs.forEach((thumb, index) => {
        thumb.addEventListener('click', () => {
            const s4ScrollTriggerInstance = s4HorizontalTween.scrollTrigger;
            const s4TargetProgress = index / (s4TotalCards - 1);
            const s4TargetScrollY = s4ScrollTriggerInstance.start + (s4TargetProgress * (s4ScrollTriggerInstance.end - s4ScrollTriggerInstance.start));

            // تأكد من استدعاء سكريبت الـ ScrollToPlugin إذا كنت تستخدم scrollTo، 
            // أو استبدلها بـ window.scrollTo لتفادي أي نقص في المكتبات:
            window.scrollTo({
                top: s4TargetScrollY,
                behavior: 'smooth'
            });
        });
    });
})();
// ===== END SECTION 4 =====

// ===== SECTION 5 =====
(function () {
    gsap.registerPlugin(ScrollTrigger);

    /* ============ خلفية: حركة عضوية + parallax بالماوس ============ */
    const s5Orbs = gsap.utils.toArray(".bg-orb");
    let s5MouseX = 0, s5MouseY = 0;
    window.addEventListener("mousemove", (e) => {
        s5MouseX = (e.clientX / window.innerWidth - 0.5);
        s5MouseY = (e.clientY / window.innerHeight - 0.5);
    });

    const s5T0 = performance.now();
    function s5AmbientLoop() {
        const s5T = (performance.now() - s5T0) / 1000;
        s5Orbs.forEach((orb, i) => {
            const depth = (i + 1) * 18;
            const driftX = Math.sin(s5T * 0.15 + i * 2) * 40;
            const driftY = Math.cos(s5T * 0.12 + i * 2) * 40;
            gsap.set(orb, {
                x: driftX + s5MouseX * depth,
                y: driftY + s5MouseY * depth
            });
        });
        requestAnimationFrame(s5AmbientLoop);
    }
    s5AmbientLoop();

    /* ============ 1. Intro ============ */
    gsap.timeline({
        scrollTrigger: { trigger: "#s5-container .intro-container", start: "top 80%", toggleActions: "play none none reverse" }
    })
        .to("#s5-container .s5-section-tag", { opacity: 1, duration: .6 })
        .to("#s5-container .s5-section-title", { opacity: 1, duration: 1, ease: "power2.out" }, "-=0.3")
        .to("#s5-container .s5-title-line", { width: "100px", duration: 0.8, ease: "power2.out" }, "-=0.5")
        .to("#s5-container .s5-section-description", { opacity: 1, duration: 1, ease: "power2.out" }, "-=0.5");

    /* ============ 2. Diptych Reveal ============ */
    gsap.timeline({
        scrollTrigger: { trigger: "#s5-container .s5-diptych", start: "top 75%", toggleActions: "play none none reverse" }
    })
        .to("#s5-container .diptych-divider", { scaleY: 1, duration: 0.8, ease: "power2.out" })
        .to("#s5-container .diptych-panel[data-panel='1'] .render-frame", { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power3.inOut" }, "-=0.6")
        .to("#s5-container .diptych-panel[data-panel='2'] .render-frame", { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power3.inOut" }, "-=0.85")
        .to("#s5-container .render-caption", { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 }, "-=0.3");

    /* ============ 3. Results ============ */
    gsap.utils.toArray("#s5-container .s5-result-card").forEach((card, i) => {
        let paths = card.querySelectorAll(".path");
        gsap.timeline({
            scrollTrigger: { trigger: card, start: "top 85%", toggleActions: "play none none reverse" }
        })
            .to(card, { opacity: 1, y: 0, duration: 0.8, delay: i * 0.15, ease: "power2.out" })
            .to(paths, { strokeDashoffset: 0, duration: 1.3, stagger: 0.2, ease: "power2.inOut" }, "-=0.5");
    });

    /* ============ 4. Before / After ============ */
    document.querySelectorAll("#s5-container .s5-ba-slider").forEach((slider) => {
        let before = slider.querySelector(".ba-before");
        let handle = slider.querySelector(".ba-handle");
        let isDragging = false;

        function moveSlider(x) {
            let rect = slider.getBoundingClientRect();
            let pos = Math.max(0, Math.min(x - rect.left, rect.width));
            let percent = (pos / rect.width) * 100;
            before.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
            handle.style.left = `${percent}%`;
        }

        slider.addEventListener("mousedown", (e) => { isDragging = true; moveSlider(e.clientX); });
        window.addEventListener("mouseup", () => { isDragging = false; });
        window.addEventListener("mousemove", (e) => { if (isDragging) moveSlider(e.clientX); });

        slider.addEventListener("touchstart", (e) => { isDragging = true; moveSlider(e.touches[0].clientX); }, { passive: true });
        window.addEventListener("touchend", () => { isDragging = false; });
        window.addEventListener("touchmove", (e) => { if (isDragging) moveSlider(e.touches[0].clientX); }, { passive: true });

        gsap.to(before, {
            clipPath: "polygon(0 0, 78% 0, 78% 100%, 0 100%)", ease: "none",
            scrollTrigger: { trigger: slider, start: "top 80%", end: "bottom 60%", scrub: 1 }
        });
        gsap.to(handle, {
            left: "78%", ease: "none",
            scrollTrigger: { trigger: slider, start: "top 80%", end: "bottom 60%", scrub: 1 }
        });
    });

    gsap.utils.toArray("#s5-container .s5-sub-title").forEach((title) => {
        gsap.to(title, {
            opacity: 1, duration: 1, ease: "power2.out",
            scrollTrigger: { trigger: title, start: "top 80%", toggleActions: "play none none reverse" }
        });
    });

    /* ============ 5. الخاتمة السينمائية: فريمات + overlay قصصي ============ */
    const s5FrameCount = 214;
    const s5FrameImage = document.getElementById("s5-frame-image");
    const s5FramesContainer = document.getElementById("s5-frames-container");
    const s5VideoText = document.getElementById("video-text-overlay");
    const s5ProgressFill = document.getElementById("cinemaProgressFill");
    const s5Chips = gsap.utils.toArray("#s5-container .s5-cinema-chip");

    function s5PadNumber(num) { return num.toString().padStart(3, "0"); }

    const s5Images = [];
    let s5CurrentFrame = 1;

    function s5PreloadImages() {
        let i = 1;
        // أول 40 فريم فوراً بعد تحميل الصفحة
        function eagerBatch() {
            const end = Math.min(40, s5FrameCount);
            for (; i <= end; i++) {
                const img = new Image();
                img.src = `assets/s5/frames/frame-${s5PadNumber(i)}.webp`;
                s5Images[i] = img;
            }
            (window.requestIdleCallback || (fn => setTimeout(fn, 100)))(restBatch);
        }
        // باقي الفريمات في idle time بدفعات 20
        function restBatch() {
            const end = Math.min(i + 19, s5FrameCount);
            for (; i <= end; i++) {
                const img = new Image();
                img.src = `assets/s5/frames/frame-${s5PadNumber(i)}.webp`;
                s5Images[i] = img;
            }
            if (i <= s5FrameCount)
                (window.requestIdleCallback || (fn => setTimeout(fn, 80)))(restBatch);
        }
        document.readyState === "complete" ? eagerBatch() : window.addEventListener("load", eagerBatch);
    }
    s5PreloadImages();

    // Double-buffer: بنحمّل الصورة في الخلفية، وبس لما تخلص تحميل نعرضها — مفيش شاشة سوداء
    const s5Buffer = new Image();
    let s5Pending = -1;
    let s5Loading = false;

    function s5Flush() {
        if (s5Pending === -1 || s5Loading) return;
        const target = s5Pending;
        s5Pending = -1;
        s5Loading = true;
        s5Buffer.onload = () => {
            s5FrameImage.src = s5Buffer.src;
            s5CurrentFrame = target;
            s5Loading = false;
            if (s5Pending !== -1) s5Flush();
        };
        s5Buffer.onerror = () => { s5Loading = false; if (s5Pending !== -1) s5Flush(); };
        s5Buffer.src = `assets/s5/frames/frame-${s5PadNumber(target)}.webp`;
    }

    function s5UpdateFrame(index) {
        index = Math.max(1, Math.min(s5FrameCount, Math.round(index)));
        if (index === s5CurrentFrame) return;
        // لو الصورة موجودة في cache وخلصت تحميل → عرضها فوراً بدون buffer
        const cached = s5Images[index];
        if (cached && cached.complete && cached.naturalWidth > 0) {
            s5FrameImage.src = cached.src;
            s5CurrentFrame = index;
            return;
        }
        // مش في cache بعد → double-buffer عشان منعرضش شاشة سوداء
        s5Pending = index;
        s5Flush();
    }

    gsap.to(s5FramesContainer, {
        scrollTrigger: {
            trigger: "#s5-frames-container",
            start: "top top",
            end: "+=400%",
            pin: true,
            scrub: 1,
            onUpdate: (self) => {
                const progress = self.progress;
                s5UpdateFrame(progress * s5FrameCount);
                s5ProgressFill.style.width = (progress * 100) + "%";

                // العنوان الرئيسي (eyebrow + lead) ظاهر من البداية لأن السكشن بقى أول حاجة تظهر للزائر
                // (مبقاش محتاج ننتظر تقدم سكرول لظهوره)

                // ظهور النص الفرعي (body) من نص الفيديو تقريبًا
                if (progress > 0.3) {
                    gsap.set("#s5-container .s5-cinema-body", { opacity: Math.min(1, (progress - 0.3) * 3.5) });
                } else {
                    gsap.set("#s5-container .s5-cinema-body", { opacity: 0 });
                }

                // النتائج تتلاقط واحدة واحدة مع تقدم الفريمات
                s5Chips.forEach((chip, i) => {
                    const threshold = 0.55 + i * 0.1;
                    const on = progress > threshold;
                    chip.classList.toggle("is-on", on);
                    gsap.to(chip, { opacity: on ? 1 : 0.35, y: on ? 0 : 10, duration: 0.4 });
                });

                // الخاتمة النصية الأخيرة
                gsap.to("#s5-container .s5-cinema-closing", { opacity: progress > 0.88 ? 1 : 0, duration: 0.4 });
            },
            onLeaveBack: () => {
                s5UpdateFrame(1);
                gsap.set("#s5-container .s5-cinema-body", { opacity: 0 });
                s5ProgressFill.style.width = "0%";
            }
        }
    });
})();
// ===== END SECTION 5 =====

// ===== SECTION 6 =====
(function () {
    // Register GSAP and ScrollTrigger plugins
    gsap.registerPlugin(ScrollTrigger);

    // Apply strict premium presentation flow on desktop environments
    let s6Mm = gsap.matchMedia();
    s6Mm.add("(min-width: 993px)", () => {

        // Master timeline with extensive virtual travel depth to guarantee absolute scrolling smoothness
        const s6StoryTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: "#s6-storySection",
                start: "top top",
                end: "+=5600", // Balanced scroll range without leaving a long terminal spacer
                scrub: 1.2,    // Soft inertial drag response
                pin: true,     // Hard locking viewport mechanics
                onUpdate: (self) => {
                    gsap.to("#s6-progressBar", { scaleX: self.progress, duration: 0.1, overwrite: "auto" });
                }
            }
        });

        // --- STEP 1: Introduction & Counter 0 -> 78 ---
        s6StoryTimeline.set("#mapView1", { autoAlpha: 1 });
        s6StoryTimeline.to("#step1", { autoAlpha: 1, duration: 1 });
        s6StoryTimeline.to("#count78", {
            innerText: 78,
            duration: 1.5,
            snap: { innerText: 1 },
            ease: "power1.out"
        }, "<");

        // Subtle editorial layout map pan & zoom as story initializes
        s6StoryTimeline.from("#mapImg1", { scale: 1.05, y: 10, duration: 2 }, "<");
        s6StoryTimeline.to("#step1", { autoAlpha: 0, y: -40, duration: 1 }, "+=1.5");

        // --- STEP 2: Sequential Card-by-Card Reveal Mechanics ---
        s6StoryTimeline.set("#step2", { y: 40 }, "<");
        s6StoryTimeline.to("#step2", { autoAlpha: 1, y: 0, duration: 1 });

        // Box 1 entry
        s6StoryTimeline.from("#mBox1", { opacity: 0, y: 25, duration: 1 });
        s6StoryTimeline.to({}, { duration: 0.8 }); // Scrolling padding/holding window

        // Box 2 entry
        s6StoryTimeline.from("#mBox2", { opacity: 0, y: 25, duration: 1 });
        s6StoryTimeline.to({}, { duration: 0.8 });

        // Box 3 entry
        s6StoryTimeline.from("#mBox3", { opacity: 0, y: 25, duration: 1 });
        s6StoryTimeline.to({}, { duration: 0.8 });

        // Box 4 entry
        s6StoryTimeline.from("#mBox4", { opacity: 0, y: 25, duration: 1 });
        s6StoryTimeline.to({}, { duration: 2 }); // Let the complete grid sit in view

        s6StoryTimeline.to("#step2", { autoAlpha: 0, y: -40, duration: 1 });

        // --- STEP 3: Map Crossfade Transition & Technical Criteria ---
        s6StoryTimeline.to("#mapView1", { autoAlpha: 0, scale: 0.97, duration: 1.2 }, "<");
        s6StoryTimeline.to("#mapView2", { autoAlpha: 1, scale: 1, duration: 1.2 }, "<");
        s6StoryTimeline.from("#mapImg2", { scale: 1.05, y: -10, duration: 1.8 }, "<");

        s6StoryTimeline.set("#step3", { y: 40 }, "<");
        s6StoryTimeline.to("#step3", { autoAlpha: 1, y: 0, duration: 1 });
        s6StoryTimeline.from("#step3 .metric-box", { opacity: 0, y: 20, stagger: 0.3, duration: 1.2 }, "-=0.3");
        s6StoryTimeline.to("#step3", { autoAlpha: 0, y: -40, duration: 1 }, "+=2");

        // --- STEP 4: Horizon 2035 ---
        s6StoryTimeline.set("#step4", { y: 40 }, "<");
        s6StoryTimeline.to("#step4", { autoAlpha: 1, y: 0, duration: 1 });
        s6StoryTimeline.to("#step4", { autoAlpha: 0, y: -40, duration: 1 }, "+=2");

        // --- STEP 5: Final Executive Summary Verdict ---
        s6StoryTimeline.set("#step5", { y: 40 }, "<");
        s6StoryTimeline.to("#step5", { autoAlpha: 1, y: 0, duration: 1 });
        s6StoryTimeline.from("#step5 .verdict-tag", { opacity: 0, x: 30, stagger: 0.15, duration: 1 }, "-=0.3");
        s6StoryTimeline.from("#step5 .conclusion-text", { opacity: 0, duration: 1 }, "-=0.5");
        s6StoryTimeline.to({}, { duration: 0.6 }); // Short final hold before viewport release
    });

    /* =========================================================
       Custom Interactive Zoom & Pan Logic (Lightbox)
       — مستقل تمامًا عن GSAP ScrollTrigger الخاص بالستوري
       ========================================================= */
    (function () {
        const s6Modal = document.getElementById('s6-zoomModal');
        const s6ZoomImg = document.getElementById('s6-zoomImage');
        const s6CloseBtn = document.getElementById('s6-zoomCloseBtn');
        const s6ZoomContainer = document.getElementById('s6-zoomContainer');
        if (!s6Modal) return;

        let s6CurrentScale = 1;
        let s6IsDragging = false;
        let s6StartX, s6StartY, s6TranslateX = 0, s6TranslateY = 0;

        // فتح المودال
        document.querySelectorAll('.zoomable').forEach(img => {
            img.addEventListener('click', (e) => {
                s6ZoomImg.src = e.target.src;
                s6Modal.classList.add('is-active');
                document.body.style.overflow = 'hidden';
                s6CurrentScale = 1; s6TranslateX = 0; s6TranslateY = 0;
                s6UpdateTransform();
            });
        });

        function s6CloseModal() {
            s6Modal.classList.remove('is-active');
            document.body.style.overflow = '';
        }
        s6CloseBtn.addEventListener('click', s6CloseModal);
        s6Modal.addEventListener('click', (e) => {
            if (e.target === s6ZoomContainer || e.target === s6Modal) s6CloseModal();
        });

        // تكبير بعجلة الماوس
        s6ZoomContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const s6ZoomSpeed = 0.15;
            s6CurrentScale += e.deltaY < 0 ? s6ZoomSpeed : -s6ZoomSpeed;
            s6CurrentScale = Math.max(0.5, Math.min(s6CurrentScale, 6));
            s6UpdateTransform();
        });

        // سحب بالماوس
        s6ZoomContainer.addEventListener('mousedown', (e) => {
            s6IsDragging = true;
            s6StartX = e.clientX - s6TranslateX;
            s6StartY = e.clientY - s6TranslateY;
        });
        window.addEventListener('mouseup', () => s6IsDragging = false);
        window.addEventListener('mousemove', (e) => {
            if (!s6IsDragging) return;
            s6TranslateX = e.clientX - s6StartX;
            s6TranslateY = e.clientY - s6StartY;
            s6UpdateTransform();
        });

        // سحب باللمس (موبايل)
        s6ZoomContainer.addEventListener('touchstart', (e) => {
            s6IsDragging = true;
            s6StartX = e.touches[0].clientX - s6TranslateX;
            s6StartY = e.touches[0].clientY - s6TranslateY;
        });
        window.addEventListener('touchend', () => s6IsDragging = false);
        window.addEventListener('touchmove', (e) => {
            if (!s6IsDragging || e.touches.length > 1) return;
            s6TranslateX = e.touches[0].clientX - s6StartX;
            s6TranslateY = e.touches[0].clientY - s6StartY;
            s6UpdateTransform();
        });

        function s6UpdateTransform() {
            s6ZoomImg.style.transform = `translate(${s6TranslateX}px, ${s6TranslateY}px) scale(${s6CurrentScale})`;
        }
    })();
})();
// ===== END SECTION 6 =====

// ===== SECTION 7 =====
(function () {
    gsap.registerPlugin(ScrollTrigger);

    // ===== seamless video loop via crossfade between two synced videos =====
    const s7VidA = document.getElementById('bgVideoA');
    const s7VidB = document.getElementById('bgVideoB');
    const s7BgFallback = document.querySelector('.media-fallback');
    const s7Crossfade = 1.2; // seconds before the end where the swap starts

    let s7ActiveVid = s7VidA;
    let s7IdleVid = s7VidB;
    let s7Crossfading = false;

    [s7VidA, s7VidB].forEach(v => {
        v.addEventListener('error', () => { s7BgFallback.style.opacity = '1'; });
        v.addEventListener('canplay', () => { s7BgFallback.style.opacity = '0'; });
    });

    function s7StartCrossfade() {
        s7Crossfading = true;
        s7IdleVid.currentTime = 0;
        s7IdleVid.play().catch(() => { });

        gsap.to(s7ActiveVid, { opacity: 0, duration: s7Crossfade, ease: 'sine.inOut' });
        gsap.to(s7IdleVid, {
            opacity: 1, duration: s7Crossfade, ease: 'sine.inOut',
            onComplete: () => {
                s7ActiveVid.pause();
                const s7Tmp = s7ActiveVid;
                s7ActiveVid = s7IdleVid;
                s7IdleVid = s7Tmp;
                s7Crossfading = false;
            }
        });
    }

    setInterval(() => {
        if (s7SectionVisible && !s7Crossfading && s7ActiveVid.duration && (s7ActiveVid.duration - s7ActiveVid.currentTime) <= s7Crossfade) {
            s7StartCrossfade();
        }
    }, 200);

    // ===== إيقاف الفيديوهات تمامًا لما السكشن يخرج من الشاشة =====
    // ده بيوقف استهلاك المعالج/الذاكرة بتاع الفيديوهين لما المستخدم يكون في سكشن تاني
    let s7SectionVisible = true;
    const s7Container = document.getElementById('s7-container');

    const s7VideoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            s7SectionVisible = entry.isIntersecting;
            if (entry.isIntersecting) {
                s7ActiveVid.play().catch(() => { });
            } else {
                s7VidA.pause();
                s7VidB.pause();
            }
        });
    }, { threshold: 0.05 });

    if (s7Container) s7VideoObserver.observe(s7Container);
})();

(function () {
    const s7Participants = [
        "احمد محمد ابراهيم حسن",
        "رحمه فتحي احمد",
        "علي سيد عباده",
        "يوسف هشام محمد فرج",
        "خالد حمدي محمد",
        "علي صالح علي سالمان",
        "سليمان محمود سليمان ابراهيم",
        "محمد يوسف عبدالحميد محمود",
        "مصطفي رضوان اسماعيل ماهر",
        "محمد اشرف محمد انس",
        "علاء ابراهيم زيدان سند",
        "منه عبد السلام علي مصطفي",
        "عاصم عادل عيد",
        "احمد عبدالرحمن محمد مصطفي",
        "رنا حسن احمد علي سلامه",
        "محمد السيد حميد سالم",
        "يوسف ماهر محمد علي",
        "زياد السيد راضي عبد المنعم",
        "عبدالرحمن خالد محمد العوضي",
        "عبد الرحمن صلاح عبدالرحمن محمد",
        "محمد صلاح احمد عبدالعال",
        "محمد مامون محمد امين",
        "عمر محمد لباد اعميد",
        "حمزه حسني نجيب ابراهيم",
        "عبدلله عنتر علي حسن",
        "عبدالرحمن محمد جلال إسماعيل",
        "محمد هشام محمد محمود",
        "منه الله وليد السيد"
    ];

    const namesGrid = document.getElementById('namesGrid');
    s7Participants.forEach((name, i) => {
        const card = document.createElement('div');
        card.className = 'name-card';
        card.innerHTML = `<span class="name-card__index">${String(i + 1).padStart(2, '0')}</span><span>${name}</span>`;
        namesGrid.appendChild(card);
    });

    gsap.from('.name-card', {
        opacity: 0,
        y: 14,
        duration: 0.5,
        stagger: { each: 0.025, grid: 'auto' },
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '#s7-screenNames',
            start: 'top 70%'
        }
    });

    gsap.from('.names-title, .names-count', {
        opacity: 0,
        y: 16,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '#s7-screenNames',
            start: 'top 75%'
        }
    });
})();

(function () {
    const s7Sections = [
        {
            tag: "01 / عن المشروع",
            title: "About the Project",
            points: [
                "موقع استراتيجي على البحر المتوسط بمحافظة مطروح",
                "قرب من الإسكندرية ومرسى مطروح وسهولة الربط بشبكات النقل",
                "مساحات مناسبة للتوسع المستقبلي المستدام"
            ]
        },
        {
            tag: "02 / التحليلات المكانية",
            title: "Spatial Analysis",
            points: [
                "تحليل طبوغرافي: ارتفاعات 0–63م وانحدارات منخفضة 0°–3°",
                "تحليل الرياح: الاتجاه الشمالي الغربي بنسبة 26.80%",
                "تحليل هيدروغرافي وأمواج ونموذج AHP للملاءمة المكانية"
            ]
        },
        {
            tag: "03 / التغيرات الساحلية",
            title: "Coastal Changes — DSAS",
            points: [
                "78 مقطعاً ساحلياً وتنبؤ بخط الساحل حتى عام 2035",
                "إرساب طفيف يسود معظم المنطقة مع تآكل محدود في أجزاء أخرى",
                "بيانات تدعم استدامة التوسع المينائي على المدى الطويل"
            ]
        },
        {
            tag: "04 / التصميم الهندسي",
            title: "Engineering Design",
            points: [
                "تصميم متكامل يضم كواسر الأمواج وقناة الاقتراب والحوض الملاحي والأرصفة",
                "قناة اقتراب بعمق 14 متراً وحوض دوران بعمق 20 متراً",
                "أرصفة متخصصة للحاويات ومناطق لوجستية وخدمية متكاملة"
            ]
        },
        {
            tag: "05 / النموذج الرقمي",
            title: "3D Model — Blender",
            points: [
                "نموذج ثلاثي الأبعاد لإظهار الشكل المستقبلي للميناء بعد التطوير",
                "محاكاة بيئة تشغيلية واقعية لدعم اتخاذ القرار",
                "ريندر واقعي، صور Before/After، وفيديو سينمائي للميناء"
            ]
        },
        {
            tag: "06 / النتائج النهائية",
            title: "Results",
            points: [
                "78 مقطعاً ساحلياً بمتوسط تغير +2.91 متر/سنة",
                "عمق 14 متراً لقناة الاقتراب و20 متراً لحوض الدوران",
                "منطقة الضبعة تمتلك مقومات طبيعية وهندسية مناسبة لميناء متكامل"
            ]
        }
    ];

    const s7Rail = document.getElementById('rail');
    const s7Stage = document.getElementById('s7-stage');

    s7Sections.forEach((s, i) => {
        const railItem = document.createElement('div');
        railItem.className = 'rail__item' + (i === 0 ? ' is-active' : '');
        railItem.dataset.index = i;
        railItem.innerHTML = `<span class="num">${String(i + 1).padStart(2, '0')}</span><span class="label">${s.title}</span>`;
        s7Rail.appendChild(railItem);

        const card = document.createElement('div');
        card.className = 'tag-card' + (i === 0 ? ' is-current' : '');
        card.dataset.index = i;
        card.innerHTML = `
    <div class="tag-card__head">
      <span class="tag-card__tag">${s.tag}</span>
      <span class="tag-card__title">${s.title}</span>
    </div>
    <ul class="tag-card__body">
      ${s.points.map(p => `<li>${p}</li>`).join('')}
    </ul>
  `;
        s7Stage.appendChild(card);
    });

    let s7Current = 0;
    let s7IsAnimating = false;
    const s7RailItems = s7Rail.querySelectorAll('.rail__item');
    const s7Cards = s7Stage.querySelectorAll('.tag-card');

    function s7ShowCard(index, direction) {
        if (s7IsAnimating || index === s7Current) return;
        s7IsAnimating = true;

        const s7Outgoing = s7Cards[s7Current];
        const s7Incoming = s7Cards[index];
        const s7Dir = direction === 'next' ? 1 : -1;

        s7RailItems[s7Current].classList.remove('is-active');
        s7RailItems[index].classList.add('is-active');

        s7Incoming.classList.add('is-current');
        gsap.set(s7Incoming, { xPercent: 6 * s7Dir, opacity: 0 });
        gsap.set(s7Incoming.querySelectorAll('li'), { opacity: 0, x: 12 * s7Dir });

        const s7Tl = gsap.timeline({
            onComplete: () => {
                s7Outgoing.classList.remove('is-current');
                s7Current = index;
                s7IsAnimating = false;
            }
        });

        s7Tl.to(s7Outgoing, { xPercent: -6 * s7Dir, opacity: 0, duration: 0.45, ease: 'power2.in' }, 0)
            .to(s7Incoming, { xPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0.1)
            .to(s7Incoming.querySelectorAll('li'), {
                opacity: 1, x: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out'
            }, 0.25);
    }

    s7RailItems.forEach(item => {
        item.addEventListener('click', () => {
            const s7Idx = parseInt(item.dataset.index);
            s7ShowCard(s7Idx, s7Idx > s7Current ? 'next' : 'prev');
        });
    });

    // auto-advance loop, pauses on hover + يتوقف تمامًا لو السكشن مش ظاهر
    let s7Auto = null;
    function s7StartAuto() {
        if (s7Auto) return; // already running
        s7Auto = setInterval(() => {
            const s7Next = (s7Current + 1) % s7Sections.length;
            s7ShowCard(s7Next, 'next');
        }, 5000);
    }
    function s7StopAuto() {
        clearInterval(s7Auto);
        s7Auto = null;
    }
    s7StartAuto();
    s7Rail.addEventListener('mouseenter', s7StopAuto);
    s7Rail.addEventListener('mouseleave', s7StartAuto);

    // إيقاف التبديل التلقائي لما السكشن يخرج تمامًا من الشاشة
    const s7RailObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) s7StartAuto();
            else s7StopAuto();
        });
    }, { threshold: 0.05 });
    s7RailObserver.observe(s7Rail);

    // initial card setup
    gsap.set(s7Cards[0].querySelectorAll('li'), { opacity: 1, x: 0 });

    // ===== entrance timeline =====
    gsap.timeline({ defaults: { ease: 'power3.out' } })
        .to('#eyebrow', { opacity: 1, duration: 0.6 }, 0.1)
        .from('#heroLine', { y: 24, opacity: 0, duration: 0.8 }, 0.2)
        .from('.rail__item', { x: 20, opacity: 0, duration: 0.5, stagger: 0.06 }, 0.5)
        .from(s7Cards[0], { y: 16, opacity: 0, duration: 0.6 }, 0.6)
        .from(s7Cards[0].querySelectorAll('li'), { opacity: 0, x: 12, duration: 0.4, stagger: 0.07 }, 0.8)
        .from('.resource', { y: 16, opacity: 0, duration: 0.5, stagger: 0.08 }, 0.9)
        .from('.book-cta', { y: 12, opacity: 0, duration: 0.5 }, 1.2);

    // .contributors__item not present in HTML yet — guard before animating
    if (document.querySelector('.contributors__item')) {
        gsap.from('.contributors__item', { y: 12, opacity: 0, duration: 0.5, stagger: 0.06, delay: 1.25 });
    }

    // ===== counters count-up =====
    document.querySelectorAll('.resource__num').forEach(el => {
        const target = parseFloat(el.dataset.count);
        gsap.to(el, {
            innerText: target,
            duration: 1.4,
            delay: 1,
            snap: { innerText: 1 },
            ease: 'power2.out',
            onUpdate: function () {
                el.innerText = Math.round(this.targets()[0].innerText);
            }
        });
    });

    // ===== book CTA click =====
    document.getElementById('bookCta').addEventListener('click', () => {
        window.open('./assets/pdf/GraduationProjectBook.pdf', '_blank');
    });
})();
// ===== END SECTION 7 =====
console.log(
    '%cDeveloped by Samir Ahmed',
    'font-size:16px;font-weight:bold;'
);

/* ============================================================
   SIDE FLAG NAVIGATOR (Dynamic Indicator)
   ============================================================ */
(function () {
    // Create the flag element dynamically to keep HTML clean
    const flag = document.createElement('div');
    flag.className = 'side-flag';
    flag.innerHTML = `
        <span class="side-flag__num" id="sideFlagNum">01</span>
        <span class="side-flag__line"></span>
        <span class="side-flag__text" id="sideFlagText">الرئيسية</span>
    `;
    document.body.appendChild(flag);

    const flagNum = document.getElementById('sideFlagNum');
    const flagText = document.getElementById('sideFlagText');

    // Map sections to their titles
    const sectionsData = [
        { id: '#s1-container', name: 'الرئيسية' },
        { id: '#s2-container', name: 'عن المشروع' },
        { id: '#s3-container', name: 'التحليلات المكانية' },
        { id: '#s4-container', name: 'التصميم الهندسي' },
        { id: '#s5-container', name: 'النموذج ثلاثي الأبعاد' },
        { id: '#s6-container', name: 'النتائج' },
        { id: '#s7-container', name: 'فريق العمل والخاتمة' }
    ];

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        sectionsData.forEach((sec, index) => {
            const sectionEl = document.querySelector(sec.id);
            if (!sectionEl) return;

            // Trigger updates based on scroll position
            ScrollTrigger.create({
                trigger: sectionEl,
                start: 'top center',
                end: 'bottom center',
                onEnter: () => updateFlag(index + 1, sec.name),
                onEnterBack: () => updateFlag(index + 1, sec.name)
            });
        });

        // Delay the appearance slightly on page load
        setTimeout(() => {
            flag.classList.add('is-visible');
        }, 1000);
    }

    // Function to animate and update flag content
    function updateFlag(num, name) {
        // Format number with leading zero (01, 02, etc.)
        flagNum.textContent = num < 10 ? '0' + num : num;
        flagText.textContent = name;

        // Add a gentle GSAP bounce to the flag content
        gsap.fromTo(flag,
            { yPercent: -60, opacity: 0.5 },
            { yPercent: -50, opacity: 1, duration: 0.4, ease: "power2.out" }
        );
    }
})();



/* ============================================================
   MAGNETIC SCROLL SNAPPING (Smooth Pull Effect) — FIXED
   ============================================================ */
(function () {
    const sections = document.querySelectorAll('section[id^="s"]');
    let scrollTimeout;
    let isSnapping = false;
    let lastScrollY = window.scrollY;
    let scrollDirection = 0; // 1 = down, -1 = up
    let rafId = null;

    // Custom easing function for a cinematic "magnetic pull"
    function magneticPull(targetTop, duration) {
        const startTop = window.scrollY;
        const distance = targetTop - startTop;
        let startTime = null;

        // لو المستخدم عمل سكرول جديد لحد ما الأنيميشن لسه شغالة، نوقفها فورًا
        function userInterrupted() {
            return Math.abs(window.scrollY - startTop) > 2 && startTime === null;
        }

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);

            const ease = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            window.scrollTo(0, startTop + distance * ease);

            if (timeElapsed < duration) {
                rafId = requestAnimationFrame(animation);
            } else {
                rafId = null;
                setTimeout(() => { isSnapping = false; }, 50);
            }
        }
        rafId = requestAnimationFrame(animation);
    }

    function cancelSnap() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        isSnapping = false;
    }

    // لو المستخدم بدأ يسكرول بقوة (wheel/touch) وإحنا بنعمل pull، بطّل الجذب فورًا
    window.addEventListener('wheel', () => {
        if (isSnapping) cancelSnap();
    }, { passive: true });

    window.addEventListener('touchmove', () => {
        if (isSnapping) cancelSnap();
    }, { passive: true });

    window.addEventListener('scroll', () => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;

        // حدّث الاتجاه بس لو الحركة فعلية (تجنب نويز)
        if (Math.abs(delta) > 1 && !isSnapping) {
            scrollDirection = delta > 0 ? 1 : -1;
        }
        lastScrollY = currentY;

        if (isSnapping || document.body.classList.contains('is-section-jumping')) return;

        clearTimeout(scrollTimeout);

        scrollTimeout = setTimeout(() => {
            let closestSection = null;
            let minDistance = Infinity;

            // Trigger distance: نسبة أصغر عشان ميتفعّلش من حركة صغيرة
            const snapThreshold = window.innerHeight * 0.15;

            sections.forEach(sec => {
                const rect = sec.getBoundingClientRect();
                const top = rect.top;

                // بنفلتر بس السكاشن اللي في اتجاه حركة المستخدم
                // لو نازل (direction = 1) ناخد بس السكاشن اللي top <= threshold صغير موجب أو سالب قريب
                // لو طالع (direction = -1) نفس الفكرة بالعكس
                const distanceToTop = Math.abs(top);

                const isInDirection =
                    scrollDirection === 0 ||
                    (scrollDirection === 1 && top <= snapThreshold) ||
                    (scrollDirection === -1 && top >= -snapThreshold);

                if (isInDirection && distanceToTop < minDistance) {
                    minDistance = distanceToTop;
                    closestSection = sec;
                }
            });

            if (closestSection && minDistance > 5 && minDistance < snapThreshold) {
                isSnapping = true;

                const targetTop = closestSection.getBoundingClientRect().top + window.scrollY;

                magneticPull(targetTop, 700);
            }
        }, 150);
    }, { passive: true });
})();