import CallActionBox from "@/components/chats/call-action";
import { db } from "@/firebase";
import { IUser, useAuth } from "@/providers/auth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, deleteField, doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { mediaDevices, MediaStream, RTCPeerConnection, RTCView } from "react-native-webrtc";

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

export default function Page() {
  const { userData } = useAuth();
  const { width } = useWindowDimensions();
  const router = useRouter();

  // saved instance of the local peer connection to be able to access it globally
  const [cachedLocalPC, setCachedLocalPC] = useState<RTCPeerConnection>();

  /**
   * @description Get the type of call from the URL, this is a query parameter
   * also, with deviceToken, I can send a push notification to the other user that a call has been made to them
   */
  const { type, deviceToken } = useLocalSearchParams() as unknown as IUser & { type: "audio" | "video" };

  /**
   * @description The room ID for the call that both users will join
   */
  const roomId = "roomId" + Math.random();

  const [isMuted, setIsMuted] = useState(false);
  const [isOffCam, setIsOffCam] = useState(false);

  // The remote stream that will be displayed on the screen of the user
  const [remoteStream, setRemoteStream] = useState<MediaStream | undefined>();

  // The local stream that will be displayed on the screen of the user
  const [localStream, setLocalStream] = useState<MediaStream | undefined>();

  async function startLocalStream() {
    const isFront = true;
    const facing = isFront ? "front" : "environment";
    const facingMode = isFront ? "user" : "environment";
    const devices = (await mediaDevices.enumerateDevices()) as MediaDeviceInfo[];

    const videoSourceId = devices.find((device) => device.kind === "videoinput" && (device as any).facing === facing);
    const newStream = await mediaDevices.getUserMedia({
      audio: true,
      video: {
        mandatory: {
          minWidth: width,
          minHeight: 300,
          minFrameRate: 30,
        },
        facingMode,
        optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
      },
    });

    /**
     * If the type of call is audio, disable the video tracks
     */
    if (type === "audio") {
      newStream.getVideoTracks().forEach((track) => {
        track.enabled = false;
      });
    }

    setLocalStream(newStream);
  }

  async function endCall() {
    if (cachedLocalPC) {
      const senders = cachedLocalPC.getSenders();
      senders.forEach((sender) => {
        cachedLocalPC.removeTrack(sender);
      });
      cachedLocalPC.close();
    }

    const roomRef = doc(db, "room", roomId);
    await updateDoc(roomRef, { answer: deleteField() });

    setLocalStream(undefined);
    setRemoteStream(undefined); // set remoteStream to null or empty when callee leaves the call
    setCachedLocalPC(undefined);

    router.canGoBack() && router.back();
  }

  async function startCall(roomId: string) {
    //if local stream is not available, return
    if (!localStream) return;

    /**
     * create an instance of the RTCPeerConnection
     * this represents the connection between the local device and the remote device
     * it is used to send and receive media streams
     */
    const localPC = new RTCPeerConnection(configuration);

    /**
     * add the local stream to the RTCPeerConnection
     * so they can be sent to the remote peer
     */
    localStream.getTracks().forEach((track) => {
      localPC.addTrack(track, localStream);
    });

    // see line 111 for the definition of roomRef
    const roomRef = doc(db, "room", roomId);
    const callerCandidatesCollection = collection(roomRef, "callerCandidates");
    const calleeCandidatesCollection = collection(roomRef, "calleeCandidates");

    /**
     * ICE candidates are potential network paths (IP addresses and posts that the peers can use to communicate)
     * ICE is the magic that connects peers even if they are separated by NAT.
     *
     * Client A uses the STUN server to determine their local and public Internet addresses, which they then relay to Client B via the Signaling Server. Each address received from the STUN server is referred to as an ICE candidate.
     *
     * Having said the above, An event listener is added to the localPC to handle ICE candidate events
     */
    localPC.addEventListener("icecandidate", (e) => {
      // When you find a null candidate then there are no more candidates.
      // Gathering of candidates has finished.
      if (!e.candidate) {
        console.log("Got final candidate!");
        return;
      }

      /**
       * Send the event.candidate onto the person you're calling.
       * Keeping to Trickle ICE Standards, you should send the candidates immediately.
       * This is because the remote peer needs to know the candidates to establish a connection.
       * firebase will be used as our stun server to relay the candidates
       */
      addDoc(callerCandidatesCollection, e.candidate.toJSON());
    });

    /**
     * The track event is fired when a new track is added to the RTCPeerConnection which typically happens when the remote peer adds a track to their end of the connection
     */
    localPC.addEventListener("track", (e) => {
      const newStream = new MediaStream();
      e.streams[0].getTracks().forEach((track) => {
        newStream.addTrack(track);
      });
      setRemoteStream(newStream);
    });

    /**
     * So you can now start creating an offer which then needs sending send off to the other call participant.
     */

    let sessionConstraints = {
      mandatory: {
        OfferToReceiveAudio: true,
        OfferToReceiveVideo: true,
        VoiceActivityDetection: true,
      },
    };

    const offer = await localPC.createOffer(sessionConstraints);
    await localPC.setLocalDescription(offer);

    await setDoc(roomRef, { offer, connected: false }, { merge: true });

    // Listen for remote answer
    onSnapshot(roomRef, (doc) => {
      const data = doc.data()!;
      if (!localPC.remoteDescription && data.answer) {
        const rtcSessionDescription = new RTCSessionDescription(data.answer);
        localPC.setRemoteDescription(rtcSessionDescription);
      } else {
        setRemoteStream(undefined);
      }
    });

    // when answered, add candidate to peer connection
    onSnapshot(calleeCandidatesCollection, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          let data = change.doc.data();
          localPC.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    setCachedLocalPC(localPC);
  }

  // Toggle the mute on and off
  const toggleMute = () => {
    if (!remoteStream || !localStream) return;

    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMuted(!track.enabled);
    });
  };

  // Switch the camera from front to back and vice versa
  const switchCamera = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => track._switchCamera());
  };

  // Toggle the camera on and off
  const toggleCamera = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsOffCam(!isOffCam);
    });
  };

  useEffect(() => {
    startLocalStream();
  }, []);

  useEffect(() => {
    if (localStream && roomId) {
      startCall(roomId);
    }
  }, [localStream, roomId]);

  return (
    <View className="flex-1 bg-white">
      {/* if you're not seeing your streamings
       * use the style property instead of the className property
       * and set the style property to { flex: 1 }
       */}
      {!remoteStream && <RTCView className="flex-1" mirror streamURL={localStream && localStream.toURL()} objectFit={"cover"} />}

      {remoteStream && (
        <>
          <RTCView className="flex-1" mirror streamURL={remoteStream && remoteStream.toURL()} objectFit={"cover"} />
          {!isOffCam && <RTCView className="w-32 h-48 absolute right-6 top-8" streamURL={localStream && localStream.toURL()} />}
        </>
      )}
      <View className="absolute bottom-0 w-full">
        <CallActionBox switchCamera={switchCamera} toggleMute={toggleMute} toggleCamera={toggleCamera} endCall={endCall} />
      </View>
    </View>
  );
}
