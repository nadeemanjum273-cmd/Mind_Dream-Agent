# Mind_Dreams — AI Customer Support Chatbot & RAG Engine

A production-ready, sleek, modern white-themed Next.js web application for an AI-powered customer support chatbot named **Mind_Dreams**.

![Mind_Dreams Chatbot](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-4285F4?style=flat-square&logo=google)
![Google Sheets](https://img.shields.io/badge/Integration-Google%20Sheets%20API%20v4-34A853?style=flat-square&logo=googlesheets)
![RAG Engine](https://img.shields.io/badge/RAG-LangChain%20Policy%20Indexing-00A67E?style=flat-square)

---

## 🌟 Key Features

1. **RAG Policy Indexing (`policy.txt`)**:
   - Automatically chunks and indexes company policies (Return, Refund, Shipping, Warranty, Exchange, Customer Support) using logical chapter splits (~500 words per chunk).
   - Mind_Dreams AI strictly references these indexed policy rules when answering policy-related queries.

2. **Google Sheets Real-Time Live Sync (3 Portions)**:
   - **Portion 1 ("Orders"):** Looks up order details, prices, product stock, and places new customer orders dynamically.
   - **Portion 2 ("Refund Eligibility"):** Validates purchase dates against the 30-day (15-day for electronics) policy timeframe.
   - **Portion 3 ("Bank Details"):** Prompts for bank account info upon refund qualification and logs payout details in real time.

3. **Google Gemini AI Agent with Function Calling**:
   - Executes multi-step function tool calls (`search_policy_rag`, `search_product_catalog`, `lookup_customer_order`, `place_new_order`, `check_refund_eligibility`, `submit_bank_details_for_refund`).

4. **Sleek White-Themed UI**:
   - Modern, slick, clean UI with Tailwind CSS, glassmorphism, responsive chat bubbles, status indicators, and live data inspector modals.

---

## 📂 Project Structure

```
AI Agent MD/
├── policy.txt                              # Company Policy Document
├── package.json                            # Dependencies & Scripts
├── tsconfig.json                           # TypeScript Configuration
├── tailwind.config.ts                      # Tailwind CSS Theme & Colors
├── postcss.config.mjs
├── next.config.mjs
├── .env.example                            # Template for Environment Variables
├── README.md                               # Setup & Deployment Documentation
└── src/
    ├── app/
    │   ├── layout.tsx                      # Root Layout & Metadata
    │   ├── page.tsx                        # Main Dashboard Page
    │   ├── globals.css                     # Tailwind & Glassmorphism CSS
    │   └── api/
    │       ├── chat/route.ts              # Chatbot API Endpoint (Gemini AI + RAG)
    │       ├── sheets/route.ts            # Live Google Sheets API (3 Portions)
    │       └── rag/route.ts               # Policy RAG Indexer API
    ├── lib/
    │   ├── rag/indexer.ts                 # Logical Chunking & RAG Retrieval
    │   ├── sheets/googleSheets.ts         # Real-Time Google Sheets Integration & Fallback
    │   ├── gemini/agent.ts                # Gemini Function Calling AI Agent
    │   └── types.ts                       # TypeScript Interfaces
    └── components/
        ├── ChatInterface.tsx              # White-themed Chatbot Component
        ├── Header.tsx                     # Header with Status Badges
        ├── SheetsViewerModal.tsx          # Real-time Inspector for 3 Sheets Portions
        ├── PolicyViewerModal.tsx          # RAG Chunks Inspector & Search Tester
        └── SetupGuideModal.tsx            # Vercel Deployment & Google Sheets Guide
```

---

## 🚀 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Google Sheets Integration (3 Portions: Orders, Refund Eligibility, Bank Details)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account@project_id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_google_sheet_id_here
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📊 Setting Up Google Sheets (3 Portions)

1. Create a Google Spreadsheet with 3 tabs:
   - `Orders`
   - `Refund Eligibility`
   - `Bank Details`
2. Create a **Service Account** in Google Cloud Console with Google Sheets API enabled.
3. Share your Google Sheet with the Service Account email address (with **Editor** access).
4. Click **"Inspect 3 Sheets" &rarr; "Seed Google Sheet Headers"** in the web app UI to automatically set up column headers!

---

## 🌐 Seamless Vercel Deployment

1. Push code to your **GitHub** repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Mind_Dreams Chatbot"
   git branch -M main
   git remote add origin https://github.com/your-username/mind-dreams-chatbot.git
   git push -u origin main
   ```
2. Import the repository into **Vercel** (`https://vercel.com`).
3. Add the 4 environment variables (`GEMINI_API_KEY`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`) under **Project Settings &rarr; Environment Variables**.
4. Deploy! Your Mind_Dreams Chatbot will be live 24/7.
