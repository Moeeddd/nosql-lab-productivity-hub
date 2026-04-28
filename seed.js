// seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connect } = require('./db/connection');

(async () => {
  const db = await connect();

  // Clear existing data so re-seeding is idempotent
  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
  await db.collection('notes').deleteMany({});

  console.log('Seeding database...');

  const hash = await bcrypt.hash('password123', 10);

  // 1. Users
  const user1 = await db.collection('users').insertOne({
    email: 'moeed@test.com',
    passwordHash: hash,
    name: 'Moeed Ali',
    createdAt: new Date()
  });
  const u1Id = user1.insertedId;

  const user2 = await db.collection('users').insertOne({
    email: 'dev@test.com',
    passwordHash: hash,
    name: 'Dev Account',
    createdAt: new Date()
  });
  const u2Id = user2.insertedId;

  // 2. Projects
  const p1 = await db.collection('projects').insertOne({ userId: u1Id, title: 'VeloRent Deployment', isArchived: false });
  const p2 = await db.collection('projects').insertOne({ userId: u1Id, title: 'Compact Kitchen Design', isArchived: false });
  const p3 = await db.collection('projects').insertOne({ userId: u2Id, title: 'DriveEasy UI', isArchived: false });
  const p4 = await db.collection('projects').insertOne({ userId: u2Id, title: 'Network Engineering Notes', isArchived: true });

  // 3. Tasks
  await db.collection('tasks').insertMany([
    {
      projectId: p1.insertedId,
      title: 'Configure Vercel Environment Variables',
      status: 'todo',
      priority: 1,
      tags: ['deployment', 'urgent'],
      subtasks: [
        { title: 'Add DB_URI', done: true },
        { title: 'Set JWT_SECRET', done: false }
      ],
      dueDate: new Date('2026-05-01') // Schema flexibility: some tasks have due dates
    },
    {
      projectId: p1.insertedId,
      title: 'Test Render & Railway fallback',
      status: 'in-progress',
      priority: 2,
      tags: ['testing'],
      subtasks: []
    },
    {
      projectId: p2.insertedId,
      title: 'Draft 6x4 layout mockup',
      status: 'done',
      priority: 2,
      tags: ['design'],
      subtasks: [{ title: 'Measure hardware constraints', done: true }]
      // Schema flexibility: dueDate omitted here
    },
    {
      projectId: p3.insertedId,
      title: 'Car details screen UI',
      status: 'in-progress',
      priority: 1,
      tags: ['flutter', 'ui'],
      subtasks: [{ title: 'Add booking confirmation dialog', done: false }]
    },
    {
      projectId: p4.insertedId,
      title: 'Review VLSM subnet boundaries',
      status: 'todo',
      priority: 3,
      tags: ['study', 'networking'],
      subtasks: []
    }
  ]);

  // 4. Notes
  await db.collection('notes').insertMany([
    { userId: u1Id, projectId: p1.insertedId, content: 'Need to check the build logs on Render if the deploy fails.', tags: ['ops'] },
    { userId: u1Id, projectId: p2.insertedId, content: 'Keep the sink and stove separated in the 6x4 footprint.' },
    { userId: u1Id, content: 'Buy groceries: Milk, Eggs, Bread.', tags: ['personal'] }, // Standalone note (no projectId)
    { userId: u2Id, projectId: p3.insertedId, content: 'Use the new asset pack for the app icon.' },
    { userId: u2Id, content: 'Lab session with Jalal Ahmed today.' } // Standalone note (no projectId)
  ]);

  console.log('Seed complete!');
  process.exit(0);
})();