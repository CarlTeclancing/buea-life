const locations = {
  mile17: [
    { id: 'ask-route', title: 'Ask for directions', detail: 'Check which shared taxi reaches Molyko safely.', kind: 'social' },
    { id: 'check-arrival', title: 'Check in with home', detail: 'Find a quiet moment to tell your people you arrived.', kind: 'social' },
    { id: 'plan-fare', title: 'Plan your fare', detail: 'Count your notes and agree a fair first fare.', kind: 'commerce' }
  ],
  taxi: [
    { id: 'share-ride', title: 'Join a shared taxi', detail: 'Agree the fare and share the ride into town.', kind: 'social' },
    { id: 'learn-routes', title: 'Learn the routes', detail: 'Ask a driver how people move between Molyko and campus.', kind: 'learn' },
    { id: 'help-luggage', title: 'Help with luggage', detail: 'Make room for a neighbour heading into town.', kind: 'community' }
  ],
  molyko: [
    { id: 'ask-shopkeeper', title: 'Ask a shopkeeper', detail: 'Get a local tip on food, rooms, and the price of things.', kind: 'social' },
    { id: 'find-landmark', title: 'Find a landmark', detail: 'Learn a familiar meeting point in the busy district.', kind: 'learn' },
    { id: 'help-neighbour', title: 'Help a neighbour', detail: 'Carry a parcel and make your first local connection.', kind: 'community' }
  ],
  university: [
    { id: 'check-noticeboard', title: 'Read the noticeboard', detail: 'Find the office hours, registration steps, or study group.', kind: 'learn' },
    { id: 'join-study', title: 'Join a study circle', detail: 'Trade notes and make a realistic plan for the week.', kind: 'learn' },
    { id: 'ask-admissions', title: 'Ask admissions', detail: 'Speak to the desk about forms, fees, and deadlines.', kind: 'social' }
  ],
  restaurant: [
    { id: 'choose-lunch', title: 'Choose a local lunch', detail: 'Pick a filling meal and keep an eye on your budget.', kind: 'meal' },
    { id: 'ask-menu', title: 'Ask about the menu', detail: 'Find out what is fresh before spending your cash.', kind: 'social' },
    { id: 'help-clear', title: 'Help clear the table', detail: 'Give the team a hand during the lunch rush.', kind: 'community' }
  ],
  home: [
    { id: 'inspect-room', title: 'Inspect a room', detail: 'Check the water, power, locks, and what the rent includes.', kind: 'learn' },
    { id: 'settle-in', title: 'Settle in', detail: 'Unpack, rest, and make a simple plan for tomorrow.', kind: 'rest' },
    { id: 'meet-neighbour', title: 'Meet a neighbour', detail: 'Introduce yourself and learn the house routine.', kind: 'social' }
  ],
  market: [
    { id: 'compare-prices', title: 'Compare prices', detail: 'Check two stalls before deciding what your money can buy.', kind: 'commerce' },
    { id: 'buy-produce', title: 'Pick fresh produce', detail: 'Choose seasonal ingredients for a meal or small resale.', kind: 'meal' },
    { id: 'negotiate-stock', title: 'Negotiate stock', detail: 'Ask a trader about a fair small-batch price.', kind: 'commerce' }
  ],
  tech: [
    { id: 'finish-design', title: 'Finish a design brief', detail: 'Deliver a tidy poster or social graphic before the deadline.', kind: 'work' },
    { id: 'print-cv', title: 'Print a CV', detail: 'Prepare a one-page CV and ask for a quick review.', kind: 'work' },
    { id: 'learn-a-skill', title: 'Practise a digital skill', detail: 'Spend a focused session improving one useful skill.', kind: 'learn' }
  ],
  mount: [
    { id: 'meet-guide', title: 'Meet a local guide', detail: 'Ask about the trail, the weather, and the mountain’s stories.', kind: 'social' },
    { id: 'walk-viewpoint', title: 'Walk to a viewpoint', detail: 'Take a steady walk and make time to appreciate the view.', kind: 'fitness' },
    { id: 'care-for-trail', title: 'Care for the trail', detail: 'Leave the path better than you found it.', kind: 'community' }
  ]
};

