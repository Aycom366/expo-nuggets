import { db } from "@/firebase";
import { IUser } from "@/providers/auth";
import { Unsubscribe } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

export const useGetUser = (uid: string) => {
  const [userData, setUserData] = useState({} as IUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unsubscribeSnapshot: Unsubscribe;

    const userDocRef = doc(db, "users", uid);
    unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
      setUserData(doc.data() as IUser);
      setIsLoading(false);
    });

    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  return { userData, isLoading };
};
