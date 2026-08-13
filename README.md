# StayNest — Airbnb-style Hotel Booking Platform

A full-stack MERN application for browsing and booking hotels/accommodations with an Airbnb-inspired design.

## Features

- 🏠 **Browse Listings** — Filter by category (Trending, Rooms, Mountains, Beachfront, etc.)
- 🔍 **Search** — Search by location, title, or description
- 🗺️ **Interactive Maps** — OpenStreetMap + Leaflet integration with geocoding
- 📸 **Image Upload** — Upload to Cloudinary or paste direct URLs
- ⭐ **Reviews & Ratings** — Leave star ratings and comments
- 🔐 **Authentication** — Secure user signup/login with Passport.js
- 💳 **Responsive Design** — Mobile-first Airbnb-style UI

## Tech Stack

**Frontend:**
- React 19 + Vite
- React Router v7
- Leaflet (maps)
- Axios

**Backend:**
- Node.js + Express 5
- MongoDB + Mongoose
- Passport.js (authentication)
- Cloudinary (image storage)
- Multer (file uploads)

## Setup Instructions

### Prerequisites

- Node.js 22+ (or 24+)
- MongoDB Atlas account (free tier)
- Cloudinary account (free tier)
- MapTiler account (optional, for maps)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd react-hotel
```

### 2. Install dependencies

```bash
# Root (backend)
npm install

# Frontend
cd client
npm install
cd ..
```

### 3. Configure environment variables

**Backend** — Create `.env` in the root folder:

```bash
cp .env.example .env
```

Edit `.env` and fill in your actual credentials:

```env
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret
ATLASDB_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname
SECRET=a_long_random_secret_string
```

**Frontend** (optional) — Create `client/.env`:

```bash
cd client
cp .env.example .env
```

Edit `client/.env`:

```env
VITE_MAP_TOKEN=your_maptiler_token
```

### 4. Run the application

**Development mode** (starts both backend and frontend):

```bash
npm run dev
```

This will:
- Start the Express server on `http://localhost:8080`
- Start the Vite dev server on `http://localhost:5173`

Open **http://localhost:5173** in your browser.

**Production mode:**

```bash
# Build frontend
cd client
npm run build
cd ..

# Start backend (serves built frontend)
npm start
```

## Project Structure

```
react-hotel/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # Axios config
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Route pages
│   │   └── index.css       # Global styles
│   └── vite.config.js
├── models/                  # Mongoose schemas
│   ├── listing.js
│   ├── reviews.js
│   └── user.js
├── routes/                  # Express routes
│   └── api/
│       ├── listings.js
│       └── users.js
├── utils/                   # Helper functions
├── middleware.js            # Auth & validation middleware
├── app.js                   # Express server
├── cloudConfig.js           # Cloudinary setup
└── dev.js                   # Dev startup script
```

## API Endpoints

### Listings
- `GET /api/listings` — Get all listings (query: `?category=`)
- `GET /api/listings/:id` — Get single listing
- `POST /api/listings` — Create listing (auth required)
- `PUT /api/listings/:id` — Update listing (owner only)
- `DELETE /api/listings/:id` — Delete listing (owner only)

### Reviews
- `POST /api/listings/:id/reviews` — Add review (auth required)
- `DELETE /api/listings/:id/reviews/:reviewId` — Delete review (author only)

### Users
- `GET /api/users/me` — Get current user
- `POST /api/users/signup` — Register new user
- `POST /api/users/login` — Login
- `POST /api/users/logout` — Logout

## Environment Variables

| Variable | Description |
|----------|-------------|
| `CLOUD_NAME` | Cloudinary cloud name |
| `CLOUD_API_KEY` | Cloudinary API key |
| `CLOUD_API_SECRET` | Cloudinary API secret |
| `ATLASDB_URL` | MongoDB connection string |
| `SECRET` | Session secret key |
| `VITE_MAP_TOKEN` | MapTiler API token (frontend) |

## License

MIT

## Contributing

Pull requests are welcome! For major changes, please open an issue first.
