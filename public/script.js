// Extract room ID from URL path (e.g., /abc-123 -> abc-123)
const ROOM_ID = window.location.pathname.substring(1);

const socket = io("/");
const videoGrid = document.getElementById("video-grid");

// Connect to integrated PeerJS server
const isSecure = window.location.protocol === "https:";
const peerPort = window.location.port
  ? parseInt(window.location.port)
  : isSecure
    ? 443
    : 80;

console.log("PeerJS connecting to:", {
  host: window.location.hostname,
  port: peerPort,
  path: "/peerjs",
  secure: isSecure,
});

const myPeer = new Peer(undefined, {
  host: window.location.hostname,
  port: peerPort,
  path: "/peerjs",
  secure: isSecure,
});

const myVideo = document.createElement("video");
myVideo.muted = true;

// Track peers and their video elements
const peers = {};
const userVideos = {}; // userId -> video element mapping

let myStream;

// Get user media - Video is REQUIRED, Audio is OPTIONAL
async function getMediaStream() {
  try {
    // Try to get both video and audio (best experience)
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  } catch (err) {
    console.log("Failed to get video and audio, trying video only...");
    try {
      // Try video only (audio is optional)
      return await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
    } catch (err2) {
      console.error("Failed to get video stream:", err2);
      alert(
        "Camera access is required for this video chat app.\n\n" +
          "Please allow camera access and reload the page.\n\n" +
          "(Microphone is optional)"
      );
      throw err2;
    }
  }
}

getMediaStream()
  .then((stream) => {
    myStream = stream;

    // Check what we got
    const hasVideo = stream.getVideoTracks().length > 0;
    const hasAudio = stream.getAudioTracks().length > 0;

    if (hasAudio) {
      console.log("✅ Video + Audio enabled");
    } else {
      console.log("✅ Video enabled, 🔇 Audio disabled (muted)");
    }

    addVideoStream(myVideo, stream);

    // Answer incoming calls
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
        userVideos[call.peer] = video;
      });

      call.on("close", () => {
        video.remove();
      });

      peers[call.peer] = call;
    });

    // When a new user connects
    socket.on("user-connected", (userId) => {
      // Small delay to ensure peer connection is ready
      setTimeout(() => connectToNewUser(userId, stream), 500);
    });
  })
  .catch((err) => {
    console.error("Failed to get media stream:", err);
    alert("Please allow camera and microphone access to join the room");
  });

// Handle user disconnection
socket.on("user-disconnected", (userId) => {
  console.log("User disconnected:", userId);

  if (peers[userId]) {
    peers[userId].close();
    delete peers[userId];
  }

  // Remove video element
  if (userVideos[userId]) {
    userVideos[userId].remove();
    delete userVideos[userId];
  }
});

// Join room when peer connection is ready
myPeer.on("open", (id) => {
  socket.emit("join-room", { roomId: ROOM_ID, userId: id });
});

// Handle peer errors
myPeer.on("error", (err) => {
  console.error("Peer error:", err);
});

// Connect to a new user
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
    userVideos[userId] = video;
  });

  call.on("close", () => {
    video.remove();
    if (userVideos[userId]) {
      delete userVideos[userId];
    }
  });

  call.on("error", (err) => {
    console.error("Call error:", err);
    video.remove();
  });

  peers[userId] = call;
}

// Add video stream to grid
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

// Cleanup on page unload
window.addEventListener("beforeunload", () => {
  if (myStream) {
    myStream.getTracks().forEach((track) => track.stop());
  }

  // Close all peer connections
  Object.values(peers).forEach((call) => call.close());

  // Disconnect socket
  socket.disconnect();
});
