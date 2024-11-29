# RequestPay

RequestPay is a decentralized application (dApp) built on the **Request Network** to simplify cryptocurrency payment requests. It empowers freelancers, businesses, and individuals to create, share, and track payment requests with ease, eliminating the complexity of blockchain transactions.

---

## Problem Statement

### Challenges in Current Payment Solutions
- **Complexity**: Requires technical expertise or blockchain integration.
- **Inconvenience**: Limited user-friendly interfaces for non-technical users.
- **Inefficiency**: Tracking payment statuses involves manual work and navigating block explorers.

---

## Solution: RequestPay

RequestPay addresses these challenges by providing:
- **Easy onboarding** for users with no technical expertise.
- An **intuitive design** for seamless payment requests.
- **Real-time tracking** of payment statuses.

---

## Features

### Effortless Payment Requests
- Input details such as:
  - The **amount** to be paid.
  - The **recipient’s blockchain wallet address**.
  - An **optional description** (e.g., "Invoice #123").
- Instantly generate a **unique payment link** (e.g., `https://requestpay.com/request/abcdef123`).

### Instant Sharing and Notifications
- Share payment links via:
  - **Email**, **social media**, or **messaging platforms**.
- Receive notifications:
  - When the payment link is generated.
  - When the payment is confirmed or completed.

### Real-Time Payment Tracking
- Monitor transaction statuses (**Pending**, **Confirmed**, or **Completed**) via:
  - **RequestPay Dashboard**.
  - **Request Network Explorer**.
- Export payment data (CSV files) for businesses.

### User-Friendly Interface
- **No sign-up required**: Simply connect a blockchain wallet to start.
- Intuitive design ensures non-technical users can onboard quickly.

---

## How It Works

### Step 1: Create a Payment Request
1. Open the RequestPay app.
2. Enter:
   - The payment amount.
   - The recipient’s wallet address.
   - An optional description (e.g., "Payment for services").
3. Click **"Generate Payment Link"** to create a unique link.

### Step 2: Share the Payment Link
1. Share the link via:
   - **Email**, **social media**, or **messaging apps**.
2. Recipients click the link to complete the payment.

### Step 3: Track Payment Status
1. Use the dashboard to monitor the transaction.
2. Receive real-time updates for statuses:
   - **Pending**
   - **Confirmed**
   - **Completed**

---

## Running the App

### Prerequisites
- Node.js and npm installed on your system.
- A connected **MetaMask wallet**.

### Installation
```bash
# Clone the repository
git clone https://github.com/blockdudes/Request-Pay

# Navigate to the project directory
cd Request-Pay

# Install dependencies
npm install

# Start the development server
npm run dev
