// Extract room ID from URL path (e.g., /abc-123 -> abc-123)
const ROOM_ID = window.location.pathname.substring(1);

const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001",
});

const myVideo = document.createElement("video");
myVideo.muted = true;

// Track peers and their video elements
const peers = {};
const userVideos = {}; // userId -> video element mapping

let myStream;

// Get user media
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myStream = stream;
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
