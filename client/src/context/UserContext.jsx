import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [roomLayout, setRoomLayout] = useState([]);

  // ⭐ Fetch user info when app loads
  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await api.get("/user/me");

        setUser({
          ...res.user,
          stravaConnected: res.stravaConnected,
          totalKm: res.totalKm,
          profilePicture: res.user.profilePicture, // Store the path/URL as-is, formatting happens in components
        });
        setPoints(Math.floor(res.pointsRemaining));
        setInventory(res.inventory || []);
        setRoomLayout(res.roomLayout || []);
      } catch (err) {
        console.log("Not logged in yet");
      }
    }

    fetchMe();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    setUser(null);
    setPoints(0);
    setInventory([]);
    setRoomLayout([]);
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        points,
        setPoints,
        inventory,
        setInventory,
        roomLayout,
        setRoomLayout,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
