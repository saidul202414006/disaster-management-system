# প্রজেক্ট ভাইভা (Viva) এবং ডেমোনস্ট্রেশন প্রস্তুতি গাইড

আপনার Disaster Management System প্রজেক্টের ডাটাবেস ডিজাইন এবং ফ্রন্টএন্ড ইন্টিগ্রেশন প্রমাণের জন্য এক্সামিনার বিভিন্ন প্রশ্ন করতে পারেন। এখানে ২১টি অত্যন্ত গুরুত্বপূর্ণ প্রশ্ন এবং আপনি কীভাবে UI (ওয়েবসাইট) থেকে ইনপুট দিয়ে SQL*Plus টার্মিনালে তা প্রমাণ করে দেখাবেন তার বিস্তারিত স্টেপ-বাই-স্টেপ গাইড (বাংলায়) দেওয়া হলো।

> [!TIP]
> **টার্মিনাল প্রস্তুতি:** ভাইভা শুরু হওয়ার আগে টার্মিনালে বা CMD তে `sqlplus system/saidul@localhost:1521/XE` দিয়ে লগইন করে রাখবেন। আউটপুট সুন্দর দেখানোর জন্য নিচের কমান্ডগুলো আগে রান করে নেবেন:
> ```sql
> SET LINESIZE 300;
> SET PAGESIZE 100;
> SET TAB OFF;
> SET WRAP OFF;
> 
> COLUMN EMAIL FORMAT A30;
> COLUMN DISASTER_NAME FORMAT A20;
> COLUMN DISASTER_TYPE FORMAT A15;
> COLUMN SHELTER_NAME FORMAT A25;
> COLUMN NAME FORMAT A20;
> COLUMN HOUSEHOLD_HEAD_NAME FORMAT A20;
> COLUMN WAREHOUSE_NAME FORMAT A30;
> COLUMN TOTAL_DONATIONS FORMAT 999,999,999;
> COLUMN EMPLOYEE FORMAT A25;
> COLUMN SUPERVISOR FORMAT A25;
> COLUMN RESPONSIBLE_PERSON FORMAT A25;
> COLUMN CONTACT_INFO FORMAT A25;
> COLUMN DISTRIBUTION_ID FORMAT A15;
> COLUMN VEHICLE_TYPE FORMAT A15;
> COLUMN REGISTRATION_NO FORMAT A15;
> ```

---

## মডিউল ১: ইউজার এবং অথেন্টিকেশন (User Authentication)

### ১. নতুন অ্যাডমিন তৈরি এবং ডাটাবেস ভেরিফিকেশন
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "UI থেকে একজন নতুন অ্যাডমিন রেজিস্টার করো এবং SQL Plus টার্মিনালে দেখাও যে তার তথ্য ডাটাবেসে সেভ হয়েছে।"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** ব্রাউজারে `http://localhost:3000/admin/register` এ যান। নাম, ইমেইল (যেমন: `testadmin@gmail.com`) এবং পাসওয়ার্ড দিয়ে রেজিস্টার সম্পন্ন করুন। 
2. **টার্মিনালে কাজ:** SQL Plus-এ নিচের কুয়েরি রান করুন:
   ```sql
   SELECT user_id, email, full_name, role FROM APP_USER WHERE email = 'testadmin@gmail.com';
   ```
3. **ফলাফল:** ডাটাবেসে নতুন রো (Row) দেখতে পাবেন এবং পাসওয়ার্ডটি যে এনক্রিপ্টেড (Hashed) অবস্থায় সেভ হয়েছে সেটাও স্যারকে হাইলাইট করে বলবেন।

### ২. ভিকটিম রেজিস্ট্রেশন (Victim)
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "একজন সাধারণ ভিকটিম হিসেবে অ্যাকাউন্ট তৈরি করো এবং দেখাও যে সে ডাটাবেসে ভিকটিম রোল হিসেবে যুক্ত হয়েছে।"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** `http://localhost:3000/victim/register` এ গিয়ে ডাটা দিন।
2. **টার্মিনালে কাজ:** 
   ```sql
   SELECT user_id, email, role, victim_id FROM APP_USER ORDER BY created_at DESC FETCH FIRST 1 ROWS ONLY;
   ```

---

## মডিউল ২: ভিকটিম প্রোফাইল এবং মাল্টিভ্যালুড/উইক এন্টিটি

