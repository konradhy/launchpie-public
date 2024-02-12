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
  })
    .index("by_user", ["userId"])
    .index("by_linkedUserId", ["linkedUserId"]),
    
    tasks: defineTable({
    title: v.optional(v.string()), 
    description: v.string(),
    assignees: v.array(v.string()),
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


})