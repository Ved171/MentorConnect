export enum UserRole {
  MENTEE = 'Mentee',
  MENTOR = 'Mentor',
  ADMIN = 'Admin',
}

export enum AvailabilityStatus {
  AVAILABLE = 'Available',
  BUSY = 'Busy',
  NOT_ACCEPTING = 'Not Accepting New Mentees',
}

export enum RequestStatus {
  PENDING = 'Pending',
  ACCEPTED = 'Accepted',
  DECLINED = 'Declined',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl: string;
  department: string;
  year?: number; // For students
  position?: string; // For faculty
  skills: string[];
  interests: string[];
  createdAt?: string | Date;
}

export interface Mentor extends User {
  role: UserRole.MENTOR;
  bio: string;
  availability: AvailabilityStatus;
  rating: number;
  menteeIds: string[];
  availabilitySlots?: { day: string; times: string[] }[];
}

export interface Mentee extends User {
  role: UserRole.MENTEE;
  mentorIds: string[];
}

export interface Admin extends User {
    role: UserRole.ADMIN;
}

export type AnyUser = Mentor | Mentee | Admin;

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
  isRead?: boolean;
}

export interface MentorshipRequest {
  id:string;
  fromId: string;
  toId: string;
  message: string;
  status: RequestStatus;
  timestamp: Date;
}

export interface Resource {
  id: string;
  title: string;
  type: 'document' | 'link' | 'article';
  url: string;
  uploadedBy: string; // User ID
  category: string;
}

export interface Goal {
  id: string;
  menteeId: string;
  text: string;
  isCompleted: boolean;
  createdAt: Date;
}

export interface Session {
  id: string;
  mentorId: string;
  menteeId: string;
  startTime: Date;
  endTime: Date;
  topic: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed' | 'Declined';
  requestedBy: string;
}