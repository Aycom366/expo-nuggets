import { AuthProvider } from "@/providers/auth";
import { Slot } from "expo-router";

export default function CallLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