const stories = [
  {
    id: 'first-light',
    title: 'First Light in Buea',
    subtitle: 'Find your feet. Build a life that feels like yours.',
    description: 'A new student arrives with a tight budget, a room to find, and a chance to shape their future in Buea.',
    protagonist: 'A new student',
    tone: 'Warm, hopeful, resourceful',
    route: ['mile17', 'taxi', 'molyko', 'home', 'restaurant', 'university', 'tech', 'market', 'mount'],
    chapters: [
      { title: 'A Place to Begin', summary: 'You arrive with one bag, a few contacts, and a long list of things to figure out.', beats: ['A name at the taxi rank', 'The fare into town', 'A first look at Molyko', 'A room within reach', 'A key and a promise'] },
      { title: 'Finding Your Rhythm', summary: 'New routines cost less when you learn the neighbourhood and look out for people.', beats: ['Breakfast before class', 'A neighbour knows the way', 'The campus noticeboard', 'Notes shared in the shade', 'One week on your own'] },
      { title: 'The Work of Learning', summary: 'Deadlines, transport, and everyday expenses test the plan you made on arrival.', beats: ['Forms before the deadline', 'A missed ride, a new route', 'A study circle takes shape', 'Make the small budget stretch', 'Results worth the effort'] },
      { title: 'Earn as You Learn', summary: 'A small digital job can become a first step toward independence.', beats: ['A poster needs a designer', 'Listen before you quote', 'Deliver the first draft', 'A client sends a friend', 'Your name travels further'] },
      { title: 'Rain on the Roof', summary: 'A difficult week calls for practical choices, not a perfect plan.', beats: ['The power goes out', 'Check on the house', 'A warm meal shared', 'Study somewhere bright', 'A setback becomes a story'] },
      { title: 'People Make a Place', summary: 'The best opportunities arrive through trust built one ordinary day at a time.', beats: ['Show a newcomer around', 'The market needs a hand', 'Trade skills, not favours', 'A community project starts', 'More hands, lighter work'] },
      { title: 'A Wider Horizon', summary: 'You have enough experience to make a bigger choice about school and work.', beats: ['Pitch a better idea', 'Choose what to learn next', 'Help a classmate prepare', 'Put savings toward a goal', 'The next door opens'] },
      { title: 'Home on the Mountain', summary: 'Look back at the people and decisions that made Buea feel like home.', beats: ['Walk the mountain path', 'Return a kindness', 'Share what you learned', 'Celebrate the whole crew', 'A future you chose'] }
    ]
  },
  {
    id: 'market-roots',
    title: 'Market Roots',
    subtitle: 'Start small. Trade fairly. Grow together.',
    description: 'A determined hustler turns one modest market idea into a neighbourhood business without losing sight of the people behind it.',
    protagonist: 'A young local entrepreneur',
    tone: 'Energetic, street-smart, generous',
    route: ['mile17', 'molyko', 'market', 'taxi', 'restaurant', 'home', 'tech', 'university', 'mount'],
    chapters: [
      { title: 'One Good Idea', summary: 'A chance conversation in Molyko points toward a small business worth testing.', beats: ['Hear what people need', 'Count your starting cash', 'Find a willing first seller', 'Make a simple offer', 'The first customer says yes'] },
      { title: 'Know the Street', summary: 'Good trading starts by learning routes, prices, and the people who keep the district moving.', beats: ['Learn the morning routes', 'Compare the real prices', 'Ask what sells by noon', 'Deliver before the rain', 'A stall remembers you'] },
      { title: 'Keep Your Word', summary: 'A late order puts your reputation on the line before the business has even begun.', beats: ['A supplier is running late', 'Find a fair alternative', 'Update the waiting customer', 'Make the hand-off right', 'Trust survives the delay'] },
      { title: 'Make It Official', summary: 'The next step is to sharpen your craft and learn the basic numbers behind it.', beats: ['Build a clean price list', 'Design a better sign', 'Track every small sale', 'Ask for honest feedback', 'The numbers finally add up'] },
      { title: 'Share the Risk', summary: 'A friend brings a new idea, and you have to decide what partnership really means.', beats: ['Listen to a new proposal', 'Write down each role', 'Split the first order fairly', 'Fix a small disagreement', 'Both names on the receipt'] },
      { title: 'A Bigger Market', summary: 'A new customer base means more work, more travel, and more choices about quality.', beats: ['Find a second route', 'Source from local growers', 'Prepare a larger order', 'Keep quality consistent', 'The market talks about you'] },
      { title: 'Give Back Locally', summary: 'A business is part of its neighbourhood, so growth should make room for others.', beats: ['Offer a first shift', 'Teach a useful skill', 'Support a community stall', 'Keep the books honest', 'Your crew grows stronger'] },
      { title: 'Roots That Last', summary: 'The final test is building something people can rely on after the excitement fades.', beats: ['Plan for a slow season', 'Thank the early customers', 'Choose a long-term partner', 'Make a promise you can keep', 'A Buea business is born'] }
    ]
  },
  {
    id: 'mountain-echo',
    title: 'Mountain Echo',
    subtitle: 'Listen closely. Bring the whole community forward.',
    description: 'A young professional returns to Buea to reconnect with family, document local knowledge, and organise a community trail project.',
    protagonist: 'A returning young professional',
    tone: 'Reflective, cinematic, community-led',
    route: ['mile17', 'home', 'molyko', 'mount', 'market', 'restaurant', 'taxi', 'university', 'tech'],
    chapters: [
      { title: 'The Road Back', summary: 'You return to Buea carrying work experience and questions about what home needs.', beats: ['A familiar road, new eyes', 'Call the person who waited', 'Settle into a spare room', 'Walk the old neighbourhood', 'Listen before you plan'] },
      { title: 'Stories in the Stalls', summary: 'People at the market remember changes no report has managed to capture.', beats: ['Ask a trader about the past', 'Record a family recipe', 'Follow a supply route', 'Share lunch and memories', 'A pattern starts to show'] },
      { title: 'The Mountain Keeps Time', summary: 'Local guides explain what visitors miss when they rush to the viewpoint.', beats: ['Meet a careful guide', 'Learn the trail signals', 'Walk at a steady pace', 'Leave no trace behind', 'A story worth carrying'] },
      { title: 'Make a Plan Together', summary: 'Students and neighbours help turn scattered ideas into a workable community project.', beats: ['Invite a campus group', 'Sketch the route together', 'Check what materials cost', 'Ask who can lend a hand', 'Agree on a shared date'] },
      { title: 'A Hard Week', summary: 'Transport trouble and a tight deadline force the team to adapt without blame.', beats: ['A ride falls through', 'Find another way across town', 'Rework the task list', 'Check on the tired crew', 'Keep the promise anyway'] },
      { title: 'Small Changes Show', summary: 'The first visible improvements bring new volunteers and fresh responsibilities.', beats: ['Clear one safe section', 'Make a simple trail guide', 'Share the local history', 'Welcome new volunteers', 'The path feels different'] },
      { title: 'A Wider Invitation', summary: 'A public showcase can bring support, provided the community remains in the lead.', beats: ['Prepare a short presentation', 'Print a clear visitor guide', 'Invite local partners', 'Tell the story accurately', 'New support arrives'] },
      { title: 'Echoes for Tomorrow', summary: 'The project becomes a living tradition when local voices shape what happens next.', beats: ['Walk the whole route', 'Thank every contributor', 'Pass the guidebook on', 'Plan the next season', 'Buea carries the story'] }
    ]
  }
];

