📋 CODE STYLE GUIDE - Backoffice Starter Template
เอกสารนี้เป็นแบบแผนการเขียนโค้ด (Code Style Guide) ฉบับสมบูรณ์ สำหรับโปรเจ็ค Backoffice Starter Template ใน Next.js ซึ่งรวมเอาข้อกำหนดพื้นฐาน กฎระเบียบก่อนหน้า และกฎเพิ่มเติมล่าสุดเข้าไว้ด้วยกัน
📌 สารบัญ
1. ภาพรวมโปรเจ็ค
2. โครงสร้างโปรเจ็ค
3. สัญญาเขียนโค้ด TypeScript
4. การตั้งชื่อและ Naming Convention
5. React & Next.js Best Practices
6. การจัดการข้อมูลเริ่มต้นด้วย onInit (กฎใหม่)
7. การใช้งาน useState ร่วมกับ any (กฎใหม่)
8. การจัดองค์ประกอบ Component
9. ชั้น API Layer
10. การจัดการ Constants และ Config
11. Comment และ Documentation
12. CSS และ Styling (รวมถึง Font Classes)
13. Responsive Design (ขนาดจอ)
14. การจัดการโทเค็นใกล้เต็มและไฟล์ Markdown
15. หลักการวางแผนก่อนลงมือทำ (Plan)
16. Import และ Dependencies
17. Error Handling
18. State Management
19. Linting และ Formatting ด้วย Prettier (อัปเดตใหม่)
20. แนวทางเพิ่มเติม
21. Checklist ก่อน Commit
1. ภาพรวมโปรเจ็ค
Stack เทคโนโลยี
Framework: Next.js 15+ (App Router)
Language: TypeScript (strict mode ปิด)
UI Library: HeroUI (Tailwind CSS based)
Styling: Tailwind CSS + CSS variables
HTTP Client: Axios
State Management: React Hooks + Context API
i18n: Custom Translation Provider
Authentication: Cookie-based with JWT
หลักการหลัก
✅ Centralized API layer (ห้ามเรียก axios โดยตรง)
✅ Constants management ในไฟล์ src/config/app.ts
✅ Component-based architecture
✅ Composable UI components จาก HeroUI
✅ Middleware สำหรับ authentication
✅ Multi-language support พร้อม
2. โครงสร้างโปรเจ็ค
src/
├── app/                           # Next.js App Router
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (login)
│   ├── providers.tsx             # Global providers (Theme, i18n, etc)
│   ├── admin/                    # Admin section (ต้อง login)
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── access/
│   │   └── example/              # Feature example
│   ├── api/
│   │   └── mock/                 # Mock API responses
│   └── forgot-password/
│
├── components/                    # Reusable React Components
│   ├── common/                   # Shared UI components
│   │   ├── BreadcrumbsComponent.tsx
│   │   ├── ChipStatusComponent.tsx
│   │   ├── ConfirmModalComponent.tsx
│   │   ├── UploadFileComponent.tsx
│   │   ├── alertComponent/       # Alert variations
│   │   └── notfound/
│   └── layout/                   # Layout-specific components
│       ├── navbarComponent.tsx
│       ├── sidebarComponent.tsx
│       ├── tabsComponent.tsx
│       └── MenuProvider.tsx
│
├── service/                       # Business logic & API calls
│   ├── http.ts                   # Centralized API layer
│   ├── common.tsx                # Shared utilities
│   └── permission.ts             # Permission checks
│
├── config/                        # Application constants
│   └── app.ts                    # Central config file
│
├── i18n/                         # Internationalization
│   └── TranslationProvider.tsx
│
├── mocks/                        # Mock data
│   ├── menu.ts
│   └── store.ts
│
└── types/                        # TypeScript types & interfaces
    └── api.ts


