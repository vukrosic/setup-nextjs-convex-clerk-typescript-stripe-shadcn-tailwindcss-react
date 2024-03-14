import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        tokenIdentifier: v.string(),
        email: v.string(),
        endsOn: v.optional(v.number()),
        subscriptionId: v.optional(v.string()),
    })
        .index("by_token", ["tokenIdentifier"])
        .index("by_subscriptionId", ["subscriptionId"]),
});