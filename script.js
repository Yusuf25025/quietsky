(() => {
  // === Starfield setup ===
  const canvas = document.getElementById('sky-canvas');
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let panX = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let startPan = 0;
  let hasMoved = false;
  let dragIntent = 'undetermined';
  let isHoveringBirthStar = false;
  const stars = [];
  const constellationLines = [];

  // Special birth star configuration (click opens external link)
  // Update x/y to reposition and adjust the info text as desired.
  const birthStar = {
    name: 'December 7, 2008 — Birthday Star',
    link: 'https://mybirthdaystar.pages.dev',
    x: 620,
    yRatio: 0.35, // relative vertical position; recalculated on resize
  };

  // Playlist data (edit title, artist, releaseDate, and audioSrc paths here)
  const songs = [
    {
      title: "I'll Be Lovin' U Long Time",
      artist: 'Mariah Carey',
      year: 2008,
      releaseDate: '2008-07-01',
      audioSrc: 'audio/ill_be_lovin_u_long_time.mp3',
    },
    {
      title: 'Love Lockdown',
      artist: 'Kanye West',
      year: 2008,
      releaseDate: '2008-09-18',
      audioSrc: 'audio/love_lockdown.mp3',
    },
    {
      title: 'One Of The Boys',
      artist: 'Katy Perry',
      year: 2008,
      releaseDate: '2008-06-17',
      audioSrc: 'audio/one_of_the_boys.mp3',
    },
    {
      title: 'Viva La Vida',
      artist: 'Coldplay',
      year: 2008,
      releaseDate: '2008-05-25',
      audioSrc: 'audio/viva_la_vida.mp3',
    },
    {
      title: 'Electric Feel',
      artist: 'MGMT',
      year: 2008,
      releaseDate: '2008-06-23',
      audioSrc: 'audio/electric_feel.mp3',
    },
    {
      title: 'You Found Me',
      artist: 'The Fray',
      year: 2008,
      releaseDate: '2008-11-21',
      audioSrc: 'audio/you_found_me.mp3',
    },
    {
      title: 'Only You',
      artist: 'Joshua Radin',
      year: 2008,
      releaseDate: '2008-01-01',
      audioSrc: 'audio/only_you.mp3',
    },
    {
      title: 'Untouched',
      artist: 'The Veronicas',
      year: 2008,
      releaseDate: '2008-12-06',
      audioSrc: 'audio/untouched.mp3',
    },
  ];

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  function renderPlaylist() {
    const list = document.getElementById('song-list');
    list.innerHTML = '';

    songs.forEach((song) => {
      const card = document.createElement('article');
      card.className = 'song-card';

      const icon = document.createElement('div');
      icon.className = 'song-icon';
      icon.textContent = '✧';

      const meta = document.createElement('div');
      meta.className = 'song-meta';

      const titleEl = document.createElement('h3');
      titleEl.className = 'song-title';
      titleEl.textContent = song.title;

      const artistEl = document.createElement('p');
      artistEl.className = 'song-artist';
      artistEl.textContent = song.artist;

      const dateEl = document.createElement('p');
      dateEl.className = 'song-year';
      dateEl.textContent = `${song.year} · ${formatDate(song.releaseDate)}`;

      meta.appendChild(titleEl);
      meta.appendChild(artistEl);
      meta.appendChild(dateEl);

      const audioWrapper = document.createElement('div');
      audioWrapper.className = 'audio-player';
      const audio = document.createElement('audio');
      audio.controls = true;
      audio.preload = 'none';
      audio.src = song.audioSrc;
      audioWrapper.appendChild(audio);

      card.appendChild(icon);
      card.appendChild(meta);
      card.appendChild(audioWrapper);
      list.appendChild(card);
    });
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    // Reposition the birth star vertically based on the viewport height.
    birthStar.y = height * birthStar.yRatio;
  }

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function generateStars() {
    const baseCount = width < 520 ? 170 : 250;
    stars.length = 0;
    constellationLines.length = 0;

    const panoramaWidth = width * 3;
    for (let i = 0; i < baseCount; i += 1) {
      const x = Math.random() * panoramaWidth;
      const y = Math.random() * height;
      stars.push({ x, y, r: Math.random() * 1.2 + 0.4, opacity: randomBetween(0.35, 0.9) });
    }

    for (let i = 0; i < stars.length; i += 12) {
      const lineSet = [];
      for (let j = 0; j < 4; j += 1) {
        const starIndex = i + j;
        if (stars[starIndex]) {
          lineSet.push(stars[starIndex]);
        }
      }
      if (lineSet.length > 2) {
        constellationLines.push(lineSet);
      }
    }

    birthStar.x = Math.min(Math.max(birthStar.x, 80), panoramaWidth - 80);
    birthStar.y = Math.min(Math.max(birthStar.y, 80), height - 80);
  }

  function drawStars() {
    ctx.clearRect(0, 0, width, height);
    const panoramaWidth = width * 3;
    const offsets = [-panoramaWidth, 0, panoramaWidth];

    offsets.forEach((offset) => {
      ctx.save();
      ctx.translate(-panX + offset, 0);

      ctx.strokeStyle = 'rgba(200, 220, 255, 0.16)';
      ctx.lineWidth = 0.6;
      constellationLines.forEach((set) => {
        ctx.beginPath();
        ctx.moveTo(set[0].x, set[0].y);
        for (let i = 1; i < set.length; i += 1) {
          ctx.lineTo(set[i].x, set[i].y);
        }
        ctx.stroke();
      });

      stars.forEach((star) => {
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 4);
        gradient.addColorStop(0, 'rgba(223, 231, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(223, 231, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(223, 231, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Birth star glow and halo (slightly stronger when hovered)
      const hoverScale = isHoveringBirthStar ? 1.1 : 1;
      const g = ctx.createRadialGradient(
        birthStar.x,
        birthStar.y,
        0,
        birthStar.x,
        birthStar.y,
        28 * hoverScale,
      );
      g.addColorStop(0, 'rgba(143, 212, 255, 0.45)');
      g.addColorStop(1, 'rgba(143, 212, 255, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(birthStar.x, birthStar.y, 24 * hoverScale, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(143, 212, 255, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(birthStar.x, birthStar.y, 15 * hoverScale, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(223, 240, 255, 0.95)';
      ctx.beginPath();
      ctx.arc(birthStar.x, birthStar.y, 3.8 * hoverScale, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    requestAnimationFrame(drawStars);
  }

  function getPanoramaWidth() {
    return width * 3;
  }

  // Pointer handling for desktop + mobile: we only lock into a horizontal drag once
  // horizontal movement wins over vertical, so quick vertical swipes still scroll the page.
  function handlePointerDown(event) {
    // Record both axes so we can decide later if the user meant to scroll vertically.
    isDragging = true;
    hasMoved = false;
    dragIntent = 'undetermined';
    startX = event.clientX;
    startY = event.clientY;
    startPan = panX;
  }

  function updateHoverState(clientX, clientY) {
    const panoramaWidth = getPanoramaWidth();
    const normalizedPan = ((panX % panoramaWidth) + panoramaWidth) % panoramaWidth;
    const realX = clientX + normalizedPan;
    const wrappedX = ((realX % panoramaWidth) + panoramaWidth) % panoramaWidth;
    const realY = clientY;
    const dx = wrappedX - birthStar.x;
    const dy = realY - birthStar.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const withinHalo = distance < 26;
    isHoveringBirthStar = withinHalo;
    canvas.style.cursor = withinHalo ? 'pointer' : 'default';
  }

  function handlePointerMove(event) {
    // Check hover feedback even when not dragging
    updateHoverState(event.clientX, event.clientY);

    if (!isDragging) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;

    if (dragIntent === 'undetermined') {
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      if (absX > 8 && absX > absY + 2) {
        dragIntent = 'horizontal';
        if (canvas.setPointerCapture && event.pointerId != null) {
          canvas.setPointerCapture(event.pointerId);
        }
      } else if (absY > 10 && absY > absX) {
        dragIntent = 'vertical';
        isDragging = false;
        return;
      }
    }

    if (dragIntent !== 'horizontal') return;

    if (Math.abs(dx) > 4) hasMoved = true;
    const panoramaWidth = getPanoramaWidth();
    panX = (startPan - dx) % panoramaWidth;
    event.preventDefault();
  }

  function handlePointerUp(event) {
    if (dragIntent === 'horizontal' && canvas.releasePointerCapture && event.pointerId != null) {
      canvas.releasePointerCapture(event.pointerId);
    }

    if (!isDragging && dragIntent !== 'horizontal') return;

    isDragging = false;

    // Tap detection only if the user wasn't intentionally scrolling vertically
    const tapX = event.clientX;
    const tapY = event.clientY;
    const panoramaWidth = getPanoramaWidth();
    const normalizedPan = ((panX % panoramaWidth) + panoramaWidth) % panoramaWidth;
    const realX = tapX + normalizedPan;
    const wrappedX = ((realX % panoramaWidth) + panoramaWidth) % panoramaWidth;
    const realY = tapY;

    const dx = wrappedX - birthStar.x;
    const dy = realY - birthStar.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!hasMoved && distance < 26 && dragIntent !== 'vertical') {
      // The highlighted birthday star opens her page in a new tab.
      window.open(birthStar.link, '_blank');
    }
  }

  function handlePointerLeave() {
    isDragging = false;
    dragIntent = 'undetermined';
    isHoveringBirthStar = false;
    canvas.style.cursor = 'default';
  }

  function registerEvents() {
    // Drag/swipe handling unified with pointer events to keep mobile browsers happy
    // (avoids older optional-chaining touch code that could fail to parse on Android).
    canvas.addEventListener('pointerdown', handlePointerDown, { passive: true });
    canvas.addEventListener('pointermove', handlePointerMove, { passive: false });
    canvas.addEventListener('pointerup', handlePointerUp, { passive: true });
    canvas.addEventListener('pointercancel', handlePointerUp, { passive: true });
    canvas.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    window.addEventListener('resize', () => {
      resize();
      generateStars();
    });
  }

  // Initialize
  resize();
  generateStars();
  renderPlaylist();
  drawStars();
  registerEvents();
})();
