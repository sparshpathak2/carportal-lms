export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  alternatePhone?: string | null;
  city?: string | null;
}

export interface LeadStatus {
  id: string;
  name: string;
  order: number;
  lostReasons?: LeadLostReason[]; // includes lostReasons relation
}

export interface LeadAssignment {
  id: string;
  leadId: string;
  dealerId: string;
  assignedToId: string;
  assignedToName: string;
  assignedById?: string | null;
  assignedByName?: string | null;
  assignedAt: string;
  isActive: boolean;
  deliveredMetricFlag: boolean;
  convertedMetricFlag: boolean;
  status?: LeadStatus | null;
  lostReason?: LeadLostReason | null;
  category: "COLD" | "WARM" | "HOT";
  createdAt: string;
  updatedAt: string;
}

export interface LeadAnalytics {
  id: string;
  leadId: string;
  internalUserId?: string | null;
  dealerId?: string | null;
  firstDeliveredAt?: string | null;
  firstConvertedAt?: string | null;
  deliveredMetricFlag: boolean;
  convertedMetricFlag: boolean;
  currentStatusOrder?: number | null;
  lastStatusChangedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;

  customer: Customer;

  oldModel?: string | null;
  testDrive: boolean;
  finance: boolean;
  occupation?: string | null;
  budget?: number | null;

  category: "COLD" | "WARM" | "HOT";
  source?: string | null;

  status?: LeadStatus | null;
  lostReason?: any; // or create type if needed

  leadAssignments: LeadAssignment[];
  analytics?: LeadAnalytics | null;

  adId?: string | null;
  adsetId?: string | null;
  campaignId?: string | null;

  adName?: string | null;
  adsetName?: string | null;
  campaignName?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface LeadLostReason {
  id: string;
  name: string;
  statusId: string;
}

export interface Comment {
  id: string;
  leadId: string;
  type: LeadActivityType;
  description: string;
  createdById?: string | null;
  createdByName?: string | null;
  createdAt: string;
}

// export interface Activity {
//   id: string;
//   leadId: string;
//   performedById?: string | null;
//   performedByName?: string | null;
//   type: string;
//   description?: string | null;
//   oldStatus?: String | null;
//   newStatus?: String | null;
//   oldReason?: String | null;
//   newReason?: String | null;
//   oldAssignee?: String | null;
//   newAssignee?: String | null;
//   dueDate?: string | null;
//   completed: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

export interface LeadActivity {
  id: string;

  leadId: string;
  lead: Lead;

  dealerAssignmentId?: string | null;
  dealerAssignment?: LeadAssignment | null;

  performedById?: string | null;
  performedByName?: string | null;

  type: LeadActivityType;
  description?: string | null;

  oldStatus?: string | null;
  newStatus?: string | null;

  oldCategory?: string | null;
  newCategory?: string | null;

  oldReason?: string | null;
  newReason?: string | null;

  oldAssignee?: string | null;
  newAssignee?: string | null;

  dueDate?: Date | null;
  completed: boolean;

  createdAt: Date;
  updatedAt: Date;

  task?: Task | null;
}

// export interface LeadAnalytics {
//   id: string;
//   leadId: string;

//   internalUserId?: string | null;
//   dealerId?: string | null;

//   firstDeliveredAt?: Date | null;
//   firstConvertedAt?: Date | null;

//   deliveredMetricFlag: boolean;
//   convertedMetricFlag: boolean;

//   currentStatusOrder?: number | null;
//   lastStatusChangedAt?: Date | null;

//   createdAt: Date;
//   updatedAt: Date;
// }

// export interface LeadDealerAssignment {
//   id: string;

//   leadId: string;
//   lead: Lead;

//   dealerId: string;
//   assignedToId: string;
//   assignedById?: string | null;
//   assignedAt: Date;

//   isActive: boolean;

//   deliveredMetricFlag: boolean;
//   convertedMetricFlag: boolean;

//   leadActivity: LeadActivity[];

//   createdAt: Date;
//   updatedAt: Date;
// }

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  location?: string | null;
  city?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // User belongs to 1 dealer (optional for super admins)
  dealerId?: string | null;
  dealer?: Dealer | null;

  // Role
  roleId: string;
  role: Role;

  leadTarget?: number | null;

  // Dealers this user owns (many-to-many via DealerOwner)
  ownerOf?: DealerOwner[];

  sessions?: Session[];
}

export interface Dealer {
  id: string;
  name: string;
  gstNumber?: string | null;
  city?: string | null;
  address?: string | null;
  type: "PREMIUM" | "REGULAR";
  createdAt: Date;
  updatedAt: Date;

  // Users under this dealer
  users?: User[];

  // Packs belonging to this dealer
  packs?: Pack[];

  // Users who own this dealer (many-to-many)
  owners?: DealerOwner[];
}

export interface DealerOwner {
  id: string;
  userId: string;
  dealerId: string;
  createdAt: Date;

  user?: User;
  dealer?: Dealer;
}

export interface Role {
  id: string;
  name: string; // e.g. SUPER_ADMIN, ADMIN, SALES, SUPPORT
  users?: User[];
}

export interface Pack {
  id: string;
  name: string;
  targetLeads: number;
  packCost: number;
  cycleStartDate: Date;
  createdAt: Date;
  updatedAt: Date;

  // Foreign key
  dealerId: string;

  // Relation
  dealer?: Dealer;

  // Pack Type
  packType: "LEADS" | "DIGITAL_MARKETING";
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;

  user: User;
}

export type Notification = {
  id: string; // matches Prisma 'String @id @default(cuid())'
  userId: string; // recipient user ID
  title: string;
  message?: string; // optional
  type?: LeadActivityType;
  isViewed: boolean;
  isRead: boolean;
  createdAt: string; // Prisma DateTime -> string when sent via API
  readAt?: string | null; // optional date
  generatedById?: string | null; // who triggered
  generatedBy?: string | null; // user name or "system"
  meta?: Record<string, any> | null; // optional JSON metadata
};

export interface Task {
  id: string;

  leadActivityId: string;
  leadActivity: LeadActivity;

  title: string;

  assignedToId?: string | null;
  assignedToName?: string | null;

  dueDate: Date;
  completed: boolean;

  notifications: Notification[];

  createdAt: Date;
  updatedAt: Date;
}

export type LeadCategory = "COLD" | "WARM" | "HOT";

export type LeadActivityType =
  | "LEAD_ADDED"
  | "COMMENT"
  | "CALL"
  | "MEETING"
  | "TEST_DRIVE"
  | "STATUS_UPDATE"
  | "ASSIGNMENT"
  | "CALLBACK"
  | "FINANCE"
  | "EMAIL"
  | "OTHER";
