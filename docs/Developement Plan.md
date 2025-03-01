# BriqPilot-Frontend
Pilot Frontned
# **🚀 Frontend MVP Development Plan**  

This plan outlines the key features, UI/UX structure, and a **10-day development roadmap** for the **BriqPilot Frontend**. The goal is to provide users with an intuitive interface to manage **authentication, API keys, SMS & email messaging, OTP verification, and logs tracking**.

---

## **🔹 Key Features for the Frontend MVP**  

### **1️⃣ Authentication & API Key Management**
- **User Registration** – Signup form to create an account.  
- **User Login** – Login with email & password.  
- **Token Management** – Store JWT in `localStorage` or `httpOnly` cookies for secure authentication.  
- **API Key Management:**  
  - Generate, copy, and delete API keys.  
  - Display existing API keys securely.  

### **2️⃣ Dashboard (Main Interface)**
- **User Dashboard:**  
  - Overview of account status (**verified/unverified**).  
  - API key management.  
- **Send SMS:**  
  - Form to send **single & bulk SMS**.  
  - Select provider (**Africa's Talking** or **NextSMS**).  
- **Send Email:**  
  - Form to send emails using **Gmail API**.  

### **3️⃣ Logs & History**
- **SMS Logs:**  
  - View sent SMS history.  
  - Check **delivery status** (delivered, failed, pending).  
- **Email Logs:**  
  - View sent emails.  
  - Track **email delivery status**.  

### **4️⃣ OTP Verification**
- Request OTP for verification (via **SMS or Email**).  
- Submit OTP to verify the user’s account.  

---

## **🔹 UI/UX Design Plan**  

### **📌 Pages to Build**
#### **Authentication Pages**
- `/register` – **Signup Page**  
- `/login` – **Login Page**  
- `/verify` – **OTP Verification Page**  

#### **Dashboard Pages**
- `/dashboard` – **User Overview**  
- `/api-keys` – **Manage API Keys**  
- `/send-sms` – **SMS Sending Form**  
- `/send-email` – **Email Sending Form**  
- `/logs/sms` – **View SMS Logs**  
- `/logs/email` – **View Email Logs**  

---

## **🔹 8-Day Development Roadmap**  

### **📅 Phase 1 (Days 1-3): Authentication & API Key Management**
✅ Set up **React (Next.js)** with **Tailwind/MUI**.  
✅ Implement **User Registration & Login** using **JWT authentication**.  
✅ Build UI for **API Key generation & management**.  

---

### **📅 Phase 2 (Days 4-6): Messaging Features**
✅ Build the **SMS sending page** with provider selection.  
✅ Build the **Email sending page** with Gmail integration.  
✅ Display **SMS & Email logs** in a structured table format.  

---

### **📅 Phase 3 (Days 7-8): OTP Verification & Security**
✅ Implement the **OTP verification UI**.  
✅ Restrict API usage to **verified accounts only**.  


---