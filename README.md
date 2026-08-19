# IGK Learning Centre — Website & LMS

A full-featured school website and Learning Management System built with **React**, **Tailwind CSS v4**, and **PocketBase**.

---

## 🌐 Live Site

The site is hosted on SiteGround Coderick and connected to the school's domain.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS v4 |
| Backend / Database | PocketBase v0.28.4 |
| Routing | React Router v7 |

---

## 📁 Project Structure

```
/
├── codebase/          # React frontend (Vite project)
│   ├── src/
│   │   ├── pages/     # All page components
│   │   ├── components/# Reusable UI components
│   │   ├── lib/       # Auth, PocketBase client, config
│   │   └── api/       # API abstraction layer
│   └── public/        # Static assets & uploaded images
├── pb_migrations/     # PocketBase database migrations
├── nginx/             # Nginx server configs (prod & staging)
├── scripts/           # Deployment & maintenance scripts
└── .github/workflows/ # CI/CD pipelines
```

---

## 👥 User Roles & Login

| Role | Email | Access |
|---|---|---|
| Site Owner | `owner@igklearningcentre.com` | Full site manager dashboard |
| LMS Admin | `academic@igklc.com` | Full LMS admin panel |
| Teacher | teacher email | Course & lesson management |
| Student | student email | Course viewing & quizzes |
| Parent | parent email | Child progress monitoring |

> ⚠️ **Change all default passwords before going live in production.**

---

## 🗄️ Database

PocketBase handles the database. Collections include:

- `users` — all accounts (students, teachers, parents, admin, owner)
- `courses`, `lessons`, `enrollments` — LMS core
- `quizzes`, `quiz_questions`, `quiz_attempts` — assessment
- `assignments`, `assignment_submissions` — homework
- `attendance` — attendance tracking
- `announcements`, `notifications` — communications
- `programs`, `site_content`, `site_media` — website CMS
- `site_settings` — school contact info & social links

All schema changes are managed via migration files in `pb_migrations/`.

---

## 🚀 Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full production deployment guide.

See [`ENVIRONMENTS.md`](./ENVIRONMENTS.md) for environment configuration.

---

## ⚠️ Security Checklist Before Going Live

- [ ] Change LMS admin password (`academic@igklc.com`)
- [ ] Change owner account password (`owner@igklearningcentre.com`)
- [ ] Delete demo account (`demo@igklc.com`)
- [ ] Reset PocketBase superuser password
- [ ] Confirm this repository is set to **Private** on GitHub

---

## 📞 School Info

**IGK Learning Centre**
Maesod, Thailand
info@igklearningcentre.com
