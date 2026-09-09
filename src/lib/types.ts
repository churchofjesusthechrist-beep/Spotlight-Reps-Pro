export interface RepProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isAdmin: boolean;
  createdAt?: string;
  lastActiveAt?: string;
}

export type ProspectType = 'Restaurant' | 'Sponsor';

export type ProspectStatus =
  | 'New'
  | 'Contacted'
  | 'Replied'
  | 'Not Interested'
  | 'Converted';

export interface Prospect {
  id: string;
  assignedRepId: string;
  type: ProspectType;
  businessName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  reasonFlagged?: string; // why AI thinks this is a good lead (e.g. "no website found")
  status: ProspectStatus;
  source: 'AI' | 'Manual';
  createdAt: string;
  lastContactedAt?: string;
  convertedBoardId?: string;
}

export interface Reminder {
  id: string;
  repId: string;
  relatedType: 'Prospect' | 'Board' | 'Sponsor' | 'General';
  relatedId?: string;
  title: string;
  dueDate: string;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export type BoardStatus = 
  | 'Restaurant Prospect'
  | 'Restaurant Accepted'
  | 'Collecting Referrals'
  | 'Selling Sponsors'
  | 'Ready to Order'
  | 'Ordered'
  | 'Delivered'
  | 'Renewal';

export interface Board {
  id: string;
  createdAt: string;
  assignedRepId: string;
  restaurantName: string;
  restaurantContactName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  status: BoardStatus;
  
  // Workflow fields
  orderDate?: string;
  printerVendor?: string;
  orderCost?: number;
  expectedDeliveryDate?: string;
  trackingNumber?: string;
  orderNotes?: string;
  
  deliveryDate?: string;
  deliveryNotes?: string;
}

export interface Referral {
  id: string;
  boardId: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  businessType: string;
  relationship: string;
  notes: string;
  createdAt: string;
}

export type SponsorStatus = 
  | 'Not Contacted'
  | 'Contacted'
  | 'Interested'
  | 'Invoice Sent'
  | 'Paid'
  | 'Declined'
  | 'Follow Up';

export type PaymentStatus = 
  | 'Invoice Not Sent'
  | 'Invoice Sent'
  | 'Payment Pending'
  | 'Paid';

export interface Sponsor {
  id: string;
  boardId: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  referralSource: string;
  spotNumber: number; // 1-6
  annualPrice: number;
  status: SponsorStatus;
  paymentStatus: PaymentStatus;
  notes: string;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  createdAt: string;
  
  invoiceDate?: string;
  paymentDate?: string;
  amountPaid?: number;
  paymentMethod?: string;
  transactionReference?: string;
}

export interface FollowUp {
  id: string;
  sponsorId: string;
  boardId: string;
  dueDate: string;
  notes: string;
  completed: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  boardId: string;
  sponsorId?: string;
  type: string; // e.g., 'Status Changed', 'Payment Recorded'
  description: string;
  timestamp: string;
}

export type ScriptCategory = 'Restaurant' | 'Sponsor' | 'Objection' | 'Other';

export interface Script {
  id: string;
  title: string;
  content: string;
  category: ScriptCategory;
  updatedAt: string;
}
