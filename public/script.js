// ========================================
// CONFIGURATION & INITIALIZATION
// ========================================

// Extract room ID from URL path (e.g., /abc-123 -> abc-123)
const ROOM_ID = window.location.pathname.substring(1);

const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const loadingEl = document.getElementById("loading");
const errorMessageEl = document.getElementById("error-message");
const controlsEl = document.getElementById("controls");
const participantCountEl = document.getElementById("participant-count");
const roomIdEl = document.getElementById("room-id");

// Display room ID
if (roomIdEl) {
  roomIdEl.textContent = ROOM_ID;
}

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

// ========================================
// STATE MANAGEMENT
// ========================================

const myVideo = document.createElement("video");
myVideo.muted = true;

// Track peers and their video elements
const peers = {};
const userVideos = {}; // userId -> video element mapping

let myStream;
let isVideoEnabled = true;
let isAudioEnabled = true;
let participantCount = 1;

// ========================================
// UI HELPER FUNCTIONS
// ========================================

function showLoading(message = "Connecting to room...") {
  if (loadingEl) {
    loadingEl.querySelector("p").textContent = message;
    loadingEl.classList.remove("hidden");
  }
}

function hideLoading() {
  if (loadingEl) {
    loadingEl.classList.add("hidden");
  }
}

function showError(message) {
  if (errorMessageEl) {
    errorMessageEl.textContent = message;
    errorMessageEl.classList.add("show");
    setTimeout(() => {
      errorMessageEl.classList.remove("show");
    }, 5000);
  }
  console.error(message);
}

function updateParticipantCount(count) {
  participantCount = count;
  if (participantCountEl) {
    participantCountEl.textContent = count;
  }
}

function showControls() {
  if (controlsEl) {
    controlsEl.classList.remove("hidden");
  }
}

// ========================================
// MEDIA STREAM HANDLING
// ========================================

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
      showError(
        "Camera access is required. Please allow camera access and reload the page."
      );
      throw err2;
    }
  }
}

// Add video stream to grid
function addVideoStream(video, stream, label = "You") {
  const container = document.createElement("div");
  container.className = "video-container";

  const labelEl = document.createElement("div");
  labelEl.className = "video-label";
  labelEl.textContent = label;

  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });

  container.appendChild(video);
  container.appendChild(labelEl);
  videoGrid.appendChild(container);

  return container;
}

// ========================================
// PEER CONNECTION HANDLERS
// ========================================

// Connect to a new user
function connectToNewUser(userId, stream) {
  // Prevent duplicate connections
  if (peers[userId]) {
    console.log(`Already connected to ${userId}, skipping...`);
    return;
  }

  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    // Prevent duplicate video elements
    if (!userVideos[userId]) {
      const container = addVideoStream(video, userVideoStream, "Participant");
      userVideos[userId] = { video, container };
      // Note: Server will broadcast room-stats with updated count
    }
  });

  call.on("close", () => {
    if (userVideos[userId]) {
      userVideos[userId].container.remove();
      delete userVideos[userId];
    }
  });

  call.on("error", (err) => {
    console.error("Call error:", err);
    if (userVideos[userId]) {
      userVideos[userId].container.remove();
      delete userVideos[userId];
    }
  });

  peers[userId] = call;
}

// ========================================
// SOCKET.IO EVENT HANDLERS
// ========================================

// Handle user disconnection
socket.on("user-disconnected", (userId) => {
  console.log("User disconnected:", userId);

  if (peers[userId]) {
    peers[userId].close();
    delete peers[userId];
  }

  // Remove video element
  if (userVideos[userId]) {
    userVideos[userId].container.remove();
    delete userVideos[userId];
  }
  // Note: Server will broadcast room-stats with updated count
});

// Handle room stats updates
socket.on("room-stats", (data) => {
  console.log("Room stats received:", data.participantCount);
  // Use the server's count as the source of truth
  participantCount = data.participantCount;
  updateParticipantCount(data.participantCount);
});

// Handle errors
socket.on("error", (data) => {
  showError(data.message || "An error occurred");
});

// ========================================
// PEER.JS EVENT HANDLERS
// ========================================

// Join room when peer connection is ready
myPeer.on("open", (id) => {
  socket.emit("join-room", { roomId: ROOM_ID, userId: id });
});

// Handle peer errors
myPeer.on("error", (err) => {
  console.error("Peer error:", err);
  showError("Connection error. Please refresh the page.");
});

// ========================================
// CONTROL BUTTON HANDLERS
// ========================================

