import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBvI2mYnuLYfa1drwMEI-QiLMN4OAH2sJw",
  authDomain: "expo-nuggets.firebaseapp.com",
  projectId: "expo-nuggets",
  storageBucket: "expo-nuggets.appspot.com",
  messagingSenderId: "730238166499",
  appId: "1:730238166499:web:16a0b0ae225e6eda446cd6",
};

export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
