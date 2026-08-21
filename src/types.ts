export type CategoryType =
  | 'GBV'
  | 'Economic Barrier'
  | 'Healthcare Denial'
  | 'Land/property rights'
  | 'Education Barrier'
  | 'Other';

export type TargetUserType =
  | 'GBV victims'
  | 'women'
  | 'girls'
  | 'men'
  | 'boys'
  | 'sex workers';

export type UrgencyType = 'Low' | 'Medium' | 'High' | 'Critical';

export type ReportStatusType = 'Pending' | 'Classified' | 'Actioned' | 'Referred';

export interface AssignedResource {
  type: string;
  name: string;
  contact: string;
  status: 'Pending' | 'Dispatched' | 'Completed';
}

export interface Report {
  id: string;
  category: CategoryType;
  targetUser: TargetUserType;
  description: string;
  date: string;
  location: string;
  reportedBy: 'Survivor' | 'Community Advocate' | 'Healthcare Worker' | 'SMS Gateway' | 'Anonymous';
  status: ReportStatusType;
  urgency: UrgencyType;
  smsContent?: string;
  cleaningLog?: string;
  assignedResource?: AssignedResource;
}

export interface ResourceAllocation {
  id: string;
  name: string;
  type: 'Medical Support' | 'Counseling' | 'Legal Aid' | 'Economic Support' | 'Temporary Shelter';
  location: string;
  contact: string;
  status: 'Available' | 'Busy' | 'Fully Allocated';
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
