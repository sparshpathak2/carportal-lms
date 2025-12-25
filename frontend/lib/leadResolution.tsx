import {
    Lead,
    LeadAssignment,
    LeadCategory,
    User,
} from "@/lib/types";

const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function isAdmin(user: User | null) {
    return ADMIN_ROLES.includes(user?.role?.name ?? "");
}

function pickLatestActivity<T>(
    activities: any[],
    type: string,
    selector: (a: any) => T | null | undefined
): T | null {
    const latest = activities
        .filter((a) => a.type === type && selector(a) != null)
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];

    return latest ? selector(latest)! : null;
}

function pickUserActiveAssignment(
    assignments: LeadAssignment[],
    userId?: string
) {
    if (!userId) return null;
    return assignments.find(
        (a) => a.isActive && a.assignedToId === userId
    ) ?? null;
}

function pickAnyActiveAssignment(assignments: LeadAssignment[]) {
    return (
        assignments
            .filter((a) => a.isActive)
            .sort(
                (a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            )[0] ?? null
    );
}

// --------------------------------------------------
// MAIN RESOLVER
// --------------------------------------------------

export function resolveLeadComputedFields(
    lead: Lead,
    loggedInUser: User | null
) {
    const assignments = lead.leadAssignments ?? [];
    const activities = lead.leadActivity ?? [];

    const userId = loggedInUser?.id;
    const dealerId = loggedInUser?.dealerId;
    const admin = isAdmin(loggedInUser);

    // --------------------------------------------
    // Assignment Resolution
    // --------------------------------------------
    const userActiveAssignment = pickUserActiveAssignment(assignments, userId);
    const adminActiveAssignment = pickAnyActiveAssignment(assignments);

    const resolvedAssignment =
        userActiveAssignment ??
        (admin ? adminActiveAssignment : null);

    // --------------------------------------------
    // STATUS
    // --------------------------------------------
    const activityStatus = pickLatestActivity(
        activities,
        "STATUS_UPDATE",
        (a) => a.newStatus
    );

    const resolvedStatus =
        resolvedAssignment?.status?.name ??
        activityStatus ??
        (admin ? lead.status?.name ?? "New" : "New");

    // --------------------------------------------
    // LOST REASON
    // --------------------------------------------
    const activityLostReason = pickLatestActivity(
        activities,
        "LOST_REASON_UPDATE",
        (a) => a.newReason
    );

    const resolvedLeadLostReason =
        resolvedAssignment?.lostReason?.name ??
        activityLostReason ??
        (admin ? lead.lostReason?.name ?? "" : "");

    // --------------------------------------------
    // CATEGORY
    // --------------------------------------------
    const activityCategory = pickLatestActivity(
        activities,
        "CATEGORY_UPDATE",
        (a) => a.newCategory
    );

    const resolvedCategory: LeadCategory =
        resolvedAssignment?.category ??
        activityCategory ??
        (admin ? lead.category ?? "COLD" : "COLD");

    // --------------------------------------------
    // ASSIGNEE / DEALER
    // --------------------------------------------
    const resolvedAssignedToId =
        resolvedAssignment?.assignedToId ?? "NA";

    const resolvedAssignedToName =
        resolvedAssignment?.assignedToName ?? "NA";

    // const resolvedDealerId =
    //     resolvedAssignment?.dealerId ??
    //     (admin ? lead.customer?.dealerId ?? "NA" : "NA");

    const resolvedDealerId =
        resolvedAssignment?.dealerId ?? "NA";


    // --------------------------------------------
    // DATE CREATED (Dealer-specific)
    // --------------------------------------------
    const firstDealerAssignment =
        assignments
            .filter((a) => a.dealerId === dealerId)
            .sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            )[0] ?? null;

    const resolvedDateCreated =
        firstDealerAssignment?.createdAt ??
        (admin ? lead.createdAt ?? null : null);

    return {
        resolvedStatus,
        resolvedCategory,
        resolvedAssignedToId,
        resolvedAssignedToName,
        resolvedLeadLostReason,
        resolvedDateCreated,
        resolvedDealerId,
    };
}