function getStory(storyId) {
  return stories.find((story) => story.id === storyId) || null;
}

function getMission(storyId, level, chosenDifficulty = 'standard') {
  const story = getStory(storyId);
  if (!story || !Number.isInteger(level) || level < 1 || level > 40) return null;
  const chapterIndex = Math.floor((level - 1) / 5);
  const chapter = story.chapters[chapterIndex];
  const difficulty = level <= 10 ? 'Easy' : level <= 20 ? 'Steady' : level <= 30 ? 'Hard' : 'Expert';
  const standardTaskCount = level <= 10 ? 1 : level <= 20 ? 2 : level <= 30 ? 2 : 3;
  const taskCount = chosenDifficulty === 'easy' ? 1 : chosenDifficulty === 'hard' ? Math.min(3, standardTaskCount + 1) : standardTaskCount;
  const tasks = Array.from({ length: taskCount }, (_, step) => {
    const routeIndex = (level - 1 + step * (level > 20 ? 3 : 2)) % story.route.length;
    const locationId = story.route[routeIndex];
    const activities = locations[locationId];
    const activity = activities[(level + step + chapterIndex) % activities.length];
    return {
      id: `${story.id}-${level}-${step + 1}`,
      activityId: activity.id,
      locationId,
      title: activity.title,
      detail: activity.detail,
      step: step + 1
    };
  });
  return {
    level,
    title: chapter.beats[(level - 1) % 5],
    chapter: chapter.title,
    chapterSummary: chapter.summary,
    difficulty,
    challengeDifficulty: chosenDifficulty[0].toUpperCase() + chosenDifficulty.slice(1),
    tasks,
    rewards: {
      points: Math.round((10 + level * 3) * (chosenDifficulty === 'easy' ? 0.75 : chosenDifficulty === 'hard' ? 1.3 : 1)),
      xp: Math.round((15 + level * 5) * (chosenDifficulty === 'easy' ? 0.85 : chosenDifficulty === 'hard' ? 1.2 : 1))
    },
    chapterFinale: level % 5 === 0,
    finalChapter: level === 40
  };
}

module.exports = { stories, locations, getStory, getMission };
