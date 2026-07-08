# ByteBazaar

ByteBazaar is a full-stack digital marketplace where creators can upload, manage, and share digital products such as eBooks, notes, templates, and other downloadable files. Users can securely authenticate, publish products with thumbnails, and browse products uploaded by others.

---

## Features

* User Registration and Login
* JWT Authentication
* Secure Password Hashing with bcrypt
* Upload Digital Products
* Upload Product Thumbnails
* Cloud Storage using Cloudinary
* Product CRUD Operations
* View All Products
* Personal Dashboard
* Responsive User Interface
* MySQL Database Integration

---

## Tech Stack

### Frontend

* React
* TypeScript
* TanStack Router
* Tailwind CSS
* Shadcn UI
* Axios
* React Hook Form

### Backend

* Node.js
* Express.js
* MySQL
* JWT Authentication
* Multer
* Cloudinary
* bcryptjs

---

## Project Structure

```text
ByteBazaar/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── context/
│   ├── services/
│   └── routes/
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── models/
│   └── app.js
│
└── README.md
```

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/bytebazaar.git
cd bytebazaar
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file.

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bytebazaar

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend.

```bash
nodemon server.js
```

---

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

---
