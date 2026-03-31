# AdminHub — React Admin Panel

A modern, fully-featured admin panel built with **React 18** + **Tailwind CSS** + **Recharts** + **React Icons**.

---

## ✨ Features

| Module | Features |
|---|---|
| **Dashboard** | Revenue & orders charts, stat cards, recent orders preview |
| **Products** | Add / Edit / Delete · Active/Inactive toggle · Search & filter by status |
| **Categories** | Card grid + table view · Add / Edit / Delete · Status toggle |
| **Users** | Add / Edit / Delete · Role management · Active/Inactive toggle · Search |
| **Banners** | Visual card preview · Add / Edit / Delete · Position tagging · Status toggle |
| **Orders** | Status filter cards · View order details · Update order status |

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production
```bash
npm run build
```

---

## 📦 Dependencies

### Runtime
| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.2.0 | UI framework |
| `react-dom` | ^18.2.0 | React DOM renderer |
| `react-router-dom` | ^6.22.0 | Client-side routing |
| `react-icons` | ^5.0.1 | Icon library (Material Design icons) |
| `recharts` | ^2.12.0 | Charts & data visualization |

### Dev
| Package | Purpose |
|---|---|
| `vite` | Build tool & dev server |
| `@vitejs/plugin-react` | React Fast Refresh |
| `tailwindcss` | Utility-first CSS |
| `postcss` | CSS processing |
| `autoprefixer` | CSS vendor prefixes |

---

## 📁 Project Structure

```
admin-panel/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx          # Entry point
    ├── App.jsx           # Root component + page routing
    ├── index.css         # Global styles + Tailwind directives
    ├── data/
    │   └── mockData.js   # Sample data (replace with API calls)
    ├── components/
    │   ├── Sidebar.jsx   # Navigation sidebar
    │   ├── TopBar.jsx    # Top header bar
    │   ├── Modal.jsx     # Reusable modal dialog
    │   └── UI.jsx        # Shared components (Toggle, Badge, Btn, etc.)
    └── pages/
        ├── Dashboard.jsx
        ├── Products.jsx
        ├── Categories.jsx
        ├── Users.jsx
        ├── Banners.jsx
        └── Orders.jsx
```

---

## 🎨 Design System

- **Primary font**: [Syne](https://fonts.google.com/specimen/Syne) (headings)
- **Body font**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- **Primary color**: Sky blue (`#0ea5e9`)
- **Background**: Slate 100 (`#f1f5f9`)

---

## 🔌 Connecting to a Real API

All data lives in `src/data/mockData.js`. To connect to a backend:

1. Replace mock arrays with `useState([])` + `useEffect` fetch calls
2. Call your API inside `useEffect` on component mount
3. Wire CRUD operations to `POST`, `PUT`, `DELETE` endpoints

Example:
```js
useEffect(() => {
  fetch('/api/products')
    .then(r => r.json())
    .then(data => setProducts(data))
}, [])
```

---

## 📱 Responsive

- **Mobile**: Collapsible sidebar (hamburger menu)
- **Tablet**: Condensed tables, hidden non-essential columns
- **Desktop**: Full sidebar + all columns visible
