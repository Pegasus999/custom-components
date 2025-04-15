
# 🧩 Custom Components

A personal collection of reusable components, hooks, and utilities built with **Next.js**, **shadcn/ui**, and **TypeScript**. This repository serves as a foundational toolkit for rapid development and consistency across projects.

---

## 🚀 Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **shadcn/ui** + **Radix UI**
- **Tailwind CSS**
- **React Hook Form** + **Zod**
- **Sonner** for toast notifications
- Custom hooks and utilities

---

## 📁 Project Structure

- `JWT-handlers/`: Utilities for handling JSON Web Tokens.
- `forms-components/`: Reusable form components with validation.
- `modular-logic/`: Modular logic pieces for various functionalities.
- `shadcn-components/`: UI components built with shadcn/ui.

---

## 📦 What's Inside?

### 🧱 Components

- **DataTable**: Searchable, filterable, and highly customizable tables.
- **Form Wrapper**: Integrated with Zod for schema validation and toast feedback.
- **Modal, Drawer, Dialog**: Easy-to-use UI overlays.
- **Auth Components**: Login forms, session checkers, and more.
- **UI Primitives**: Buttons, inputs, cards, and other foundational elements.

### 🧠 Hooks & Utilities

- `useDebounce`, `useMounted`, `useLocalStorage`: Commonly used custom hooks.
- API utilities with integrated toast notifications.
- JWT/session helpers.
- Role and permission management utilities.

---

## 💡 Purpose

This repository is designed to eliminate repetitive setup and promote consistency across projects. By centralizing commonly used components and logic, development becomes more efficient and maintainable.

---

## 📂 Usage

1. **Clone** the repository or **install as a local package** (monorepo friendly).
2. Import the necessary components or utilities:
   ```tsx
   import { DataTable } from "@/shadcn-components/data-table";
   import { useDebounce } from "@/modular-logic/hooks/use-debounce";
   ```
3. Customize components as needed to fit your project's requirements.

---

## 🧠 Best Practices

- Maintain strict typing; avoid using `any`.
- Keep components and utilities modular and independent.
- Customize components while preserving the base structure for consistency.

---

## 🧑‍💻 Author

Developed by [@pegasus999](https://github.com/pegasus999) to streamline development workflows and promote code reuse.
