# 🏊‍♂️ SwimTrackJS – Swimmer Management System

A standalone Node.js & Express application to manage all aspects of a competitive swimming program. SwimTrackJS stores data as JSON files and provides RESTful CRUD endpoints for swimmer profiles, coaches, training sessions, registrations, competitions, performance statistics, health & fitness records, and event qualifications — complete with validation, relationship handling, and sample mock-data patterns.

---

## 📁 Project Structure

```
SwimTrackJS/
├── index.js
├── package.json
├── data/
│   ├── swimmers.json
│   ├── coaches.json
│   ├── training-sessions.json
│   ├── session-registrations.json
│   ├── competitions.json
│   ├── competition-participants.json
│   ├── performance-stats.json
│   └── audit.json
├── tests/
│   ├── swimmers.test.js
│   ├── coaches.test.js
│   ├── training-session.test.js
│   ├── registrations.test.js
│   ├── competitions.test.js
│   ├── competitionParticipants.test.js
│   ├── performanceStats.test.js
│   ├── healthFitness.test.js
│   └── audit.test.js
└── src/
    ├── db.js
    ├── routes/
    │   ├── index.js
    │   └── v1/
    │       ├── swimmers.js
    │       ├── coaches.js
    │       ├── training-sessions.js
    │       ├── registrations.js
    │       ├── competitions.js
    │       ├── competition-participants.js
    │       ├── performance-stats.js
    │       ├── health-fitness.js
    │       └── audit.js
    ├── controllers/
    │   ├── controllerFactory.js
    │   ├── swimmerController.js
    │   ├── coachController.js
    │   ├── trainingSessionController.js
    │   ├── registrationController.js
    │   ├── competitionController.js
    │   ├── competitionParticipantController.js
    │   ├── performanceStatController.js
    │   ├── healthFitnessController.js
    │   └── auditController.js
    ├── services/
    │   ├── serviceFactory.js
    │   ├── swimmerService.js
    │   ├── coachService.js
    │   ├── trainingSessionService.js
    │   ├── registrationService.js
    │   ├── competitionService.js
    │   ├── competitionParticipantService.js
    │   ├── performanceStatService.js
    │   ├── healthFitnessService.js
    │   └── indexManager.js
    ├── models/
    │   └── validation/
    │       ├── swimmerValidation.js
    │       ├── coachValidation.js
    │       ├── trainingSessionValidation.js
    │       ├── registrationValidation.js
    │       ├── competitionValidation.js
    │       ├── competitionParticipantValidation.js
    │       ├── performanceStatValidation.js
    │       └── healthFitnessValidation.js
    ├── utils/
    │   ├── fileOps.js
    │   ├── transactionManager.js
    │   ├── relationshipManager.js
    │   ├── queryBuilder.js
    │   └── logger.js
    └── middleware/
        └── errorHandler.js
```

---

## ⚙️ How to Run

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the server**

   ```bash
   npm start
   ```

3. **Run test**

   ```bash
   npx jest <testfilename>
   ```

---

## 🔍 Key Highlights

| # | Module                                 | Status      | Key Features                                                                                            |
| - | -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| 1 | Swimmer API                            | ✅ Completed | Full CRUD for swimmer profiles with email & DOB validation, JSON-file persistence, consistent errors    |
| 2 | Coach API & Swimmer–Coach Linking      | ✅ Completed | Coach CRUD, primary-coach assignment/unlinking, referential integrity & cascade-delete prevention       |
| 3 | Training Session API                   | ✅ Completed | Session CRUD with date/time validation, coach linkage, capacity constraints, filtering by date/coach    |
| 4 | Session Registration API               | ✅ Completed | Registration CRUD, capacity checks, duplicate-booking prevention, slot freeing, list by session/swimmer |
| 5 | Competition API                        | ✅ Completed | Competition CRUD with future-date validation, max-participants enforcement, filtering by date/location  |
| 6 | Performance Statistics API             | ✅ Completed | Read-only stats endpoints; calculates best/average times and total races per swimmer/event on-the-fly   |
| 7 | Swimmer Health & Fitness API           | ✅ Completed | HealthRecord CRUD, injury & assessment tracking, training metrics, health-trend querying                |
| 8 | Event Registration & Qualification API | ✅ Completed | Qualification CRUD, auto-validation vs. standards, status tracking, coach review, event ranking         |

---

## 🧪 Unit Test Results & 🚀 Code Execution Screenshots

| Conversation | Test Result Screenshot                                                    | Code Execution Screenshot                                                 |
| --| ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| 1 | [View](https://drive.google.com/file/d/1YstpgZgdzcaG3PsqroaGJSEnW6gEBbAH/view?usp=drive_link) | [View](https://drive.google.com/file/d/1TcVjATTsTjIVLKmOJ47oC87AG4lWUY43/view?usp=drive_link) |
| 2 | [View](https://drive.google.com/file/d/1TcVjATTsTjIVLKmOJ47oC87AG4lWUY43/view?usp=drive_link) | [View](https://drive.google.com/file/d/1kUXctBvkAXQ-Y2KSI_qny4mPv-czy-KK/view?usp=drive_link) |
| 3 | [View](https://drive.google.com/file/d/1cUbeuU5-Gnwdl5hL2h8suX-wG1mMJweK/view?usp=drive_link) | [View](https://drive.google.com/file/d/1i0V13YA906tA0iAaT92bF97d0C9ryK-0/view?usp=drive_link) |
| 4 | [View](https://drive.google.com/file/d/1JhKr28QQVVhvVBl2pZIJAy5kjzdoWo9Q/view?usp=drive_link) | [View](https://drive.google.com/file/d/1OZ9YVyLCO3ZhF1lQ2iNBlkR_BQ-5FLWH/view?usp=drive_link) |
| 5 | [View](https://drive.google.com/file/d/1UdNcJVRRq2y3ydXxZAOOyAUQ4vAeywPo/view?usp=drive_link) | [View](https://drive.google.com/file/d/1IxmRI3g6IzNDA107gPqCulhPfduNRt3Y/view?usp=drive_link) |
| 6 | [View](https://drive.google.com/file/d/1sCO0haLbpOrtLs4DRb3wXzqSlRXQ6UCL/view?usp=drive_link) | [View](https://drive.google.com/file/d/1519tsNXhkN3KuM_nL7cj2TLsPs7cshdx/view?usp=drive_link) |
| 7 | [View](https://drive.google.com/file/d/1EXKrRCCPAV980DbMJ49rXVy2MsD8Psmh/view?usp=drive_link) | [View](https://drive.google.com/file/d/1P2ZgQKtmnXuHRPFagL2on0e9ZZM-U-KN/view?usp=drive_link) |
| 8 | [View](https://drive.google.com/file/d/1Aw_iyPTvag9XeI-EJe8Q_TeVCc4qMTk1/view?usp=drive_link)| [View](https://drive.google.com/file/d/1lxKc-c3_s_FD3w31RxBVoRAC1tE1YG71/view?usp=drive_link) |

---

## 📦 Dependencies

See [`package.json`](./package.json) for the full list.
Key dependencies include:

* **express** – HTTP server framework
* **body-parser** – JSON payload parsing
* **jest** & **supertest** – Testing framework & HTTP assertions
* **nodemon** (dev) – Dev auto-reload
* **date-fns** – Date validation & manipulation

---
