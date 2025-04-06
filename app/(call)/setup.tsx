import { auth, db } from "@/firebase";
import { GoogleSigninButton, GoogleSignin, isErrorWithCode, statusCodes } from "@react-native-google-signin/google-signin";
import { useRouter } from "expo-router";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const googleWebClientId = process.env.EXPO_PUBLIC_GoogleWebClientId;

export default function Page() {
  const [isInProgress, setInProgress] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function configureGoogle() {
      GoogleSignin.configure({
        webClientId: googleWebClientId,
      });
    }

    configureGoogle();
  }, []);

  const _signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const user = await GoogleSignin.signIn();

      /**
       * Also sign in with firebase to have the user in the firebase auth system
       */
      const credential = GoogleAuthProvider.credential(user.idToken);
      const result = await signInWithCredential(auth, credential);

      //Check if the user exists in the database
      const userDocReference = doc(db, "users", result.user.uid);
      const docSnap = await getDoc(userDocReference);

      // If the user does not exist, create a new user
      if (!docSnap.exists()) {
        await setDoc(userDocReference, {
          email: result.user.email,
          name: result.user.displayName,
          photoURL: result.user.photoURL,
          uid: result.user.uid,
        });
      }

      router.replace("/(call)/(protected)/chats");
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            alert("Signin cancelled");
            // user cancelled the login flow
            break;
          case statusCodes.IN_PROGRESS:
            alert("Signin already in progress");
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            alert("Play services not available");
            // play services not available or outdated
            break;
          default:
            Alert.alert("Error", "An Unknown has occurred\nPlease try again later");
            break;
        }
      } else {
        // an error that's not related to google sign in occurred
        Alert.alert("Error", "An Unknown has occurred\nPlease try again later");
      }
    } finally {
      setInProgress(false);
    }
  };

  return (
    <SafeAreaView className="items-center justify-center flex-1">
      <GoogleSigninButton size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} onPress={_signIn} disabled={isInProgress} />
    </SafeAreaView>
  );
}
