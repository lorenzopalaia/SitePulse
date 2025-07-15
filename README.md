# SitePulse 📊

**SitePulse** is a modern, privacy-focused web analytics platform built with Next.js, Supabase, and TypeScript. Track your website's performance with real-time insights, beautiful charts, and detailed visitor analytics.

## ✨ Features

- **🔒 Privacy-First**: GDPR compliant analytics without compromising user privacy
- **📈 Real-time Analytics**: Live visitor tracking and real-time data updates
- **🎨 Beautiful Dashboard**: Modern, responsive UI with dark/light theme support
- **📊 Comprehensive Metrics**: Track page views, unique visitors, bounce rate, session time, and more
- **🌍 Geographic Insights**: Country-based visitor analytics with flag visualization
- **🔗 Link Tracking**: Monitor both internal and external link clicks
- **📱 Device Analytics**: Operating system and device information
- **⚡ Lightweight Script**: Minimal impact on your website's performance
- **🔔 Discord Integration**: Real-time notifications via Discord webhooks
- **🚀 Easy Setup**: Simple integration with any website

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Deployment**: Vercel (recommended)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A Supabase account and project
- (Optional) Discord bot for notifications

### 1. Clone the Repository

```bash
git clone https://github.com/lorenzopalaia/SitePulse.git
cd SitePulse
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Discord Integration (Optional)
DISCORD_CHANNEL_ID=your_discord_channel_id
DISCORD_BOT_TOKEN=your_discord_bot_token
```

### 4. Database Setup

Create the following tables in your Supabase database:

#### Websites Table

```sql
CREATE TABLE websites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  name TEXT,
  setup_status TEXT DEFAULT 'add' CHECK (setup_status IN ('add', 'install', 'done')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Events Table

```sql
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  website_id UUID REFERENCES websites(id) ON DELETE CASCADE,
  visitor_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  href TEXT,
  referrer TEXT,
  event_type TEXT NOT NULL,
  extra_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📖 Usage

### Adding a Website

1. **Sign up/Login** to your SitePulse dashboard
2. **Add a new website** by entering your domain
3. **Copy the tracking script** provided
4. **Install the script** on your website before the closing `</body>` tag:

```html
<script
  src="https://your-sitepulse-domain.com/js/script.js"
  data-website-id="your-website-id"
  data-domain="your-domain.com"
  defer
></script>
```

### Dashboard Features

- **📊 Overview**: Quick stats including total visitors, events, bounce rate, and session time
- **📈 Charts**: Visual representation of traffic over time
- **🌍 Geographic Data**: See where your visitors are coming from
- **🔗 Link Analysis**: Track internal and external link clicks
- **📱 Device Insights**: Operating system and device information
- **📄 Page Analytics**: Most visited pages on your site
- **🔍 Referrer Tracking**: See which sites are sending you traffic

## 🔧 Configuration

### Custom Events

Track custom events using the SitePulse JavaScript API:

```javascript
// Track a custom event
window.sitepulse("custom_event", {
  action: "button_click",
  value: "signup",
});

// Track page views (automatic)
window.sitepulse("pageview");
```

### Discord Notifications

To enable Discord notifications:

1. Create a Discord bot and get the bot token
2. Get your Discord channel ID
3. Add the credentials to your `.env.local` file
4. The system will automatically send notifications for new events

## 🏗️ Project Structure

```
SitePulse/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── check/         # Script verification endpoint
│   │   └── events/        # Event tracking endpoint
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Authentication pages
│   └── new/               # Website setup flow
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
│   └── js/               # Tracking script
└── utils/                # Helper utilities
    └── supabase/         # Supabase configuration
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/lorenzopalaia/SitePulse)

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Known Issues

- Timezone conversion may affect latest timestamp display in charts
- Some chart data might not appear immediately due to timezone handling

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

## 👨‍💻 Author

**Lorenzo Palaia** - [GitHub](https://github.com/lorenzopalaia)

---

⭐ **Star this repository if you find it helpful!**

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
