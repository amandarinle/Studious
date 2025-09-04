# Studious 📚

A social study tracking app that helps students stay motivated, connect with study communities, and optimize their learning through various study techniques.

## Features

**Study Session Tracking**
- Active session logging with real-time timer
- Multiple recording modes: focus mode, time-lapse, AI evaluation
- Track subject, study technique, mood, duration, and notes
- Share study sessions to community feed

**Community Features**  
- Create and join public/private study groups
- Social feed to view and interact with others' study sessions
- University-based local study communities
- Like and comment on study posts

**Learning Optimization**
- Built-in study techniques (Pomodoro, Feynman, Active Recall)
- Progress tracking with personal analytics
- Achievements system with badges
- Goal setting and tracking

## Tech Stack

- React Native with Expo
- TypeScript
- React Navigation
- Expo Camera & AV
- Expo Vector Icons

**Project Structure**
studious/
├── App.tsx                    # Root component
├── navigation/
│   └── AppNavigator.tsx       # Bottom tab navigation
├── screens/
│   ├── HomeScreen.tsx         # Social feed
│   ├── StudyScreen.tsx        # Timer and recording
│   ├── GroupsScreen.tsx       # Study groups
│   └── ProfileScreen.tsx      # Profile and stats
└── package.json

**License**
MIT License - feel free to use this code for learning purposes.
Built as a personal project to explore React Native development.

## Getting Started

```bash
# Clone and install
git clone https://github.com/yourusername/studious.git
cd studious
npm install

# Start development server
npx expo start

# Run on device
# Scan QR code with Expo Go app
# Or press 'i' for iOS simulator, 'a' for Android emulator
