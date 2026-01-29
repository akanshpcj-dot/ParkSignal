# ParkSignal 🚗📲

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)
![Turso](https://img.shields.io/badge/Database-Turso-green)
![Status](https://img.shields.io/badge/Status-Active%20Development-yellow)
![Privacy](https://img.shields.io/badge/Privacy-First-success)

**ParkSignal** is a smart, privacy-first QR-based vehicle contact system that enables instant communication with parked car owners. Each vehicle is assigned a unique QR code that, when scanned, allows direct contact via phone call or WhatsApp — without installing an app or exposing personal information.

ParkSignal is designed for real-world use: fast, reliable, print-safe, and frictionless.

---

## ✨ Key Highlights

- 🔗 Unique QR code per vehicle  
- 📞 One-tap call to vehicle owner  
- 💬 Optional WhatsApp fallback  
- 🔒 Privacy-first (no tracking, no scan logs)  
- 🖨️ Print-optimized, high-contrast QR codes  
- ⚡ Lightweight and mobile-first  

---

## 🧭 How ParkSignal Works

1. Vehicle owner registers a vehicle in the admin dashboard  
2. ParkSignal generates a unique QR code  
3. QR code is placed on the vehicle windshield  
4. Anyone can scan the QR code  
5. Scanner can instantly contact the owner via call or WhatsApp  

No login. No app. No friction.

---

## 🔐 Privacy by Design

ParkSignal follows strict privacy principles:

- No QR scan tracking  
- No cookies on public pages  
- No analytics on scan flow  
- No phone numbers displayed as plain text  
- No interception or storage of calls or messages  

All communication happens directly through the user’s device and service provider.

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)  
- **Database:** Turso (SQLite at the edge)  
- **Hosting:** Vercel  
- **Authentication:** Email + Password (Admin only)  
- **QR Codes:** SVG-based with high error correction  
- **Messaging:** Direct call + WhatsApp deep links  

---

## 📂 Project Structure (High Level)

/app
/login
/dashboard
/q/[carId] # Public QR scan page

/api
/auth
/vehicles

/lib
db.ts
auth.ts

/public
/brand
parksignal-logo.svg


---

## 🌍 Use Cases

- Private car owners  
- Residential apartments  
- Office parking spaces  
- Visitor parking areas  
- Commercial vehicles  

---

## 🚀 Deployment

ParkSignal is optimized for edge deployment and modern hosting platforms.

- Environment-based configuration  
- No hardcoded secrets  
- Production-ready defaults  

---

## 📄 Legal & Safety

- [Privacy Policy](/privacy)  
- [Terms of Use](/terms)  
- [Safety Notice](/safety)  

ParkSignal is not an emergency service and should only be used for polite, non-urgent communication related to parked vehicles.

---

## 📌 Project Status

🚧 Active development  
Core functionality is stable and production-focused.  
Additional enhancements may be introduced incrementally.

---

## 🧠 Philosophy

> ParkSignal is designed to disappear.  
> When it works well, users don’t think about it — they just get on with their day.

---

© ParkSignal. All rights reserved.
