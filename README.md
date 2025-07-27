# ⚖️ Adhikaar

*Empowering citizens through real-time legal access, AI-assisted documentation, and verified advocate consultation.*

Adhikaar is a modern legal-tech platform designed to bridge the justice gap in India. It enables citizens to connect with verified advocates, initiate video consultations, chat in real-time, and generate legal documents using Gemini AI — all from one place.

---

## 📚 Table of Contents

* Features
* Technologies Used
* Getting Started
* Prerequisites
* Installation
* Running the Project Locally
* License
* Contact

---

## 🌟 Features

* Verified Advocate Profiles & Search
* Real-time Video Consultation (ZeoCloud)
* Live Chat via Socket.IO
* Gemini AI–powered Document Drafting & Translation
* Role-based Access (User / Advocate / Admin)
* Legal Journal Publishing for Advocates

---

## 🧪 Technologies Used

* Next.js (App Router)
* React & Tailwind CSS
* Prisma + PostgreSQL
* NextAuth.js
* Socket.IO
* Gemini API (Google)
* ZeoCloud (Video infra)
* Cloudinary (Image storage)
* TypeScript

---

## ⚙️ Getting Started

---

### 🔧 Prerequisites

Make sure you have the following installed:

* Node.js (v20.11.1 or later)
* pnpm (v8.6.7 or later)
* Git (v2.45.1 or later)
* PostgreSQL or [NeonDB](https://neon.tech/)

---

### 📥 Installation

```bash
git clone https://github.com/your-username/adhikaar.git
cd adhikaar
pnpm install
```

---

### 🔐 Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-secret

GEMINI_API_KEY=your-gemini-api-key
ZEOCLOUD_API_KEY=your-zeocloud-api-key

NODE_ENV=development
```

---

### 🧾 Running the Project Locally

1. Sync the Prisma schema:

```bash
pnpm prisma generate
pnpm prisma db push
```

2. Start the development server:

```bash
pnpm dev
```

3. Open your browser and visit:

```
http://localhost:3000
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 📬 Contact

For more information or support:
📧 **[teamxtesseract@gmail.com](mailto:teamxtesseract@gmail.com)**
