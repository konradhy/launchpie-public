import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  records: defineTable({
    userId: v.string(),
    audioFileId: v.string(),
    audioFileUrl: v.string(),
    title: v.optional(v.string()),
    transcription: v.optional(v.string()),
    summary: v.optional(v.string()),
    embedding: v.optional(v.array(v.float64())),
    generatingTranscript: v.boolean(),
    generatingTitle: v.boolean(),
    generatingActionItems: v.boolean(),
    companyId: v.id("companies"),
  })
    .index("by_userId", ["userId"])
    .index("by_companyId", ["companyId"])

    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["userId", "companyId"],
    }),

  //i think this is being replaced completely by tasks
  actionItems: defineTable({
    recordId: v.id("records"),
    userId: v.string(),
    companyId: v.id("companies"),
    task: v.string(),
    personId: v.optional(v.id("persons")),
  })
    .index("by_recordId", ["recordId"])
    .index("by_userId", ["userId"])
    .index("by_companyId", ["companyId"]),

  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string(),
    credits: v.number(),
    membership: v.string(),
    email: v.string(),
    companyId: v.optional(v.id("companies")),
    linkedPersonId: v.optional(v.id("persons")),
  }).index("by_token", ["tokenIdentifier"]),

  companies: defineTable({
    companyName: v.string(),
    email: v.string(),
    address: v.string(),
    phoneNumber: v.string(),
    industry: v.string(),
    companyActivities: v.string(),
    updatedAt: v.string(),
    userId: v.string(),
    associatedUsers: v.optional(v.array(v.string())),
    status: v.string(),
    registered: v.string(),
    taxId: v.string(),
    riskMultiplier: v.number(),
    totalPieValue: v.number(),
    meetingAgenda: v.optional(v.string()),

    shareholders: v.optional(
      v.array(
        v.object({
          personId: v.id("persons"),
          equity: v.number(),
          hourlyRate: v.number(),
        }),
      ),
    ),
    directors: v.optional(
      v.array(
        v.object({
          personId: v.id("persons"),
          title: v.string(),
        }),
      ),
    ),
  })
    .index("by_user", ["userId"])
    .index("by_companyName", ["companyName"])
    .index("by_associatedUsers", ["associatedUsers"]),

  persons: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    dob: v.string(),
    address: v.string(),
    phoneNumber: v.string(),
    updatedAt: v.string(),
    userId: v.string(),
    email: v.string(),
    linkedUserId: v.optional(v.string()),
    hourlyRate: v.number(),
    role: v.string(),
    profilePicture: v.optional(v.string()),
    companyId: v.id("companies"),
    equity: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_linkedUserId", ["linkedUserId"])
    .index("by_email", ["email"]),

  tasks: defineTable({
    title: v.optional(v.string()),
    description: v.string(),
    assignees: v.array(v.id("persons")), //this should be an array of personIds
    dueDate: v.string(),
    estimatedTime: v.number(),
    actualTime: v.optional(v.number()),
    text: v.optional(v.string()),
    taskState: v.union(
      v.literal("notStarted"),
      v.literal("inProgress"),
      v.literal("completed"),
    ),
    reviewStatus: v.union(
      v.literal("notFlagged"),
      v.literal("flagged"),
      v.literal("approved"),
    ),
    meetingAgendaFlag: v.boolean(),
    equityValue: v.number(),
    notes: v.optional(v.string()),
    userId: v.string(),
    companyId: v.id("companies"),
    createdAt: v.string(),
    updatedAt: v.string(),
    updatedBy: v.string(),
    category: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    isArchived: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_company", ["companyId"])
    .index("by_assignee", ["assignees"]) //not sure if this works with an array
    .index("by_company_and_date", ["companyId", "updatedAt"]),

  notes: defineTable({
    title: v.string(),
    userId: v.string(),
    isArchived: v.boolean(),
    parentNote: v.optional(v.id("notes")),
    content: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    icon: v.optional(v.string()),
    isPublished: v.boolean(),
    editors: v.optional(v.array(v.string())),
    companyId: v.id("companies"),
    text: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentNote"])
    .index("by_company", ["companyId"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["userId", "isArchived", "isPublished", "companyId"],
    }),

  messages: defineTable({
    isViewer: v.boolean(),
    sessionId: v.string(),
    text: v.string(),
  }).index("bySessionId", ["sessionId"]),

  files: defineTable({
    url: v.optional(v.string()),
    text: v.optional(v.string()), //not doing anything?
    storageId: v.string(),
    fileName: v.string(),
    userId: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    isArchived: v.boolean(),
    isPublished: v.boolean(),
    companyId: v.id("companies"),
    summary: v.optional(v.string()),
  })
    .index("byUrl", ["url"])
    .index("byCompanyId", ["companyId"]),

  chunks: defineTable({
    fileId: v.optional(v.id("files")),
    noteId: v.optional(v.id("notes")),
    taskId: v.optional(v.id("tasks")),
    text: v.string(),
    embeddingId: v.union(v.id("embeddings"), v.null()),
    companyId: v.id("companies"),
  })
    .index("byFileId", ["fileId"])
    .index("byNoteId", ["noteId"])
    .index("byTaskId", ["taskId"])
    .index("byEmbeddingId", ["embeddingId"]),

  // the actual embeddings
  embeddings: defineTable({
    embedding: v.array(v.number()),
    chunkId: v.id("chunks"),
    companyId: v.id("companies"),
    noteId: v.optional(v.id("notes")),
    taskId: v.optional(v.id("tasks")),
    fileId: v.optional(v.id("files")),
  })
    .index("byChunkId", ["chunkId"])
    .index("byNoteId", ["noteId"])
    .index("byTaskId", ["taskId"])
    .index("byFileId", ["fileId"])
    .vectorIndex("byEmbedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["companyId"],
    }),
});
