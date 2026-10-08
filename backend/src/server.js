const http = require('http');
const crypto = require('crypto');
const { stories, locations: storyLocations, getStory, getMission } = require('./storylines');
const PORT = Number(process.env.PORT || 4100);
const TEST_MODE = String(process.env.TEST_MODE || 'true').toLowerCase() === 'true';
const players = new Map();
const accounts = new Map();

const backgrounds = {
  student: { title: 'Student', startingCash: 75000, skills: ['study', 'networking'], summary: 'You arrived with tuition, ambition, and a room search to finish.' },
  professional: { title: 'Young Professional', startingCash: 120000, skills: ['career', 'discipline'], summary: 'You have a small cash cushion and a few career contacts in town.' },
  hustler: { title: 'Hustler', startingCash: 90000, skills: ['resale', 'negotiation'], summary: 'Your street instincts and hustle energy are your biggest assets.' },
  entrepreneur: { title: 'Tech Entrepreneur', startingCash: 160000, skills: ['software', 'business'], summary: 'You already carry a laptop, a network, and a startup ambition.' }
};

const locations = [
  { id: 'mile17', name: 'Mile 17', type: 'arrival', x: 12, y: 72, action: 'talk', description: 'The road into Buea and your opening chapter.' },
  { id: 'taxi', name: 'Taxi Rank', type: 'transport', x: 28, y: 63, action: 'ride', description: 'Yellow taxis leave toward Molyko and beyond.' },
  { id: 'molyko', name: 'Molyko', type: 'district', x: 42, y: 52, action: 'explore', description: 'Student streets, shops, bars, and early hustle energy.' },
  { id: 'university', name: 'University District', type: 'school', x: 67, y: 34, action: 'register', description: 'A compact university hub with desks, lectures, and study spots.' },
  { id: 'restaurant', name: 'Mountain Pot', type: 'food', x: 33, y: 77, action: 'eat', description: 'Fresh meals, rice, grilled fish, and the essentials of the day.' },
  { id: 'home', name: 'Molyko Rooms', type: 'housing', x: 56, y: 74, action: 'rent', description: 'Shared rooms and budget studios for new arrivals.' },
  { id: 'market', name: 'Molyko Market', type: 'market', x: 82, y: 64, action: 'trade', description: 'Food, clothes, and micro-business opportunity.' },
  { id: 'tech', name: 'Digital Hub', type: 'work', x: 25, y: 27, action: 'work', description: 'Small software, design, and media jobs appear here.' },
  { id: 'mount', name: 'Mount Cameroon', type: 'landmark', x: 50, y: 12, action: 'view', description: 'The mountain dominates the skyline and anchors the identity of Buea.' }
];

const jobs = [
  { id: 'print', title: 'Print Shop Assistant', pay: 3500, energyCost: 12 },
  { id: 'design', title: 'Design Gig', pay: 9000, energyCost: 18 },
  { id: 'dev', title: 'Junior Developer', pay: 18000, energyCost: 24 },
  { id: 'delivery', title: 'Delivery Rider', pay: 6000, energyCost: 14 }
];

function randomId() {
  return crypto.randomUUID();
}

function makeTimestamp() {
  return new Date().toISOString();
}

function makeLedgerEntry(type, amount, label, meta = {}) {
  return {
    id: randomId(),
    type,
    amount,
    label,
    createdAt: makeTimestamp(),
    ...meta
  };
}

function hashPassword(password) {
  return crypto.createHash('sha256').update(String(password || '')).digest('hex');
}

function awardPoints(player, amount) {
  const points = Number(amount || 0);
  if (!Number.isFinite(points) || points <= 0) return player;
  player.points += points;
  player.totalPointsEarned += points;
  return player;
}

