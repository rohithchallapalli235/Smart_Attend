# Smart Attend

Institutional smart attendance management system for colleges and institutions.

## Features

- Student dashboard with percentage tracking
- Faculty dashboard with attendance monitoring
- Institution-level overview and analytics
- Attendance status logic:
  - >=75% = Safe (green)
  - 60 to <75% = Alert (blue)
  - <60% = Warning (red)
- Email alert to faculty and parent when attendance enters Alert or Warning range
- College SMTP configuration using your own college email ID and password
- Institution-managed registration for students and faculty

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- Nodemailer
- Prisma with SQLite

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
cp .env.example .env.local
```

3. Update the SMTP credentials in `.env.local`:

```env
SMTP_HOST=smtp.college.edu
SMTP_PORT=587
SMTP_USER=attendance@college.edu
SMTP_PASSWORD=your-college-mail-password
SMTP_FROM=attendance@college.edu
SMTP_SECURE=false
```

The default local database is SQLite. Initialize it after installing dependencies:

```bash
npx prisma db push
```

The institution can register student and faculty login credentials from the institution dashboard. Passwords are stored as bcrypt hashes.

4. Start the app:

```bash
npm run dev
```

5. Open the app in the browser:

```text
http://localhost:3000
```

## Important note on email

The application is designed to use your institution's college email account as the sender. The email credentials are entered in `.env.local` and should never be committed to version control.

## Production note

For production deployment, use a secure environment secret manager or hosting platform secrets manager.
