const API = localStorage.getItem('buea-api') || 'http://localhost:4100';
const app = document.querySelector('#app');
import { isGameAudioMuted, playGameSound, setStoryTheme, toggleGameAudio } from './game-audio.js';
let worldScene = null;

async function mountWorldScene() {
  const container = document.querySelector('.district-map');
  if (!container) return;
  if (worldScene) {
    worldScene.attach(container);
    worldScene.setLevel(state.story.progress.level);
    worldScene.movePlayer(state.player.position.x, state.player.position.y);
    return;
  }
  try {
    const sceneModule = await import('./world3d.js');
    if (container.isConnected) {
      worldScene = sceneModule.mountWorldScene(container, state.world.locations, state.player.position, { level: state.story.progress.level });
    }
  } catch (error) {
    container.classList.add('scene-fallback');
    console.warn('3D scene unavailable; using the map fallback.', error);
  }
}

const state = {
  token: localStorage.getItem('buea-token') || '',
  player: null,
  world: null,
  mode: 'login',
  name: '',
  email: '',
  background: 'student',
  story: null,
  difficulty: 'standard',
  activeLocationId: null,
  milestone: null,
  leaderboard: null,
  activeStoryIndex: 0
};

function api(path, options = {}) {
  const headers = {
    'content-type': 'application/json',
    ...(state.token ? { authorization: `Bearer ${state.token}` } : {}),
    ...(options.headers || {})
  };
  return fetch(`${API}${path}`, { ...options, headers })
    .then(async (response) => {
      const isJson = (response.headers.get('content-type') || '').includes('application/json');
      const payload = isJson ? await response.json() : {};
      if (!response.ok) {
        throw new Error(payload.error || 'Request failed');
      }
      return payload;
    });
}

