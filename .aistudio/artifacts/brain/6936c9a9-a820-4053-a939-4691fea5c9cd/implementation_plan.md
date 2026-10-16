# แผนการปรับปรุงหน้าแอดมิน: Modern Compact Teacher & Learning Analytics Dashboard

แผนงานยกระดับหน้าแอดมินของระบบฝึกออกเสียงภาษาจีนสู่หน้าจอจัดการสำหรับครูผู้สอน (Teacher Cockpit) ในรูปแบบ Modern Compact คมชัด สบายตา จัดการพื้นที่อย่างคุ้มค่า และเน้นตารางข้อมูลนักเรียนและการวิเคราะห์การออกเสียงที่หนาแน่นแม่นยำ

### User Review & Critical Decisions

> [!IMPORTANT]
> **สถานะระบบปัจจุบัน**:
> - ✅ แก้ไขปัญหา Dev Server เรียบร้อยแล้ว (ติดตั้งแพ็กเกจที่ขาดหาย, ปรับแต่ง Vite Config ร่วมกับ SvelteKit 3 และ `$lib` Alias, Dev Server ทำงานปกติที่พอร์ต 3000 และตอบรับ HTTP 200 OK)
>
> **สรุปทิศทางจากที่ตกลงไว้**:
> 1. **เป้าหมายหลัก**: ปรับปรุงดีไซน์และ Dashboard ให้ทันสมัย เป็นมืออาชีพ น่าใช้งานสำหรับคุณครู
> 2. **ทิศทางสไตล์**: สไตล์ Compact จัดการพื้นที่แน่นหนา (High-density tabular grids) ตัวเลขและตารางชัดเจน ไม่กินพื้นที่หน้าจอโดยไม่จำเป็น
> 3. **กลุ่มผู้ใช้งานหลัก**: ครูผู้สอนภาษาจีนที่ต้องการติดตามพัฒนาการของผู้เรียนเป็นรายคนและรายห้องเรียน

- **การจัดสัดส่วนหน้าจอ (Workspace Density)**: ปรับความสูงของแถวตาราง (Table row height) เป็น 40px พร้อมจัดชิดซ้ายสำหรับชื่อ/ข้อมูล และชิดขวาสำหรับตัวเลขสถิติ (`tabular-nums`)
- **การจัดหมวดหมู่ข้อมูลสำหรับครู**: ชูการ์ดสรุป KPI ด้านพัฒนาการเรียน (อัตราการเข้าเรียนวันนี้, ผู้เรียนที่ต้องดูแลเป็นพิเศษ/At-Risk, คะแนนเฉลี่ย GOP/PER และวรรณยุกต์ที่ห้องเรียนมักออกเสียงผิด) ขึ้นเป็นจุดเด่นในหน้าแรก

---

### 1. Overview & Core Concept

- **What It Does**: ปรับโฉมหน้าแอดมินเดิมให้กลายเป็น Teacher Command Center ที่ทันสมัย รองรับการตรวจสอบพัฒนาการของนักเรียนแต่ละคน วิเคราะห์จุดอ่อนด้านการออกเสียงภาษาจีน (Phoneme Confusion & Tone Pitches) จัดการด่านบทเรียน HSK และทดลองดูมุมมองของผู้เรียนผ่านระบบสลับบัญชี (Impersonate)
- **Target Audience / Persona**: คุณครูผู้สอนภาษาจีน อาจารย์ประจำวิชา และผู้ดูแลหลักสูตรที่ต้องการข้อมูลเชิงลึกแบบเห็นภาพรวมทันทีและเจาะลึกรายบุคคลได้ในคลิกเดียว
- **Key Value**: ประหยัดเวลาการตรวจเช็กและประเมินผลนักเรียน ลดความซับซ้อนของ UI แบบเดิม เพิ่มความกระชับของตาราง (Compact Table) และแสดงผลคะแนนการออกเสียง (GOP Score / Tone Pitch) อย่างชัดเจนพร้อมแนะนำคลังคำศัพท์ซ่อมเสริม (Remedial Vocab) ทันที

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Teacher Quick Overview (Dashboard)**:
   - ครูเปิดหน้าแอดมิน จะเห็นแถบสรุปสถานะการเรียนวันนี้ (Active Learners, At-Risk Students, Class Average GOP, Tone 3/4 Confusion Rate)
   - ตาราง "นักเรียนที่ต้องการการดูแลเร่งด่วน" (Students Needing Remedial Attention) ช่วยให้ครูกดดูจุดติดขัดได้ทันที
2. **Student Drilldown & Remedial Actions (Users)**:
   - ค้นหาและคัดกรองนักเรียนตามระดับ HSK, อัตราผ่าน (Pass Rate), หรือสตรีค (Streak)
   - คลิกเพื่อเปิดแผงข้อมูลเชิงลึกด้านขวา (Compact Slide-over Drawer / Modal) แสดงกราฟเสียงวรรณยุกต์ที่ผิดบ่อย การ์ดคำศัพท์ซ่อมเสริม และปุ่ม "สลับมุมมองเป็นนักเรียนคนนี้" (Impersonate)
3. **Curriculum Tuning (Stages)**:
   - ตารางด่านบทเรียน HSK แบบกะทัดรัด แสดงจำนวนคำศัพท์, อัตราการหลุดกลางคัน (Drop Rate), และสามารถคลิกแก้ไขชื่อ/คำอธิบาย หรือสลับสถานะเปิด-ปิดได้ทันที
4. **Phonetics & Tone Deep-Dive (Learning Analytics)**:
   - Matrix ตารางจับคู่วรรณยุกต์และพยัญชนะที่สับสน (zh/z, ch/c, sh/s) พร้อมปุ่มทดสอบเสียงสังเคราะห์มาตรฐาน

