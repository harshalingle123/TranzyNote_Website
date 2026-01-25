# TranzyNote - Feature Documentation

## Overview

TranzyNote is an invisible AI interview companion that provides real-time hints and chat assistance during job interviews. The application runs as a desktop overlay that stays visible during video calls while remaining undetectable during screen sharing.

---

## Core Features

### 1. AI-Powered Chat Assistant

**Real-time Conversation Support**
- Stream-based AI responses for instant feedback
- Context-aware assistance based on interview type
- Message history preserved throughout the session
- Support for follow-up questions and clarifications

**Document Integration**
- Upload resumes, job descriptions, and study materials
- AI references your documents when providing answers
- Support for PDF, DOCX, and text files
- Per-mode document management

### 2. Interview Modes

TranzyNote offers specialized modes tailored to different interview types:

| Mode | Description |
|------|-------------|
| **General** | All-purpose interview assistance |
| **Technical** | Coding problems, algorithms, data structures |
| **Behavioral** | STAR method, situational questions |
| **System Design** | Architecture, scalability, trade-offs |
| **Coding** | Live coding support with syntax help |
| **Practice** | Self-study and preparation mode |
| **Mock Interview** | Simulated interview scenarios |

**Mode Customization**
- Create custom modes with personalized system prompts
- Clone and modify existing modes
- Attach mode-specific documents
- Reorderable note templates per mode

### 3. Audio Transcription

**Real-time Speech-to-Text**
- Live transcription using browser Web Speech API
- Instant visual feedback as you speak
- Support for multiple languages

**High-Accuracy Transcription**
- Whisper API integration (Groq and OpenAI)
- 16kHz audio capture for optimal quality
- 3-second chunk processing for low latency
- Automatic temporary file cleanup

**Dual Audio Capture**
- Microphone input (your voice)
- System audio capture (interviewer's voice)
  - Windows: Native WASAPI support
  - macOS: Requires BlackHole virtual audio driver

### 4. Floating Overlay Interface

**Always-On-Top Design**
- Stays visible during video calls
- Draggable to any screen position
- Minimal footprint to avoid distraction
- Position saved between sessions

**Session Controls**
- Start/Stop session buttons
- Real-time timer display
- Recording status indicators
- Quick access to chat history

### 5. Safety & Privacy Features

**Screen Share Detection**
- Automatic detection of screen sharing applications
- Monitors for: Zoom, Microsoft Teams, Google Meet, OBS
- Auto-hides overlay when screen sharing detected
- 2-second polling interval for quick response

**Incognito Mode**
- Suppresses tooltips and visual hints
- Hidden cursor mode for extra stealth
- Removes detectable UI elements
- User preference saved to account

**Content Protection**
- Overlay excluded from screen capture (Windows)
- Warning banners for safety reminders
- Clear disclaimers about detection limitations

### 6. Session Management

**Session Lifecycle**
- Create new interview sessions
- Start/pause/stop with time tracking
- Session recovery after crashes
- Full conversation history per session

**Time Synchronization**
- Client-server time sync
- Accurate elapsed time tracking
- Automatic pause on inactivity
- Session state persistence

### 7. Global Hotkeys

**Quick Toggle**
- Default: `Ctrl+Shift+O` (customizable)
- Instantly show/hide overlay
- Works from any application
- Session-aware (only shows when active)

### 8. Voucher & Time System

**Flexible Plans**
- Pay-as-you-go (per-second billing)
- Hourly bundles (10h, 25h, 50h packages)
- Unlimited plans with daily fair-use limits

**Time Tracking**
- Real-time countdown display
- Low-time warnings
- Automatic session pause when depleted
- Voucher status in dashboard

### 9. Authentication & Security

**Multiple Sign-in Options**
- Email/Password registration
- Google OAuth integration
- OTP verification for sensitive actions

**Account Management**
- Password reset via OTP
- Account deletion with confirmation
- Profile customization (avatar, bio, timezone)

### 10. Cross-Platform Support

| Platform | Status | Installer |
|----------|--------|-----------|
| Windows | Full Support | NSIS Installer |
| macOS | Full Support | DMG (Intel & Apple Silicon) |
| Linux | Beta | AppImage |

**Platform-Specific Features**
- Windows: Native screen capture exclusion
- macOS: App focus detection, screen recording permission check
- All: Automatic updates via electron-updater

---

## Technical Specifications

### Audio Capture
- Sample Rate: 16,000 Hz
- Bit Depth: 16-bit
- Channels: Mono
- Format: PCM/WAV

### Supported Transcription Services
- Groq Whisper API (recommended - faster)
- OpenAI Whisper API (fallback)

### System Requirements
- **Windows**: Windows 10 or later
- **macOS**: macOS 10.15 (Catalina) or later
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 200MB for installation
- **Internet**: Stable connection required

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+O` | Toggle overlay visibility |
| `Enter` | Send message |
| `Shift+Enter` | New line in message |
| `Escape` | Close modals/menus |

---

## Integration Points

### Backend API
- RESTful API hosted on Azure
- Real-time streaming via Server-Sent Events
- Secure token-based authentication

### Third-Party Services
- **Groq/OpenAI**: Audio transcription
- **Google**: OAuth authentication
- **Razorpay**: Payment processing
- **Azure Blob Storage**: Auto-update distribution

---

## Coming Soon

- [ ] Multi-language UI support
- [ ] Custom AI model selection
- [ ] Team/Enterprise features
- [ ] Interview analytics and insights
- [ ] Mobile companion app
- [ ] Browser extension version