// Toggle video
document.getElementById("toggleVideo")?.addEventListener("click", () => {
  const videoTrack = myStream.getVideoTracks()[0];
  if (videoTrack) {
    videoTrack.enabled = !videoTrack.enabled;
    isVideoEnabled = videoTrack.enabled;
    const btn = document.getElementById("toggleVideo");
    if (btn) {
      btn.classList.toggle("active", isVideoEnabled);
      btn.textContent = isVideoEnabled ? "📹" : "🚫";
    }
  }
});

// Toggle audio
document.getElementById("toggleAudio")?.addEventListener("click", () => {
  const audioTrack = myStream.getAudioTracks()[0];
  if (audioTrack) {
    audioTrack.enabled = !audioTrack.enabled;
    isAudioEnabled = audioTrack.enabled;
    const btn = document.getElementById("toggleAudio");
    if (btn) {
      btn.classList.toggle("active", isAudioEnabled);
      btn.textContent = isAudioEnabled ? "🎤" : "🔇";
    }
  }
});

// Leave room
document.getElementById("leaveRoom")?.addEventListener("click", () => {
  if (confirm("Are you sure you want to leave the room?")) {
    // Stop all tracks
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }

    // Close all peer connections
    Object.values(peers).forEach((call) => call.close());

    // Disconnect socket
    socket.disconnect();

    // Clear the video grid
    videoGrid.innerHTML = "";

    // Show a "You left the room" message with rejoin option
    const leftMessage = document.createElement("div");
    leftMessage.style.cssText =
      "text-align: center; margin-top: 100px; font-size: 24px;";
    leftMessage.innerHTML = `
      <p>📞 You have left the room</p>
      <p style="margin-top: 30px; display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
        <button id="rejoinBtn" style="
          background: #667eea;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          🔄 Rejoin this room
        </button>
        <a href="/" style="
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 25px;
          font-size: 16px;
          text-decoration: none;
          display: inline-block;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          ➕ Join a new room
        </a>
      </p>
    `;
    document.querySelector(".container").appendChild(leftMessage);

    // Add event listener for rejoin button
    document.getElementById("rejoinBtn")?.addEventListener("click", () => {
      // Reload the page to rejoin the same room
      window.location.reload();
    });

    // Hide controls
    controlsEl?.classList.add("hidden");
  }
});

// ========================================
// MAIN INITIALIZATION
// ========================================

getMediaStream()
  .then((stream) => {
    myStream = stream;

    // Check what we got
    const hasVideo = stream.getVideoTracks().length > 0;
    const hasAudio = stream.getAudioTracks().length > 0;

    if (hasAudio) {
      console.log("✅ Video + Audio enabled");
      isAudioEnabled = true;
    } else {
      console.log("✅ Video enabled, 🔇 Audio disabled (muted)");
      isAudioEnabled = false;
      const audioBtn = document.getElementById("toggleAudio");
      if (audioBtn) {
        audioBtn.classList.remove("active");
        audioBtn.textContent = "🔇";
        audioBtn.disabled = true;
        audioBtn.style.opacity = "0.5";
      }
    }

    addVideoStream(myVideo, stream, "You (Me)");
    hideLoading();
    showControls();

    // Answer incoming calls
    myPeer.on("call", (call) => {
      // Prevent duplicate connections from incoming calls
      if (peers[call.peer]) {
        console.log(
          `Already have connection with ${call.peer}, skipping incoming call...`
        );
        return;
      }

      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        // Prevent duplicate video elements
        if (!userVideos[call.peer]) {
          const container = addVideoStream(
            video,
            userVideoStream,
            "Participant"
          );
          userVideos[call.peer] = { video, container };
        }
      });

      call.on("close", () => {
        if (userVideos[call.peer]) {
          userVideos[call.peer].container.remove();
          delete userVideos[call.peer];
        }
      });

      peers[call.peer] = call;
    });

    // When a new user connects
    socket.on("user-connected", (userId) => {
      console.log("New user connected:", userId);
      // Small delay to ensure peer connection is ready
      setTimeout(() => connectToNewUser(userId, stream), 500);
    });
  })
  .catch((err) => {
    console.error("Failed to get media stream:", err);
    hideLoading();
    showError(
      "Failed to access camera/microphone. Please check permissions and reload."
    );
  });

// ========================================
// CLEANUP ON PAGE UNLOAD
// ========================================

window.addEventListener("beforeunload", () => {
  if (myStream) {
    myStream.getTracks().forEach((track) => track.stop());
  }

  // Close all peer connections
  Object.values(peers).forEach((call) => call.close());

  // Disconnect socket
  socket.disconnect();
});