function saveToken(token, player) {
  state.token = token;
  state.player = player;
  localStorage.setItem('buea-token', token);
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  const area = document.querySelector('.world-stage');
  if (area) area.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

async function loadStory() {
  state.story = await api('/api/player/story');
  if (state.story.progress?.difficulty) state.difficulty = state.story.progress.difficulty;
  if (state.player?.background) state.background = state.player.background;
}

async function selectStory(storyId) {
  try {
    const response = await api('/api/player/story/select', { method: 'POST', body: JSON.stringify({ storyId, difficulty: state.difficulty, background: state.background }) });
    state.player = response.player;
    state.story = response.story;
    state.activeLocationId = null;
    setStoryTheme(storyId);
    renderGame();
    playGameSound('chapter');
  } catch (error) {
    showToast(error.message);
  }
}

async function performStoryActivity(activityId) {
  try {
    const response = await api('/api/player/activity', { method: 'POST', body: JSON.stringify({ activityId }) });
    state.player = response.player;
    state.story = response.story;
    worldScene?.activityPulse();
    state.milestone = response.event.levelCompleted ? response.event : null;
    if (response.event.storyCompleted || response.event.chapterCompleted) playGameSound('chapter');
    else if (response.event.levelCompleted) playGameSound('complete');
    else playGameSound(response.event.kind || 'tap');
    state.activeLocationId = null;
    renderGame();
    if (response.event.levelCompleted) {
      if (!state.milestone) showToast('Level complete.');
    } else if (response.event.taskCompleted) {
      showToast('Story task complete. Keep going.');
    } else {
      showToast('Activity complete. +2 points.');
    }
  } catch (error) {
    playGameSound('error');
    showToast(error.message);
  }
}

function renderStorySelect() {
  setStoryTheme(null);
  app.innerHTML = `
    <main class="story-select-screen">
      <header class="story-select-heading"><span class="eyebrow">Your Buea, your pace</span><h1>Choose the life you want to build.</h1><p>Each journey has 40 chapters of ordinary choices, local places and people who remember how you showed up.</p></header>
      <section class="setup-controls" aria-label="Game setup">
        <label>Challenge<select id="difficulty-choice"><option value="easy" ${state.difficulty === 'easy' ? 'selected' : ''}>Easy · one task each level</option><option value="standard" ${state.difficulty === 'standard' ? 'selected' : ''}>Standard · balanced journey</option><option value="hard" ${state.difficulty === 'hard' ? 'selected' : ''}>Hard · extra objectives</option></select></label>
        <label>Your path<select id="background-choice"><option value="student" ${state.background === 'student' ? 'selected' : ''}>Student</option><option value="professional" ${state.background === 'professional' ? 'selected' : ''}>Young professional</option><option value="hustler" ${state.background === 'hustler' ? 'selected' : ''}>Hustler</option><option value="entrepreneur" ${state.background === 'entrepreneur' ? 'selected' : ''}>Entrepreneur</option></select></label>
      </section>
      <div class="story-carousel" id="story-carousel">${(state.story?.catalog || []).map((story, index) => `
        <article class="story-choice story-choice-${index + 1}">
          <span class="story-number">0${index + 1} / 40 LEVELS</span>
          <div class="story-preview" aria-hidden="true"><span class="preview-mountain"></span><span class="preview-house preview-house-one"></span><span class="preview-house preview-house-two"></span><span class="preview-path"></span><span class="preview-person"></span></div>
          <h2>${story.title}</h2><p class="story-subtitle">${story.subtitle}</p>
          <p>${story.description}</p>
          <div class="story-tone">${story.protagonist} <span>${story.tone}</span></div>
          <button class="primary-button" data-story="${story.id}">Begin this story</button>
        </article>`).join('')}
      </div>
      <nav class="story-carousel-nav" aria-label="Choose a story"><button class="icon-button" id="story-previous" aria-label="Previous story">${icon('prev')}</button><span id="story-count">01 / 03</span><button class="icon-button" id="story-next" aria-label="Next story">${icon('next')}</button></nav>
      <button class="audio-toggle" id="audio-toggle" aria-label="${isGameAudioMuted() ? 'Turn sound on' : 'Mute sound'}" title="${isGameAudioMuted() ? 'Turn sound on' : 'Mute sound'}">${audioIcon(isGameAudioMuted())}</button>
    </main>`;
  document.querySelectorAll('[data-story]').forEach((button) => button.addEventListener('click', () => selectStory(button.dataset.story)));
  const storyCarousel = document.querySelector('#story-carousel');
  const storyCards = [...document.querySelectorAll('.story-choice')];
  const updateStoryIndex = () => {
    const index = Math.max(0, storyCards.findIndex((card) => card.getBoundingClientRect().left >= storyCarousel.getBoundingClientRect().left - 20));
    state.activeStoryIndex = index;
    document.querySelector('#story-count').textContent = `${String(index + 1).padStart(2, '0')} / ${String(storyCards.length).padStart(2, '0')}`;
  };
  const scrollToStory = (index) => {
    const card = storyCards[Math.max(0, Math.min(storyCards.length - 1, index))];
    const cardRect = card.getBoundingClientRect();
    const carouselRect = storyCarousel.getBoundingClientRect();
    storyCarousel.scrollTo({ left: storyCarousel.scrollLeft + cardRect.left - carouselRect.left, behavior: 'smooth' });
  };
  storyCarousel?.addEventListener('scroll', updateStoryIndex, { passive: true });
  document.querySelector('#story-previous')?.addEventListener('click', () => scrollToStory(state.activeStoryIndex - 1));
  document.querySelector('#story-next')?.addEventListener('click', () => scrollToStory(state.activeStoryIndex + 1));
  updateStoryIndex();
  document.querySelector('#difficulty-choice')?.addEventListener('change', (event) => { state.difficulty = event.target.value; });
  document.querySelector('#background-choice')?.addEventListener('change', (event) => { state.background = event.target.value; });
  document.querySelector('#audio-toggle')?.addEventListener('click', (event) => {
    const muted = toggleGameAudio();
    event.currentTarget.innerHTML = audioIcon(muted);
    event.currentTarget.setAttribute('aria-label', muted ? 'Turn sound on' : 'Mute sound');
  });
}

function icon(name) {
  const paths = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
    moon: '<path d="M20.9 13A8.9 8.9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>',
    sound: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7m3-10a9 9 0 0 1 0 13"/>',
    mute: '<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m17 9 5 6m0-6-5 6"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2m10 8h-2"/>',
    save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
    exit: '<path d="M10 17l5-5-5-5m5 5H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/>',
    rank: '<path d="M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0V4Z"/><path d="M7 7H4v2a4 4 0 0 0 4 4m9-6h3v2a4 4 0 0 1-4 4"/>',
    zoomIn: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4m-5-8v6m-3-3h6"/>',
    zoomOut: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4m-5-5h6"/>',
    next: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    prev: '<path d="M19 12H5m6 6-6-6 6-6"/>'
  };
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.target}</svg>`;
}

function audioIcon(muted) {
  return icon(muted ? 'mute' : 'sound');
}

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US').format(value || 0);
}

function setMode(mode) {
  state.mode = mode;
  renderAuth();
}

function renderAuth() {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card">
        <div class="brand-mark">
          <div class="brand-badge">B</div>
          <div>
            <div class="eyebrow">Open world life sim</div>
            <h1>Buea Life</h1>
          </div>
        </div>

        <div class="auth-toggle">
          <button class="toggle ${state.mode === 'login' ? 'selected' : ''}" data-mode="login">Login</button>
          <button class="toggle ${state.mode === 'register' ? 'selected' : ''}" data-mode="register">Create account</button>
        </div>

        ${state.mode === 'register' ? `<div class="field-group"><label>Name</label><input id="name" value="${state.name}" placeholder="Your player name" autocomplete="name" /></div>` : ''}

        <div class="field-group">
          <label>Email</label>
          <input id="email" type="email" value="${state.email}" placeholder="you@example.com" autocomplete="email" />
        </div>

        <button class="primary-button auth-submit" id="auth-submit">${state.mode === 'login' ? 'Enter Buea' : 'Create account'}</button>
        <p class="small-copy">Earn points while you play and cash them out to FCFA within the game economy.</p>
      </div>
    </div>
  `;

  document.querySelectorAll('[data-mode]').forEach((button) => {
    button.addEventListener('click', () => setMode(button.dataset.mode));
  });

  document.querySelector('#auth-submit').addEventListener('click', async () => {
    state.name = document.querySelector('#name')?.value.trim() || '';
    state.email = document.querySelector('#email').value.trim();

    try {
      const endpoint = state.mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const payload = state.mode === 'login'
        ? { email: state.email }
        : { name: state.name, email: state.email };

      const response = await api(endpoint, { method: 'POST', body: JSON.stringify(payload) });
      saveToken(response.token, response.player);
      state.background = response.player.background || 'student';
      state.world = await api('/api/world');
      await loadStory();
      renderGame();
    } catch (error) {
      showToast(error.message);
    }
  });
}

