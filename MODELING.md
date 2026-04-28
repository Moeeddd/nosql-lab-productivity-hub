# Schema Design — Personal Productivity Hub

> Fill in every section below. Keep answers concise.

---

## 1. Collections Overview

Briefly describe each collection (1–2 sentences each):

- **users** — Stores basic account details and login credentials.
- **projects** — High-level folders that group related tasks and notes together.
- **tasks** — Action items that belong to a project, tracking progress, priority, and sub-steps.
- **notes** — Freeform text entries that can be standalone brain dumps or linked to a specific project.

---

## 2. Document Shapes

For each collection, write the document shape (field name + type + required/optional):

### users
{
  _id: ObjectId,
  email: string (required, unique),
  passwordHash: string (required),
  name: string (required),
  createdAt: Date (required)
}

### projects
{
  _id: ObjectId,
  userId: ObjectId (required),
  title: string (required),
  isArchived: boolean (required) 
}

### tasks
{
  _id: ObjectId,
  projectId: ObjectId (required),
  title: string (required),
  status: string (required),
  priority: number (required),
  tags: array of strings (optional),
  subtasks: array of objects [{ title: string, done: boolean }] (optional)
}

### notes
{
  _id: ObjectId,
  userId: ObjectId (required),
  projectId: ObjectId (optional),
  content: string (required),
  tags: array of strings (optional)
}

---

## 3. Embed vs Reference — Decisions

For each relationship, state whether you embedded or referenced, and **why** (one sentence):

| Relationship                       | Embed or Reference? | Why? |
|------------------------------------|---------------------|------|
| Subtasks inside a task             | Embed               | They are owned completely by the parent task and always read together. |
| Tags on a task                     | Embed               | It's just a simple array of strings that doesn't need its own separate collection. |
| Project → Task ownership           | Reference           | Tasks are queried independently and an embedded task array could grow too large over time. |
| Note → optional Project link       | Reference           | Notes are often queried on their own and only occasionally linked to a project. |

---

## 4. Schema Flexibility Example

Name one field that exists on **some** documents but not **all** in the same collection. Explain why this is acceptable (or even useful) in MongoDB.

> The `projectId` field inside the `notes` collection. Since some notes are standalone while others are tied to a project, MongoDB lets us omit the field entirely on standalone notes because documents in the same collection don't require identical schemas. This saves us from managing empty or null columns like we would in SQL.