# Asmika Fashion Backend

A production-ready Hono + Cloudflare Workers backend for Asmika Fashion, integrated with Supabase.

## Tech Stack
- **Framework**: [Hono](https://hono.dev/)
- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Validation**: Zod
- **Auth**: JWT with custom Web Crypto password hashing

## Getting Started

### 1. Installation
```bash
cd backend
npm install
```

### 2. Database Setup
1. Log in to your [Supabase Dashboard](https://app.supabase.com/).
2. Open the **SQL Editor**.
3. Copy and paste the contents of `schema.sql` and run it to create the necessary tables and triggers.

### 3. Storage Setup
1. In Supabase, go to **Storage**.
2. Create a new **Public** bucket named `asmika-media`.
3. (Optional) Create folders: `products`, `categories`, `subcategories`, `collections`.

### 4. Environment Variables
Create a `.dev.vars` file in the `backend` directory (I have already created this for you with your keys):
```txt
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

### 5. Create Initial Admin
Since there is no "register" endpoint for admins, you need to insert the first admin manually into the `admins` table.
You can use the following SQL (replace with your desired email and a hashed password):

*Note: The password hashing uses Web Crypto PBKDF2. For development, you can use a placeholder or I can provide a utility script to generate the hash.*

### 6. Development
```bash
npm run dev
```

### 7. Deployment
```bash
npm run deploy
```

## API Documentation

### Auth
- `POST /api/auth/login`: Admin login

### Products
- `GET /api/products`: Fetch all products (supports filters)
- `GET /api/products/:slug`: Fetch single product
- `POST /api/products`: Create product (Protected)
- `PUT /api/products/:id`: Update product (Protected)
- `POST /api/products/:id/archive`: Archive product (Protected)
- `POST /api/products/:id/restore`: Restore product (Protected)
- `DELETE /api/products/:id`: Hard delete product (Protected)

### Categories & Subcategories
- `GET /api/categories`: Fetch all categories
- `POST /api/categories`: Create category (Protected)
- `GET /api/subcategories`: Fetch all subcategories
- `POST /api/subcategories`: Create subcategory (Protected)

### Collections
- `GET /api/collections`: Fetch all collections
- `POST /api/collections`: Create collection (Protected)

### Enquiries
- `POST /api/enquiries`: Submit a new enquiry (Public)
- `GET /api/enquiries`: Fetch enquiries (Protected)
- `PUT /api/enquiries/:id/status`: Update enquiry status (Protected)

### Smart Formatter
- `POST /api/formatter`: Format raw textile input into descriptions (Protected)

### Media Uploads
- `POST /api/uploads`: Upload image (Protected)
- `DELETE /api/uploads`: Delete image (Protected)
