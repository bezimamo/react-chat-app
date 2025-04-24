import { useEffect } from "react";
import { getAuth } from "firebase/auth";
import { ref, onDisconnect, set, onValue } from "firebase/database";
import { rtdb } from "./firebase";

const usePresence = () => {
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;

    const userStatusRef = ref(rtdb, `users/${user.uid}/isOnline`);
    const lastSeenRef = ref(rtdb, `users/${user.uid}/lastSeen`);
    const connectedRef = ref(rtdb, ".info/connected");

    onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === false) return;

      // When connected: mark online and setup disconnection
      onDisconnect(userStatusRef).set(false);
      onDisconnect(lastSeenRef).set(Date.now());

      set(userStatusRef, true);
    });
  }, []);
};

export default usePresence;
