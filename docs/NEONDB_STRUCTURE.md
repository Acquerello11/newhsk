# โครงสร้างฐานข้อมูล Neon PostgreSQL (NeonDB Structure)

ฐานข้อมูล: **`neondb`**  
Schema: **`public`**  
Row Level Security (RLS): **Off** (จัดการผ่าน Server-side API & SvelteKit Hooks)

---

## 1. ตาราง `user_consents` (ความยินยอม PDPA & เงื่อนไขการวิจัย)

ใช้สำหรับบันทึกสถานะการให้ความยินยอมตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA) และความยินยอมในการนำข้อมูลเสียง/คะแนนไปใช้ในงานวิจัย

### โครงสร้างคอลัมน์ (Columns)

| ชื่อคอลัมน์ | ประเภทข้อมูล (Data Type) | Nullable | ค่าเริ่มต้น (Default) | คำอธิบาย |
| :--- | :--- | :---: | :--- | :--- |
| **`user_id`** | `UUID` | **NO** | *None* | รหัสประจำตัวผู้ใช้ (Primary Key) |
| **`terms_accepted`** | `BOOLEAN` | **NO** | `false` | ยอมรับข้อกำหนดและเงื่อนไขการใช้งานระบบ |
| **`audio_consent`** | `BOOLEAN` | **NO** | `false` | ยินยอมให้ประมวลผลเสียงแบบเรียลไทม์ (Zero Audio Storage) |
| **`research_consent`** | `BOOLEAN` | **NO** | `false` | ยินยอมให้นำผลคะแนน Telemetry ไปใช้เพื่อการศึกษาวิจัย |
| **`consent_version`** | `VARCHAR(20)` | **NO** | `'v1.0'` | เวอร์ชันของเอกสารข้อตกลงและนโยบายความยินยอม |
| **`consented_at`** | `TIMESTAMP WITH TIME ZONE` | YES | `CURRENT_TIMESTAMP` | วันและเวลาที่กดยินยอม |

### ข้อกำหนดและดัชนี (Constraints & Indexes)

- **Primary Key:**
  - `CONSTRAINT user_consents_pkey PRIMARY KEY (user_id)`
- **Indexes:**
  - `UNIQUE INDEX user_consents_pkey USING BTREE (user_id)`

---

## 2. ตาราง `phoneme_evaluations` (ผลการประเมินหน่วยเสียงละเอียด & GOP)

ใช้สำหรับเก็บข้อมูล Goodness of Pronunciation (GOP), Phoneme Error Rate (PER) และรายละเอียดระดับหน่วยเสียง (พยัญชนะต้น สระ วรรณยุกต์) เพื่อการวิเคราะห์ Remedial และงานวิจัย Phonetic Analytics

### โครงสร้างคอลัมน์ (Columns)

| ชื่อคอลัมน์ | ประเภทข้อมูล (Data Type) | Nullable | ค่าเริ่มต้น (Default) | คำอธิบาย |
| :--- | :--- | :---: | :--- | :--- |
| **`id`** | `UUID` | **NO** | `gen_random_uuid()` | รหัสประจำรายการประเมิน (Primary Key) |
| **`user_id`** | `VARCHAR(100)` | **NO** | *None* | รหัสผู้เรียน (User ID หรือ Local UUID) |
| **`word_id`** | `VARCHAR(50)` | **NO** | *None* | คำศัพท์ภาษาจีน (ตัวอักษรจีน เช่น `爱`, `你好`, `东西`) |
| **`pinyin`** | `VARCHAR(100)` | **NO** | *None* | พินอินมาตรฐานของคำศัพท์ เช่น `ài`, `nǐ hǎo` |
| **`phoneme`** | `VARCHAR(20)` | **NO** | *None* | หน่วยเสียงที่ตรวจ เช่น `b`, `p`, `zh`, `ài`, `de` |
| **`phoneme_type`** | `VARCHAR(20)` | **NO** | *None* | ประเภทหน่วยเสียง (`initial`, `final`, `final_tone`) |
| **`gop`** | `NUMERIC(5, 2)` | **NO** | *None* | คะแนนความชัดเจนหน่วยเสียง (0.00 - 100.00) |
| **`status`** | `VARCHAR(20)` | **NO** | *None* | สถานะการออกเสียง (`correct`, `substitution`, `omission`) |
| **`target`** | `VARCHAR(20)` | **NO** | *None* | หน่วยเสียงเป้าหมายที่ควรออก |
| **`recognized`** | `VARCHAR(20)` | **NO** | *None* | หน่วยเสียงที่ระบบ AI ตรวจจับได้จริง |
| **`created_at`** | `TIMESTAMP WITH TIME ZONE` | YES | `CURRENT_TIMESTAMP` | วันและเวลาที่บันทึกข้อมูล |

