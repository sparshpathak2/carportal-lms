import { axiosInstance } from "@/lib/axios";
import { LeadActivity, LeadActivityType } from "@/lib/types";

// -------------------- LEADS --------------------

// Create a new lead
export const createLead = async (data: {
  dealerId?: string;
  assignedToId?: string;
  assignedToName?: string;
  name: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  oldModel?: string;
  location?: string;
  city?: string;
  leadForwardedTo?: string[];
  testDrive?: boolean | "Yes" | "No";
  finance?: boolean | "Yes" | "No";
  occupation?: string;
  budget?: number | string;
  status?: string; // status name
  lostReason?: string; // optional lost reason if Lost
}) => {
  const res = await axiosInstance.post("/lead/leads", data);
  return res.data;
};

// Fetch all leads
export const getLeads = async () => {
  const res = await axiosInstance.get("/lead/leads");
  return res.data;
};

export const getLeadsWithFilters = async (filters?: Record<string, any>) => {
  const queryParams = filters
    ? new URLSearchParams(filters as any).toString()
    : "";
  const res = await axiosInstance.get(
    `/lead/leads${queryParams ? `?${queryParams}` : ""}`
  );
  return res.data;
};

// Get a single lead by ID
export const getLeadById = async (id: string) => {
  const res = await axiosInstance.get(`/lead/leads/${id}`);
  return res.data;
};

// Edit (update) a lead
export const editLead = async (id: string, data: any) => {
  const res = await axiosInstance.put(`/lead/leads/${id}`, data);
  return res.data;
};

// Delete a lead
export const deleteLead = async (id: string) => {
  const res = await axiosInstance.delete(`/lead/leads/${id}`);
  return res.data;
};

// Bulk upload leads
export const bulkUploadLeads = async (data: any[]) => {
  const res = await axiosInstance.post("/lead/leads/bulk-upload", { data });
  return res.data;
};

// -------------------- ACTIVITIES --------------------

// Fetch activities by lead ID
export const getActivitiesByLeadId = async (leadId: string) => {
  const res = await axiosInstance.get<{
    success: boolean;
    data: LeadActivity[];
  }>(`/lead/activities/lead/${leadId}`);
  return res.data;
};

// -------------------- SOURCES --------------------

// Fetch distinct lead sources
export const getLeadSources = async () => {
  const res = await axiosInstance.get("/lead/sources");
  return res.data;
};

// -------------------- STATUSES --------------------

// Fetch all statuses
export const getLeadStatuses = async () => {
  const res = await axiosInstance.get("/lead/statuses");
  return res.data;
};

// Get a single status by ID
export const getLeadStatusById = async (id: string) => {
  const res = await axiosInstance.get(`/lead/statuses/${id}`);
  return res.data;
};

// Create a new status
export const createLeadStatus = async (data: {
  name: string;
  order?: number;
}) => {
  const res = await axiosInstance.post("/lead/statuses", data);
  return res.data;
};

// Update a status
export const editLeadStatus = async (
  id: string,
  data: { name?: string; order?: number }
) => {
  const res = await axiosInstance.put(`/lead/statuses/${id}`, data);
  return res.data;
};

// Delete a status
export const deleteLeadStatus = async (id: string) => {
  const res = await axiosInstance.delete(`/lead/statuses/${id}`);
  return res.data;
};

// -------------------- COMMENTS --------------------

// Fetch comments by lead ID
export const getCommentsByLeadId = async (leadId: string) => {
  const res = await axiosInstance.get<{ success: boolean; data: any[] }>(
    `/lead/comments/lead/${leadId}`
  );
  return res.data;
};

// Create a new comment
export const createComment = async (data: {
  leadId: string;
  type: LeadActivityType;
  description: string;
  leadAssignmentId?: string | null;
  dueDate?: string; // optional ISO string
}) => {
  const res = await axiosInstance.post<{ success: boolean; data: any }>(
    "/lead/comments",
    data
  );
  return res.data;
};

// Update a comment
export const editComment = async (
  id: string,
  data: Partial<{ description: string; dueDate?: string }>
) => {
  const res = await axiosInstance.put<{ success: boolean; data: any }>(
    `/lead/comments/${id}`,
    data
  );
  return res.data;
};

// Delete a comment
export const deleteComment = async (id: string) => {
  const res = await axiosInstance.delete<{ success: boolean }>(
    `/lead/comments/${id}`
  );
  return res.data;
};

// -------------------- USER FILTERS --------------------

// Save user filters for the "leads" dashboard
export const saveUserFilters = async (filters: Record<string, any>) => {
  const res = await axiosInstance.post("/filters/save", {
    type: "leads",
    filters,
  });
  return res.data;
};

// Get user filters for the "leads" dashboard
export const getUserFilters = async () => {
  const res = await axiosInstance.get("/filters/get?type=leads");
  return res.data;
};

// Combined utility: get saved filters and then fetch leads
export const getLeadsWithUserFilters = async () => {
  const saved = await getUserFilters();
  const filters = saved?.data || {};
  const leads = await getLeadsWithFilters(filters);
  return { filters, leads };
};