function createPlayer(name = 'Player', background = 'student', email = '') {
  const profile = backgrounds[background] || backgrounds.student;
  const id = randomId();
  const player = {
    id,
    name: String(name || 'Player').trim() || 'Player',
    email: String(email || '').trim().toLowerCase(),
    background,
    balance: profile.startingCash,
    points: 0,
    totalPointsEarned: 0,
    totalCashConverted: 0,
    level: 1,
    xp: 0,
    campaignId: null,
    storyProgress: {},
    activityHistory: [],
    titles: ['New Arrival'],
    title: 'New Arrival',
    streak: 0,
    lastActiveDate: null,
    health: 100,
    energy: 92,
    mood: 78,
    hunger: 72,
    position: { x: 12, y: 72 },
    locationId: 'mile17',
    home: null,
    education: null,
    currentJob: null,
    inventory: ['phone', 'notebook'],
    ledger: [makeLedgerEntry('credit', profile.startingCash, 'Arrival cash')],
    questLog: [
      { id: 'stay', label: 'Find accommodation', done: false },
      { id: 'food', label: 'Buy food and recover hunger', done: false },
      { id: 'study', label: 'Register or find work', done: false }
    ],
    story: 'Arrived in Buea with a small budget and a big plan.',
    lastAction: 'You stepped off the road and entered Buea.'
  };
  players.set(player.id, player);
  return player;
}

function ensurePlayer(req, res) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const player = players.get(token);
  if (!player) {
    json(res, 401, { error: 'Login required' });
    return null;
  }
  player.campaignId ??= null;
  player.storyProgress ||= {};
  player.activityHistory ||= [];
  player.titles ||= ['New Arrival'];
  player.title ||= 'New Arrival';
  player.streak ||= 0;
  return player;
}

function getPlayerStory(player) {
  const story = getStory(player.campaignId);
  const progress = story ? (player.storyProgress[story.id] || null) : null;
  const mission = story && progress && !progress.finished ? getMission(story.id, progress.level, progress.difficulty) : null;
  const openings = {
    'first-light': {
      student: 'Your first class is close. First, find a room, learn the taxi fare, and make a plan that leaves room for lunch.',
      professional: 'You came to Buea to invest in your future. Build a steady routine before the workday fills up.',
      hustler: 'You know how to make a little go further. Read the neighbourhood before you decide where to put your energy.',
      entrepreneur: 'You have a laptop and a sharp idea. Start by listening to the people who already know this town.'
    },
    'market-roots': {
      student: 'Between classes, you spot a small gap in the market. Test the idea carefully and keep your studies on track.',
      professional: 'A side project could become something lasting. Start with honest numbers and one useful local connection.',
      hustler: 'A trader in Molyko has offered you a first chance to test a small idea. Your reputation is your first capital.',
      entrepreneur: 'You want to build something of your own. Begin with a real customer need, not a pitch deck.'
    },
    'mountain-echo': {
      student: 'Your campus project brings you back to the mountain. Listen to local guides before drawing the route.',
      professional: 'You are back in Buea with experience to offer and local knowledge to listen to.',
      hustler: 'A community trail project needs practical hands. Find a way to help without promising more than you can deliver.',
      entrepreneur: 'Your product skills can help a community project. Keep local voices in the lead.'
    }
  };
  const opening = story ? openings[story.id]?.[player.background] : null;
  return {
    catalog: stories.map(({ id, title, subtitle, description, protagonist, tone }) => ({ id, title, subtitle, description, protagonist, tone })),
    story: story ? { id: story.id, title: story.title, subtitle: story.subtitle, description: story.description, tone: story.tone, protagonist: backgrounds[player.background]?.title || story.protagonist, opening: opening || story.description } : null,
    progress,
    mission,
    taskIndex: progress?.taskIndex || 0,
    activities: storyLocations
  };
}