### ৩. ভিকটিমের বিস্তারিত তথ্য ইনসার্ট (Core Entity)
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "ভিকটিমের বিস্তারিত তথ্য (নাম, NID, ইত্যাদি) অ্যাড করো এবং টার্মিনালে শো করো।"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** ভিকটিম প্যানেলে বা অ্যাডমিন প্যানেল থেকে "Add Victim" ফর্মে গিয়ে ডেটা দিন।
2. **টার্মিনালে কাজ:** NID দিয়ে সার্চ করুন:
   ```sql
   SELECT victim_id, household_head_name, gender, nid_number FROM VICTIM WHERE nid_number = 'আপনার_দেওয়া_NID';
   ```

### ৪. মাল্টিভ্যালুড এট্রিবিউট প্রমাণ (Multivalued Attribute)
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "একটি ভিকটিমের একাধিক ফোন নাম্বার থাকতে পারে (Multivalued Attribute)। এটি ডাটাবেসে কীভাবে হ্যান্ডেল করেছো দেখাও।"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** একটি ভিকটিমের প্রোফাইলে দুটি আলাদা ফোন নাম্বার যুক্ত করুন। 
2. **টার্মিনালে কাজ:**
   ```sql
   SELECT victim_id, phone FROM VICTIM_PHONE WHERE victim_id = 'উক্ত_ভিকটিম_আইডি';
   ```
3. **ব্যাখ্যা:** স্যারকে বলবেন, "যেহেতু Phone মাল্টিভ্যালুড, তাই 1NF বজায় রাখতে আমরা `VICTIM_PHONE` নামে আলাদা টেবিল করেছি।"

### ৫. উইক এন্টিটি প্রমাণ (Weak Entity)
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "ভিকটিমের ফ্যামিলি মেম্বারগুলো কীভাবে সেভ করছো? এটা উইক এন্টিটি কিনা প্রমাণ করো।"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** ভিকটিমের অধীনে কয়েকজন ফ্যামিলি মেম্বার যুক্ত করুন। 
2. **টার্মিনালে কাজ:**
   ```sql
   SELECT victim_id, member_seq_no, name FROM FAMILY_MEMBER WHERE victim_id = 'উক্ত_ভিকটিম_আইডি';
   ```
3. **ব্যাখ্যা:** স্যারকে বলবেন, "`FAMILY_MEMBER` এর নিজস্ব প্রাইমারি কী নেই, এটি `victim_id` এর উপর নির্ভরশীল, তাই এটি উইক এন্টিটি।"

---

## মডিউল ৩: ডিজাস্টার এবং শেল্টার ম্যানেজমেন্ট

### ৬. নতুন ডিজাস্টার ইভেন্ট যুক্ত করা
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "একটি নতুন ডিজাস্টার ইভেন্ট অ্যাড করো এবং ডাটাবেসে দেখাও।"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** অ্যাডমিন ড্যাশবোর্ডে "Disasters" সেকশন থেকে "Add Disaster" এ ক্লিক করে (যেমন: "Dhaka Flood 2026") তৈরি করুন।
2. **টার্মিনালে কাজ:**
   ```sql
   SELECT disaster_name, disaster_type, division, district FROM DISASTER_EVENT ORDER BY start_date DESC FETCH FIRST 1 ROWS ONLY;
   ```

### ৭. অ্যাক্টিভ ডিজাস্টার ফিল্টার করা (Filtering)
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "বর্তমানে কোন কোন ডিজাস্টার অ্যাক্টিভ আছে (যাদের শেষ হওয়ার তারিখ নেই) তা SQL কুয়েরি দিয়ে বের করে দেখাও।"
**কীভাবে দেখাবেন:**
1. **টার্মিনালে কাজ:**
   ```sql
   SELECT disaster_name, start_date FROM DISASTER_EVENT WHERE end_date IS NULL;
   ```

### ৮. শেল্টার তৈরি করা
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "নতুন একটি শেল্টার তৈরি করো এবং দেখাও যে তা নির্দিষ্ট একটি ডিজাস্টারের সাথে যুক্ত হয়েছে।"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** "Shelters" পেজ থেকে নতুন শেল্টার তৈরি করুন এবং ডিজাস্টার সিলেক্ট করুন।
2. **টার্মিনালে কাজ:**
   ```sql
   SELECT shelter_id, shelter_name, capacity, disaster_name FROM SHELTER WHERE shelter_name = 'আপনার_দেওয়া_নাম';
   ```

