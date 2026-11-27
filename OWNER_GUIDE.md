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

### Three Ways Orders Appear:
1. **Automatic (with Supabase connected):** Any order placed by a customer appears on your kitchen screen instantly in real-time.
2. **Take Phone Call / Walk-In Order (New):**
   - When a customer calls on the phone or walks in, tap the **"📞 Take Phone Order"** button in the top tools bar.
   - Enter their Name and Floor/Desk/Time.
   - Tap the food items on the quick menu picker (with search & category filters) to set quantities.
   - Select packaging (*Takeaway pack +₦300* or *Own plate ₦0*) and payment method.
   - Read the generated **4-digit Pickup Code** (e.g. `4910`) to the caller immediately over the phone!
   - Tap **"✅ Record Order & Pin to Board"**. It pins straight to your active kitchen board and syncs across all devices.
   - *(Optional)* If caller phone number is entered, tap **"💬 WhatsApp Ticket to Caller"** to send them a receipt with their pickup code.
3. **Manual WhatsApp Pinning:** If a customer sent an order directly via WhatsApp or text:
   - Copy the message text from WhatsApp.
   - Paste it into the **"Paste incoming WhatsApp message here"** box on the Kitchen Board.
   - Tap **"Pin to Board"**. The system automatically extracts the customer's name, food items, total, and pickup code.

### 📅 Order Dates & Date Grouping:
Incoming orders are automatically grouped by the date they arrived with clear headings:
- **"Today"** — Orders placed today.
- **"Yesterday"** — Orders placed yesterday.
- **"Wednesday 25th November"** — Specific calendar date for older orders.

### 🔍 Quick Filter Pills:
Filter the kitchen display anytime using the top filter buttons:
- **All Orders**: Shows every recorded order.
- **Today Only**: Shows only orders received today during lunch rush.
- **To Pack / Ready**: Filters to only active pending orders that need action.
- **Handed Over**: Shows historical completed orders.

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
| **WhatsApp Phone** | The WhatsApp number that receives all orders | `2347082291264` *(Default configured)* |
| **Bank Account Info** | Automatically included in tickets when customer selects bank transfer | `7082291264 - Moniepoint MFB` |
| **Staff PIN** | The secret PIN to access the kitchen board & settings | Default: `1234` |

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
