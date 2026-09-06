# StayNest 🏡

An Airbnb-inspired full-stack hotel booking platform built with the MERN stack.

![StayNest](https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&auto=format&fit=crop&q=60)

---

## Features

### For Customers (Guests)
- 🔐 **Email OTP Login** — No password needed. Enter email → get OTP → log in
- 🏠 **Browse Listings** — Filter by 9 categories (Trending, Rooms, Mountains, Beachfront, etc.)
- 🔍 **Search** — Search by title, location, country, or description
- 📅 **Book a Stay** — Reserve with full details: name, phone, check-in/out, guests
- ⭐ **Reviews** — Leave star ratings and comments with Airbnb-style review cards
- 🗺️ **Interactive Maps** — OpenStreetMap + Leaflet with location geocoding

### For Hosts
- 🔐 **Email OTP Login** — Same secure OTP flow after account creation
- ➕ **List a Property** — Add title, description, category, price, location, photos
- 📸 **Multi-image Upload** — Upload up to 10 photos per listing (Cloudinary)
- ✏️ **Edit / Delete** — Full CRUD on your own listings
- 🔒 **Role Protection** — Edit/Delete only visible to the listing owner

### General
- 📱 **Responsive Design** — Mobile-first Airbnb-style UI
- 💌 **Real Email OTP** — Styled HTML emails via Gmail SMTP (Nodemailer)
- 🖼️ **Photo Grid + Lightbox** — Airbnb-style photo grid on listing detail page
- 🎠 **Image Carousel** — Swipeable carousel with arrows + dots on listing cards

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, React Router v7 |
| Styling | Plain CSS (custom Airbnb-style design system) |
| Maps | Leaflet + React-Leaflet + Nominatim geocoding |
| HTTP | Axios |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas + Mongoose |
| Auth | Passport.js + Email OTP (no passwords) |
| Sessions | express-session + connect-mongo |
| Images | Cloudinary (direct buffer upload) |
| Email | Nodemailer + Gmail SMTP |
| Deployment | AWS Elastic Beanstalk ready |

---

## Project Structure

```
StayNest/
├── app.js                    # Express server entry point
├── cloudConfig.js            # Cloudinary SDK setup
├── middleware.js             # isLoggedIn, isHost, isOwner guards
├── schema.js                 # Joi validation schemas
├── dev.js                    # Dev startup script (backend → frontend)
├── Procfile                  # AWS Elastic Beanstalk process file
│
├── models/
│   ├── listing.js            # Listing schema (multi-image support)
│   ├── user.js               # User schema (host/guest roles)
│   ├── reviews.js            # Review schema
│   ├── booking.js            # Booking schema
│   └── otp.js                # OTP schema (auto-expires in 10 min)
│
├── routes/api/
│   ├── listings.js           # CRUD + reviews
│   ├── users.js              # Signup, OTP send/verify, logout
│   └── bookings.js           # Create booking, get my bookings
│
├── utils/
│   ├── mailer.js             # Nodemailer Gmail OTP emails
│   ├── wrapAsync.js          # Async error wrapper
│   └── ExpressError.js       # Custom error class
│
└── client/                   # React frontend (Vite)
    └── src/
        ├── api/axios.js      # Axios instance
        ├── context/          # AuthContext (currentUser, isHost, isGuest)
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── ListingCard.jsx   # Card with image carousel
        │   ├── BookingModal.jsx  # Booking form modal
        │   ├── LocationMap.jsx   # Leaflet map (picker + view)
        │   └── Toast.jsx
        └── pages/
            ├── ListingsPage.jsx  # Home grid with filters
            ├── ShowPage.jsx      # Listing detail + booking + reviews
            ├── NewListingPage.jsx
            ├── EditListingPage.jsx
            ├── LoginPage.jsx     # Customer + Host OTP login
            └── SignupPage.jsx    # Customer + Host signup
```

---

## API Reference

