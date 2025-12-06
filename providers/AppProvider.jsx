import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useMemo } from "react";
// Removed type imports since they aren't needed in JS
import { mockEvents } from "../mocks/events";
import { mockUsers } from "../mocks/users";
import { getLeaderboardApi } from "../api/user";
import { submitFeedbackApi, getFeedbacksApi } from "../api/feedback";
import { createEventApi, getEventsApi, registerEventApi, unregisterEventApi} from "../api/event";

const STORAGE_KEYS = {
  CURRENT_USER: "current_user",
  USERS: "users",
  EVENTS: "events",
  FEEDBACKS: "feedbacks",
  REGISTRATIONS: "registrations",
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [registrations, setRegistrations] = useState([]);

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
      const response = await getEventsApi();
      return response.data; // backend se events
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
      // Try to get from backend
      try {
        const response = await getFeedbacksApi();
        return response.data;
      } catch (e) {
        // Fallback to storage if offline
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.FEEDBACKS);
        return stored ? JSON.parse(stored) : [];
      }
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
    mutationFn: async (user) => {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      const existingUsers = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
      const usersList = existingUsers ? JSON.parse(existingUsers) : mockUsers;
      const userExists = usersList.find((u) => u._id === user._id);
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
    mutationFn: async (event) => {
      // Backend call
      const response = await createEventApi(event);
      return response.data; // yeh backend se saved event ka data hai (_id included)
    },
    onSuccess: (savedEvent) => {
      // State update
      setEvents((prev) => [...prev, savedEvent]);
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (event) => {
      const updated = events.map((e) => (e._id === event._id ? event : e));
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      setEvents(updated);
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId) => {
      const updated = events.filter((e) => e._id !== eventId);
      await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (updated) => {
      setEvents(updated);
    },
  });

  const registerEventMutation = useMutation({
    mutationFn: async ({ eventId, userId }) => {
      
      // 1. SERVER UPDATE
      await registerEventApi(eventId, userId); 

      // 2. LOCAL STATE & STORAGE UPDATE
      
      // A. Update Registrations List
      const registration = {
        _id: `${eventId}_${userId}_${Date.now()}`,
        eventId,
        userId,
        registeredAt: Date.now(),
        attended: false,
      };

      const updatedRegistrations = [...registrations, registration];
      await AsyncStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updatedRegistrations));

      // B. Update Event (add userId to registeredParticipants)
      const event = events.find((e) => e._id === eventId);
      if (event) {
        const updatedEvent = {
          ...event,
          registeredParticipants: [...event.registeredParticipants, userId],
        };
        // Update local events array
        const updatedEvents = events.map((e) => (e._id === eventId ? updatedEvent : e));
        await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
      }

      // C. Update User (add eventId to registeredEvents)
      const user = users.find((u) => u._id === userId);
      if (user) {
        const updatedUser = {
          ...user,
          registeredEvents: [...user.registeredEvents, eventId],
        };
        // Update local users array
        const updatedUsers = users.map((u) => (u._id === userId ? updatedUser : u));
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        
        // Update Current User context if it matches
        if (currentUser?._id === userId) {
          setCurrentUser(updatedUser);
          await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
        }
      }

      return updatedRegistrations;
    },
    onSuccess: (updated) => {
      setRegistrations(updated);
    },
    onError: (error) => {
      console.error("Registration failed:", error);
    }
  });

  const unregisterEventMutation = useMutation({
    mutationFn: async ({ eventId, userId }) => {
      
      // 1. CALL BACKEND FIRST
      await unregisterEventApi(eventId, userId);

      // 2. UPDATE LOCAL STATE & STORAGE
      
      // A. Remove from Registrations List
      const updatedRegistrations = registrations.filter(
        (r) => !(r.eventId === eventId && r.userId === userId)
      );
      await AsyncStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(updatedRegistrations));

      // B. Remove User from Event (registeredParticipants)
      const event = events.find((e) => e._id === eventId);
      if (event) {
        const updatedEvent = {
          ...event,
          registeredParticipants: event.registeredParticipants.filter((id) => id !== userId),
        };
        const updatedEvents = events.map((e) => (e._id === eventId ? updatedEvent : e));
        await AsyncStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
      }

      // C. Remove Event from User (registeredEvents)
      const user = users.find((u) => u._id === userId);
      if (user) {
        const updatedUser = {
          ...user,
          registeredEvents: user.registeredEvents.filter((id) => id !== eventId),
        };
        const updatedUsers = users.map((u) => (u._id === userId ? updatedUser : u));
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        setUsers(updatedUsers);

        // Update Current User context if it matches
        if (currentUser?._id === userId) {
          setCurrentUser(updatedUser);
          await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
        }
      }

      return updatedRegistrations;
    },
    onSuccess: (updated) => {
      setRegistrations(updated);
    },
    onError: (error) => {
      console.error("Unregister failed:", error);
    }
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedback) => {
      
      // 1. CALL BACKEND
      const response = await submitFeedbackApi(feedback);
      
      // 2. UPDATE LOCAL STATE
      const updated = [...feedbacks, feedback];
      await AsyncStorage.setItem(STORAGE_KEYS.FEEDBACKS, JSON.stringify(updated));

      const event = events.find((e) => e._id === feedback.eventId);
      const user = users.find((u) => u._id === feedback.userId);
      
      if (event && user) {
        const updatedUser = {
          ...user,
          points: user.points + event.points,
          attendedEvents: [...user.attendedEvents, feedback.eventId],
        };

        const updatedUsers = users.map((u) => (u._id === feedback.userId ? updatedUser : u));
        await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
        setUsers(updatedUsers);

        if (currentUser?._id === feedback.userId) {
          setCurrentUser(updatedUser);
          await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
        }
      }

      return updated;
    },
    onSuccess: (updated) => {
      setFeedbacks(updated);
    },
    onError: (err) => {
      console.error("Feedback failed", err);
    }
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
    login: loginMutation.mutateAsync,
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

export function useFilteredEvents(search, category, status) {
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

export function useEventDetails(eventId) {
  const { events, feedbacks, currentUser } = useApp();

  return useMemo(() => {
    const event = events.find((e) => e._id === eventId);
    const eventFeedbacks = feedbacks.filter((f) => f.eventId === eventId);
    const isRegistered = event?.registeredParticipants.includes(currentUser?._id || "") || false;
    const hasFeedback = feedbacks.some(
      (f) => f.eventId === eventId && f.userId === currentUser?._id
    );

    const avgRating =
      eventFeedbacks.length > 0
        ? eventFeedbacks.reduce((sum, f) => sum + f.rating, 0) / eventFeedbacks.length
        : 0;

    return { event, eventFeedbacks, isRegistered, hasFeedback, avgRating };
  }, [events, feedbacks, eventId, currentUser]);
}

export function useLeaderboard() {
  const query = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const response = await getLeaderboardApi();
      return response.data;
    },
    refetchInterval: 60000, 
  });

  return query.data || [];
}