# HireSage AI X - AI-Powered Interview Platform

A modern, full-stack web application for AI-driven interview assessments and candidate evaluation.

## 🚀 Features

### Frontend
- **Modern Landing Page** - Beautiful, responsive design with gradient themes
- **Interactive Forms** - Contact forms, trial signups, and newsletter subscriptions
- **Real-time Notifications** - Toast notifications for user feedback
- **Mobile Responsive** - Optimized for all device sizes
- **Accessible UI** - Built with shadcn/ui components

### Backend
- **API Routes** - RESTful endpoints for form submissions
- **Form Validation** - Zod schema validation for all inputs
- **Database Integration** - In-memory storage with TypeScript interfaces
- **Error Handling** - Comprehensive error handling and user feedback
- **Analytics** - Admin endpoint for viewing form submissions

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Forms**: React Hook Form, Zod validation
- **Notifications**: Sonner toast
- **Icons**: Lucide React
- **Backend**: Next.js API Routes

## 📁 Project Structure

```
hiresage/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── contact/           # Contact form submissions
│   │   ├── trial/             # Trial signup handling
│   │   ├── newsletter/        # Newsletter subscriptions
│   │   └── admin/             # Admin analytics
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main landing page
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── contact-form.tsx       # Contact form component
│   └── trial-signup-form.tsx  # Trial signup component
├── lib/
│   ├── db.ts                  # Database utilities
│   └── utils.ts               # Utility functions
└── public/                    # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hiresage
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 API Endpoints

### Contact Form
- **POST** `/api/contact`
- Handles contact form submissions
- Validates: name, email, company (optional), plan (optional), message

### Trial Signup
- **POST** `/api/trial`
- Handles free trial signups
- Validates: name, email, company (optional), plan (optional), useCase (optional)

### Newsletter
- **POST** `/api/newsletter`
- Handles newsletter subscriptions
- Validates: email, name (optional)

### Admin Analytics
- **GET** `/api/admin/analytics`
- Returns analytics data (total submissions, recent entries)

## 🗄️ Database

Currently using in-memory storage for development. Ready for integration with:

- **PostgreSQL** (with Prisma)
- **MongoDB** (with Mongoose)
- **Supabase**
- **Firebase**

## 🎨 Customization

### Styling
- Modify `tailwind.config.ts` for theme customization
- Update `app/globals.css` for global styles
- Component styles in individual component files

### Content
- Update team members in `app/page.tsx`
- Modify pricing tiers in the same file
- Change features and descriptions as needed

### Backend
- Replace in-memory database in `lib/db.ts`
- Add email service integration
- Implement authentication for admin routes

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Other Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Good for full-stack apps
- **DigitalOcean**: App Platform support

## 🔧 Environment Variables

Create a `.env.local` file for production:

```env
# Database (when implementing real database)
DATABASE_URL=your_database_url

# Email Service (when implementing email)
EMAIL_SERVICE_API_KEY=your_email_service_key

# Admin Authentication
ADMIN_SECRET=your_admin_secret
```

## 📈 Analytics

View form submissions and analytics:
```bash
curl http://localhost:3000/api/admin/analytics
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@hiresage-ai.com or create an issue in the repository.

---

**Built with ❤️ by the HireSage AI X Team** 