async function loadGame() {
  try {
    state.world = await api('/api/world');
    state.player = await api('/api/player');
    await loadStory();
    if (state.story.story) setStoryTheme(state.story.story.id);
    renderGame();
  } catch (error) {
    state.token = '';
    localStorage.removeItem('buea-token');
    renderAuth();
  }
}

function findNearbyLocation() {
  if (!state.world || !state.player) return null;
  const player = state.player;
  let nearest = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const location of state.world.locations) {
    const distance = Math.hypot(player.position.x - location.x, player.position.y - location.y);
    if (distance < 14 && distance < bestDistance) {
      nearest = location;
      bestDistance = distance;
    }
  }

  return nearest;
}

async function performAction(action, payload = {}) {
  try {
    state.player = await api('/api/player/interact', {
      method: 'POST',
      body: JSON.stringify({ action, ...payload })
    });
    renderGame();
    showToast(`${action[0].toUpperCase()}${action.slice(1)} complete.`);
  } catch (error) {
    showToast(error.message);
  }
}

async function convertPoints(points) {
  try {
    const response = await api('/api/player/convert-points', {
      method: 'POST',
      body: JSON.stringify({ points })
    });
    state.player = response.player;
    renderGame();
    showToast(`Converted ${points} points to FCFA.`);
  } catch (error) {
    showToast(error.message);
  }
}

