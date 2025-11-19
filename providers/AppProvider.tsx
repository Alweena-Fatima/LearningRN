import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useMemo } from "react";
import { Event, User, Feedback, Registration, EventCategory, EventStatus } from "../types";
import { mockEvents } from "../mocks/events";
import { mockUsers } from "../mocks/users";

const STORAGE_KEYS = {
  CURRENT_USER: "current_user",
  USERS: "users",
  EVENTS: "events",
  FEEDBACKS: "feedbacks",
  REGISTRATIONS: "registrations",
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const loadUserQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return stored ? JSON.parse(stored) : null;
    },
  });

  const loadEventsQuery = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.EVENTS);
      if (stored) {
        return JSON.parse(stored);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(mockEvents));
      return mockEvents;
    },
  });

  const loadUsersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      if (stored) {
        return JSON.parse(stored);
      }
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
      return mockUsers;
    },
  });

  const loadFeedbacksQuery = useQuery({
    queryKey: ["feedbacks"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.FEEDBACKS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const loadRegistrationsQuery = useQuery({
    queryKey: ["registrations"],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
      return stored ? JSON.parse(stored) : [];
    },
  });

  useEffect(() => {
    if (loadUserQuery.data !== undefined) {
      setCurrentUser(loadUserQuery.data);
    }
  }, [loadUserQuery.data]);

  useEffect(() => {
    if (loadEventsQuery.data) {
      setEvents(loadEventsQuery.data);
    }
  }, [loadEventsQuery.data]);

  useEffect(() => {
    if (loadUsersQuery.data) {
      setUsers(loadUsersQuery.data);
    }
  }, [loadUsersQuery.data]);

  useEffect(() => {
    if (loadFeedbacksQuery.data) {
      setFeedbacks(loadFeedbacksQuery.data);
    }
  }, [loadFeedbacksQuery.data]);

  useEffect(() => {
    if (loadRegistrationsQuery.data) {
      setRegistrations(loadRegistrationsQuery.data);
    }
  }, [loadRegistrationsQuery.data]);

  const loginMutation = useMutation({
    mutationFn: async (user: User) => {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      const existingUsers = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const usersList = existingUsers ? JSON.parse(existingUsers) : mockUsers;
      const userExists = usersList.find((u: User) => u.id === user.id);
      if (!userExists) {
        usersList.push(user);
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(usersList));
        setUsers(usersList);
      }
      return user;
    },
    onSuccess: (user) => {
      setCurrentUser(user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    },
    onSuccess: () => {
      setCurrentUser(null);
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (event: Event) => {
      const updated = [...events, event];
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      setEvents(updated);
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (event: Event) => {
      const updated = events.map((e) => (e.id === event.id ? event : e));
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      setEvents(updated);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const updated = events.filter((e) => e.id !== eventId);
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      setEvents(updated);
    },
  });

  const registerEventMutation = useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
      const registration: Registration = {
        id: `${eventId}_${userId}_${Date.now()}`,
        eventId,
        userId,
        registeredAt: Date.now(),
        attended: false,
      };

      const updatedRegistrations = [...registrations, registration];
      await AsyncStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updatedRegistrations));

      const event = events.find((e) => e.id === eventId);
      if (event) {
        const updatedEvent = {
          ...event,
          registeredParticipants: [...event.registeredParticipants, userId],
        };
        const updatedEvents = events.map((e) => (e.id === eventId ? updatedEvent : e));
        await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
      }

      const user = users.find((u) => u.id === userId);
      if (user) {
        const updatedUser = {
          ...user,
          registeredEvents: [...user.registeredEvents, eventId],
        };
        const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u));
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        
        if (currentUser?.id === userId) {
          setCurrentUser(updatedUser);
          await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
        }
      }

      return updatedRegistrations;
    },
    onSuccess: (updated) => {
      setRegistrations(updated);
    },
  });

  const unregisterEventMutation = useMutation({
    mutationFn: async ({ eventId, userId }: { eventId: string; userId: string }) => {
      const updatedRegistrations = registrations.filter(
        (r) => !(r.eventId === eventId && r.userId === userId)
      );
      await AsyncStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updatedRegistrations));

      const event = events.find((e) => e.id === eventId);
      if (event) {
        const updatedEvent = {
          ...event,
          registeredParticipants: event.registeredParticipants.filter((id) => id !== userId),
        };
        const updatedEvents = events.map((e) => (e.id === eventId ? updatedEvent : e));
        await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
      }

      const user = users.find((u) => u.id === userId);
      if (user) {
        const updatedUser = {
          ...user,
          registeredEvents: user.registeredEvents.filter((id) => id !== eventId),
        };
        const updatedUsers = users.map((u) => (u.id === userId ? updatedUser : u));
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        setUsers(updatedUsers);

        if (currentUser?.id === userId) {
          setCurrentUser(updatedUser);
          await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
        }
      }

      return updatedRegistrations;
    },
    onSuccess: (updated) => {
      setRegistrations(updated);
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback: Feedback) => {
      const updated = [...feedbacks, feedback];
      await AsyncStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(updated));

      const event = events.find((e) => e.id === feedback.eventId);
      const user = users.find((u) => u.id === feedback.userId);
      
      if (event && user) {
        const updatedUser = {
          ...user,
          points: user.points + event.points,
          attendedEvents: [...user.attendedEvents, feedback.eventId],
        };
        const updatedUsers = users.map((u) => (u.id === feedback.userId ? updatedUser : u));
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        setUsers(updatedUsers);

        if (currentUser?.id === feedback.userId) {
          setCurrentUser(updatedUser);
          await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
        }
      }

      return updated;
    },
    onSuccess: (updated) => {
      setFeedbacks(updated);
    },
  });

  return {
    currentUser,
    events,
    users,
    feedbacks,
    registrations,
    isLoading:
      loadUserQuery.isLoading ||
      loadEventsQuery.isLoading ||
      loadUsersQuery.isLoading ||
      loadFeedbacksQuery.isLoading ||
      loadRegistrationsQuery.isLoading,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    deleteEvent: deleteEventMutation.mutate,
    registerEvent: registerEventMutation.mutate,
    unregisterEvent: unregisterEventMutation.mutate,
    submitFeedback: submitFeedbackMutation.mutate,
    isRegistering: registerEventMutation.isPending,
    isUnregistering: unregisterEventMutation.isPending,
    isSubmittingFeedback: submitFeedbackMutation.isPending,
    isCreatingEvent: createEventMutation.isPending,
  };
});