#### Visual Identity & Theme
- **Aesthetic Direction**: Modern Compact SaaS (แรงบันดาลใจจากแดชบอร์ดระดับ Enterprise เช่น Linear / Stripe Dashboard) คมชัด สบายตา ไม่เกะกะสายตา
- **Color Palette & Contrast**:
  - พื้นหลังหลัก: Neutral Slate สะอาดตา (`bg-slate-50/50` / Dark: `bg-slate-950`)
  - โครงสร้างและตาราง: ผิวการ์ดขาวสะอาด ขอบเส้นแบ่งบางเฉียบ 1px (`border-slate-200/80` / `border-slate-800/80`)
  - สีเน้นสถานะข้อมูล (Semantic Accents): เขียวมรกต (`#16a34a`) สำหรับสถานะดีเยี่ยม, ส้มอำพัน (`#d97706`) สำหรับกลุ่มเตือน/คำศัพท์ติดขัด, แดงกุหลาบ (`#dc2626`) สำหรับจุดคอขวดที่ต้องแก้ไข
- **Typography & Tabular Discipline**:
  - ฟอนต์หัวข้อและข้อความ: สะอาดตา รองรับภาษาไทยและอักษรจีน (Hanzi) อย่างเป็นธรรมชาติ
  - ตัวเลขสถิติ: บังคับใช้ `tabular-nums font-mono` ทุกจุดเพื่อความตรงแนวในตาราง
- **Zero-Pill Discipline**:
  - เปลี่ยนแถบป้ายข้อความลอยแบบแคปซูล ให้เป็นข้อความเรียบหรูพร้อมจุดแบ่งทางไวยากรณ์ (เช่น `HSK 1 · 15 คำ · ผ่านแล้ว 88%`)

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: รูปแบบตาราง Compact Table แทนการ์ดบล็อกขนาดใหญ่**
  - *Chosen Approach*: เปลี่ยนการแสดงผลรายชื่อนักเรียนและด่านบทเรียนจากเดิมที่ใช้การ์ดกว้าง เป็นตารางแถวกระชับ (Compact Data Table) มีฟิลเตอร์และช่องค้นหาในตัว
  - *Why*: ครูต้องการกวาดสายตามองนักเรียนทั้งชั้น 20-50 คนได้ในหน้าเดียวโดยไม่ต้องเลื่อนหน้าจอยาว
  - *Alternatives Considered*: การ์ด Grid กว้าง ซึ่งสวยงามแต่จุข้อมูลได้น้อยและเปลืองพื้นที่เลื่อนหน้าจอ
- **Decision 2: บูรณาการ Quick Remedial Actions ให้ครูส่งงานซ่อมเสริมได้ทันที**
  - *Chosen Approach*: ในแถวนักเรียนที่มีคะแนนการออกเสียงต่ำ จะมีปุ่มลัด "สร้างชุดซ่อมเสริม (Remedial Deck)" ที่ดึงคำศัพท์เฉพาะที่นักเรียนคนนั้นออกเสียงผิดมาทบทวน
  - *Why*: ตอบโจทย์ครูผู้สอนโดยตรงในการแก้ปัญหานักเรียนติดขัดเรื่องเสียงวรรณยุกต์จีน

---

### 4. Technical Architecture & Data Strategy (Technical Reference)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Admin Dashboard Layout                          │
│  ┌───────────────────────┬──────────────────────────────────────────┐  │
│  │     Left Sidebar      │              Top Control Bar             │  │
│  │  - Dashboard Overview │  - Breadcrumb Trail                      │  │
│  │  - Students (Users)   │  - Class Filter (HSK 1-3)                │  │
│  │  - Stages & Vocab     │  - Quick Export CSV / JSON               │  │
│  │  - Phonetic Analytics │  - Teacher Profile & Impersonate Badge   │  │
│  │  - Audit & Security   │                                          │  │
│  ├───────────────────────┴──────────────────────────────────────────┤  │
│  │                     Active View Container                        │  │
│  │  ┌────────────────────────────────────────────────────────────┐  │  │
│  │  │ 1. Teacher KPI Ribbon (4 Compact Metric Cards)             │  │  │
│  │  │    [Active Today] [Avg GOP %] [Tone 3/4 Issue] [At-Risk]   │  │  │
│  │  ├────────────────────────────────────────────────────────────┤  │  │
│  │  │ 2. High-Density Student Progress Table                     │  │  │
│  │  │    - Name/ID | HSK Level | XP | Streak | Tone Acc | Action │  │  │
│  │  ├────────────────────────────────────────────────────────────┤  │  │
│  │  │ 3. Pronunciation Diagnostics & Minimal Pairs Matrix        │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

#### Component & State Mapping
- `src/routes/admin/+page.svelte`: จัดการสถานะแท็บ (`activeTab`), ตัวกรองการค้นหานักเรียน (`userSearchQuery`, `userRoleFilter`), การสลับด่านบทเรียน, และการเปิด Slide-over Drawer ดูข้อมูลนักเรียน
- `src/routes/admin/+page.server.ts`: ส่งข้อมูล `usersWithDetail`, `classPhonemeStats`, `enrichedStages`, `advancedAnalytics` ไปยังหน้าบ้านอย่างครบถ้วน
- สัญญาของ UI: ควบคุมให้ทุกปุ่มคำสั่ง (Impersonate, Edit Stage, Play Audio, Export CSV/JSON) มี Event Handler ที่ทำงานได้จริง 100% ปราศจากปุ่มลอยหรือ Dead Clicks

---