### ข้อกำหนดและดัชนี (Constraints & Indexes)

- **Primary Key:**
  - `CONSTRAINT phoneme_evaluations_pkey PRIMARY KEY (id)`
- **Indexes:**
  - `UNIQUE INDEX phoneme_evaluations_pkey USING BTREE (id)`
  - `INDEX idx_phoneme_eval_phoneme USING BTREE (phoneme)` — เร่งความเร็วการค้นหาสถิติรายพยัญชนะ
  - `INDEX idx_phoneme_eval_user USING BTREE (user_id)` — เร่งความเร็วการดึงประวัติรายผู้เรียน

---

## 3. ตาราง `learning_events` (พฤติกรรมการเรียนรู้ & xAPI Statements)

ใช้สำหรับบันทึกเหตุการณ์การเรียนรู้ตามมาตรฐานสากล **IEEE 9274.1.1 (xAPI)** เช่น การออกเสียงคำศัพท์ (`pronounced`), การฟังเสียงตัวอย่างก่อนพูด (`listened_to_example`), และระยะเวลาลังเลก่อนพูด (`hesitated`)

### โครงสร้างคอลัมน์ (Columns)

| ชื่อคอลัมน์ | ประเภทข้อมูล (Data Type) | Nullable | ค่าเริ่มต้น (Default) | คำอธิบาย |
| :--- | :--- | :---: | :--- | :--- |
| **`id`** | `UUID` | **NO** | `gen_random_uuid()` | รหัสประจำรายการ Event (Primary Key) |
| **`user_id`** | `UUID` | **NO** | *None* | รหัสประจำตัวผู้เรียน (UUID) |
| **`verb`** | `VARCHAR(50)` | **NO** | *None* | กริยา xAPI เช่น `pronounced`, `listened_to_example` |
| **`lesson_id`** | `VARCHAR(50)` | **NO** | *None* | รหัสบทเรียนหรือด่านเควสต์ เช่น `hsk1_stage_1` |
| **`word`** | `VARCHAR(50)` | **NO** | *None* | คำศัพท์ที่เกี่ยวข้อง เช่น `爱` |
| **`target_tone`** | `INTEGER` | YES | `NULL` | วรรณยุกต์เป้าหมาย (1, 2, 3, 4) |
| **`detected_tone`** | `INTEGER` | YES | `NULL` | วรรณยุกต์ที่ระบบตรวจจับได้จริง (1, 2, 3, 4) |
| **`is_correct`** | `BOOLEAN` | **NO** | *None* | ผลลัพธ์ความถูกต้อง (`true` / `false`) |
| **`confidence`** | `DOUBLE PRECISION` | YES | `NULL` | ระดับความเชื่อมั่นของโมเดล AI (0.0 - 1.0) |
| **`xapi_statement`** | `JSONB` | **NO** | *None* | ข้อมูล xAPI Statement ฉบับเต็มตามมาตรฐาน IEEE 9274 |
| **`created_at`** | `TIMESTAMP WITH TIME ZONE` | YES | `CURRENT_TIMESTAMP` | วันและเวลาที่เกิดเหตุการณ์ |

### ข้อกำหนดและดัชนี (Constraints & Indexes)

- **Primary Key:**
  - `CONSTRAINT learning_events_pkey PRIMARY KEY (id)`
- **Indexes:**
  - `UNIQUE INDEX learning_events_pkey USING BTREE (id)`
  - `INDEX idx_events_user_created USING BTREE (user_id, created_at)` — วิเคราะห์ไทม์ไลน์รายผู้เรียน
  - `INDEX idx_events_user_verb USING BTREE (user_id, verb)` — ค้นหากิจกรรมตามประเภท (เช่น ฟัง/พูด)
  - `INDEX idx_events_word USING BTREE (word)` — วิเคราะห์สถิติแยกตามคำศัพท์
  - `INDEX idx_events_xapi_gin USING GIN (xapi_statement)` — ค้นหาเชิงลึกภายใน JSONB (Extensions, Context)