export function useFilteredEvents(
  search: string,
  category: EventCategory | "All",
  status: EventStatus | "all"
) {
  const { events } = useApp();

  return useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        search === "" ||
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.clubName.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory = category === "All" || event.category === category;

      const now = Date.now();
      const eventStatus =
        event.status === "cancelled"
          ? "cancelled"
          : event.date < now
          ? "completed"
          : event.date <= now + 24 * 60 * 60 * 1000
          ? "ongoing"
          : "upcoming";

      const matchesStatus = status === "all" || eventStatus === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [events, search, category, status]);
}

export function useEventDetails(eventId: string) {
  const { events, feedbacks, currentUser } = useApp();

  return useMemo(() => {
    const event = events.find((e) => e.id === eventId);
    const eventFeedbacks = feedbacks.filter((f) => f.eventId === eventId);
    const isRegistered = event?.registeredParticipants.includes(currentUser?.id || "") || false;
    const hasFeedback = feedbacks.some(
      (f) => f.eventId === eventId && f.userId === currentUser?.id
    );

    const avgRating =
      eventFeedbacks.length > 0
        ? eventFeedbacks.reduce((sum, f) => sum + f.rating, 0) / eventFeedbacks.length
        : 0;

    return { event, eventFeedbacks, isRegistered, hasFeedback, avgRating };
  }, [events, feedbacks, eventId, currentUser]);
}

export function useLeaderboard() {
  const { users } = useApp();

  return useMemo(() => {
    return [...users]
      .filter((u) => u.role === "student")
      .sort((a, b) => b.points - a.points);
  }, [users]);
}
