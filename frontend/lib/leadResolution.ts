import {
  Lead,
  LeadAssignment,
  LeadCategory,
  LeadStatus,
  User,
} from "@/lib/types";

export function pickLatestNonEmpty<T>(
  arr: LeadAssignment[],
  selector: (a: LeadAssignment) => T | null | undefined
): T | null {
  const sorted = arr
    .filter((a) => selector(a))
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

  return sorted.length > 0 ? selector(sorted[0])! : null;
}

export function resolveLeadComputedFields(
  lead: Lead,
  loggedInUser: User | null
) {
  const assignments = lead.leadAssignments || [];
  const loggedInDealerId = loggedInUser?.dealerId;
  const loggedInUserId = loggedInUser?.id;

  const activeAssignment = assignments.find((a) => a.isActive);
  const isUserActiveOwner = activeAssignment?.assignedToId === loggedInUserId;

  let fallbackAssignment: LeadAssignment | null = null;

  if (!isUserActiveOwner) {
    const dealerAssignments = assignments
      .filter((a) => a.dealerId === loggedInDealerId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    fallbackAssignment =
      dealerAssignments[0] ??
      assignments
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0] ??
      null;
  }

  const usedAssignment = isUserActiveOwner
    ? activeAssignment
    : fallbackAssignment;

  // STATUS
  const latestStatus = pickLatestNonEmpty(assignments, (a) => a.status);
  const resolvedStatus = isUserActiveOwner
    ? activeAssignment?.status?.name ?? lead.status?.name ?? "New"
    : latestStatus?.name ?? lead.status?.name ?? "New";

  // LOST REASON
  const latestLostReason = pickLatestNonEmpty(assignments, (a) => a.lostReason);
  const resolvedLeadLostReason = isUserActiveOwner
    ? activeAssignment?.lostReason?.name ?? lead.lostReason?.name ?? ""
    : latestLostReason?.name ?? lead.lostReason?.name ?? "";

  // CATEGORY
  const latestCategory = pickLatestNonEmpty(assignments, (a) => a.category);
  const resolvedCategory: LeadCategory = isUserActiveOwner
    ? activeAssignment?.category ?? lead.category ?? "COLD"
    : latestCategory ?? lead.category ?? "COLD";

  // OWNER
  //   const resolvedAssignedToName =
  //     usedAssignment?.assignedToName ?? lead.assignedToName ?? "NA";
  const resolvedAssignedToId: string = usedAssignment?.assignedToId ?? "NA";
  const resolvedAssignedToName: string = usedAssignment?.assignedToName ?? "NA";

  // DEALER
  //   const resolvedAssignedToName =
  //     usedAssignment?.assignedToName ?? lead.assignedToName ?? "NA";
  const resolvedDealerId: string = usedAssignment?.dealerId ?? "NA";

  // DATE CREATED (first assignment for dealerId)
  const dealerAssignments = assignments
    .filter((a) => a.dealerId === loggedInDealerId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() // ascending -> first assignment
    );
  const firstDealerAssignment = dealerAssignments[0] ?? null;
  const resolvedDateCreated =
    firstDealerAssignment?.createdAt ?? lead.createdAt ?? null;

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
