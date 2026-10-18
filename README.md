# Balaji Corian Home Decor Website

Responsive HTML, CSS and JavaScript website built from the provided logo, product images and reference template.

## Run locally
- Extract the ZIP.
- Open the `balaji-corian-website` folder in VS Code.
- Open `index.html` directly in a browser, or use the VS Code Live Server extension.

## Included
- Company logo and brand palette
- Responsive home page
- Product category filters
- Product gallery with supplied images; prices are intentionally omitted and customers are invited to enquire
- Contact information and WhatsApp enquiry buttons
- Enquiry form that opens WhatsApp with a pre-filled message

## Contact information used from supplied template
- +91 96305 89519 (configured as WhatsApp)
- +91 97525 35368
- Plot No. 141, Shop No. 1 & 2, Zone 2, Maharana Pratap Nagar, Bhopal – 462011, Madhya Pradesh

## Important
- The site is currently static. The enquiry form does not save customer data to a database; it opens WhatsApp so the customer can send the message.
- Product images that show room interiors are presented as design inspiration, with price on enquiry.
- Confirm prices, stock, business hours and details before publishing.
- To connect a database later, build a backend API and update the form submit logic to send enquiries securely to that API.


## Full-stack admin + database upgrade
A starter MongoDB/Express API is included in `server/`, and the admin panel is `admin.html`.

1. Install Node.js.
2. Create a MongoDB Atlas database and database user.
3. Open a terminal in `server` and run `Copy-Item .env.example .env` (PowerShell).
4. Edit `server/.env`: add your MongoDB connection string, a long unique JWT secret, and your own admin username/password.
5. Run `npm install` and then `npm run dev` inside `server`.
6. Open the root `index.html` using Live Server. The contact form will attempt to save enquiries to the API and also open WhatsApp.
7. Open `admin.html` using Live Server to manage product records and enquiries.

The website's original product cards are static design content; the admin panel stores product records in MongoDB but does not yet dynamically replace the static gallery. This can be connected as the next integration step. Never publish the `.env` file or use placeholder credentials in production.
