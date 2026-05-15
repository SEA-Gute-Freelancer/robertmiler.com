// ============ FAN STACK LOGIC ============
let openFan = null;

function toggleFan(which) {
  const fan = document.getElementById('fan' + which);
  const dockItem = document.querySelector(`[data-dock="${which.toLowerCase()}"]`);
  if (!fan || !dockItem) return;

  const rect = dockItem.getBoundingClientRect();
  fan.style.left = (rect.left + rect.width / 2 - 20) + 'px';

  if (openFan === which) {
    closeFan();
  } else {
    closeFan();
    fan.classList.add('open');
    document.getElementById('fanOverlay').classList.add('open');
    openFan = which;
  }
}

function closeFan() {
  const fanOverlay = document.getElementById('fanOverlay');
  const fanProjekte = document.getElementById('fanProjekte');
  const fanSkills = document.getElementById('fanSkills');
  if (fanProjekte) fanProjekte.classList.remove('open');
  if (fanSkills) fanSkills.classList.remove('open');
  if (fanOverlay) fanOverlay.classList.remove('open');
  openFan = null;
}

// ============ NAVIGATION ============
function navigateTo(page) {
  closeFan();
  window.location.href = page + '.html';
}

function goHome() {
  closeFan();
  window.location.href = 'index.html';
}

// ============ SLIDE NAVIGATION (Project Pages) ============
let currentSlide = 0;

function initSlides() {
  const slides = document.querySelectorAll('.slide');
  const sidebarItems = document.querySelectorAll('.sidebar-item[data-slide]');
  if (slides.length === 0) return;

  function showSlide(index) {
    // Stop all videos on the current slide before switching
    stopAllVideos();
    slides.forEach(s => s.classList.remove('active'));
    sidebarItems.forEach(s => s.classList.remove('active'));
    slides[index].classList.add('active');
    sidebarItems[index].classList.add('active');
    currentSlide = index;
    updateArrows();
    updateCounter();
  }

  function updateArrows() {
    const prev = document.getElementById('prevSlide');
    const next = document.getElementById('nextSlide');
    if (prev) prev.classList.toggle('disabled', currentSlide === 0);
    if (next) next.classList.toggle('disabled', currentSlide === slides.length - 1);
  }

  function updateCounter() {
    const counter = document.getElementById('slideCounter');
    if (counter) counter.textContent = (currentSlide + 1) + ' / ' + slides.length;
  }

  // Sidebar click
  sidebarItems.forEach((item, i) => {
    item.addEventListener('click', () => showSlide(i));
  });

  // Arrow buttons
  const prev = document.getElementById('prevSlide');
  const next = document.getElementById('nextSlide');
  if (prev) prev.addEventListener('click', () => { if (currentSlide > 0) showSlide(currentSlide - 1); });
  if (next) next.addEventListener('click', () => { if (currentSlide < slides.length - 1) showSlide(currentSlide + 1); });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && currentSlide < slides.length - 1) showSlide(currentSlide + 1);
    if (e.key === 'ArrowLeft' && currentSlide > 0) showSlide(currentSlide - 1);
  });

  showSlide(0);
}

// ============ DRAGGABLE + RESIZABLE WINDOWS ============
let highestZ = 10;

function initDraggableWindows() {
  const windows = document.querySelectorAll('.desktop .window');
  if (windows.length === 0) return;

  windows.forEach(win => {
    let isDragging = false;
    let hasDragged = false;
    let startX, startY, origLeft, origTop;

    // Wrap contents in .window-inner for clipping
    const inner = document.createElement('div');
    inner.className = 'window-inner';
    while (win.firstChild) inner.appendChild(win.firstChild);
    win.appendChild(inner);

    // Add resize handles
    const handles = ['rh-right','rh-bottom','rh-left','rh-top','rh-br','rh-bl','rh-tr','rh-tl'];
    handles.forEach(cls => {
      const h = document.createElement('div');
      h.className = 'resize-handle ' + cls;
      win.appendChild(h);
    });

    // Bring to front on mousedown
    win.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('dot') || e.target.closest('.dot')) return;
      highestZ++;
      win.style.zIndex = highestZ;
    });

    // Start drag from titlebar only
    const titlebar = win.querySelector('.window-titlebar');
    if (!titlebar) return;

    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('dot') || e.target.closest('.dot')) return;

      isDragging = true;
      hasDragged = false;
      startX = e.clientX;
      startY = e.clientY;

      const rect = win.getBoundingClientRect();
      origLeft = rect.left;
      origTop = rect.top;

      win.style.left = origLeft + 'px';
      win.style.top = origTop + 'px';
      win.style.right = 'auto';

      win.classList.add('dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged = true;
      }

      win.style.left = (origLeft + dx) + 'px';
      win.style.top = (origTop + dy) + 'px';
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      win.classList.remove('dragging');
    });

    // Window body click -> navigate (only if not dragged)
    const body = win.querySelector('.window-body');
    if (body) {
      body.addEventListener('click', (e) => {
        if (hasDragged) { hasDragged = false; return; }
        const project = win.dataset.project;
        const page = win.dataset.page;
        const external = win.dataset.external;
        if (external) window.open(external, '_blank');
        else if (project) navigateTo(project);
        else if (page) navigateTo(page);
      });
    }

    // ---- Resize logic ----
    initResize(win);
  });
}

