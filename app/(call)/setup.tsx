import { GoogleSigninButton } from "@react-native-google-signin/google-signin";
import { useState } from "react";

export default function Page() {
  const [isInProgress, setInProgress] = useState(false);
  return (
    <>
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={() => {
          // initiate sign in
        }}
        disabled={isInProgress}
      />
      ;
    </>
  );
}