3. สัญญาเขียนโค้ด TypeScript
TypeScript Configuration
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": false, // ✅ ปิด strict mode
    "noUnusedLocals": false, // ✅ อนุญาต unused variables
    "noUnusedParameters": false, // ✅ อนุญาต unused params
    "jsx": "preserve", // ✅ Preserve JSX for Next.js
    "module": "esnext",
    "moduleResolution": "bundler"
  },
  "paths": {
    "@/*": ["./src/*"] // ✅ Path alias
  }
}


4. การตั้งชื่อและ Naming Convention
Components: PascalCase + "Component" suffix (เช่น BreadcrumbsComponent.tsx)
Utilities: camelCase (เช่น http.ts, common.tsx)
Folders: camelCase (เช่น alertComponent/)
Next.js files: lowercase (เช่น page.tsx, layout.tsx, route.ts)
5. React & Next.js Best Practices
ระบุ "use client"; ที่บรรทัดแรกสำหรับ Client Components
ใช้ useRouter จาก next/navigation ใน App Router
จัดการข้อผิดพลาดด้วย try-catch และเรียกใช้ผ่าน API Layer
6. การจัดการข้อมูลเริ่มต้นด้วย onInit (กฎใหม่)
onInit Pattern: ใช้ฟังก์ชันหรือโครงสร้างรูปแบบ onInit สำหรับการดึงข้อมูลหลายชุดหรือจัดการการโหลดข้อมูลเริ่มต้นมาพร้อมกันในครั้งเดียว เพื่อความเป็นระเบียบและลดปัญหาการเรียกซ้ำ
7. การใช้งาน useState ร่วมกับ any (กฎใหม่)
useState Type: หากประกาศใช้งาน useState แล้วยังไม่มีประเภทข้อมูล (Type) ที่ชัดเจน หรือเป็นข้อมูลยืดหยุ่น ให้กำหนดเป็น any ไปก่อนเพื่อความสะดวกรวดเร็วในการพัฒนา
8. การจัดองค์ประกอบ Component
ลำดับการเขียนภายใน Component:
Imports (React, Libraries, Local Services, Components, Config/Types)
Type definitions & Interfaces
Component declaration (Hooks, State declarations, Event handlers, Render)
9. ชั้น API Layer
ทุกหน้าต้องเรียกผ่านฟังก์ชันกลางใน src/service/http.ts เท่านั้น (Get, Post, Update, Delete, Logins) ห้าม import axios ตรงๆ เพื่อให้การจัดการ Header และ Token หมดอายุทำงานที่จุดเดียว
10. การจัดการ Constants และ Config
รวมค่าคงที่ทั้งหมดไว้ที่ src/config/app.ts (เช่น ROUTES, COOKIE_KEYS, API_BASE_URL, LOGO)
11. Comment และ Documentation
ใช้ JSDoc สำหรับอธิบายฟังก์ชันหรือคอมโพเนนต์สำคัญ
Comment Rule: คำคอมเมนต์ในโค้ดไม่ต้องอธิบายยืดยาว ให้ใส่คอมเมนต์แท็กสั้นๆ เพื่อระบุว่าส่วนนั้นคือส่วนไหนของโค้ด
12. CSS และ Styling (รวมถึง Font Classes)
ใช้งาน Tailwind CSS ควบคู่กับ CSS Variables และเพิ่มคลาสสำหรับฟอนต์ Poppins รองรับ Noto Sans Thai ดังนี้:
.poppins-thin {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 100;
  font-style: normal;
}

.poppins-extralight {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 200;
  font-style: normal;
}

.poppins-light {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 300;
  font-style: normal;
}

.poppins-regular {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 400;
  font-style: normal;
}

.poppins-medium {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 500;
  font-style: normal;
}

.poppins-semibold {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 600;
  font-style: normal;
}

.poppins-bold {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 700;
  font-style: normal;
}

.poppins-extrabold {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 800;
  font-style: normal;
}

.poppins-black {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 900;
  font-style: normal;
}

.poppins-thin-italic {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 100;
  font-style: italic;
}

.poppins-extralight-italic {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 200;
  font-style: italic;
}

.poppins-light-italic {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 300;
  font-style: italic;
}

