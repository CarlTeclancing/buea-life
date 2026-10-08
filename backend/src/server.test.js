const test = require('node:test');
const assert = require('node:assert');
const { server, createPlayer } = require('./server');
const { getMission, stories } = require('./storylines');

function startTestServer() {
  if (!server.listening) {
    server.listen(0);
  }
  return new Promise((resolve) => {
    server.once('listening', () => resolve(server.address().port));
  });
}

async function closeTestServer() {
  if (server.listening) {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }
}

test('new player starts with the Student background and a valid economy', async (t) => {
  t.after(async () => {
    await closeTestServer();
  });

  const player = createPlayer('Test Player', 'student');
  assert.equal(player.balance, 75000);
  assert.equal(player.background, 'student');
  assert.equal(player.questLog.length, 3);
  assert.equal(player.energy, 92);
});

test('register and login create real accounts and return a valid session', async (t) => {
  t.after(async () => {
    await closeTestServer();
  });

  const port = await startTestServer();
  const signup = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Zoe', email: 'zoe@example.com', password: 'secret123', background: 'student' })
  });

  assert.equal(signup.status, 201);
  const signupPayload = await signup.json();
  assert.ok(signupPayload.token);
  assert.equal(signupPayload.player.points, 0);

  const login = await fetch(`http://localhost:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'zoe@example.com', password: 'secret123' })
  });

  assert.equal(login.status, 200);
  const loginPayload = await login.json();
  assert.equal(loginPayload.player.name, 'Zoe');
});

test('playing activities awards points that can convert into cash', async (t) => {
  t.after(async () => {
    await closeTestServer();
  });

  const port = await startTestServer();
  const signup = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Kofi', email: 'kofi@example.com', password: 'secret123', background: 'hustler' })
  });
  const signupPayload = await signup.json();

  const work = await fetch(`http://localhost:${port}/api/player/interact`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${signupPayload.token}`
    },
    body: JSON.stringify({ action: 'work', jobId: 'design' })
  });

  assert.equal(work.status, 200);
  const playerAfterWork = await work.json();
  assert.ok(playerAfterWork.points > 0);

  const convert = await fetch(`http://localhost:${port}/api/player/convert-points`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${signupPayload.token}`
    },
    body: JSON.stringify({ points: 1 })
  });

  assert.equal(convert.status, 200);
  const converted = await convert.json();
  assert.ok(converted.player.balance >= signupPayload.player.balance);
  assert.ok(converted.player.points < playerAfterWork.points);
});

test('test login creates a valid player token and returns ledger data', async (t) => {
  t.after(async () => {
    await closeTestServer();
  });

  const port = await startTestServer();
  const response = await fetch(`http://localhost:${port}/api/test/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Amina', background: 'student' })
  });

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.player.balance, 75000);
  assert.ok(Array.isArray(payload.player.ledger));
  assert.equal(payload.player.ledger[0].type, 'credit');
});

test('renting a room requires enough FCFA and updates the quest state', async (t) => {
  t.after(async () => {
    await closeTestServer();
  });

  const port = await startTestServer();
  const response = await fetch(`http://localhost:${port}/api/test/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Terry', background: 'student' })
  });
  const payload = await response.json();

  const rentResponse = await fetch(`http://localhost:${port}/api/player/interact`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${payload.token}`
    },
    body: JSON.stringify({ action: 'rent' })
  });

  assert.equal(rentResponse.status, 200);
  const nextState = await rentResponse.json();
  assert.equal(nextState.home, 'Molyko Shared Room');
  assert.ok(nextState.questLog[0].done);
});

test('story selection exposes forty authored beats and increasing mission difficulty', () => {
  assert.equal(stories.length, 3);
  for (const story of stories) {
    assert.equal(story.chapters.length * 5, 40);
    assert.equal(getMission(story.id, 1).difficulty, 'Easy');
    assert.equal(getMission(story.id, 40).difficulty, 'Expert');
    assert.ok(getMission(story.id, 40).rewards.points > getMission(story.id, 1).rewards.points);
    assert.ok(getMission(story.id, 40).tasks.length > getMission(story.id, 1).tasks.length);
    assert.equal(getMission(story.id, 20, 'easy').tasks.length, 1);
    assert.ok(getMission(story.id, 20, 'hard').tasks.length > getMission(story.id, 20, 'standard').tasks.length);
  }
});

test('story activity must be done at its location and completing a mission unlocks the next level', async (t) => {
  t.after(async () => {
    await closeTestServer();
  });

  const port = await startTestServer();
  const login = await fetch(`http://localhost:${port}/api/test/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Amina' })
  });
  const { token } = await login.json();
  const headers = { 'content-type': 'application/json', authorization: `Bearer ${token}` };
  const select = await fetch(`http://localhost:${port}/api/player/story/select`, {
    method: 'POST', headers, body: JSON.stringify({ storyId: 'first-light', difficulty: 'standard' })
  });
  assert.equal(select.status, 200);
  const selected = await select.json();
  const task = selected.story.mission.tasks[0];
  assert.equal(task.locationId, 'mile17');

  const wrongPlace = await fetch(`http://localhost:${port}/api/player/activity`, {
    method: 'POST', headers, body: JSON.stringify({ activityId: 'ask-shopkeeper' })
  });
  assert.equal(wrongPlace.status, 400);

  const activity = await fetch(`http://localhost:${port}/api/player/activity`, {
    method: 'POST', headers, body: JSON.stringify({ activityId: task.activityId })
  });
  assert.equal(activity.status, 200);
  const result = await activity.json();
  assert.equal(result.event.levelCompleted, true);
  assert.equal(result.story.progress.level, 1);
  assert.equal(result.story.progress.pendingNext, true);
  assert.equal(result.story.progress.completedLevels, 1);
  assert.equal(result.player.points, 13);
  assert.equal(result.player.streak, 1);
  assert.equal(result.player.title, 'Buea Explorer');

  const next = await fetch(`http://localhost:${port}/api/player/story/next`, { method: 'POST', headers });
  assert.equal(next.status, 200);
  const nextState = await next.json();
  assert.equal(nextState.story.progress.level, 2);
  assert.equal(nextState.story.progress.pendingNext, false);
});

test('name/email-only registration can choose a hard campaign and appears on the leaderboard', async (t) => {
  t.after(async () => {
    await closeTestServer();
  });

  const port = await startTestServer();
  const signup = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Market Maker', email: 'maker@example.com' })
  });
  assert.equal(signup.status, 201);
  const account = await signup.json();

  const login = await fetch(`http://localhost:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'maker@example.com' })
  });
  assert.equal(login.status, 200);

  const headers = { 'content-type': 'application/json', authorization: `Bearer ${account.token}` };
  const selection = await fetch(`http://localhost:${port}/api/player/story/select`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ storyId: 'market-roots', background: 'hustler', difficulty: 'hard' })
  });
  const selected = await selection.json();
  assert.equal(selection.status, 200);
  assert.equal(selected.player.background, 'hustler');
  assert.equal(selected.story.mission.challengeDifficulty, 'Hard');
  assert.equal(selected.story.mission.tasks.length, 2);

  const leaderboard = await fetch(`http://localhost:${port}/api/leaderboard`);
  assert.equal(leaderboard.status, 200);
  const rows = await leaderboard.json();
  const newPlayerRow = rows.find((row) => row.name === 'Market Maker');
  assert.ok(newPlayerRow);
  assert.equal(newPlayerRow.title, 'New Arrival');
});
