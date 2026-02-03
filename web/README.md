# Gemination - AI Agricultural Assistant Frontend

A beautiful, modern Next.js web application for the Gemination agricultural AI platform. Connect with your backend API to provide instant crop diagnosis, expert advice, and a farming community.

## Features

🌾 **Crop Diagnosis** - AI-powered analysis of crop issues using image, audio, or text input
💬 **Smart Chat** - Get expert advice from AI trained on agricultural knowledge
👥 **Community Forum** - Connect with other farmers and share experiences
🛒 **Marketplace** - Buy and sell agricultural products and services
🔐 **User Authentication** - Secure login and registration
🎤 **Voice Input** - Describe issues using your voice
📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client for API calls
- **Zustand** - State management
- **Sonner** - Toast notifications
- **React Icons** - Beautiful icon set

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn installed
- Backend API running (default: http://localhost:8000)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
web/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout with navbar
│   ├── page.tsx                 # Home page with hero section
│   ├── diagnosis/               # Diagnosis feature
│   │   ├── page.tsx            # Diagnosis list and form
│   │   └── [id]/page.tsx       # Diagnosis detail with chat
│   ├── chat/page.tsx           # Chat hub page
│   ├── community/page.tsx       # Community forum
│   ├── marketplace/page.tsx     # Marketplace listings
│   └── auth/                    # Authentication pages
│       ├── login/page.tsx
│       └── register/page.tsx
├── components/                  # Reusable React components
│   ├── Navbar.tsx              # Navigation bar
│   ├── HeroSection.tsx          # Landing page hero
│   ├── DiagnosisForm.tsx       # Diagnosis input form
│   └── ChatInterface.tsx        # Chat component
├── lib/                         # Utility functions and stores
│   ├── api.ts                  # API client and endpoints
│   └── store.ts                # Zustand state stores
├── public/                      # Static assets
└── package.json                # Dependencies and scripts
```

## API Endpoints Expected

The frontend expects the following backend endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Diagnosis
- `GET /diagnosis/` - List all diagnoses
- `GET /diagnosis/{id}` - Get specific diagnosis
- `POST /diagnosis/` - Create new diagnosis
- `POST /diagnosis/transcribe` - Transcribe audio to text

### Chat
- `GET /chat/diagnosis/{id}` - Get chats for diagnosis
- `POST /chat/private` - Send a message

### Community
- `GET /community/posts` - List posts
- `POST /community/posts` - Create post
- `GET /community/posts/{id}` - Get specific post

### Marketplace
- `GET /marketplace/listings` - List all products
- `GET /marketplace/listings/{id}` - Get product details
- `POST /marketplace/listings` - Create listing

## Development Features

### Authentication Flow
- Users can register or login
- Auth tokens are stored in localStorage
- Automatic token injection in API headers
- Auth state managed with Zustand

### State Management
- `useAuthStore` - Manages user authentication and tokens
- `useDiagnosisStore` - Manages current diagnosis context

### UI Components
- Glass-morphism design elements
- Smooth animations with Framer Motion
- Responsive grid layouts
- Dark theme with green accent color (#10A37F)

## Customization

### Colors
Edit `tailwind.config.ts` to customize the color scheme:
```typescript
'gemini-green': '#10A37F',     // Primary color
'gemini-dark': '#0D1117',      // Background
'gemini-light': '#F7F7F8',     // Light background
```

### API Base URL
Set `NEXT_PUBLIC_API_URL` in `.env.local` to point to your backend:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Building for Production

```bash
npm run build
npm start
```

## Deployment

The app is ready to deploy on:
- Vercel (recommended for Next.js)
- Netlify
- AWS Amplify
- Any Node.js hosting

### Vercel Deployment
```bash
npm install -g vercel
vercel
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

## Troubleshooting

### API Connection Issues
- Ensure backend is running on the configured URL
- Check CORS settings on backend
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`

### Audio Recording Not Working
- Grant microphone permissions in browser
- Ensure HTTPS in production (some browsers require it)

### Build Errors
- Delete `node_modules` and `.next` directories
- Run `npm install` again
- Clear browser cache

## Future Enhancements

- [ ] Real-time notifications
- [ ] Video consultation with experts
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Mobile app (React Native)
- [ ] Payment integration
- [ ] Advanced search and filters

## Contributing

Contributions are welcome! Please follow these steps:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes

## Support

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for farmers using AI**