.poppins-regular-italic {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 400;
  font-style: italic;
}

.poppins-medium-italic {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 500;
  font-style: italic;
}

.poppins-semibold-italic {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 600;
  font-style: italic;
}

.poppins-bold-italic {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 700;
  font-style: italic;
}

.poppins-extrabold-italic {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 800;
  font-style: italic;
}

.poppins-black-italic {
  font-family: "Poppins", "Noto Sans Thai", sans-serif;
  font-weight: 900;
  font-style: italic;
}


13. Responsive Design (ขนาดจอ)
การออกแบบและพัฒนาต้องรองรับขนาดหน้าจอหลักตามมาตรฐานดังนี้:
Device Category
Breakpoint / Screen Size
Description
 
Mobile
< 768px (sm / max-425)
สมาร์ทโฟน แนวตั้งและแนวนอนขนาดเล็ก
Tablet
768px - 1023px (md)
แท็บเล็ตและจอขนาดกลาง
Laptop
1024px - 1439px (lg / max-1024)
คอมพิวเตอร์พกพาและจอโน้ตบุ๊กทั่วไป
Desktop
≥ 1440px (xl / max-1440 และขึ้นไป)
จอภาพเดสก์ท็อปขนาดใหญ่

14. การจัดการโทเค็นใกล้เต็มและไฟล์ Markdown
Token Management: หาก token ใกล้เต็ม ให้จัดทำเนื้อหาในรูปแบบไฟล์ Markdown (MD) เพื่อให้ AI สามารถบันทึกสถานะและทำงานต่อในส่วนถัดไปได้อย่างราบรื่น
15. หลักการวางแผนก่อนลงมือทำ (Plan)
Pre-execution Planning: ต้องทำการ Plan (วางแผนขั้นตอนการทำงาน) ก่อนลงมือเขียนโค้ดหรือแก้ไขงานทุกครั้ง เพื่อความถูกต้องและเป็นระบบ
16. Import และ Dependencies
จัดลำดับการ Import: React/Next.js > Third-party libraries > Local services > Components > Config/Types โดยใช้งาน Path Aliases (@/*) เสมอ
17. Error Handling
ใช้ try-catch ใน asynchronous functions ทุกตัว พร้อมทั้งแสดงข้อความแจ้งเตือนที่เข้าใจง่ายและจัดการกรณี Unauthorized (401/403)
18. State Management
ใช้ React useState, Context API หรือ Hooks ตามความเหมาะสมของโปรเจ็คเพื่อแชร์ข้อมูลระหว่างคอมโพเนนต์
19. Linting และ Formatting ด้วย Prettier
Code Formatting: ใช้ Prettier เป็นเครื่องมือหลักในการจัดรูปแบบเอกสารและโค้ด (Format Doc) ให้เป็นระเบียบและได้มาตรฐานเดียวกัน
20. แนวทางเพิ่มเติม
คำนึงถึง Performance (Memoization, Dynamic Import), Accessibility (a11y), Security (หลีกเลี่ยงข้อมูลอ่อนไหวบน Client), และ SEO Optimization
21. Checklist
✅ ชื่อไฟล์และตัวแปร follows naming convention
✅ ไม่มี hardcoded values — ใช้ constants จาก src/config/app.ts
✅ ไม่ import axios โดยตรง — ใช้ src/service/http.ts
✅ Comments เป็นแท็กสั้นๆ ไม่ยืดยาว
✅ Error handling มีอยู่ในทุก async function
✅ TypeScript types ถูกกำหนดสำหรับ props และ state หรือใช้ any หากไม่มีที่มา
✅ ใช้ onInit สำหรับดึงข้อมูลเริ่มต้นพร้อมกัน
✅ ใช้ Prettier จัดรูปแบบโค้ด (Format Doc)
✅ Responsive design รองรับ Mobile, Tablet, Laptop และ Desktop ครบถ้วน
✅ มีการ Plan ก่อนเริ่มลงมือทำทุกครั้ง
