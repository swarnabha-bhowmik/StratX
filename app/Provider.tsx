"use client";

import { useState, useEffect, ReactNode, useRef, useCallback } from "react";
import axios from "axios";
import { useUser, useAuth } from "@clerk/nextjs";
import { UserDetailContext } from "../context/UserDetailContext";

interface ProviderProps {
  children: ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const [userDetail, setUserDetail] = useState<any>(null);
  const isFetchingRef = useRef(false);
  const syncedUserIdRef = useRef<string | null>(null);

  const createNewUser = useCallback(async () => {
    if (!user || !isSignedIn || isFetchingRef.current) return;

    // Prevent duplicate calls if this user is already synced
    if (syncedUserIdRef.current === user.id && userDetail) return;

    try {
      isFetchingRef.current = true;
      const token = await getToken();

      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) return;

      const userName =
        user?.username ||
        user?.fullName ||
        (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : null) ||
        userEmail.split("@")[0] ||
        "User";

      const res = await axios.post(
        "/api/users",
        {
          email: userEmail,
          name: userName,
        },
        {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
          withCredentials: true,
        }
      );

      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setUserDetail(data);
      syncedUserIdRef.current = user.id;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        // Session token might still be propagating on initial auth load
        console.warn("User auth session pending, will retry once session is verified.");
      } else {
        console.error("Failed to sync user with database:", error);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [user, isSignedIn, getToken, userDetail]);

  useEffect(() => {
    if (isUserLoaded && user && isAuthLoaded && isSignedIn) {
      if (syncedUserIdRef.current !== user.id) {
        createNewUser();
      }
    } else if (isAuthLoaded && !isSignedIn) {
      setUserDetail(null);
      syncedUserIdRef.current = null;
    }
  }, [user?.id, isUserLoaded, isAuthLoaded, isSignedIn, createNewUser]);

  return (
    <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
      {children}
    </UserDetailContext.Provider>
  );
};

export default Provider;
