<div align="center">
  <img src="./public/Dizz-no-bg.png" alt="DIZZ Logo" width="240" />

  <h3>The World's #1 AI Dating Wingman</h3>
  <p>Upload a chat screenshot. Get elite, personalized reply suggestions powered by Gemini 2.0 Flash Vision.</p>

  ![React Native](https://img.shields.io/badge/React%20Native-Expo-blue?style=flat-square&logo=react)
  ![Gemini AI](https://img.shields.io/badge/Gemini-2.0%20Flash-orange?style=flat-square&logo=google)
  ![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-green?style=flat-square)
</div>

---

## ✨ Features

- 📸 **Upload any chat screenshot** — Tinder, Hinge, Instagram DMs, iMessage
- 🤖 **Gemini 2.0 Flash Vision** — reads exactly what she said and generates contextual replies
- 🎯 **3 elite reply options** — witty, bold, and smooth — all under 15 words
- ⚡ **Keyword focus mode** — steer replies around any topic
- 📊 **Chat Wrapped** — get a chemistry analysis with interest levels, green/red flags, and attachment style
- 🎨 **Stunning onboarding** — full-screen video intro, gender selection, and DIZZ stats screen

---

## 🚀 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/daudibrahimhasan/dizz.git
cd dizz
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add your Gemini API Key
Create a `.env` file in the project root:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run on your phone
```bash
npx expo start
```
Scan the QR code with **Expo Go** (iOS or Android).

---

## 📦 Build APK

```bash
npx eas build -p android --profile preview
```

---

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | React Native (Expo) |
| AI Engine | Google Gemini 2.0 Flash (Vision) |
| Navigation | React Native Stack |
| Animations | React Native Animated API |
| Haptics | expo-haptics |
| Video | expo-av |
| Gradients | expo-linear-gradient |
| Build | EAS Build |

---

## 📁 Project Structure

```
dizz/
├── src/
│   ├── screens/
│   │   ├── OnboardingScreen.tsx     # Full-screen video intro
│   │   ├── ChooseGenderScreen.tsx   # Gender selection step
│   │   ├── DIZZStatsScreen.tsx      # 50M+ stats screen
│   │   └── DizzMainScreen.tsx       # Core AI reply generator
│   ├── services/
│   │   └── directAiService.ts       # Gemini 2.0 Flash API calls
│   └── store/
│       └── useSettingsStore.ts      # App state management
├── public/
│   ├── Dizz-no-bg.png               # Transparent logo
│   └── Dizz-2.mp4                   # Onboarding video
├── assets/
│   └── icon.png                     # App icon
└── eas.json                         # EAS Build config
```

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/daudibrahimhasan">daudibrahimhasan</a></sub>
</div>
