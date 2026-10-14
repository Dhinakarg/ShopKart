# Deploying ShopKart on Vercel

ShopKart is configured for seamless deployment on Vercel as a fullstack application (Vite React frontend + Express Node.js serverless functions).

---

## 🚀 Quick Deployment Guide (Fullstack Monorepo)

### Step 1: Push Code to GitHub
Ensure all code and configurations are pushed to your GitHub repository:
```bash
git add .
git commit -m "Configure Vercel deployment"
git push origin main
```

### Step 2: Import into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
2. Select your `ShopKart` GitHub repository.
3. Keep **Root Directory** as `./` (default).
4. Vercel will automatically detect the settings from `vercel.json` and `package.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`

### Step 3: Configure Environment Variables
In the Vercel project setup screen, expand **Environment Variables** and add:

| Variable Name | Description | Example / Required Value |
|---|---|---|
| `MONGO_URI` | MongoDB Atlas Connection String | `mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopkart?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for JWT signing | `shopkart_production_secret_key_2026` |
| `RAZORPAY_KEY_ID` | Razorpay Test Key ID | `rzp_test_Tm9TwY3GxTDMtI` |
| `RAZORPAY_KEY_SECRET` | Razorpay Test Key Secret | `BuOeFxCiYjcdnALu27lLmz1Q` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Key ID for client checkout | `rzp_test_Tm9TwY3GxTDMtI` |
| `NODE_ENV` | Runtime environment | `production` |

> ⚠️ **Important for MongoDB Atlas:**
> Because Vercel serverless functions run on dynamic cloud IPs, open your [MongoDB Atlas Dashboard](https://cloud.mongodb.com) -> **Network Access** -> **IP Access List** and add `0.0.0.0/0` (Allow access from anywhere).

### Step 4: Click Deploy!
Vercel will compile the Vite frontend, bundle the serverless functions (`/api`), and provide you with a live URL (e.g., `https://shopkart-xyz.vercel.app`).

---

## 🛠️ Alternative: Deploy Client & Server Separately

If you prefer deploying the frontend on Vercel and the backend on Render/Railway:

### 1. Backend (Server)
- Set root directory to `server`
- Configure `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `CLIENT_URL` (your frontend Vercel URL).

### 2. Frontend (Client on Vercel)
- Set root directory to `client` in Vercel project settings.
- Add environment variable:
  - `VITE_API_URL`: `https://your-backend-api.onrender.com`
  - `VITE_RAZORPAY_KEY_ID`: `rzp_test_...`
- `client/vercel.json` is already configured for React Router SPA rewrites.

---

## 🔍 Health Check
Once deployed, test your API at:
```http
GET https://your-deployment.vercel.app/api/health
```
Expected response:
```json
{
  "status": "ok",
  "message": "ShopKart API is running"
}
```
