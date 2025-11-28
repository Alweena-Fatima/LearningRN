import { User } from "../types"; // Adjust the path if needed

export const mockUsers: User[] = [
  {
    _id: "student1",
    name: "Alex Johnson",
    email: "alex.johnson@college.edu",
    role: "student",
    collegeId: "CS2023001",
    department: "Computer Science",
    password: "password123", // Added password
    points: 250,
    registeredEvents: [],
    attendedEvents: [],
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
  },
  {
    _id: "student2",
    name: "Sarah Williams",
    email: "sarah.williams@college.edu",
    role: "student",
    collegeId: "EC2023045",
    department: "Electronics",
    password: "password123", // Added password
    points: 180,
    registeredEvents: [],
    attendedEvents: [],
    createdAt: Date.now() - 350 * 24 * 60 * 60 * 1000,
  },
  {
    _id: "admin1",
    name: "CS Club Admin",
    email: "csclub@college.edu",
    role: "admin",
    clubName: "Computer Science Club",
    password: "admin123", // Added password
    points: 0,
    registeredEvents: [],
    attendedEvents: [],
    createdAt: Date.now() - 400 * 24 * 60 * 60 * 1000,
  },
];
