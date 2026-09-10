# Job Board Backend API

A scalable **Job Board Backend API** built with **Node.js, Express.js, TypeScript, MongoDB, GraphQL, and Socket.IO**.

The project provides authentication, user/company/job management, applications, real-time chat, notifications, and an admin dashboard.

## 🚀 Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB & Mongoose
- GraphQL
- Socket.IO
- JWT Authentication
- Google OAuth
- Zod Validation
- bcrypt
- Redis
- Firebase Admin / FCM
- Cloudinary
- Nodemailer
- Helmet
- CORS
- Express Rate Limit
- CRON Jobs
- AWS Deployment

## ✨ Main Features

### Authentication & Authorization
- System & Google authentication
- Access & Refresh Tokens
- Email verification using OTP
- Forgot & Reset Password
- Role-based authorization
- Password hashing with bcrypt
- Mobile number encryption

### User Management
- Update account information
- Profile & Cover picture upload
- Soft delete account
- Profile data for other users
- Password update

### Company Management
- Create and update companies
- Company owner & HR management
- Company approval by Admin
- Company logo & cover upload
- Soft delete
- Search companies

### Jobs
- Create, update and delete jobs
- Job filtering & searching
- Pagination, sorting and total count
- Company-related jobs
- Technical & soft skills

### Applications
- Apply to jobs
- Upload CV
- Application status management
- Accept / Reject applicants
- Email notifications

### Real-Time Chat
- Real-time messaging using Socket.IO
- HR / Company Owner can initiate conversations
- Users can reply after the conversation is started

### Admin Dashboard
Built with **GraphQL**:
- View users and companies
- Ban / unban users
- Ban / unban companies
- Approve companies

### Security & Background Tasks
- Helmet
- CORS origin configuration
- Rate limiting
- JWT authentication
- CRON job to remove expired OTPs every 6 hours
- Mongoose hooks for related-document cleanup

## 🧩 Validation

The assignment specified **Class Validator**.

However, this project uses **Zod** for request validation instead of Class Validator, providing schema-based validation for:

- Body
- Params
- Query
- Headers
- Files

## 🗄️ Main Collections

- User
- Company
- Job
- Application
- Chat
- Notification

## ☁️ Deployment

The backend is **deployed on AWS**.

## 📮 API Testing

All REST APIs were tested using **Postman**.

The exported Postman Collection is included in the repository.

## 📁 Project Structure

```text
src/
├── DB/
├── middleware/
├── modules/
├── services/
├── utils/
├── graphql/
├── config/
└── index.ts
```

## 👨‍💻 Author

**Mohamed Nasser**

- GitHub: [DevMohamedNasser](https://github.com/DevMohamedNasser)
- LinkedIn: [Mohamed Nasser](https://www.linkedin.com/in/dev-mohamed-nasser/)
```