### ৯. মেনি-টু-মেনি রিলেশন (ভিকটিম চেক-ইন)
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "একজন ভিকটিম একটি শেল্টারে আশ্রয় নিলে ডাটাবেসে সেটা কোথায় সেভ হয়? (Many-to-Many Relationship)"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** ভিকটিমকে একটি শেল্টারে অ্যাসাইন/চেক-ইন করুন।
2. **টার্মিনালে কাজ:**
   ```sql
   SELECT victim_id, shelter_id, checkin_date FROM VICTIM_SHELTER_STAY WHERE shelter_id = 'উক্ত_শেল্টার_আইডি';
   ```
3. **ব্যাখ্যা:** স্যারকে বলবেন, "ভিকটিম এবং শেল্টারের মধ্যে M:N সম্পর্ক, তাই `VICTIM_SHELTER_STAY` নামে নতুন একটি Associative Table তৈরি করা হয়েছে।"

---

## মডিউল ৪: পার্সোনেল এবং হাইয়ারার্কি (Supertype/Subtype)

### ১০. পার্সোনেল (Base Entity) তৈরি
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "টিমে নতুন একজন মেম্বার বা কর্মী যোগ করো।"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** "Personnel" পেজ থেকে নতুন কর্মী যোগ করুন। 
2. **টার্মিনালে কাজ:**
   ```sql
   SELECT person_id, name, designation FROM PERSONNEL WHERE name = 'নতুন_কর্মীর_নাম';
   ```

### ১১. সাবটাইপ এন্টিটি (Subtype Entity)
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "ভলান্টিয়ার বা মেডিকেল স্টাফ যুক্ত করলে সাবটাইপ টেবিলে ডেটা যাচ্ছে কিনা দেখাও।"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** পার্সোনেল অ্যাড করার সময় রোল "Volunteer" দিন।
2. **টার্মিনালে কাজ:**
   ```sql
   SELECT p.name, p.designation, v.team 
   FROM PERSONNEL p 
   JOIN VOLUNTEER v ON p.person_id = v.person_id;
   ```
3. **ব্যাখ্যা:** স্যারকে বলবেন, "এখানে Is-A Relationship ব্যবহার করা হয়েছে (Personnel Is-a Volunteer)।"

### ১২. রিকার্সিভ রিলেশনশিপ (Self-Join / Hierarchy)
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "কে কার সুপারভাইজার সেটা বের করার জন্য কুয়েরি লিখে দেখাও (Self Join)।"
**কীভাবে দেখাবেন:**
1. **টার্মিনালে কাজ:**
   ```sql
   SELECT e.name AS Employee, m.name AS Supervisor 
   FROM PERSONNEL e 
   LEFT JOIN PERSONNEL m ON e.supervisor_id = m.person_id;
   ```

---

## মডিউল ৫: ওয়্যারহাউজ এবং ডোনেশন (Aggregation & Group By)

### ১৩. ওয়্যারহাউজ অ্যাড করা
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "নতুন ওয়্যারহাউজ অ্যাড করো।"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** Warehouse সেকশনে গিয়ে অ্যাড করুন।
2. **টার্মিনালে কাজ:** `SELECT * FROM WAREHOUSE WHERE warehouse_name = '...';`

### ১৪. ডোনেশন অ্যাড করা
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "ওয়্যারহাউজে ফান্ড বা ডোনেশন আসলে সেটা ইনসার্ট করে দেখাও।"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** Donations পেজে গিয়ে ডোনেশন যুক্ত করুন।
2. **টার্মিনালে কাজ:** `SELECT donation_id, donor_name, amount_or_value FROM DONATION ORDER BY donation_date DESC FETCH FIRST 1 ROWS ONLY;`

### ১৫. অ্যাগ্রিগেশন ফাংশন (GROUP BY & SUM)
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "কোন ওয়্যারহাউজে মোট কত টাকার ডোনেশন বা ভ্যালু জমা হয়েছে তা গ্রুপ করে দেখাও (SUM & GROUP BY)।"
**কীভাবে দেখাবেন:**
1. **টার্মিনালে কাজ:**
   ```sql
   SELECT w.warehouse_name, SUM(d.amount_or_value) AS Total_Donations 
   FROM DONATION d 
   JOIN WAREHOUSE w ON d.warehouse_id = w.warehouse_id 
   GROUP BY w.warehouse_name;
   ```

---

## মডিউল ৬: রিলিফ ডিস্ট্রিবিউশন এবং কমপ্ল্যাক্স জয়েন

### ১৬. ডিস্ট্রিবিউশন ইনসার্ট
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "ওয়্যারহাউজ থেকে নির্দিষ্ট এলাকায় রিলিফ পাঠানোর ডেটা ইনসার্ট করো।"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** Relief Distribution পেজ থেকে ডিস্ট্রিবিউশন অ্যাড করুন।
2. **টার্মিনালে কাজ:** `SELECT distribution_id, warehouse_id, quantity FROM DISTRIBUTION ORDER BY distribution_date DESC FETCH FIRST 1 ROWS ONLY;`

