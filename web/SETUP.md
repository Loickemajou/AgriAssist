# 🚀 Gemination Frontend Setup Guide

## Quick Start

### 1. Installation

Navigate to the web folder and install dependencies:

```bash
cd Gemination/web
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the `web` directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your backend API URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
web/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with navbar & footer
│   ├── page.tsx           # Home page
│   ├── diagnosis/         # Diagnosis pages
│   ├── chat/              # Chat page
│   ├── community/         # Community forum
│   ├── marketplace/       # Marketplace
│   └── auth/              # Auth pages (login/register)
├── components/            # React components
│   ├── Navbar.tsx        # Navigation
│   ├── Footer.tsx        # Footer
│   ├── HeroSection.tsx   # Hero section
│   ├── DiagnosisForm.tsx # Diagnosis form
│   ├── ChatInterface.tsx # Chat component
│   ├── LoadingSpinner.tsx # Loading state
│   └── ErrorBoundary.tsx # Error handling
├── lib/
│   ├── api.ts            # API client
│   ├── store.ts          # Zustand stores
│   └── types.ts          # TypeScript interfaces
├── public/               # Static assets
├── .env.local            # Environment variables (create from .env.local.example)
└── package.json          # Dependencies
```

## 🎨 Design Features

### Color Scheme
- **Primary Green**: `#10A37F` - Gemini green
- **Dark Background**: `#0D1117` - Dark theme
- **Light Background**: `#F7F7F8` - Light accents

### Key Components
- **Glass Morphism** - Semi-transparent frosted glass effects
- **Gradient Text** - Eye-catching headings
- **Smooth Animations** - Framer Motion transitions
- **Dark Theme** - Easy on the eyes

### Responsive Design
- Mobile-first approach
- Grid layouts that adapt to screen size
- Touch-friendly buttons and inputs
- Optimized for all devices

## 🔗 Backend Integration

### Expected API Endpoints

The frontend is configured to connect to these backend endpoints:

```
POST   /auth/login
POST   /auth/register
GET    /diagnosis/
POST   /diagnosis/
GET    /diagnosis/{id}
POST   /diagnosis/transcribe
GET    /chat/diagnosis/{id}
POST   /chat/private
GET    /community/posts
POST   /community/posts
GET    /marketplace/listings
```

### API Client Configuration

The API client is configured in `lib/api.ts`:

```typescript
// Automatically injects auth tokens
// Handles CORS and common errors
// Base URL from NEXT_PUBLIC_API_URL env var
```

## 🔐 Authentication

### User Flow
1. User registers with email, password, and name
2. Backend returns JWT token
3. Token stored in localStorage
4. Token automatically sent with API requests
5. Logout clears token and resets auth state

### Protected Routes
Currently, all routes are accessible. Add route protection in `middleware.ts` if needed.

## 📱 Features Overview

### 1. **Crop Diagnosis** (`/diagnosis`)
- Upload images of crops
- Record audio descriptions
- Text-based symptom descriptions
- AI analysis and results
- View past diagnoses

### 2. **Chat Interface** (`/chat`)
- Ask follow-up questions about diagnoses
- Get expert advice
- Voice input support
- Message history

### 3. **Community** (`/community`)
- Share farming experiences
- Like and comment on posts
- Connect with other farmers
- View posts in chronological order

### 4. **Marketplace** (`/marketplace`)
- Browse agricultural products
- View ratings and prices
- Buy and sell items
- Seller information

### 5. **Authentication** (`/auth`)
- User registration
- Login with email/password
- Token management
- Session persistence

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts and your site will be live!

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY .next /app/.next
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t gemination-web .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=<backend-url> gemination-web
```

### Other Platforms

- **Netlify**: Connect Git repo, set `NEXT_PUBLIC_API_URL` in environment
- **AWS Amplify**: Similar process to Netlify
- **Self-hosted**: Run `npm run build && npm start`

## 🔧 Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Build and start
npm run build && npm start
```

## 📊 Performance Optimizations

- ✅ Server-side rendering with Next.js
- ✅ Image optimization
- ✅ Code splitting
- ✅ API request caching
- ✅ Lazy loading components
- ✅ CSS-in-JS with Tailwind

## 🐛 Troubleshooting

### API Connection Issues
```
Error: Failed to connect to API
→ Check NEXT_PUBLIC_API_URL in .env.local
→ Ensure backend is running
→ Check CORS configuration on backend
```

### Microphone Not Working
```
Error: Failed to access microphone
→ Check browser permissions
→ In production, require HTTPS
→ Test in different browser
```

### Build Errors
```
Error: Module not found
→ Delete node_modules and .next
→ Run npm install again
→ Clear npm cache: npm cache clean --force
```

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Zustand](https://github.com/pmndrs/zustand)
- [TypeScript](https://www.typescriptlang.org)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📝 Code Style

- Use TypeScript for type safety
- Follow React hooks best practices
- Use Tailwind CSS classes
- Keep components small and focused
- Add proper error handling
- Write meaningful comments

## 🎯 Next Steps

1. ✅ Frontend setup complete
2. ⏭️ Ensure backend is running on configured URL
3. ⏭️ Test authentication flow
4. ⏭️ Test API connections
5. ⏭️ Deploy to production

## 💡 Tips

- Use React DevTools for debugging
- Check Network tab for API calls
- Use TypeScript strict mode
- Keep environment variables secure
- Test on mobile devices
- Monitor bundle size

## 📞 Support

For issues or questions:
1. Check the README.md
2. Look at component examples
3. Check browser console for errors
4. Review API response in Network tab

---

Happy farming! 🌾 Made with ❤️ by the Gemination team