### Users
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users/me` | Get current session user | — |
| POST | `/api/users/signup` | Create host account | — |
| POST | `/api/users/send-otp` | Send OTP to email | — |
| POST | `/api/users/verify-otp` | Verify OTP & log in | — |
| POST | `/api/users/logout` | Log out | ✓ |

### Listings
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/listings` | Get all listings (`?category=`) | — |
| GET | `/api/listings/:id` | Get single listing | — |
| POST | `/api/listings` | Create listing | Host only |
| PUT | `/api/listings/:id` | Update listing | Owner only |
| DELETE | `/api/listings/:id` | Delete listing | Owner only |
| POST | `/api/listings/:id/reviews` | Add review | ✓ |
| DELETE | `/api/listings/:id/reviews/:reviewId` | Delete review | Author only |

### Bookings
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/bookings` | Create a booking | ✓ |
| GET | `/api/bookings/my` | Get my bookings | ✓ |

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free) — [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Cloudinary account (free) — [cloudinary.com](https://cloudinary.com)
- Gmail account with App Password — see below

### 1. Clone the repo

```bash
git clone https://github.com/Pranaypatil43/SyayNest.git
cd SyayNest
```

### 2. Install dependencies

```bash
# Backend
npm install

# Frontend
cd client && npm install && cd ..
```

### 3. Create your `.env` file

```bash
cp .env.example .env
```

Fill in your values:

```env
ATLASDB_URL=mongodb+srv://user:pass@cluster.mongodb.net/staynest
SECRET=any_long_random_string_here
CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_key
CLOUD_API_SECRET=your_cloudinary_secret
GMAIL_USER=your_gmail@gmail.com
GMAIL_PASS=your_16_char_app_password
```

### 4. Get Gmail App Password (for OTP emails)

1. Go to [myaccount.google.com](https://myaccount.google.com) → **Security**
2. Enable **2-Step Verification**
3. Search **"App passwords"** → Select **Mail** → **Generate**
4. Copy the 16-character code → paste as `GMAIL_PASS` (no spaces)

### 5. Run in development

```bash
npm run dev
```

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:5173`

### 6. Build for production

```bash
npm run build   # builds React into client/dist/
npm start       # Express serves everything on port 8080
```

---

## User Roles

| Role | How to create | Can do |
|---|---|---|
| **Guest** | Just enter any email on Login page — account auto-created | Browse, book, review |
| **Host** | Sign up → enter username + email → log in via OTP | All guest actions + create/edit/delete listings |

---

## Deployment on AWS Elastic Beanstalk

```bash
# 1. Install AWS + EB CLI
pip install awsebcli

# 2. Build the React app
npm run build

# 3. Initialize EB
eb init staynest --platform node.js --region ap-south-1

# 4. Set environment variables (never upload .env)
eb setenv \
  NODE_ENV=production \
  ATLASDB_URL="your_url" \
  SECRET="your_secret" \
  CLOUD_NAME="your_name" \
  CLOUD_API_KEY="your_key" \
  CLOUD_API_SECRET="your_secret" \
  GMAIL_USER="your_gmail" \
  GMAIL_PASS="your_app_pass"

# 5. Deploy
eb create staynest-prod   # first time
eb deploy                  # subsequent updates

# 6. Open
eb open
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `ATLASDB_URL` | ✅ | MongoDB Atlas connection string |
| `SECRET` | ✅ | Session encryption secret (any long random string) |
| `CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUD_API_KEY` | ✅ | Cloudinary API key |
| `CLOUD_API_SECRET` | ✅ | Cloudinary API secret |
| `GMAIL_USER` | ✅ | Gmail address used to send OTPs |
| `GMAIL_PASS` | ✅ | Gmail App Password (16 chars, no spaces) |
| `NODE_ENV` | prod only | Set to `production` on AWS |
| `CLIENT_URL` | prod only | Your frontend domain (for CORS) |
| `PORT` | optional | Server port (default: 8080, AWS sets automatically) |

---

## License

MIT © 2026 Pranay Patil
