# 🍲 Zapols Restaurant & Lounge — Owner & Staff Operating Guide

Welcome to your **Zapols Office Meal & WhatsApp Ordering System**. This platform streamlines office lunch orders, reduces WhatsApp order clutter, and eliminates food pickup mix-ups using **4-digit secure pickup codes**.

---

## 📋 Table of Contents
1. [How the System Works](#how-the-system-works)
2. [Accessing Staff & Kitchen Controls](#accessing-staff--kitchen-controls)
3. [The Kitchen Board Workflow](#the-kitchen-board-workflow)
4. [Pickup-Code Verification](#pickup-code-verification)
5. [Managing Menu, Stock & Prices](#managing-menu-stock--prices)
6. [Restaurant Settings & Bank Details](#restaurant-settings--bank-details)
7. [Customer Ordering Experience](#customer-ordering-experience)
8. [Tips for Lunch Rush Operations](#tips-for-lunch-rush-operations)

---

## 1. How the System Works

```
Customer Opens Menu
      ↓
Selects Meals & Enters Desk/Floor
      ↓
Sends WhatsApp Ticket
      ↓
Gets 4-Digit Pickup Code
      ↓
Kitchen Prepares & Marks Packed
      ↓
Staff Verifies 4-Digit Code & Hands Over Food
```

1. **Customers** visit the web link on their mobile phones, select their meals, and enter their name and floor/office location.
2. When they tap **"Send Order"**, the order is pre-formatted and sent directly to your restaurant's WhatsApp number.
3. The customer receives a **unique 4-digit pickup code** on their screen.
4. **Kitchen staff** see the order on the **Kitchen Board** (or paste it from WhatsApp).
5. When the food is collected, staff type the 4-digit code into the Kitchen Board to verify and hand over the meal.

---

## 2. Accessing Staff & Kitchen Controls

To keep kitchen controls and pricing settings hidden from regular customers, they are password-protected:

### 🔑 Secret Staff Unlock (On Any Phone or Tablet):
1. **Tap the restaurant logo** in the top-left header **5 times quickly**.
2. A **"Staff Unlock"** prompt will appear.
3. Enter your Staff PIN (Default is **`1234`**).
4. Tap **Unlock**.

> **Kitchen Tablet Shortcut:** On your dedicated kitchen tablet or laptop, open the URL with `?vendor=1` at the end (e.g. `https://your-domain.com/?vendor=1`). This automatically keeps kitchen tools accessible.

### Locking Staff Controls:
Tap the **"Lock"** button in the top-right header whenever you hand your phone to a customer.

---

## 3. The Kitchen Board Workflow

Once unlocked, tap the **"Kitchen"** button in the header to switch to the live order board.

### Two Ways Orders Appear:
1. **Automatic (with Supabase connected):** Any order placed by a customer appears on your kitchen screen instantly with zero delay.
2. **Manual WhatsApp Pinning:** If a customer sent an order directly via WhatsApp or text:
   - Copy the message text from WhatsApp.
   - Paste it into the **"Paste incoming WhatsApp message here"** box on the Kitchen Board.
   - Tap **"Pin to Board"**. The system automatically extracts the customer's name, food items, total, and pickup code.

### Ticket Statuses:
- **To pack (Yellow):** New incoming order that needs preparation.
  - Action: Tap **"Mark Packed"** once the food is boxed and ready.
- **Ready (Green):** Meal is bagged and waiting on the counter for pickup.
- **Handed over (Muted):** Food has been collected and verified.

---

## 4. Pickup-Code Verification

> **The Golden Rule:** Never hand food to a courier or colleague without matching their 4-digit code! This prevents wrong deliveries in busy office buildings.

### Step-by-Step Handover:
1. When someone comes to collect order `#ZPL-842K`, ask:  
   *"What is your 4-digit pickup code?"*
2. Customer reads or shows the code on their screen (e.g., `4910`).
3. Enter the 4 digits into the **Pickup Code** box under the ticket.
4. Tap **"Verify & Hand Over"**:
   - ✅ **Match:** Screen confirms *"Order #ZPL-842K verified and handed over!"*
   - ❌ **Mismatch:** System warns *"Wrong code! Does not match order."*

### What if a customer forgot their code?
Kitchen staff can tap **"Staff peek: view expected code"** right below the ticket to cross-check with the customer's name, phone, or WhatsApp chat.

---

## 5. Managing Menu, Stock & Prices

To add food, update prices, or mark dishes sold out:
1. Tap the **Settings (⚙)** icon in the header (staff mode must be unlocked).
2. Scroll to the **Menu & Stock** sections:

### Marking Items "Sold Out" (During Lunch Rush):
- Find the dish (e.g., *Jollof Rice* or *Goat Meat*).
- Tap the **"In Stock"** pill to toggle it to **"Sold Out"**.
- Customers immediately see **"Sold out"** on their phones and cannot add it to their plate.
- Tap it again tomorrow to restore stock.

### Adding a New Item:
1. Enter the dish name (e.g. *Peppered Turkey*).
2. Enter the price in Naira (e.g. `2500`).
3. Select the category (*Proteins*, *Rice*, *Soups*, etc.).
4. Tap **"Add Item"**.

---

## 6. Restaurant Settings & Bank Details

Under the **Settings (⚙)** modal, you can update:

| Setting | Description | Example |
| :--- | :--- | :--- |
| **Restaurant Name** | Displays in the app header and on WhatsApp ticket headers | `Zapols Restaurant & Lounge` |
| **WhatsApp Phone** | The WhatsApp number that receives all orders | `2348012345678` *(Start with country code, no `+`)* |
| **Bank Account Info** | Automatically included in tickets when customer selects bank transfer | `GTBank - 0123456789 - Zapols Lounge` |
| **Staff PIN** | The secret PIN to access the kitchen board & settings | Change from `1234` to your custom PIN |

---

## 7. Customer Ordering Experience

Here is what your office customers see and do:
1. **Category Filter & Search:** Quick-jump between *Rice*, *Soups*, *Swallows*, *Sides*, *Proteins*, and *Extras*.
2. **Custom Plate Building:** Stepper buttons (`+` / `−`) make it easy to add 2 portions of beef, 1 jollof, and extra dodo.
3. **Packaging Options:** Customers pick either:
   - *Takeaway pack* (`+₦300`)
   - *Own plate / eat-in* (`₦0`)
4. **Delivery Location:** Customers specify their exact office floor (e.g., *"4th Floor, Tech Team"*).
5. **Instant WhatsApp Order:** Tapping **"Send Order"** opens WhatsApp with the entire ticket formatted with emojis, itemized breakdown, and total.
6. **Order Confirmation Sheet:** After sending, a confirmation pop-up displays their **4-digit pickup code** in giant numbers with a **Copy Code** button.

---

## 8. Tips for Lunch Rush Operations

1. **Mount a Kitchen Tablet:** Place a low-cost Android tablet or iPad in the packing area displaying the Kitchen Board in full screen.
2. **Review Notes First:** Customers often put special instructions (e.g. *"extra pepper"*, *"no fish"*). The Kitchen Board highlights prep notes in yellow.
3. **Keep Phone Battery Charged:** Ensure the official restaurant WhatsApp phone has notifications turned on with loud alert sounds for incoming orders.
4. **Update Sold Out Items Promptly:** If the last portion of *Afang Soup* or *Fisherman Soup* is dished, toggle it to **Sold Out** in settings immediately to avoid customer disappointment.