### ১৭. মাল্টি-টেবিল জয়েন (Multi-Table JOIN)
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "এমন একটি কুয়েরি লেখো যেখানে দেখা যাবে: কোন ডিস্ট্রিবিউশন আইডি, কোন ওয়্যারহাউজ থেকে গেছে, এবং কোন কর্মী (Personnel) সেটি নিয়ে গেছে।"
**কীভাবে দেখাবেন:**
1. **টার্মিনালে কাজ:**
   ```sql
   SELECT dist.distribution_id, w.warehouse_name, p.name AS Responsible_Person, dist.quantity
   FROM DISTRIBUTION dist
   JOIN WAREHOUSE w ON dist.warehouse_id = w.warehouse_id
   JOIN PERSONNEL p ON dist.person_id = p.person_id;
   ```
   > [!IMPORTANT]
   > এটি খুব ইমপ্রেসিভ একটি কুয়েরি। ৩টি টেবিল জয়েন করে ডেটা আনা হয়েছে।

### ১৮. ডিস্ট্রিবিউশনের সাথে ভেহিক্যাল (Ternary / Associative Table)
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "ওই রিলিফ নিয়ে যাওয়ার জন্য কোন কোন গাড়ি (Vehicle) ব্যবহার হয়েছে তা দেখাও।"
**কীভাবে দেখাবেন:**
1. **টার্মিনালে কাজ:**
   ```sql
   SELECT vd.distribution_id, v.registration_no, v.vehicle_type 
   FROM VEHICLE_DISTRIBUTION vd
   JOIN VEHICLE v ON vd.vehicle_id = v.vehicle_id;
   ```

---

## মডিউল ৭: সিস্টেম ফিল্টারিং এবং ড্যাশবোর্ড লজিক

### ১৯. স্পেশাল নিডস ভিকটিম ফাইন্ডিং
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "শুধু সেইসব ভিকটিমদের বের করো যাদের 'Wheelchair' বা বিশেষ সাহায্য প্রয়োজন (Filtering)।"
**কীভাবে দেখাবেন:**
1. **টার্মিনালে কাজ:**
   ```sql
   SELECT victim_id, household_head_name, special_needs 
   FROM VICTIM 
   WHERE special_needs IS NOT NULL;
   ```

### ২০. খালি আছে এমন শেল্টার ফাইন্ডিং
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "যেসব শেল্টারে এখনো জায়গা (Capacity > Occupancy) ফাঁকা আছে তাদের লিস্ট বের করো।"
**কীভাবে দেখাবেন:**
1. **টার্মিনালে কাজ:**
   ```sql
   SELECT shelter_name, capacity, current_occupancy, (capacity - NVL(current_occupancy, 0)) AS Available_Space
   FROM SHELTER 
   WHERE (capacity - NVL(current_occupancy, 0)) > 0 AND current_status = 'Open';
   ```

### ২১. সিস্টেম ড্যাশবোর্ড KPI (Dashboard Stats)
**শিক্ষকের সম্ভাব্য প্রশ্ন:** "ওয়েবসাইটের ড্যাশবোর্ডে যে 'Total Victims' দেখাচ্ছে, সেটা ডাটাবেস থেকে কুয়েরি করে মেলাও।"
**কীভাবে দেখাবেন:**
1. **UI তে কাজ:** ড্যাশবোর্ডে Total Victims এর সংখ্যা দেখুন।
2. **টার্মিনালে কাজ:**
   ```sql
   SELECT COUNT(*) AS Total_Victims FROM VICTIM;
   ```
3. **ফলাফল:** ফ্রন্টএন্ড এবং টার্মিনালের সংখ্যা হুবহু মিলে যাবে।

---

> [!TIP]
> **এক্সামিনার টিপস:** স্যার যখন কোনো কিছু এড করতে বলবেন, আপনি সাথে সাথে ওয়েবসাইটে ফর্ম পূরণ করে সাবমিট করবেন এবং সাথে সাথে SQL+ এ গিয়ে কুয়েরি চালিয়ে ডাটাগুলো দেখাবেন। এতে স্যারের কাছে প্রমাণ হবে যে আপনার ফ্রন্টএন্ড এবং ডাটাবেস ১০০% রিয়েল-টাইমে কানেক্টেড।
