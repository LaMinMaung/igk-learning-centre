# IGK Learning Centre — Website & LMS

A full-featured school website and Learning Management System built with **React**, **Tailwind CSS v4**, and **PocketBase**.

---

## 🌐 Overview

IGK Learning Centre is a production web platform for a school in Mae Sot, Thailand, combining a public-facing marketing site with a role-based Learning Management System (LMS) for course delivery, assessments, and communication between teachers, students, and parents.

---

## 🏗️ Tech Stack

| Layer              | Technology                   |
| ------------------ | ----------------------------- |
| Frontend           | React 19 + TypeScript + Vite |
| Styling            | Tailwind CSS v4               |
| Backend / Database | PocketBase v0.28.4            |
| Routing            | React Router v7               |
| CI/CD              | GitHub Actions                |

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

## 👥 User Roles

The system supports five distinct role-based access levels, each with a dedicated dashboard:

| Role       | Access                                  |
| ---------- | ---------------------------------------- |
| Owner      | Full site management dashboard           |
| Admin      | Full LMS admin panel                     |
| Teacher    | Course & lesson management               |
| Student    | Course viewing, quizzes, resource library|
| Parent     | Child progress monitoring                |

---

## 🗄️ Database

PocketBase handles the database. Core collections include:

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

## ✨ Key Features

- Role-based authentication and dashboards for five distinct user types
- Full course and lesson management system for teachers
- Quiz engine with auto-graded assessments and results tracking
- Resource library with a document reader
- Parent portal for monitoring child progress
- Website CMS for managing public-facing content without code changes
- Isolated development, staging, and production environments
- Automated CI/CD deployment pipeline via GitHub Actions

---

## 🚀 Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full production deployment guide and [`ENVIRONMENTS.md`](./ENVIRONMENTS.md) for environment configuration details.

Each environment (development, staging, production) runs against its own isolated database with no data crossing environment boundaries.

---

## 🏛️ Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for a full breakdown of the system design, including the frontend/backend data flow and infrastructure layer.

---

## 📞 Contact

**IGK Learning Centre**
Mae Sot, Thailand

---

## 📄 License

This project is licensed under the MIT License — see [`LICENSE`](./LICENSE) for details.
