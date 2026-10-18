# Balaji website API + admin panel

## 1. Set up MongoDB
Create a MongoDB Atlas database and database user, then allow your development IP in Network Access.

## 2. Configure the server
In PowerShell, from this `server` folder:
```powershell
Copy-Item .env.example .env
notepad .env
npm install
npm run dev
```
Replace every placeholder in `.env`. Do not share or commit `.env`.

## 3. Open the site
Run the website through VS Code Live Server (usually http://127.0.0.1:5500). If using another port, set `CLIENT_ORIGIN` in `.env` accordingly.

## 4. Admin panel
Open `admin.html` from the website root using Live Server. Log in with `ADMIN_USERNAME` and `ADMIN_PASSWORD` from `server/.env`.

## API routes
- `GET /api/health`
- `GET /api/products`
- `POST /api/enquiries`
- `POST /api/admin/login`
- `GET /api/admin/enquiries`
- `PATCH /api/admin/enquiries/:id`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `DELETE /api/admin/products/:id`

## Important
This is a starter project. Use a strong unique admin password and JWT secret, keep `.env` private, and deploy the API over HTTPS before public launch. The admin page can manage product records and enquiries. Image fields accept image URLs; file uploads need a separate storage service.
