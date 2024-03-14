import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";

export const store = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called storeUser without authenticated user");
        }

        // check if user is already stored
        const user = await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();

        if (user !== null) {
            return user._id;
        }

        const userId = await ctx.db.insert("users", {
            tokenIdentifier: identity.tokenIdentifier,
            email: identity.email!,
        });

        return userId;
    }
});

export const currentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called selectGPT without authenticated user");
        }

        return await ctx.db
            .query("users")
            .withIndex("by_token", (q) =>
                q.eq("tokenIdentifier", identity.tokenIdentifier))
            .unique();
    }
})


//update subscription
export const updateSubscription = internalMutation({
    args: { subscriptionId: v.string(), userId: v.id("users"), endsOn: v.number() },
    handler: async (ctx, { subscriptionId, userId, endsOn }) => {
        await ctx.db.patch(userId, {
            subscriptionId: subscriptionId,
            endsOn: endsOn
        });
    },
});

//update subscription by id
export const updateSubscriptionById = internalMutation({
    args: { subscriptionId: v.string(), endsOn: v.number() },
    handler: async (ctx, { subscriptionId, endsOn }) => {
        const user = await ctx.db.query("users")
            .withIndex("by_subscriptionId", (q) => q.eq("subscriptionId", subscriptionId))
            .unique();

        if (!user) {
            throw new Error("User not found!");
        }

        await ctx.db.patch(user._id, {
            endsOn: endsOn
        });
    },
});