"use client";

declare global {
  interface Window {
    ReactNativeWebView: {
      postMessage: (data: string) => void;
    };
  }
}

import "@aws-amplify/ui-react/styles.css";
import React from "react";
import { Loader, ThemeProvider } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import { FaceLivenessDetector } from "@aws-amplify/ui-react-liveness";

const credentials = {
  aws_project_region: process.env.NEXT_PUBLIC_REGION,
  aws_cognito_identity_pool_id: process.env.NEXT_PUBLIC_IDENTITY_POOL_ID,
  aws_cognito_region: process.env.NEXT_PUBLIC_REGION,
};

Amplify.configure(credentials);

function postMessageToExternalListeners(data: any) {
  if (!window.ReactNativeWebView) return;
  window.ReactNativeWebView.postMessage(JSON.stringify(data));
}

export const Liveness = () => {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchCreateLiveness: () => Promise<void> = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/session", { method: "POST" });
        const data = await response.json();
        setSessionId(data.sessionId);
      } catch (error) {
        console.error("Error:", error);
        const data = {
          event: "Error_Creating_Session",
          data: error,
        };
        postMessageToExternalListeners(data);
      } finally {
        setLoading(false);
      }
    };

    fetchCreateLiveness();
    postMessageToExternalListeners({
      event: "Liveness_SDK_Initialized",
      meta: "Callback called when the SDK is initialized successfully",
    });
  }, []);

  const handleAnalysisComplete = async () => {
    if (!sessionId) return alert("Session ID not found");

    try {
      const response = await fetch(`/api/session?sessionId=${sessionId}`);
      const { data } = await response.json();
      const eventToSend = {
        event: "Analysis_Complete",
        data,
      };
      postMessageToExternalListeners(eventToSend);
    } catch (error) {
      console.error("Error:", error);
      const eventToSend = {
        event: "Error_Fetching_Result",
        data: error,
      };
      postMessageToExternalListeners(eventToSend);
    } finally {
      setSessionId(null);
    }
  };

  return (
    <ThemeProvider>
      {loading ? (
        <Loader />
      ) : (
        <FaceLivenessDetector
          sessionId={sessionId!}
          region={process.env.NEXT_PUBLIC_REGION!}
          onAnalysisComplete={handleAnalysisComplete}
          onUserCancel={() => {
            const data = {
              event: "User_Cancel",
              meta: "Callback called when the user cancels the flow. This callback is also called when users click the, Try Again button in the default error modal",
            };
            postMessageToExternalListeners(data);
          }}
          onError={(error) => {
            console.error(error);
            const data = {
              event: "OnError",
              meta: "Callback called when there an error occurred on any step.",
              data: error,
            };
            postMessageToExternalListeners(data);
          }}
        />
      )}
    </ThemeProvider>
  );
};
