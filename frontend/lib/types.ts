export interface Lead {
  id: string;
  dealerId?: string | null;
  assignedToId?: string | null;
  assignedToName?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  oldModel?: string | null;
  location?: string | null;
  city?: string | null;
  leadForwardedTo: string[];
  testDrive: boolean;
  finance: boolean;
  occupation?: string | null;
  budget?: number | null;
  createdAt: Date;
  updatedAt: Date;
  category: LeadCategory;
  source: string | null;

  statusId?: string | null;
  status?: LeadStatus | null;

  lostReasonId?: string | null;
  lostReason?: LeadLostReason | null;

  Activity: Activity[];
  comments: Comment[];
}

export interface LeadStatus {
  id: string;
  name: string;
  order: number;
  lostReasons?: LeadLostReason[]; // includes lostReasons relation
}

export interface LeadLostReason {
  id: string;
  name: string;
  statusId: string;
}

export interface Comment {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  createdById?: string | null;
  createdByName?: string | null;
  createdAt: string;
}

export interface Activity {
  id: string;
  leadId: string;
  performedById?: string | null;
  performedByName?: string | null;
  type: string;
  description?: string | null;
  oldStatus?: String | null;
  newStatus?: String | null;
  oldReason?: String | null;
  newReason?: String | null;
  oldAssignee?: String | null;
  newAssignee?: String | null;
  dueDate?: string | null;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string | null;
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

  dealerId: string;
  dealer?: Dealer;
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
  type?: ActivityType;
  isViewed: boolean;
  isRead: boolean;
  createdAt: string; // Prisma DateTime -> string when sent via API
  readAt?: string | null; // optional date
  generatedById?: string | null; // who triggered
  generatedBy?: string | null; // user name or "system"
  meta?: Record<string, any> | null; // optional JSON metadata
};

export type LeadCategory = "COLD" | "WARM" | "HOT";

export type ActivityType =
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
