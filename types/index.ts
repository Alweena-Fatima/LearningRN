export type UserRole = "student" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  collegeId?: string;
  department?: string;
  clubName?: string;
  points: number;
  registeredEvents: string[];
  attendedEvents: string[];
  createdAt: number;
  password?: string; // <--- Add this
}


export type EventCategory = "Technical" | "Cultural" | "Sports" | "Workshop" | "Social" | "Academic" | "Other";

export type EventStatus = "upcoming" | "ongoing" | "completed" | "cancelled";

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  clubName: string;
  venue: string;
  date: number;
  startTime: string;
  endTime: string;
  imageUrl: string;
  maxParticipants: number;
  registeredParticipants: string[];
  registrationDeadline: number;
  status: EventStatus;
  createdBy: string;
  createdAt: number;
  points: number;
}

export interface Feedback {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: number;
  attended: boolean;
}