function updateStreak(player) {
  const today = new Date().toISOString().slice(0, 10);
  if (player.lastActiveDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  player.streak = player.lastActiveDate === yesterday ? player.streak + 1 : 1;
  player.lastActiveDate = today;
}

function updateTitles(player) {
  const totalLevels = Object.values(player.storyProgress).reduce((sum, progress) => sum + progress.completedLevels, 0);
  const earned = [[1, 'Buea Explorer'], [5, 'Neighbourhood Regular'], [15, 'Community Builder'], [30, 'Mountain Keeper'], [60, 'Buea Legend']]
    .filter(([threshold]) => totalLevels >= threshold).map(([, title]) => title);
  for (const title of earned) if (!player.titles.includes(title)) player.titles.push(title);
  player.title = earned[earned.length - 1] || 'New Arrival';
}

function getLeaderboard() {
  return [...players.values()]
    .map((player) => ({
      name: player.name,
      title: player.title || 'New Arrival',
      streak: player.streak || 0,
      completedLevels: Object.values(player.storyProgress || {}).reduce((sum, progress) => sum + progress.completedLevels, 0),
      pointsEarned: player.totalPointsEarned || 0
    }))
    .sort((first, second) => second.completedLevels - first.completedLevels || second.pointsEarned - first.pointsEarned || second.streak - first.streak)
    .slice(0, 25)
    .map((entry, index) => ({ rank: index + 1, ...entry }));
}

function applyActivityEffect(player, activity, activityId) {
  if (activity.kind === 'rest') {
    player.energy = Math.min(100, player.energy + 10);
    player.mood = Math.min(100, player.mood + 3);
  } else if (activity.kind === 'meal') {
    const cost = 800;
    if (player.balance < cost) throw new Error('You need 800 FCFA for this activity.');
    player.balance -= cost;
    player.hunger = Math.min(100, player.hunger + 16);
    player.mood = Math.min(100, player.mood + 2);
    player.ledger.unshift(makeLedgerEntry('debit', cost, 'Local meal'));
  } else if (activity.kind === 'learn') {
    player.energy = Math.max(0, player.energy - 3);
    player.xp += 5;
  } else if (activity.kind === 'work') {
    if (player.energy < 5) throw new Error('Rest first; you need 5 energy for this task.');
    player.energy -= 5;
    player.xp += 8;
  } else if (activity.kind === 'fitness') {
    if (player.energy < 4) throw new Error('Rest first; you need 4 energy for this walk.');
    player.energy -= 4;
    player.mood = Math.min(100, player.mood + 3);
    player.health = Math.min(100, player.health + 1);
  } else if (activity.kind === 'community') {
    player.mood = Math.min(100, player.mood + 5);
  } else if (activity.kind === 'social') {
    player.mood = Math.min(100, player.mood + 4);
  } else if (activity.kind === 'commerce') {
    player.mood = Math.min(100, player.mood + 2);
  }
  player.level = 1 + Math.floor(player.xp / 75);
  player.lastAction = activity.detail;
  return activityId;
}

function updateQuestProgress(player) {
  player.questLog = player.questLog.map((quest) => {
    if (quest.id === 'stay' && player.home) return { ...quest, done: true };
    if (quest.id === 'food' && player.hunger > 60) return { ...quest, done: true };
    if (quest.id === 'study' && (player.education || player.currentJob)) return { ...quest, done: true };
    return quest;
  });
}

function json(res, status, data) {
  res.writeHead(status, {
    'content-type': 'application/json',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'content-type, authorization',
    'access-control-allow-methods': 'GET, POST, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });
  });
}

function extractValidBackground(value) {
  return Object.prototype.hasOwnProperty.call(backgrounds, value || 'student') ? (value || 'student') : 'student';
}

function respondPlayerAuth(res, player) {
  return json(res, 200, { token: player.id, player });
}

function route(req, res) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/health') {
    return json(res, 200, { ok: true, mode: TEST_MODE ? 'test' : 'live', timestamp: makeTimestamp() });
  }

  if (req.method === 'GET' && url.pathname === '/api/world') {
    return json(res, 200, {
      city: 'Buea',
      district: 'Molyko',
      weather: { condition: 'Cloudy', temperature: 22, rainChance: 18 },
      cycle: { time: '09:40', phase: 'morning' },
      locations,
      locationActivities: storyLocations,
      stories: stories.map(({ id, title, subtitle, description, protagonist, tone }) => ({ id, title, subtitle, description, protagonist, tone })),
      jobs,
      backgrounds
    });
  }

  if (req.method === 'GET' && url.pathname === '/api/leaderboard') {
    return json(res, 200, getLeaderboard());
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/register') {
    return readBody(req)
      .then((body) => {
        const name = String(body.name || '').trim();
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');
        const background = extractValidBackground(body.background);

        if (!name || !email) {
          return json(res, 400, { error: 'Name and email are required.' });
        }

        const existingAccount = [...accounts.values()].find((user) => user.email === email);
        if (existingAccount) {
          return json(res, 409, { error: 'An account with that email already exists.' });
        }

        const player = createPlayer(name, background, email);
        const passwordHash = hashPassword(password);

        accounts.set(email, {
          id: player.id,
          name,
          email,
          passwordHash: password ? passwordHash : null,
          background,
          createdAt: makeTimestamp()
        });

        return json(res, 201, { token: player.id, player });
      })
      .catch(() => json(res, 400, { error: 'Invalid registration payload' }));
  }

  if (req.method === 'POST' && url.pathname === '/api/auth/login') {
    return readBody(req)
      .then((body) => {
        const email = String(body.email || '').trim().toLowerCase();
        const account = accounts.get(email);

        if (!account || (body.password && account.passwordHash && account.passwordHash !== hashPassword(body.password))) {
          return json(res, 401, { error: 'Invalid email or password.' });
        }

        let player = players.get(account.id);
        if (!player) {
          player = createPlayer(account.name, account.background, account.email);
          player.id = account.id;
          players.set(player.id, player);
        }

        return respondPlayerAuth(res, player);
      })
      .catch(() => json(res, 400, { error: 'Invalid login payload' }));
  }

  if (req.method === 'POST' && url.pathname === '/api/test/login') {
    return readBody(req)
      .then((body) => {
        const name = (body.name || 'Amina').toString().trim() || 'Amina';
        const background = extractValidBackground(body.background);
        const player = createPlayer(name, background);
        return json(res, 200, { token: player.id, player });
      })
      .catch(() => json(res, 400, { error: 'Invalid player payload' }));
  }

  if (req.method === 'POST' && url.pathname === '/api/test/reset') {
    const player = ensurePlayer(req, res);
    if (!player) return null;
    const resetPlayer = createPlayer(player.name, player.background, player.email);
    const newToken = resetPlayer.id;
    players.set(newToken, resetPlayer);
    players.delete(player.id);
    return json(res, 200, { token: newToken, player: resetPlayer });
  }

  if (req.method === 'GET' && url.pathname === '/api/player') {
    const player = ensurePlayer(req, res);
    if (!player) return null;
    return json(res, 200, player);
  }

  if (req.method === 'GET' && url.pathname === '/api/player/story') {
    const player = ensurePlayer(req, res);
    if (!player) return null;
    return json(res, 200, getPlayerStory(player));
  }

  if (req.method === 'POST' && url.pathname === '/api/player/story/select') {
    const player = ensurePlayer(req, res);
    if (!player) return null;
    return readBody(req)
      .then((body) => {
        const story = getStory(String(body.storyId || ''));
        if (!story) return json(res, 400, { error: 'Choose one of the available Buea stories.' });
        player.campaignId = story.id;
        const difficulty = ['easy', 'standard', 'hard'].includes(body.difficulty) ? body.difficulty : 'standard';
        if (Object.prototype.hasOwnProperty.call(backgrounds, body.background)) player.background = body.background;
        player.storyProgress[story.id] ||= { level: 1, taskIndex: 0, completedLevels: 0, finished: false, pendingNext: false, difficulty };
        player.storyProgress[story.id].difficulty = difficulty;
        player.storyProgress[story.id].pendingNext = false;
        player.lastAction = `Your story begins: ${story.title}.`;
        return json(res, 200, { player, story: getPlayerStory(player) });
      })
      .catch(() => json(res, 400, { error: 'Invalid story selection.' }));
  }

  if (req.method === 'POST' && url.pathname === '/api/player/story/next') {
    const player = ensurePlayer(req, res);
    if (!player) return null;
    const story = getStory(player.campaignId);
    const progress = story && player.storyProgress[story.id];
    if (!progress?.pendingNext) return json(res, 400, { error: 'Complete the current level before continuing.' });
    if (progress.level >= 40) {
      progress.finished = true;
      progress.pendingNext = false;
    } else {
      progress.level += 1;
      progress.taskIndex = 0;
      progress.pendingNext = false;
    }
    player.lastAction = progress.finished ? 'You completed the whole story.' : `You started level ${progress.level}.`;
    return json(res, 200, { player, story: getPlayerStory(player) });
  }

  if (req.method === 'POST' && url.pathname === '/api/player/move') {
    const player = ensurePlayer(req, res);
    if (!player) return null;
    return readBody(req)
      .then((body) => {
        const nextX = Number(body.x ?? player.position.x);
        const nextY = Number(body.y ?? player.position.y);
        player.position = {
          x: Math.min(92, Math.max(8, Number.isFinite(nextX) ? nextX : player.position.x)),
          y: Math.min(86, Math.max(10, Number.isFinite(nextY) ? nextY : player.position.y))
        };
        const nearestLocation = locations.reduce((nearest, location) => {
          const distance = Math.hypot(player.position.x - location.x, player.position.y - location.y);
          return !nearest || distance < nearest.distance ? { id: location.id, distance } : nearest;
        }, null);
        player.locationId = nearestLocation?.id || player.locationId;
        player.lastAction = 'Movement updated around the Molyko district.';
        return json(res, 200, player);
      })
      .catch(() => json(res, 400, { error: 'Invalid movement payload' }));
  }

  if (req.method === 'POST' && url.pathname === '/api/player/activity') {
    const player = ensurePlayer(req, res);
    if (!player) return null;
    return readBody(req)
      .then((body) => {
        const activityId = String(body.activityId || '');
        const match = Object.entries(storyLocations).flatMap(([locationId, activities]) => activities.map((activity) => ({ ...activity, locationId }))).find((activity) => activity.id === activityId);
        if (!match) return json(res, 400, { error: 'That activity is not available.' });
        if (player.locationId !== match.locationId) return json(res, 400, { error: 'Travel to this location before starting the activity.' });

        const story = getStory(player.campaignId);
        const progress = story ? player.storyProgress[story.id] : null;
        if (progress?.pendingNext) return json(res, 409, { error: 'Continue to the next level before starting another activity.' });
        const mission = story && progress && !progress.finished ? getMission(story.id, progress.level, progress.difficulty) : null;
        const currentTask = mission?.tasks[progress.taskIndex];
        const isStoryTask = currentTask?.activityId === match.id && currentTask.locationId === match.locationId;

        try {
          applyActivityEffect(player, match, activityId);
        } catch (error) {
          return json(res, 400, { error: error.message });
        }

        let event = { type: 'activity', title: match.title, kind: match.kind, reward: { points: 0, xp: 0 } };
        if (isStoryTask) {
          progress.taskIndex += 1;
          event = { type: 'story-task', title: match.title, kind: match.kind, taskCompleted: true, levelCompleted: false, reward: { points: 0, xp: 0 } };
          if (progress.taskIndex >= mission.tasks.length) {
            awardPoints(player, mission.rewards.points);
            player.xp += mission.rewards.xp;
            player.level = 1 + Math.floor(player.xp / 75);
            progress.completedLevels += 1;
            progress.pendingNext = !mission.finalChapter;
            updateStreak(player);
            updateTitles(player);
            event = {
              ...event,
              levelCompleted: true,
              chapterCompleted: mission.chapterFinale,
              storyCompleted: mission.finalChapter,
              reward: mission.rewards
            };
            if (mission.finalChapter) {
              progress.finished = true;
            }
          }
          player.lastAction = event.levelCompleted
            ? `Chapter task complete: ${mission.title}. You earned ${mission.rewards.points} points.`
            : `Story task complete: ${match.title}.`;
        }
        return json(res, 200, { player, story: getPlayerStory(player), event });
      })
      .catch(() => json(res, 400, { error: 'Invalid activity request.' }));
  }

  if (req.method === 'POST' && url.pathname === '/api/player/convert-points') {
    const player = ensurePlayer(req, res);
    if (!player) return null;
    return readBody(req)
      .then((body) => {
        const requested = Number(body.points ?? 0);
        if (!Number.isFinite(requested) || requested <= 0) {
          return json(res, 400, { error: 'Enter a valid number of points to convert.' });
        }
        if (requested > player.points) {
          return json(res, 400, { error: 'You do not have enough points to convert.' });
        }

        const cashValue = requested * 5;
        player.points -= requested;
        player.balance += cashValue;
        player.totalCashConverted += cashValue;
        player.ledger.unshift(makeLedgerEntry('credit', cashValue, 'Points conversion'));
        player.lastAction = `You converted ${requested} points into ${cashValue} FCFA.`;
        return json(res, 200, { message: 'Points converted to cash.', player });
      })
      .catch(() => json(res, 400, { error: 'Invalid conversion request' }));
  }

  if (req.method === 'POST' && url.pathname === '/api/player/interact') {
    const player = ensurePlayer(req, res);
    if (!player) return null;
    return readBody(req)
      .then((body) => {
        const action = String(body.action || '').toLowerCase();

        if (action === 'eat') {
          const cost = 1500;
          if (player.balance < cost) return json(res, 400, { error: 'Not enough FCFA for a meal.' });
          player.balance -= cost;
          player.hunger = Math.min(100, player.hunger + 30);
          player.mood = Math.min(100, player.mood + 8);
          player.energy = Math.min(100, player.energy + 5);
          awardPoints(player, 1);
          player.ledger.unshift(makeLedgerEntry('debit', cost, 'Meal purchase'));
          player.lastAction = 'You bought a warm meal and regained your drive.';
          updateQuestProgress(player);
          return json(res, 200, player);
        }

        if (action === 'rent') {
          const cost = 35000;
          if (player.home) return json(res, 400, { error: 'You already have accommodation.' });
          if (player.balance < cost) return json(res, 400, { error: 'Not enough FCFA to rent a room.' });
          player.balance -= cost;
          player.home = 'Molyko Shared Room';
          player.position = { x: 56, y: 74 };
          player.locationId = 'home';
          awardPoints(player, 4);
          player.ledger.unshift(makeLedgerEntry('debit', cost, 'Room rent'));
          player.lastAction = 'You secured a room in Molyko and settled in.';
          updateQuestProgress(player);
          return json(res, 200, player);
        }

        if (action === 'register') {
          player.education = 'University of Buea';
          player.xp += 25;
          player.energy = Math.max(0, player.energy - 8);
          awardPoints(player, 3);
          player.lastAction = 'You registered and sharpened your academic path.';
          updateQuestProgress(player);
          return json(res, 200, player);
        }

        if (action === 'work') {
          const job = jobs.find((entry) => entry.id === (body.jobId || 'design')) || jobs[0];
          if (player.energy < job.energyCost) return json(res, 400, { error: 'Not enough energy for this task.' });
          player.energy = Math.max(0, player.energy - job.energyCost);
          player.balance += job.pay;
          player.currentJob = job.title;
          player.xp += 18;
          player.level = 1 + Math.floor(player.xp / 75);
          awardPoints(player, 2);
          player.ledger.unshift(makeLedgerEntry('credit', job.pay, `${job.title} payment`));
          player.lastAction = `You completed a ${job.title.toLowerCase()} shift and earned FCFA.`;
          updateQuestProgress(player);
          return json(res, 200, player);
        }

        if (action === 'ride') {
          const fare = 2000;
          if (player.balance < fare) return json(res, 400, { error: 'Not enough FCFA for the taxi fare.' });
          player.balance -= fare;
          player.position = { x: 42, y: 52 };
          player.locationId = 'molyko';
          awardPoints(player, 1);
          player.ledger.unshift(makeLedgerEntry('debit', fare, 'Taxi trip'));
          player.lastAction = 'The taxi brought you into the centre of Molyko.';
          return json(res, 200, player);
        }

        if (action === 'trade') {
          player.hunger = Math.max(0, player.hunger - 10);
          player.mood = Math.min(100, player.mood + 4);
          awardPoints(player, 1);
          player.lastAction = 'You browsed the market and found small opportunities.';
          return json(res, 200, player);
        }

        player.lastAction = 'You scanned the area and kept moving.';
        return json(res, 200, player);
      })
      .catch(() => json(res, 400, { error: 'Invalid interaction request' }));
  }

  return json(res, 404, { error: 'Not found' });
}

const server = http.createServer(route);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Buea Life API ready on http://localhost:${PORT}`);
  });
}

module.exports = {
  server,
  TEST_MODE,
  createPlayer,
  backgrounds,
  locations,
  jobs,
  players,
  accounts
};
