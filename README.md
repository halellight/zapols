# Zapols Restaurant & Lounge

Office meal ordering platform with WhatsApp ticketing and pickup-code verification.

## Tech Stack
- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19)
- **Language:** TypeScript
- **Styling:** Custom CSS (`zapols.css`)

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Features
- **Office Meal Ordering:** Browse categories (Rice, Soups, Swallows, Sides, Proteins, Extras) and build meal plates.
- **WhatsApp Integration:** Generates formatted WhatsApp order tickets with pickup code, breakdown, and bank transfer info.
- **Pickup Verification Code:** 4-digit code generated for handover security.
- **Kitchen Board:** Dedicated board to pin WhatsApp orders, track packing status, and verify pickup codes before handing over food (tap logo 5 times or append `?vendor=1`).
- **Offline / Local Persistence:** Menu items, past order history, settings, and active tickets are stored locally.
