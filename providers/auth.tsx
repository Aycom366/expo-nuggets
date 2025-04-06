import { Loading } from "@/components/shared/Loading";
import { auth, db } from "@/firebase";
import { useRouter } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react";
import * as Notifications from "expo-notifications";

import { googleWebClientId } from "@/app/(call)/setup";
import { registerForPushNotificationsAsync } from "@/lib/notification";
import { doc, updateDoc } from "firebase/firestore";

export interface IUser {
  uid: string;
  name: string;
  photoURL: string;
  email: string;
  deviceToken?: string;
}

interface IUserContext {
  userData: IUser;
  logout: () => void;
}

/**
 * This will notification will send a notification to the user that someone is calling them
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const AuthContext = createContext<IUserContext | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState({} as IUser);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (user) => {
        if (user?.uid) {
          setUserData({
            uid: user.uid,
            name: user?.displayName ?? "",
            photoURL: user?.photoURL ?? "",
            email: user?.email ?? "",
          });
          setIsLoading(false);
        } else router.replace("/setup");
      },
      (error) => {
        console.log("firebase error", error);
      }
    );

    return () => {
      if (unsubscribeAuth) {
        unsubscribeAuth();
      }
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      GoogleSignin.configure({
        webClientId: googleWebClientId,
      });

      const isSignedIn = GoogleSignin.hasPreviousSignIn();

      if (isSignedIn) {
        //react native google sign in sign out
        await GoogleSignin.signOut();
        await GoogleSignin.revokeAccess();
      }

      //firebase sign out
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  }, []);

  useEffect(() => {
    if (userData.uid) {
      registerForPushNotificationsAsync()
        .then(async (token) => {
          const userDoc = doc(db, "users", userData.uid);
          await updateDoc(userDoc, { deviceToken: token });
        })
        .catch((error: any) => alert(`${error}`));
    }
  }, [userData.uid]);

  if (isLoading) return <Loading />;

  return <AuthContext.Provider value={{ userData, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }
  return context;
};
