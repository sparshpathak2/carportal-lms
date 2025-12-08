import axios from "axios";

export async function handleLeadUpdated(oldLead, newLead) {
    // -------------------------------------
    // Status changed → notify user-service
    // -------------------------------------
    if (oldLead.statusId !== newLead.statusId) {
        await sendEvent("LEAD_STATUS_CHANGED", {
            leadId: newLead.id,
            dealerId: newLead.dealerId,
            assignedToId: newLead.assignedToId,
            oldStatus: oldLead.statusId,
            newStatus: newLead.statusId
        });
    }

    // -------------------------------------
    // Assignment changed
    // -------------------------------------
    if (oldLead.assignedToId !== newLead.assignedToId) {
        await sendEvent("LEAD_ASSIGNED", {
            leadId: newLead.id,
            dealerId: newLead.dealerId,
            oldAssignedTo: oldLead.assignedToId,
            newAssignedTo: newLead.assignedToId
        });
    }

    // -------------------------------------
    // Lost reason changed
    // -------------------------------------
    // if (oldLead.lostReasonId !== newLead.lostReasonId) {
    //     await sendEvent("LEAD_LOST_REASON_UPDATED", {
    //         leadId: newLead.id,
    //         dealerId: newLead.dealerId
    //     });
    // }
}

async function sendEvent(type, payload) {
    try {
        await axios.post("http://user-service:3002/events", { type, payload });
    } catch (err) {
        console.error("Failed to send event:", type, err.message);
    }
}
