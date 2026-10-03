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
- Parent and faculty email alerts through Resend or configured SMTP
- Institution-managed registration for students and faculty

## Tech stack

- Next.js
- TypeScript
- Tailwind CSS
- Nodemailer
- Prisma with PostgreSQL

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create a PostgreSQL database and configure your environment:

```bash
Copy `.env.example` to `.env.local`, then set `DATABASE_URL` to your PostgreSQL connection string and choose an institution email/password.
```

3. Configure email delivery. Resend is recommended for Render because some Render services restrict SMTP egress. Verify a sending domain with Resend, then set:

```env
RESEND_API_KEY=re_...
EMAIL_FROM="Smart Attend <alerts@your-verified-domain.edu>"
```

Alternatively configure an SMTP service with `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM`. Never commit email-provider secrets.

4. Initialize the database schema after installing dependencies:

```bash
npx prisma db push
```

The institution can register faculty and students from the institution dashboard. Their records are stored in PostgreSQL, and passwords are stored as bcrypt hashes.

5. Start the app:

```bash
npm run dev
```

6. Open the app in the browser:

```text
http://localhost:3000
```

## Render deployment

Create a Render PostgreSQL database, then set the web service's `DATABASE_URL` to that database's **Internal Database URL**. Set `INSTITUTION_EMAIL` and a strong `INSTITUTION_PASSWORD` on the web service as well. The start command runs `prisma db push` before serving requests; the build does not require a live database.

For alerts, set `RESEND_API_KEY` and `EMAIL_FROM` in the Render web service's environment. The sender domain must be verified with Resend. Alternatively, set all SMTP variables for an SMTP provider that permits connections from Render. Email alerts are submitted as soon as attendance is saved, and a batch is processed concurrently.

Use Render's secret environment variables for all credentials. If the existing deployment contains users in an ephemeral SQLite database, provision PostgreSQL and re-register those users or migrate them once; this change cannot recover data already lost when the ephemeral instance restarted. The SMTP password previously embedded in source should be revoked and replaced.
