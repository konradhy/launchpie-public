import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
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
    files: v.optional(
      v.array(
        v.object({
          storageId: v.string(),
          fileName: v.string(),
          userId: v.string(),
          createdAt: v.string(),
          updatedAt: v.string(),
          isArchived: v.boolean(),
          isPublished: v.boolean(),
        }),
      ),
    ),
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
    .index("by_companyName", ["companyName"]),

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
    companyId: v.optional(v.id("companies")), //made mandatory later
  })
    .index("by_user", ["userId"])
    .index("by_linkedUserId", ["linkedUserId"]),

  tasks: defineTable({
    title: v.optional(v.string()),
    description: v.string(),
    assignees: v.array(v.string()), //this should be an array of personIds
    dueDate: v.string(),
    estimatedTime: v.number(),
    actualTime: v.optional(v.number()),
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
    companyId: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    updatedBy: v.string(),
    category: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    isArchived: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_company", ["companyId"])
    .index("by_assignee", ["assignees"]), //not sure if this works with an array

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
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentNote"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["userId", "isArchived", "isPublished"],
    }),

  messages: defineTable({
    isViewer: v.boolean(),
    sessionId: v.string(),
    text: v.string(),
  }).index("bySessionId", ["sessionId"]),

  documents: defineTable({
    url: v.optional(v.string()),
    text: v.optional(v.string()),
    storageId: v.string(),
    fileName: v.string(),
    userId: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    isArchived: v.boolean(),
    isPublished: v.boolean(),
    companyId: v.id("companies"),
  })
    .index("byUrl", ["url"])
    .index("byCompanyId", ["companyId"]),

  chunks: defineTable({
    documentId: v.id("documents"),
    text: v.string(),
    embeddingId: v.union(v.id("embeddings"), v.null()),
  })
    .index("byDocumentId", ["documentId"])
    .index("byEmbeddingId", ["embeddingId"]),

  // the actual embeddings
  embeddings: defineTable({
    embedding: v.array(v.number()),
    chunkId: v.id("chunks"),
  })
    .index("byChunkId", ["chunkId"])
    .vectorIndex("byEmbedding", {
      vectorField: "embedding",
      dimensions: 1536,
    }),
});