function initResize(win) {
  const MIN_W = 160, MIN_H = 140;

  win.querySelectorAll('.resize-handle').forEach(handle => {
    let isResizing = false;
    let startX, startY, startW, startH, startLeft, startTop;
    const cls = handle.className;

    const resizeRight  = cls.includes('rh-right')  || cls.includes('rh-br') || cls.includes('rh-tr');
    const resizeBottom = cls.includes('rh-bottom') || cls.includes('rh-br') || cls.includes('rh-bl');
    const resizeLeft   = cls.includes('rh-left')   || cls.includes('rh-bl') || cls.includes('rh-tl');
    const resizeTop    = cls.includes('rh-top')    || cls.includes('rh-tr') || cls.includes('rh-tl');

    handle.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isResizing = true;

      startX = e.clientX;
      startY = e.clientY;

      const rect = win.getBoundingClientRect();
      startW = rect.width;
      startH = rect.height;
      startLeft = rect.left;
      startTop = rect.top;

      // Ensure left/top positioning
      win.style.left = startLeft + 'px';
      win.style.top = startTop + 'px';
      win.style.right = 'auto';

      win.classList.add('dragging');

      const onMove = (e) => {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newW = startW, newH = startH, newL = startLeft, newT = startTop;

        if (resizeRight)  newW = Math.max(MIN_W, startW + dx);
        if (resizeBottom) newH = Math.max(MIN_H, startH + dy);
        if (resizeLeft) {
          const proposedW = startW - dx;
          if (proposedW >= MIN_W) { newW = proposedW; newL = startLeft + dx; }
        }
        if (resizeTop) {
          const proposedH = startH - dy;
          if (proposedH >= MIN_H) { newH = proposedH; newT = startTop + dy; }
        }

        win.style.width  = newW + 'px';
        win.style.height = newH + 'px';
        win.style.left   = newL + 'px';
        win.style.top    = newT + 'px';
      };

      const onUp = () => {
        isResizing = false;
        win.classList.remove('dragging');
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });
}

// ============ WINDOW DOTS (Close / Minimize / Open) ============
function initWindowDots() {
  const windows = document.querySelectorAll('.desktop .window');
  if (windows.length === 0) return;

  windows.forEach(win => {
    const dots = win.querySelectorAll('.dot');
    if (dots.length < 3) return;

    const dotRed = dots[0];
    const dotYellow = dots[1];
    const dotGreen = dots[2];

    // Red dot — close instantly
    dotRed.addEventListener('click', (e) => {
      e.stopPropagation();
      win.classList.add('window-closed');
    });

    // Yellow dot — minimize with genie effect to dock
    dotYellow.addEventListener('click', (e) => {
      e.stopPropagation();

      // Get fresh dock position each time
      const dock = document.querySelector('.dock');
      const dockRect = dock ? dock.getBoundingClientRect() : null;
      const winRect = win.getBoundingClientRect();

      const targetX = dockRect ? dockRect.left + dockRect.width / 2 : window.innerWidth / 2;
      const targetY = dockRect ? dockRect.top + dockRect.height / 2 : window.innerHeight;
      const winCenterX = winRect.left + winRect.width / 2;
      const winCenterY = winRect.top + winRect.height / 2;
      const dx = targetX - winCenterX;
      const dy = targetY - winCenterY;

      // Inject dynamic keyframe for this specific window
      const animName = 'minimize_' + Date.now();
      const style = document.createElement('style');
      style.textContent = `
        @keyframes ${animName} {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(${dx}px, ${dy}px) scale(0.03); opacity: 0; }
        }
      `;
      document.head.appendChild(style);

      // Apply animation
      win.style.animation = `${animName} 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
      win.style.pointerEvents = 'none';

      // After animation, mark as minimized
      setTimeout(() => {
        win.classList.add('window-minimized');
        win.style.animation = '';
        style.remove();
      }, 520);
    });

    // Green dot — open project
    dotGreen.addEventListener('click', (e) => {
      e.stopPropagation();
      const project = win.dataset.project;
      const page = win.dataset.page;
      const external = win.dataset.external;
      if (external) window.open(external, '_blank');
      else if (project) navigateTo(project);
      else if (page) navigateTo(page);
    });
  });
}

// ============ SPOTIFY MINI PLAYER ============
let spotifyOpen = false;

function toggleSpotify() {
  const player = document.getElementById('spotifyMini');
  if (!player) return;

  spotifyOpen = !spotifyOpen;
  player.classList.toggle('open', spotifyOpen);

  // Toggle active state on dock icon
  const dockItem = document.querySelector('[data-dock="spotify"]');
  if (dockItem) dockItem.classList.toggle('active', spotifyOpen);
}

// ============ RANDOM BACKGROUND ============
function initRandomBackground() {
  const backgrounds = [
    '0FEFF30E-DDE1-42AF-B6C2-C1A78EFA8089.jpg',
    '21144700-17c5-42cb-ab01-6d92b3876343.jpg',
    '765D8499-A463-414E-827E-E31593A67235.jpg',
    'AC1F4A53-C9DD-4F9A-B35C-2FF69F9EFA0A.jpg',
    'IMG_0554.jpeg',
    'IMG_0587.JPG',
    'IMG_0673.jpeg',
    'IMG_0786.jpeg',
    'IMG_0879.jpeg',
    'IMG_1003.jpeg',
    'IMG_1038.jpeg',
    'IMG_1058.jpeg',
    'IMG_1063.jpeg',
    'IMG_1090.jpeg',
    'IMG_1152.jpeg',
    'IMG_1198.jpeg',
    'IMG_1201.jpeg',
    'IMG_1217.jpeg',
    'IMG_1291.jpeg',
    'IMG_1302.jpeg',
    'IMG_1432.jpeg',
    'IMG_1442.jpeg',
    'IMG_1776.jpeg',
    'IMG_2148.jpeg',
    'IMG_2344.jpeg',
    'IMG_2405.jpeg',
    'IMG_2807.jpeg',
    'IMG_2899.jpeg',
    'IMG_3468.jpeg',
    'IMG_3536.jpeg',
    'IMG_3538.PNG',
    'IMG_3622.jpeg',
    'IMG_3623.jpeg',
    'IMG_3936.jpeg',
    'IMG_3946.jpeg',
    'IMG_3971.jpeg',
    'IMG_4045.jpeg',
    'IMG_4076.jpeg',
    'IMG_4123.JPG',
    'IMG_5894.jpeg',
    'a7bd2838-735c-4db0-a866-e6a15e764730.jpg',
    'camphoto_1804928587.jpg',
    'camphoto_1932422408.jpg',
    'camphoto_342241519.jpg',
    'f86505c7-3665-4e9d-b7c1-558588f2c79a.jpg'
  ];

  // Use sessionStorage so the same background persists across page navigations
  let chosen = sessionStorage.getItem('bg');
  if (!chosen || !backgrounds.includes(chosen)) {
    chosen = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    sessionStorage.setItem('bg', chosen);
  }

  // Apply background to .desktop, .project-page, or .content-page
  const target = document.querySelector('.desktop') || document.querySelector('.project-page') || document.querySelector('.content-page');
  if (target) {
    target.style.backgroundImage = 'url(public/backgrounds/' + chosen + ')';
  }
}

// ============ VIDEO PLAYER MANAGEMENT ============

// Stop all videos on the page (pause + reset to beginning)
function stopAllVideos() {
  document.querySelectorAll('video').forEach(v => {
    v.pause();
    v.currentTime = 0;
  });
}

// Initialize video players — stop on navigation
function initVideoPlayers() {
  // Stop all videos when navigating away
  document.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', stopAllVideos);
  });
  document.querySelectorAll('.dock-item').forEach(item => {
    item.addEventListener('click', stopAllVideos);
  });
  document.querySelectorAll('.fan-item').forEach(item => {
    item.addEventListener('click', stopAllVideos);
  });
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  // Fan overlay close
  const fanOverlay = document.getElementById('fanOverlay');
  if (fanOverlay) fanOverlay.addEventListener('click', closeFan);

  // Fan item clicks
  document.querySelectorAll('.fan-item[data-project]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.project));
  });
  document.querySelectorAll('.fan-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFan();
      goHome();
    }
  });

  // Init draggable windows (desktop only)
  initDraggableWindows();

  // Init window dot actions (desktop only)
  initWindowDots();

  // Init slides if on a project page
  initSlides();

  // Random background image
  initRandomBackground();

  // Init video players with play overlays
  initVideoPlayers();
});