function renderGame() {
  if (!state.world || !state.player) {
    renderAuth();
    return;
  }

  if (!state.story) {
    renderAuth();
    return;
  }
  if (!state.story.story) {
    renderStorySelect();
    return;
  }

  const currentMission = state.story.mission;
  const currentTask = currentMission?.tasks[state.story.taskIndex];
  const chapterNumber = Math.floor(((state.story.progress?.level || 1) - 1) / 5) + 1;
  const chapterLevels = Array.from({ length: 40 }, (_, index) => index + 1);
  const activeLocation = state.world.locations.find((location) => location.id === state.activeLocationId);
  const locationActivities = state.story.activities?.[state.activeLocationId] || [];
  const isDay = !/night|evening/i.test(state.world.cycle.phase);
  const milestone = state.milestone || (state.story.progress.pendingNext ? { chapterCompleted: currentMission?.chapterFinale, storyCompleted: false, reward: currentMission?.rewards } : null);

  const objectives = state.player.questLog.map((quest) => `
    <div class="objective-row ${quest.done ? 'done' : ''}">
      <span class="checkmark">${quest.done ? '✓' : '○'}</span>
      <span>${quest.label}</span>
    </div>
  `).join('');

  const target = findNearbyLocation();

  app.innerHTML = `
    <div class="game-shell world-shell">
      <aside class="left-panel info-panel">
        <div class="brand-mark compact">
          <div class="brand-badge">B</div>
          <div>
            <div class="eyebrow">Buea</div>
            <h1>${state.player.name}</h1>
          </div>
        </div>

        <section class="campaign-summary">
          <div class="campaign-kicker">${state.story.story.protagonist || state.story.story.tone}</div>
          <h2>${state.story.story.title}</h2>
          <p>${state.story.story.opening || currentMission?.chapterSummary || 'You have finished this story. Choose another journey to keep exploring.'}</p>
          <div class="campaign-progress">${state.story.progress.completedLevels} / 40 levels <span>${state.story.progress.difficulty || 'standard'}</span></div>
          <div class="player-honours"><span>${state.player.title || 'New Arrival'}</span><span>🔥 ${state.player.streak || 0} day streak</span></div>
          <button class="text-button" id="change-story">Choose another story</button>
        </section>

        <section class="chapter-levels" aria-label="Story levels">
          <div class="section-label">Chapter ${chapterNumber} · ${currentMission?.chapter || 'Story complete'}</div>
          <div class="level-rail" id="level-rail">${chapterLevels.map((level) => {
            const complete = level <= state.story.progress.completedLevels;
            const current = level === state.story.progress.level && !state.story.progress.finished;
            return `<div class="level-step ${complete ? 'completed' : ''} ${current ? 'current' : 'locked'}"><span>${complete ? '✓' : String(level).padStart(2, '0')}</span></div>`;
          }).join('')}</div>
          <div class="difficulty-line"><span>${currentMission?.difficulty || 'Journey complete'}</span><span>${currentMission?.tasks.length || 0} tasks · +${currentMission?.rewards.points || 0} pts</span></div>
        </section>

        <div class="stat-strip">
          <div class="stat-box">
            <div class="metric-label">FCFA</div>
            <div class="metric-value">${formatCurrency(state.player.balance)}</div>
          </div>
          <div class="stat-box">
            <div class="metric-label">Points</div>
            <div class="metric-value">${state.player.points}</div>
          </div>
        </div>

        <div class="needs-grid">
          <div class="need-pill"><span>Health</span><strong>${state.player.health}%</strong></div>
          <div class="need-pill"><span>Energy</span><strong>${state.player.energy}%</strong></div>
          <div class="need-pill"><span>Mood</span><strong>${state.player.mood}%</strong></div>
          <div class="need-pill"><span>Hunger</span><strong>${state.player.hunger}%</strong></div>
        </div>

        <section class="panel-block small-block">
          <div class="section-label">Objectives</div>
          <div class="objective-list">${objectives}</div>
        </section>

        <section class="panel-block small-block">
          <div class="section-label">Progress</div>
          <div class="status-card">
            <div>Level: ${state.player.level}</div>
            <div>Home: ${state.player.home || 'No home yet'}</div>
            <div>School: ${state.player.education || 'No education path yet'}</div>
            <div>Job: ${state.player.currentJob || 'No job yet'}</div>
            <div>Points to cash: ${state.player.points}</div>
          </div>
        </section>

        <button class="primary-button" id="convert-points">Convert 5 points to FCFA</button>
      </aside>

      <main class="world-stage">
        <div class="hud-top">
          <div class="hud-pill">${state.world.weather.condition} | ${state.world.weather.temperature}°C</div>
          <div class="hud-pill phase-pill">${icon(isDay ? 'sun' : 'moon')}<span>${state.world.cycle.phase}</span></div>
          <div class="honours-pill" title="${state.player.title || 'New Arrival'} · ${state.player.streak || 0} day streak">${icon('rank')}<span>${state.player.title || 'New Arrival'}</span><b>🔥 ${state.player.streak || 0}</b></div>
          <button class="icon-button audio-toggle-game" id="audio-toggle" aria-label="${isGameAudioMuted() ? 'Turn sound on' : 'Mute sound'}" title="${isGameAudioMuted() ? 'Turn sound on' : 'Mute sound'}">${audioIcon(isGameAudioMuted())}</button>
        </div>

        ${currentMission ? `<section class="mission-banner"><div class="mission-level">LEVEL ${String(currentMission.level).padStart(2, '0')} <span>${state.story.progress.difficulty || 'standard'} · ${currentMission.difficulty}</span></div><h2>${currentMission.title}</h2><p>${currentTask ? `${currentTask.title} · ${state.world.locations.find((location) => location.id === currentTask.locationId)?.name}` : state.story.progress.pendingNext ? 'Level complete. Ready when you are.' : 'Choose a district to begin.'}</p></section>` : '<section class="mission-banner story-finale"><div class="mission-level">40 LEVELS COMPLETE</div><h2>You made Buea yours.</h2><p>Pick another story to see the city from a different life.</p></section>'}

        <div class="district-map">
          <div class="mountain-backdrop"></div>
          <div class="road road-one"></div>
          <div class="road road-two"></div>
          <div class="road road-three"></div>

          ${state.world.locations.map((location) => {
            const taskHere = currentTask?.locationId === location.id;
            return `
            <button class="location-marker ${taskHere ? 'story-destination' : ''}" data-location="${location.id}" style="left:${location.x}%; top:${location.y}%">
              <span class="marker-icon">${location.type}</span>
              <span class="marker-name">${location.name}${taskHere ? ' · TASK' : ''}</span>
            </button>
          `;}).join('')}

          <div class="player-figure" style="left:${state.player.position.x}%; top:${state.player.position.y}%">
            <div class="player-inner" style="--skin:#b66f3b; --outfit:#1e6b57;"></div>
          </div>
        </div>

        ${activeLocation ? `<section class="activity-sheet"><div class="activity-sheet-heading"><div><span class="section-label">YOU ARE HERE</span><h2>${activeLocation.name}</h2></div><button class="sheet-close" id="close-activities" aria-label="Close activities">×</button></div><p class="location-description">${activeLocation.description}</p><div class="activity-options">${locationActivities.map((activity) => {
          const isCurrent = currentTask?.activityId === activity.id && currentTask.locationId === activeLocation.id;
          return `<button class="activity-option ${isCurrent ? 'story-task-option' : ''}" data-activity="${activity.id}"><span><strong>${activity.title}</strong><small>${activity.detail}</small></span><span class="activity-reward">${isCurrent ? 'STORY TASK' : '+2 pts'}</span></button>`;
        }).join('')}</div></section>` : ''}

        ${state.leaderboard ? `<section class="leaderboard-sheet"><div class="activity-sheet-heading"><div><span class="section-label">BUEA COMMUNITY</span><h2>Neighbourhood board</h2></div><button class="sheet-close" id="close-leaderboard" aria-label="Close leaderboard">×</button></div><div class="leaderboard-list">${state.leaderboard.map((entry) => `<div class="leaderboard-row"><span class="rank-number">${String(entry.rank).padStart(2, '0')}</span><span><strong>${entry.name}</strong><small>${entry.title} · ${entry.streak} day streak</small></span><b>${entry.completedLevels} LVL</b></div>`).join('') || '<p class="location-description">Be the first to earn a place here.</p>'}</div></section>` : ''}

        ${milestone ? `<div class="milestone-overlay"><div class="milestone-card"><div class="wax-seal"><span>✦</span></div><span class="milestone-eyebrow">${milestone.storyCompleted ? 'THE STORY IS YOURS' : milestone.chapterCompleted ? 'CHAPTER COMPLETE' : 'LEVEL COMPLETE'}</span><h2>${milestone.storyCompleted ? 'Buea remembers.' : currentMission?.title || 'A new chapter opens.'}</h2><p>${milestone.storyCompleted ? 'You made this place your own. Your next story is waiting.' : `You earned ${milestone.reward?.points || currentMission?.rewards.points || 0} points and ${milestone.reward?.xp || currentMission?.rewards.xp || 0} XP.`}</p><div class="milestone-reward">${icon('rank')} <span>${state.player.title || 'New Arrival'} · ${state.player.streak || 0} day streak</span></div><button class="primary-button milestone-continue" id="milestone-continue">${milestone.storyCompleted ? 'Choose another story' : 'Continue to next level'} ${icon('next')}</button></div></div>` : ''}

        <div class="interaction-bar">
          <button class="dock-action task-jump" id="task-jump" aria-label="${currentTask ? `Go to ${currentTask.title}` : 'No next task'}" title="${currentTask ? `${currentTask.title} at ${state.world.locations.find((location) => location.id === currentTask.locationId)?.name}` : 'No next task'}" ${!currentTask ? 'disabled' : ''}>${icon('target')}<span>Task</span></button>
          <button class="dock-action" id="leaderboard-btn" aria-label="Leaderboard" title="Leaderboard">${icon('rank')}<span>Rank</span></button>
          <button class="dock-action" id="save-btn" aria-label="Save progress" title="Save progress">${icon('save')}<span>Save</span></button>
          <button class="dock-action" id="logout-btn" aria-label="Log out" title="Log out">${icon('exit')}<span>Exit</span></button>
        </div>
        <div class="map-tools"><button class="icon-button" id="zoom-in" aria-label="Zoom in" title="Zoom in">${icon('zoomIn')}</button><button class="icon-button" id="zoom-out" aria-label="Zoom out" title="Zoom out">${icon('zoomOut')}</button></div>
      </main>
    </div>
  `;

  mountWorldScene();
  document.querySelector('.level-step.current')?.scrollIntoView({ block: 'nearest', inline: 'center' });

  document.querySelectorAll('.location-marker').forEach((button) => {
    button.addEventListener('click', async () => {
      const location = state.world.locations.find((entry) => entry.id === button.dataset.location);
      if (!location) return;
      worldScene?.focusLocation(location.x, location.y);
      worldScene?.movePlayer(location.x, location.y);
      playGameSound('travel');
      try {
        state.player = await api('/api/player/move', {
          method: 'POST',
          body: JSON.stringify({ x: location.x, y: location.y })
        });
        state.activeLocationId = location.id;
        renderGame();
      } catch (error) {
        playGameSound('error');
        showToast(error.message);
      }
    });
  });

  document.querySelectorAll('[data-activity]').forEach((button) => button.addEventListener('click', () => performStoryActivity(button.dataset.activity)));
  document.querySelector('#close-activities')?.addEventListener('click', () => { state.activeLocationId = null; renderGame(); });
  document.querySelector('#close-leaderboard')?.addEventListener('click', () => { state.leaderboard = null; renderGame(); });
  document.querySelector('#change-story')?.addEventListener('click', () => { state.story.story = null; renderStorySelect(); });
  document.querySelector('#audio-toggle')?.addEventListener('click', (event) => {
    const muted = toggleGameAudio();
    event.currentTarget.innerHTML = audioIcon(muted);
    event.currentTarget.title = muted ? 'Turn sound on' : 'Mute sound';
    event.currentTarget.setAttribute('aria-label', event.currentTarget.title);
  });

  document.querySelector('#task-jump')?.addEventListener('click', async () => {
    if (!currentTask) return;
    const location = state.world.locations.find((entry) => entry.id === currentTask.locationId);
    if (!location) return;
    worldScene?.focusLocation(location.x, location.y);
    worldScene?.movePlayer(location.x, location.y);
    playGameSound('travel');
    try {
      state.player = await api('/api/player/move', { method: 'POST', body: JSON.stringify({ x: location.x, y: location.y }) });
      state.activeLocationId = location.id;
      renderGame();
    } catch (error) { showToast(error.message); }
  });
  document.querySelector('#zoom-in')?.addEventListener('click', () => worldScene?.zoom(0.82));
  document.querySelector('#zoom-out')?.addEventListener('click', () => worldScene?.zoom(1.22));
  document.querySelector('#leaderboard-btn')?.addEventListener('click', async () => {
    try { state.leaderboard = await api('/api/leaderboard'); renderGame(); }
    catch (error) { showToast(error.message); }
  });
  document.querySelector('#milestone-continue')?.addEventListener('click', async () => {
    if (milestone.storyCompleted) {
      state.milestone = null;
      state.story.story = null;
      renderStorySelect();
      return;
    }
    try {
      const response = await api('/api/player/story/next', { method: 'POST', body: '{}' });
      state.player = response.player;
      state.story = response.story;
      state.milestone = null;
      renderGame();
      playGameSound('chapter');
    } catch (error) { showToast(error.message); }
  });

  document.querySelector('#context-action')?.addEventListener('click', async () => {
    const target = findNearbyLocation();
    if (!target) return;
    if (target.action === 'eat') await performAction('eat');
    if (target.action === 'rent') await performAction('rent');
    if (target.action === 'register') await performAction('register');
    if (target.action === 'ride') await performAction('ride');
    if (target.action === 'work') await performAction('work', { jobId: 'design' });
    if (target.action === 'trade') await performAction('trade');
  });

  document.querySelector('#convert-points')?.addEventListener('click', () => {
    if (state.player.points >= 5) {
      convertPoints(5);
    } else {
      showToast('You need at least 5 points to convert cash.');
    }
  });

  document.querySelector('#save-btn')?.addEventListener('click', () => {
    localStorage.setItem('buea-save', JSON.stringify({ token: state.token, player: state.player, world: state.world }));
    showToast('Progress saved.');
  });

  document.querySelector('#logout-btn')?.addEventListener('click', () => {
    worldScene?.dispose();
    worldScene = null;
    setStoryTheme(null);
    state.token = '';
    state.player = null;
    state.world = null;
    localStorage.removeItem('buea-token');
    localStorage.removeItem('buea-save');
    renderAuth();
  });
}

async function initialize() {
  const saved = localStorage.getItem('buea-save');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      state.token = parsed.token || '';
      state.player = parsed.player || null;
      state.world = parsed.world || null;
    } catch (error) {
      state.token = '';
    }
  }

  if (state.token && state.player && state.world) {
    await loadStory();
    if (state.story.story) setStoryTheme(state.story.story.id);
    renderGame();
    return;
  }

  if (state.token) {
    loadGame();
    return;
  }

  renderAuth();
}

initialize();
