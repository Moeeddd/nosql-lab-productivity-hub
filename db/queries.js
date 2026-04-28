// db/queries.js
//
// =============================================================================
//  THIS IS THE FILE YOU EDIT.
// =============================================================================

const { ObjectId } = require('mongodb');

/**
 * Query 1: signupUser
 */
async function signupUser(db, userData) {
  const doc = {
    ...userData,
    createdAt: new Date()
  };
  const result = await db.collection('users').insertOne(doc);
  return { insertedId: result.insertedId };
}

/**
 * Query 2: loginFindUser
 */
async function loginFindUser(db, email) {
  return await db.collection('users').findOne({ email });
}

/**
 * Query 3: listUserProjects
 */
async function listUserProjects(db, ownerId) {
  return await db.collection('projects')
    .find({ ownerId, archived: false })
    .sort({ createdAt: -1 })
    .toArray();
}

/**
 * Query 4: createProject
 */
async function createProject(db, projectData) {
  const doc = {
    ...projectData,
    archived: false,
    createdAt: new Date()
  };
  const result = await db.collection('projects').insertOne(doc);
  return { insertedId: result.insertedId };
}

/**
 * Query 5: archiveProject
 */
async function archiveProject(db, projectId) {
  const result = await db.collection('projects').updateOne(
    { _id: projectId },
    { $set: { archived: true } }
  );
  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}

/**
 * Query 6: listProjectTasks
 */
async function listProjectTasks(db, projectId, status) {
  const filter = { projectId };
  if (status) {
    filter.status = status;
  }
  
  return await db.collection('tasks')
    .find(filter)
    .sort({ priority: -1, createdAt: -1 })
    .toArray();
}

/**
 * Query 7: createTask
 */
async function createTask(db, taskData) {
  const doc = {
    ...taskData,
    priority: taskData.priority ?? 1,
    tags: taskData.tags || [],
    subtasks: taskData.subtasks || [],
    status: "todo",
    createdAt: new Date()
  };
  
  const result = await db.collection('tasks').insertOne(doc);
  return { insertedId: result.insertedId };
}

/**
 * Query 8: updateTaskStatus
 */
async function updateTaskStatus(db, taskId, newStatus) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    { $set: { status: newStatus } }
  );
  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}

/**
 * Query 9: addTaskTag
 */
async function addTaskTag(db, taskId, tag) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    { $addToSet: { tags: tag } }
  );
  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}

/**
 * Query 10: removeTaskTag
 */
async function removeTaskTag(db, taskId, tag) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    { $pull: { tags: tag } }
  );
  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}

/**
 * Query 11: toggleSubtask
 */
async function toggleSubtask(db, taskId, subtaskTitle, newDone) {
  const result = await db.collection('tasks').updateOne(
    { _id: taskId, "subtasks.title": subtaskTitle },
    { $set: { "subtasks.$.done": newDone } }
  );
  return { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount };
}

/**
 * Query 12: deleteTask
 */
async function deleteTask(db, taskId) {
  const result = await db.collection('tasks').deleteOne({ _id: taskId });
  return { deletedCount: result.deletedCount };
}

/**
 * Query 13: searchNotes
 */
async function searchNotes(db, ownerId, tags, projectId) {
  const filter = { 
    ownerId, 
    tags: { $in: tags } 
  };
  if (projectId) {
    filter.projectId = projectId;
  }

  return await db.collection('notes')
    .find(filter)
    .sort({ createdAt: -1 })
    .toArray();
}

/**
 * Query 14: projectTaskSummary
 */
async function projectTaskSummary(db, ownerId) {
  return await db.collection('tasks').aggregate([
    { $match: { ownerId } },
    { 
      $group: {
        _id: "$projectId",
        todo: { $sum: { $cond: [{ $eq: ["$status", "todo"] }, 1, 0] } },
        inProgress: { $sum: { $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0] } },
        done: { $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] } },
        total: { $sum: 1 }
      }
    },
    { 
      $lookup: { 
        from: "projects", 
        localField: "_id", 
        foreignField: "_id", 
        as: "project" 
      } 
    },
    { $unwind: "$project" },
    { 
      $project: {
        projectName: "$project.name",
        todo: 1,
        inProgress: 1,
        done: 1,
        total: 1
      }
    }
  ]).toArray();
}

/**
 * Query 15: recentActivityFeed
 */
async function recentActivityFeed(db, ownerId) {
  return await db.collection('tasks').aggregate([
    { $match: { ownerId } },
    { $sort: { createdAt: -1 } },
    { $limit: 10 },
    { 
      $lookup: { 
        from: "projects", 
        localField: "projectId", 
        foreignField: "_id", 
        as: "project" 
      } 
    },
    { $unwind: "$project" },
    { 
      $project: {
        title: 1,
        status: 1,
        priority: 1,
        createdAt: 1,
        projectId: 1,
        projectName: "$project.name"
      }
    }
  ]).toArray();
}

// =============================================================================
//  EXPORTS — do not edit
// =============================================================================
module.exports = {
  signupUser,
  loginFindUser,
  listUserProjects,
  createProject,
  archiveProject,
  listProjectTasks,
  createTask,
  updateTaskStatus,
  addTaskTag,
  removeTaskTag,
  toggleSubtask,
  deleteTask,
  searchNotes,
  projectTaskSummary,
  recentActivityFeed
};