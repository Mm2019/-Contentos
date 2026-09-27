# ContentOS Unified Personal + Project + Business Operating System
## Master Build Prompt — Source-of-Truth Architecture, Phased Implementation, QA & Continuation Protocol

> **IMPORTANT:** هذا الملف هو **Master Specification + Master Prompt** مخصص لوكيل/أداة ذكاء اصطناعي ستقوم ببناء وتطوير النظام فوق **ContentOS الموجود في الملف المرفق**.
>
> **لا تبنِ النظام في Notion.**
>
> **لا تبدأ من الصفر.**
>
> **لا تنشئ تطبيقًا منفصلًا ثم تحاول نقل ContentOS إليه.**
>
> المطلوب هو اعتبار **ContentOS المرفق هو الـ architectural foundation / codebase / product foundation**، ثم توسيعه تدريجيًا ليصبح نظام تشغيل شخصي ومشاريع وأعمال موحد.
>
> يجب الحفاظ على قدرات ContentOS الحالية، وتطوير النظام **جزءًا بجزء**، مع إكمال كل جزء بالكامل قبل الانتقال للجزء التالي.

---

# 0. الدور المطلوب منك كـ AI Builder

أنت تعمل كالتالي:

- Principal Software Architect
- Senior Full-Stack Engineer
- Product Engineer
- Data Architect
- QA Engineer
- UX/Product Designer
- Migration & Backward-Compatibility Engineer
- Technical Project Manager

أنت لا تتعامل مع هذا الملف كـ "فكرة عامة".

اعتبره:

1. Product Specification
2. Architecture Specification
3. Data Model Specification
4. Workflow Specification
5. UX Specification
6. Security Specification
7. QA Specification
8. Migration Specification
9. Implementation Roadmap
10. Continuation Protocol

## القاعدة الأساسية

**Do not implement everything at once.**

نفّذ النظام على مراحل مستقلة، وكل مرحلة يجب أن تكون:

- مصممة
- منفذة
- مربوطة بالـ architecture
- مختبرة
- مراجعة
- متوافقة مع المراحل السابقة
- موثقة
- قابلة للاستكمال من AI آخر

ثم فقط انتقل للمرحلة التالية.

---

# 1. المرجع الأساسي: ContentOS المرفق

الملف المرفق هو المرجع البرمجي والمعماري الأساسي.

النسخة الحالية من ContentOS تحتوي على معماريات مهمة يجب عدم فقدانها، ومنها:

- Account Configuration
- Platform → Content Type inheritance
- Account-level overrides
- Account-specific stages
- Account-specific tasks
- Account-specific fields
- Account-specific KPIs
- Raw Metrics
- KPI input references
- Platform Analytics
- Post Analytics
- Analytics History
- Definition Snapshots
- KPI Formula Engine
- KPI Targets
- Benchmarks
- Scoring
- Intelligence
- Learning Signals
- Permissions
- Ownership
- Audit metadata
- Versioning
- Migration
- Backup
- Snapshot
- Restore
- PWA assets
- Android WebView package
- Supabase authentication/data handling
- RLS protection
- Backward-compatible migrations

## المرجع المعماري الحالي

ContentOS يستخدم مفهوم inheritance مشابهًا:

```text
Global Defaults
      ↓
Platform
      ↓
Content Type
      ↓
Account Override
      ↓
New Post / Workflow Snapshot
      ↓
Post-level Overrides / Historical Data
```

هذا المفهوم **جزء أساسي من النظام الجديد**.

لا تستبدله بتصميم أبسط.

---

# 2. الهدف النهائي

تحويل ContentOS إلى:

# Unified Personal + Project + Business Operating System

النظام النهائي يجب أن يجمع:

```text
PERSONAL OS
+
PROJECT OS
+
BUSINESS OS
+
CONTENT OS
+
PRODUCT / SAAS OS
+
ECOMMERCE OS
+
OPERATIONS OS
+
KNOWLEDGE OS
+
LEARNING OS
+
HOME OS
+
FINANCE OS
+
HABIT OS
+
FITNESS OS
```

لكن لا يعني ذلك أن كل مشروع يستخدم كل شيء.

النظام يجب أن يكون:

```text
One Core
+
Shared Data Model
+
Project Profiles
+
Selective Modules
+
Configurable Workflows
+
Contextual Dashboards
+
Global Command Center
```

---

# 3. أهم مبدأ: ContentOS هو Foundation وليس Module

لا تجعل ContentOS مجرد Module إضافي يتم تركيبه بجانب باقي الأنظمة.

الأصح:

```text
Unified OS
│
├── Core
│
├── Personal
│
├── Projects
│
├── Business
│
├── Finance
│
├── ContentOS
│
├── Product / SaaS
│
├── Commerce
│
├── Operations
│
├── Knowledge
│
├── Learning
│
├── Home
│
├── Habits
│
└── Fitness
```

لكن ContentOS يحتفظ بكل قدراته الحالية ويصبح أحد أقوى الـ vertical engines داخل النظام.

---

# 4. Architectural Principles

## 4.1 Single Source of Truth

كل نوع بيانات له مصدر واحد.

### Money

```text
Financial Ledger
```

### Projects

```text
Projects
```

### Tasks

```text
Tasks
```

### Content

```text
Content
```

### Products

```text
Products
```

### Orders

```text
Orders
```

### Customers

```text
Customers
```

### Features

```text
Features
```

### Bugs

```text
Bugs
```

### Releases

```text
Releases
```

### Goals

```text
Goals
```

### Resources

```text
Resources / Bookmarks
```

لا تنشئ نسخًا مكررة من نفس البيانات في كل Dashboard.

---

# 5. قاعدة عدم التكرار

قبل إنشاء أي entity أو database أو table أو collection جديدة:

اسأل:

1. هل البيانات موجودة بالفعل؟
2. هل يمكن تمثيلها Property؟
3. هل يمكن تمثيلها Relation؟
4. هل View يحل المشكلة؟
5. هل Template يحل المشكلة؟
6. هل هي حالة مختلفة من Entity موجود؟
7. هل تحتاج lifecycle مستقل؟
8. هل تحتاج أكثر من سجل؟
9. هل تحتاج filtering مستقل؟
10. هل تحتاج analytics مستقل؟
11. هل تحتاج permissions مستقلة؟

إذا لم تكن هناك حاجة حقيقية:

**Do not create another database.**

---

# 6. Core Entity Model

يجب أن يحتوي النظام في النهاية على Core entities التالية.

## 6.1 Areas

الغرض:

أعلى مستوى للتنظيم.

أمثلة:

- Personal
- Finance
- Business
- Koumma
- Content
- Learning
- Home
- Fitness
- Technology

Properties:

- id
- name
- type
- parentArea
- status
- description
- owner
- projects
- goals
- tasks
- resources
- notes

---

# 7. Projects

Project هو instance حقيقي، وليس profile.

مثال:

```text
Koumma
Al Mosally
Marriage App
Budget App
NeelGo
Personal YouTube
POD Store
Digital Products
Blog
Affiliate Business
```

## Project properties

- id
- name
- projectType
- profile
- area
- status
- priority
- owner
- startDate
- targetDate
- description
- vision
- mission
- businessModel
- revenueModel
- costModel
- enabledModules
- team
- goals
- tasks
- finance
- resources
- content
- products
- customers
- KPIs
- risks
- decisions
- meetings
- milestones

---

# 8. Project Profiles

Profiles تحدد طبيعة المشروع.

لا تعني إنشاء مشروع جديد.

Profiles المقترحة:

1. Personal / Research
2. App / SaaS
3. Marketplace
4. E-commerce
5. Content / Creator
6. Blog / SEO
7. Affiliate
8. Digital Product
9. Delivery / Logistics
10. Service Business
11. Internal Tool
12. Community
13. Media
14. Hybrid

يمكن إضافة Profiles لاحقًا.

---

# 9. Enabled Modules

كل Project يحدد الوحدات المطلوبة فقط.

مثال:

```text
Koumma
├── Product
├── PRD
├── Features
├── Releases
├── Bugs
├── QA
├── Support
├── Analytics
├── Finance
├── Marketing
├── Content
├── Trust & Safety
└── Team
```

مثال Delivery Business:

```text
Delivery
├── Customers
├── Orders
├── Routes
├── Slots
├── Drivers
├── Pricing
├── Finance
└── Analytics
```

مثال Personal YouTube:

```text
Creator
├── ContentOS
├── Publishing
├── Analytics
├── Sponsors
├── Affiliate
└── Finance
```

---

# 10. Shared Core Modules

## Core Modules

- Areas
- Projects
- Tasks
- Calendar / Events
- Goals
- People / Contacts
- Notes
- Resources / Bookmarks
- Meetings
- Documents
- Reviews
- Decisions
- Finance
- Assets

---

# 11. Task System

Tasks يجب أن تكون Shared Core.

Properties:

- title
- project
- area
- parentTask
- status
- priority
- assignee
- dueDate
- startDate
- estimatedTime
- actualTime
- tags
- dependencies
- blockedBy
- relatedEntity
- recurring
- completedAt

Statuses يجب أن تكون configurable:

```text
Backlog
Next
In Progress
Blocked
Review
Done
Cancelled
```

Project-specific workflows يمكن أن تستخدم حالات مختلفة دون إنشاء Tasks DB جديدة.

---

# 12. Calendar / Events

يشمل:

- Meetings
- Appointments
- Deadlines
- Publishing
- Releases
- Maintenance
- Study sessions
- Personal events
- Business events

لا تنشئ Calendar database لكل Module.

---

# 13. Goals

Goal hierarchy:

```text
Vision
 ↓
Goal
 ↓
Objective
 ↓
Milestone
 ↓
Task
```

Goal يمكن ربطه بـ:

- Project
- Area
- Finance
- Learning
- Fitness
- Home
- Content
- Business

---

# 14. Finance OS

Finance يجب أن يكون Shared Core.

## Finance entities

1. Accounts & Wallets
2. Financial Ledger
3. Categories & Budgets
4. Recurring & Subscriptions
5. Debts & Receivables
6. Savings Goals / Wishlist

---

# 15. Financial Ledger

هو المصدر الوحيد للحركات المالية.

Transaction fields:

- id
- date
- amount
- type
- fromAccount
- toAccount
- category
- project
- area
- description
- recurringSource
- debt
- shoppingItem
- subscription
- source
- externalId
- syncFlag
- createdAt
- updatedAt

أنواع الحركة:

```text
Income
Expense
Transfer
Refund
Adjustment
Debt Payment
Debt Received
```

---

# 16. Finance Rules

لا تسمح بأن:

```text
Home Shopping
```

ينشئ transaction منفصلًا يدويًا إذا تم بالفعل إنشاء Transaction من خلال sync.

استخدم:

```text
sourceEntity
sourceId
syncStatus
linkedTransaction
```

لتجنب duplicate transactions.

---

# 17. Home OS

Home OS يتكون من:

1. Rooms & Zones
2. Home Tasks
3. Maintenance
4. Home Inventory
5. Home Shopping

## Rooms

- bedroom
- living room
- kitchen
- bathroom
- office
- storage
- balcony
- outdoor
- custom

---

# 18. Home Tasks

أنواع:

- Cleaning
- Laundry
- Dishes
- Organization
- Deep Cleaning
- Outdoor
- Other

Home Tasks ترتبط بالـ Tasks Core عندما يكون ذلك مناسبًا، ولا تكرر task record بلا داعٍ.

---

# 19. Maintenance

Fields:

- issue
- room
- category
- priority
- status
- estimatedCost
- actualCost
- technician
- dueDate
- completedDate
- relatedInventory
- relatedShopping
- relatedFinanceTransaction

---

# 20. Home Inventory

يشمل:

- Consumables
- Assets
- Appliances
- Furniture
- Tools
- Electronics

Stock statuses:

```text
Good
Low
Critical
Out
```

---

# 21. Home Shopping

يمكن ربطه بـ:

- Inventory
- Maintenance
- Finance

مثال:

```text
Shopping Item
↓
Purchased
↓
Inventory updated
↓
Financial Ledger transaction created
↓
Sync flag = synced
```

---

# 22. Learning OS

Architecture:

```text
Area
 ↓
Course
 ↓
Module / Chapter
 ↓
Lesson
```

Lesson fields:

- title
- course
- chapter
- duration
- watchedDuration
- status
- progress
- skill
- notes
- resource
- completedAt

Progress يجب أن يكون time-weighted عندما يكون duration متاحًا.

---

# 23. Language Learning

Language Learning يستخدم نفس Learning OS.

لا تنشئ نظامًا منفصلًا للغة.

مثال:

```text
Area: Languages
Course: American English
Module: Listening
Lesson: YouTube lesson
Skill: Listening
```

Skills:

- Reading
- Listening
- Speaking
- Writing
- Vocabulary
- Grammar
- Pronunciation

---

# 24. Knowledge OS

## Resources / Bookmarks

Master Resource entity.

Properties:

- title
- URL
- type
- category
- area
- project
- platform
- status
- notes
- tags
- rating
- source
- dateAdded

Statuses:

```text
New
Testing
Essential
Reference
Future
Archived
```

---

# 25. Ideas

Statuses:

```text
Raw Idea
Evaluating
Developing
Ready
In Progress
Completed
Paused
Archived
```

Idea can become:

- Project
- Feature
- Content
- Product
- Task
- Resource

لكن لا يتم إنشاء duplicate source records.

---

# 26. Meetings

Meeting fields:

- title
- date
- participants
- project
- agenda
- notes
- decisions
- actionItems
- followUpDate

Action items should link to Tasks.

---

# 27. HABIT OS

Habit system يجب أن يكون بسيطًا.

لا تجعل المستخدم يملأ عشرات الحقول يوميًا.

Core:

1. Habit Master
2. Daily Habit Log
3. Weekly Review
4. Optional Trigger / Relapse

Habit Master:

- habit
- type
- frequency
- target
- active
- category
- startDate
- goal

Daily Log:

- date
- habit
- actualValue
- status
- notes
- trigger

Statuses:

```text
Done
Partial
Missed
Skipped
```

---

# 28. FITNESS OS

Fitness يجب أن يستخدم نفس Core + specialized module.

يمكن أن يحتوي على:

- Programs
- Phases
- Workouts
- Exercises
- Sessions
- Cardio
- Mobility
- Recovery
- Measurements

Architecture:

```text
Program
 ↓
Phase
 ↓
Week
 ↓
Workout
 ↓
Exercise
```

---

# 29. CONTENTOS — PRESERVE AND EXTEND

هذا الجزء مهم جدًا.

**لا تعيد بناء ContentOS من الصفر.**

انقل/ادمج capabilities الحالية إلى Unified OS مع الحفاظ على behavior.

---

# 30. ContentOS Entity Architecture

الترتيب:

```text
Project
  ↓
Content Account
  ↓
Platform
  ↓
Content Type
  ↓
Account Configuration
  ↓
Workflow
  ↓
Post
  ↓
Analytics
```

---

# 31. Content Account

Account يجب أن يكون entity مستقل.

مثال:

```text
Project: Creator Business
Account: YouTube - Main
Account: TikTok - Main
Account: Instagram - Main
Account: Facebook - Main
Account: LinkedIn - Main
```

كل Account يمكن أن يملك configuration مختلف.

---

# 32. ContentOS Inheritance

يجب الحفاظ على:

```text
Global Defaults
      ↓
Platform
      ↓
Content Type
      ↓
Account Override
      ↓
Workflow Snapshot
      ↓
Post-level Override
      ↓
Historical Analytics
```

## أهم قاعدة

Account Override لا يغير Platform Default.

إذا:

```text
mode = inherit
```

فالحساب يستخدم parent configuration.

إذا:

```text
mode = custom
```

فالحساب يحصل على isolated configuration.

---

# 33. Account Workflow Customization

كل Account يجب أن يستطيع:

- Add Stage
- Edit Stage
- Delete Stage
- Reorder Stage
- Reset to Default

Stages لا تكون hard-coded.

---

# 34. Account Task Customization

داخل كل Stage:

- Add Task
- Edit Task
- Delete Task
- Reorder Task
- Assign
- Required / Optional
- Instructions
- SLA
- Approval requirement

---

# 35. Account Field Customization

Fields يمكن أن تكون:

- Short Text
- Long Text
- Select
- Number
- Date
- URL
- Boolean
- Relation
- Media
- Custom future types

مع:

- label
- placeholder
- instructions
- options
- required
- visibility
- order

---

# 36. Approval Gates

هذه capability إلزامية.

كل Stage يمكن أن يحتوي:

```text
requiresApproval
approver
approvalStatus
approvalComment
approvedAt
```

ولا يمكن الانتقال للمرحلة التالية إذا كانت approval مطلوبة ولم تتم الموافقة.

Transition rule:

```text
Required Fields Complete
AND
Required Tasks Complete
AND
Approval Gate Passed
AND
No Blocking Validation Error
```

---

# 37. Content Workflow Snapshot

عند إنشاء Post:

يجب حفظ snapshot من effective workflow.

مثال:

```text
Post
 ├── workflowSnapshot
 ├── stageSnapshot
 ├── taskSnapshot
 ├── fieldSnapshot
 ├── KPI definition snapshot
 └── analytics definition snapshot
```

إذا تغير Account Workflow لاحقًا:

**لا تعيد كتابة التاريخ.**

المنشور القديم يستمر وفق snapshot الخاص به.

---

# 38. Content Types

Content Type يمكن أن يكون:

- Short Video
- Long Video
- Reel
- Short
- Post
- Carousel
- Story
- Article
- Thread
- Newsletter
- Podcast
- Live
- Custom

كل Content Type يمكن أن يملك:

- stages
- tasks
- fields
- rawMetrics
- KPIs
- publishing rules
- templates

---

# 39. Raw Metrics

افصل:

```text
Raw Facts
```

عن:

```text
Derived KPIs
```

مثال Raw Metrics:

- Views
- Reach
- Likes
- Comments
- Shares
- Saves
- Clicks
- Watch Time
- Revenue
- Followers Gained

ثم:

```text
Raw Metric
 ↓
KPI Input
 ↓
Formula
 ↓
Computed KPI
```

---

# 40. KPI Engine

KPIs يمكن أن تكون:

- Engagement Rate
- CTR
- Conversion Rate
- Completion Rate
- Save Rate
- Revenue per 1,000 views
- Custom KPI

لا تستخدم:

```javascript
eval()
```

ولا:

```javascript
Function()
```

للتعامل مع formulas.

استخدم parser/evaluator آمن.

---

# 41. KPI Targets

كل KPI يمكن أن يحتوي:

- target
- unit
- direction
- benchmark
- benchmarkType
- scoring model
- cap

Directions:

```text
higher_better
lower_better
```

---

# 42. Analytics History

كل measurement يجب أن يحفظ:

- date
- values
- source
- notes
- revision
- recordedAt
- definitionSnapshot

لا تعيد كتابة historical analytics بسبب تغير definition لاحقًا.

---

# 43. Analytics Sources

Architecture يجب أن يدعم:

```text
Manual
Import
API
Hybrid
```

لكن لا تدّعي أن API موجود إذا لم يتم تنفيذه.

يمكن بناء schema connector-ready.

---

# 44. Platform Analytics

كل Platform يمكن أن يملك:

- enabled
- dataSource
- platformMetrics
- canonicalMetricMapping
- pageKPIs

Platform-specific metrics يجب أن تبقى منفصلة عن Content Type defaults.

---

# 45. Canonical Metrics

لتوحيد المنصات:

```text
YouTube Views
TikTok Views
Instagram Plays
```

يمكن mapping إلى:

```text
Canonical: Video Views
```

لكن لا تفقد metric الأصلية.

---

# 46. Content Dashboard

يجب أن يعرض:

- Content pipeline
- Today's content
- Pending approval
- Blocked content
- Publishing schedule
- Analytics pending
- Top content
- KPI performance
- Account health
- Platform performance
- Learning signals
- Recommendations

---

# 47. Content Intelligence

يجب الحفاظ على:

```text
Analytics
 ↓
Patterns
 ↓
Learning Signals
 ↓
Recommendations
 ↓
Content Decisions
```

Examples:

- format repeatedly underperforming
- topic overperforming
- posting time pattern
- platform differences
- hook performance
- retention patterns

أي recommendation يجب أن تكون traceable إلى data.

---

# 48. E-COMMERCE MODULE

Entities:

- Products
- Product Variants
- Inventory
- Suppliers
- Orders
- Customers
- Returns
- Promotions
- Campaigns

Product lifecycle:

```text
Idea
 ↓
Draft
 ↓
Ready
 ↓
Published
 ↓
Archived
```

Inventory:

```text
On Hand
Reserved
Available
Damaged
Returned
```

---

# 49. Product Catalog

Product properties:

- productId
- name
- category
- type
- project
- supplier
- cost
- price
- SKU
- stock
- status
- assets
- description
- variants

---

# 50. Orders

Order source of truth.

Order statuses:

```text
Pending
Confirmed
Processing
Packed
Shipped
Delivered
Cancelled
Returned
Refunded
```

Orders can link to:

- customer
- product
- project
- finance
- marketing campaign
- delivery

---

# 51. App / SaaS MODULE

Entities:

- Products
- PRD
- Requirements
- Epics
- Features
- Backlog
- Releases
- Bugs
- QA
- Feedback
- Support
- Product Analytics
- Subscriptions
- Team
- Technical Assets

---

# 52. PRD System

PRD hierarchy:

```text
Product
 ↓
PRD
 ↓
Requirement
 ↓
Epic
 ↓
Feature
 ↓
Task
```

PRD fields:

- problem
- users
- goals
- nonGoals
- requirements
- assumptions
- risks
- dependencies
- acceptanceCriteria
- metrics

---

# 53. Feature Lifecycle

Configurable lifecycle example:

```text
Idea
 ↓
Discovery
 ↓
Spec
 ↓
Ready
 ↓
In Development
 ↓
QA
 ↓
Beta
 ↓
Released
 ↓
Deprecated
```

Do not hard-code if the project needs custom workflow.

---

# 54. Bug / QA

Bug fields:

- severity
- priority
- environment
- steps
- expected
- actual
- reproduction
- linkedFeature
- release
- assignee
- status

QA should support:

- test cases
- test runs
- pass/fail
- blocked
- evidence
- release readiness

---

# 55. Support

Support entities:

- Tickets
- Requests
- Complaints
- Disputes
- Knowledge Base
- SLA

Ticket workflow configurable.

---

# 56. MARKETPLACE MODULE

مهم خصوصًا لـ Koumma.

Entities:

- Listings
- Categories
- Users
- Orders / Deals
- Trust
- Verification
- Reviews
- Reports
- Disputes
- Safety
- Transactions

---

# 57. Marketplace Listing

Listing fields يجب أن تكون category-aware.

مثال:

Real Estate:

- propertyType
- rooms
- bathrooms
- area
- pool
- location

Cars:

- make
- model
- year
- engine
- mileage
- transmission
- condition

لا تجعل كل properties إجبارية لكل category.

استخدم dynamic category attributes.

---

# 58. Trust & Safety

Koumma وغيرها يمكن أن تستخدم:

- Verification
- KYC status
- Trust score
- Reports
- Disputes
- Risk flags
- Safe meetup
- Escrow state
- Fraud signals

لكن sensitive personal data يجب أن يكون access-controlled.

---

# 59. DELIVERY / OPERATIONS MODULE

Entities:

- Service Areas
- Delivery Orders
- Routes
- Slots
- Drivers / Partners
- Customers
- Pricing
- Delivery Status
- Operations Metrics

Example:

```text
Customer
 ↓
Order
 ↓
Slot
 ↓
Route
 ↓
Driver
 ↓
Delivery
 ↓
Finance
```

---

# 60. BLOG / SEO MODULE

Entities:

- Articles
- Topics
- Keywords
- Search Intent
- SEO Tasks
- SERP Tracking
- Organic Traffic
- Content Refresh
- Affiliate Links

SEO content can use ContentOS workflow where appropriate.

---

# 61. AFFILIATE MODULE

Entities:

- Programs
- Merchants
- Tracking Links
- Content
- Clicks
- Conversions
- Commissions
- Payouts

Tracking link should connect to Content rather than duplicate content.

---

# 62. DIGITAL PRODUCTS MODULE

Entities:

- Products
- Assets
- Versions
- Production
- Platforms
- Sales
- Customers
- Refunds
- Marketing

---

# 63. CREATOR BUSINESS

Creator project can combine:

```text
ContentOS
+
Marketing
+
Affiliate
+
Sponsors
+
Analytics
+
Finance
```

Accounts remain separate per platform.

---

# 64. SOCIAL CONTENT MODEL

لا تنشئ Content record مختلفًا لكل منصة إذا كان نفس المحتوى.

الأصح:

```text
Content Master
   ↓
Publishing Records
   ├── YouTube
   ├── TikTok
   ├── Instagram
   ├── Facebook
   ├── X
   ├── LinkedIn
   └── Other
```

يمكن لكل publishing record أن يملك:

- account
- platform
- scheduledAt
- publishedAt
- platformId
- URL
- status
- platformMetrics

---

# 65. GLOBAL HOME PAGE

يجب أن تكون Home Page هي:

# Command Center

وليست مجرد صفحة روابط.

Architecture:

```text
HOME
│
├── Global Dashboard
├── Quick Actions
├── Today
├── Alerts
├── Projects
├── Finance
├── Content
├── Business
├── Learning
├── Home
├── Fitness
└── System
```

---

# 66. Global Dashboard

Dashboard يجب أن يكون exception-first.

لا تعرض كل شيء.

اعرض:

## Today

- overdue tasks
- today's tasks
- today's meetings
- publishing due
- maintenance due
- study sessions
- habits
- important events

## Finance

- cash available
- income
- expenses
- budget alerts
- debts due
- subscriptions due
- savings progress

## Projects

- active projects
- blocked projects
- overdue milestones
- deadlines
- risks

## Content

- content awaiting approval
- content awaiting analytics
- scheduled posts
- blocked workflow
- important KPI changes

## Business

- revenue
- orders
- customers
- inventory alerts
- support tickets

## Learning

- today's lesson
- overdue lessons
- course progress

## Home

- maintenance
- shopping
- inventory alerts

---

# 67. Quick Actions

Global quick actions:

```text
New Task
New Project
New Goal
New Transaction
New Content
New Idea
New Bookmark
New Meeting
New Event
New Home Task
New Product
New Feature
New Bug
New Order
```

Quick actions يجب أن تفتح entity الصحيحة مباشرة.

---

# 68. Alerts Engine

Alerts يجب أن تكون data-driven.

أمثلة:

```text
Overdue Task
Blocked Task
Budget Exceeded
Debt Due
Subscription Due
Goal Behind
Pending Content Approval
Analytics Missing
Critical Bug
QA Blocked
Low Stock
Return Pending
Maintenance Due
Course Behind
Habit Risk
```

لا تحول كل شيء إلى notification.

يمكن تصنيف:

```text
Critical
High
Medium
Info
```

---

# 69. GLOBAL SEARCH

Search يجب أن يكون موحدًا.

ابحث في:

- Projects
- Tasks
- Content
- Products
- Orders
- Customers
- Resources
- Notes
- Goals
- Features
- Bugs
- Finance
- Learning
- Home

---

# 70. PROJECT DASHBOARD

عند فتح Project:

اعرض فقط modules enabled.

مثال:

```text
Koumma
├── Overview
├── Tasks
├── Product
├── PRD
├── Features
├── Releases
├── QA
├── Content
├── Analytics
├── Marketing
├── Finance
├── Support
└── Trust & Safety
```

لا تعرض:

```text
Inventory
```

إذا لم يكن مفعّلًا.

---

# 71. PERSONAL DASHBOARD

يشمل:

- Today
- Tasks
- Goals
- Finance
- Habits
- Fitness
- Learning
- Home
- Calendar
- Notes
- Resources

---

# 72. BUSINESS DASHBOARD

يشمل حسب المشاريع:

- revenue
- expenses
- profit
- orders
- customers
- projects
- content
- products
- operations
- alerts

---

# 73. Permissions

Roles:

```text
Owner
Admin
Manager
Editor
Contributor
Viewer
```

Finance يجب أن يدعم visibility restrictions.

Content accounts قد تحتاج access restrictions.

Project-level permissions يجب أن تكون ممكنة.

## مهم

Client-side permissions ليست boundary أمنية حقيقية.

Backend authorization / database rules يجب أن تكون authoritative.

---

# 74. Audit Log

يجب تسجيل التغييرات الحساسة:

- permission change
- workflow change
- stage change
- KPI change
- formula change
- finance change
- restore
- migration
- delete
- ownership change

Audit record:

```text
who
what
when
entity
oldValue
newValue
reason
source
```

---

# 75. Versioning

يجب أن يحتوي النظام على:

- schemaVersion
- migrationVersion
- configVersion
- workflowVersion
- analyticsDefinitionVersion

أي migration يجب أن تكون:

- backward-compatible
- explicit
- testable
- recoverable

---

# 76. Backup / Snapshot / Restore

يجب التفريق بين:

## System Export

مثل:

```text
HTML/PWA package
```

و:

## Data Backup

مثل:

```text
JSON backup
```

لا تخلط الاثنين.

قبل Restore:

```text
Current State
 ↓
Protective Snapshot
 ↓
Validate Backup
 ↓
Migrate if needed
 ↓
Restore
 ↓
Verify
```

إذا فشل restore:

```text
Rollback / Recovery
```

---

# 77. Supabase / Backend Safety

إذا استمر استخدام Supabase:

- Auth session يجب استعادته قبل تحميل البيانات المحمية.
- لا تعتبر localStorage مصدر الحقيقة عندما يكون Supabase متاحًا.
- لا تستخدم anon access لبيانات workspace الحساسة.
- يجب وجود authenticated policies.
- account/team matching يستخدم authUid أولًا.
- email fallback فقط legacy.
- فشل query المؤقت لا يجب أن يؤدي تلقائيًا إلى sign-out.
- لا تضع workspace كاملًا في public/anon-readable table.

---

# 78. Data Model Strategy

ابدأ بـ logical entities ثم physical implementation.

لا تربط architecture بالـ UI.

كل Entity يجب أن يكون له:

```text
ID
CreatedAt
UpdatedAt
Owner
Status
Source
ExternalId (when needed)
```

وإذا كان mutable configuration:

```text
Version
SchemaVersion
```

---

# 79. External Integrations

Notion-style manual dashboards ليست مصدر الحقيقة للخدمات الخارجية.

External systems يمكن أن تبقى source of truth لـ:

- YouTube
- TikTok
- Meta
- Instagram
- Google Search Console
- GA4
- App analytics
- Payment providers
- E-commerce platforms
- Supabase

Unified OS يخزن:

- snapshots
- KPIs
- decisions
- reviews
- operational data
- imported measurements

إلى أن يتم بناء connector حقيقي.

لا تدّعي وجود real-time integration إذا لم يتم بناؤه.

---

# 80. ContentOS + Unified OS Relationship

العلاقة النهائية:

```text
Project
│
├── Content Accounts
│
├── Content
│   ├── Workflow
│   ├── Publishing
│   └── Analytics
│
├── Product
├── Features
├── Finance
├── Marketing
├── Customers
└── Support
```

ContentOS لا يصبح isolated.

وفي نفس الوقت لا يتم تفكيك architecture القوي الموجود فيه.

---

# 81. Koumma Example

Koumma يجب أن يكون مثالًا مرجعيًا لاختبار architecture.

Project Profile:

```text
Marketplace
+
App/SaaS
```

Modules:

```text
Product
PRD
Features
Releases
Engineering
QA
Analytics
ContentOS
Marketing
Finance
Support
Trust & Safety
Marketplace
Team
```

Marketplace modules:

```text
Listings
Categories
Users
Deals
Verification
Trust
Reviews
Reports
Disputes
Safety
```

Revenue:

```text
Commission
Service Fees
Subscriptions
Ads
```

---

# 82. NeelGo Example

افصل:

```text
Delivery Business
```

عن:

```text
NeelGo Software Product
```

إذا أصبح NeelGo تطبيقًا:

```text
Delivery Business
    ↕
NeelGo Product
```

الأول Operations.

الثاني Product/SaaS.

لا تخلط financial/operational records بالـ software development records.

---

# 83. Finance Project Integration

Project Finance يجب أن يعتمد على Financial Ledger.

Project dashboard يعرض:

```text
Expenses
Revenue
Net
ROI
Budget
Forecast
```

لكن لا ينشئ Ledger جديد.

---

# 84. Home Finance Integration

Home Shopping:

```text
Shopping
 ↓
Purchased
 ↓
Finance Transaction
```

Maintenance:

```text
Maintenance
 ↓
Cost
 ↓
Financial Ledger
```

لا duplicate transaction.

---

# 85. Learning + Tasks

Lesson يمكن أن يولد Task أو Study Session.

لكن لا تنشئ duplicate lesson.

مثال:

```text
Lesson
 ↓
Scheduled Study Session
 ↓
Task / Calendar
```

الـ Lesson هو source of truth للمحتوى التعليمي.

---

# 86. Habit + Tasks

Habit ليس Task.

لكن Habit completion يمكن أن يظهر في Today Dashboard.

لا تجعل المستخدم ينشئ task يدويًا لكل habit.

---

# 87. Content + Calendar

Publishing schedule يجب أن يرتبط بالـ Calendar.

لكن Content record يظل source of truth للمحتوى.

---

# 88. Product + Content

Content يمكن أن يكون marketing asset لمنتج.

العلاقة:

```text
Product
 ↕
Campaign
 ↕
Content
```

لا تنشئ duplicate campaign content.

---

# 89. Entity Relationship Overview

النموذج المفاهيمي النهائي:

```text
                         ┌──────────────┐
                         │    AREAS     │
                         └──────┬───────┘
                                │
                         ┌──────▼───────┐
                         │   PROJECTS   │
                         └──────┬───────┘
                                │
       ┌────────────────────────┼─────────────────────────┐
       │                        │                         │
┌──────▼──────┐         ┌──────▼──────┐          ┌──────▼──────┐
│    TASKS    │         │    GOALS    │          │   FINANCE   │
└─────────────┘         └─────────────┘          └─────────────┘
       │
       │
┌──────▼──────────────────────────────────────────────────────┐
│                    PROJECT MODULES                         │
├────────────┬────────────┬────────────┬─────────────────────┤
│ ContentOS  │ Product    │ Commerce   │ Operations          │
├────────────┼────────────┼────────────┼─────────────────────┤
│ SEO        │ Features   │ Orders     │ Delivery            │
├────────────┼────────────┼────────────┼─────────────────────┤
│ Affiliate  │ Releases   │ Inventory  │ Support             │
└────────────┴────────────┴────────────┴─────────────────────┘
```

---

# 90. IMPLEMENTATION STRATEGY

## Do NOT build in one pass.

Use the following phases.

---

# PHASE 0 — BASELINE & REVERSE ENGINEERING

Before changing code:

1. Inspect the entire ContentOS source.
2. Map files.
3. Map components.
4. Map data structures.
5. Map migrations.
6. Map state management.
7. Map Supabase integration.
8. Map authentication.
9. Map permissions.
10. Map backup/restore.
11. Map analytics.
12. Map workflow logic.
13. Map PWA.
14. Map Android WebView.
15. Identify existing technical debt.
16. Create architecture map.
17. Create current-state entity map.

### Deliverables

```text
CURRENT_ARCHITECTURE.md
CURRENT_DATA_MODEL.md
CURRENT_FEATURE_MAP.md
CURRENT_RISK_REGISTER.md
CURRENT_PHASE_STATUS.md
```

Do not modify production behavior in Phase 0 unless required to make the baseline safe.

---

# PHASE 1 — PROTECT THE EXISTING CONTENTOS CORE

Goal:

Ensure the current ContentOS continues to work before expansion.

Test:

- authentication
- cross-browser login
- account loading
- platform loading
- content types
- stages
- tasks
- fields
- KPIs
- analytics
- dashboards
- intelligence
- permissions
- backup
- restore
- migration

### Acceptance

Existing ContentOS behavior must not regress.

---

# PHASE 2 — CORE UNIFIED DATA MODEL

Introduce:

- Areas
- Projects
- Tasks
- Goals
- People
- Events
- Resources
- Notes
- Decisions
- Reviews

Do not yet build every vertical.

Goal:

Create a stable foundation.

---

# PHASE 3 — GLOBAL NAVIGATION + HOME

Build:

```text
Home
Projects
Personal
Business
Content
Finance
Knowledge
Learning
Home
Fitness
System
```

Build global search and quick actions.

---

# PHASE 4 — FINANCE OS

Implement:

- Accounts
- Ledger
- Categories
- Budgets
- Recurring
- Debts
- Savings Goals

Then integrate:

- Projects
- Home
- Commerce
- Orders
- Delivery

---

# PHASE 5 — PERSONAL OS

Implement:

- Goals
- Habits
- Learning
- Fitness
- Home
- Calendar
- Personal tasks

---

# PHASE 6 — PROJECT PROFILES + MODULE SYSTEM

Implement dynamic:

```text
Project Profile
+
Enabled Modules
```

The UI should adapt to enabled modules.

---

# PHASE 7 — CONTENTOS UNIFIED INTEGRATION

Move from standalone ContentOS mental model to:

```text
Project
 ↓
Content Account
 ↓
ContentOS
```

Preserve all existing capabilities.

Do not break old data.

---

# PHASE 8 — CONTENTOS CONFIGURATION ENGINE

Verify and harden:

- inheritance
- overrides
- stages
- tasks
- fields
- KPIs
- approvals
- workflow snapshots

---

# PHASE 9 — ANALYTICS ENGINE

Implement/harden:

- Raw Metrics
- Platform Metrics
- Canonical Metrics
- KPI formulas
- targets
- benchmarks
- scoring
- history
- revisions
- definition snapshots

---

# PHASE 10 — CONTENT INTELLIGENCE

Implement:

```text
Analytics
 ↓
Learning Signals
 ↓
Insights
 ↓
Recommendations
 ↓
Content Decisions
```

---

# PHASE 11 — PRODUCT / SAAS

Implement:

- PRD
- Requirements
- Epics
- Features
- Backlog
- Releases
- Bugs
- QA
- Feedback
- Support
- Product Analytics

---

# PHASE 12 — COMMERCE

Implement:

- Products
- Variants
- Inventory
- Orders
- Customers
- Suppliers
- Returns
- Promotions
- Campaigns

---

# PHASE 13 — MARKETPLACE

Implement:

- Listings
- Categories
- Deals
- Verification
- Trust
- Reviews
- Reports
- Disputes
- Safety

---

# PHASE 14 — OPERATIONS

Implement:

- Service Areas
- Delivery Orders
- Routes
- Slots
- Drivers
- Pricing
- Operations Analytics

---

# PHASE 15 — KNOWLEDGE + LEARNING

Implement:

- Resources
- Bookmarks
- Ideas
- Notes
- Courses
- Modules
- Lessons
- Skills
- Study sessions

---

# PHASE 16 — HOME + FITNESS + HABITS

Complete:

- Home
- Maintenance
- Inventory
- Shopping
- Habits
- Fitness
- Recovery
- Personal dashboards

---

# PHASE 17 — GLOBAL INTELLIGENCE

Build cross-system intelligence.

Examples:

```text
Finance says spending increased
+
Project budget is near limit
+
Business revenue decreased
=
Global alert
```

Another:

```text
Content KPI down
+
Specific format underperforms
+
Specific platform affected
=
Content learning signal
```

Do not invent conclusions without data.

---

# PHASE 18 — SECURITY + PERMISSIONS + AUDIT

Complete:

- role system
- project permissions
- account permissions
- finance restrictions
- audit
- action-level authorization
- backend security

---

# PHASE 19 — VERSIONING + RECOVERY

Complete:

- schema versioning
- migrations
- snapshots
- backup
- restore
- rollback
- compatibility tests

---

# PHASE 20 — FINAL INTEGRATION

Run:

- static validation
- data model validation
- migration tests
- permission tests
- workflow tests
- analytics tests
- cross-module tests
- browser tests
- mobile/PWA tests
- recovery tests

If runtime smoke test cannot be executed because of environment limitations:

**mark it NOT VERIFIED.**

Never falsely mark it PASS.

---

# 91. CONTENTOS ORIGINAL 20-PHASE COMPATIBILITY

The original ContentOS architecture already established these phases:

1. Account Configuration Foundation
2. Platform → Content Type Inheritance
3. Account Stages Customization
4. Account Tasks Customization
5. Account Fields Customization
6. Account KPIs Customization
7. Raw Metrics / KPI Architecture
8. Platform-Specific Analytics
9. Easy Post Analytics Entry
10. Analytics Data Normalization & History
11. Account Analytics Customization
12. Account Dashboard Configuration
13. Cross-Platform Metric Normalization
14. KPI Formula Engine
15. KPI Targets, Benchmarks & Scoring
16. Analytics Intelligence & Recommendations
17. Content Intelligence Feedback Loop
18. Permissions, Ownership & Audit Safety
19. Versioning, Migration & Recovery
20. Final Integration & Regression Validation

هذه المراحل لا يتم حذفها.

إذا كان Unified OS implementation يحتاج مراحل إضافية، اجعلها طبقة فوقها.

---

# 92. PHASE EXECUTION PROTOCOL

كل مرة أطلب منك تنفيذ مرحلة، اتبع هذا البروتوكول:

## STEP A — Read Before Writing

اقرأ:

- Master Prompt
- Current Architecture
- Previous phase report
- Relevant source files
- Data model
- migration files
- tests

---

## STEP B — State the Phase

اكتب:

```text
Current Phase:
Goal:
Dependencies:
Affected Modules:
Affected Files:
Risks:
Acceptance Criteria:
```

---

## STEP C — Design

قبل كتابة code:

حدد:

- entities
- relations
- state
- lifecycle
- permissions
- migration
- UI
- APIs
- edge cases
- rollback

---

## STEP D — Implement

نفذ فقط ما يخص المرحلة.

لا تقفز إلى Phase 8 أثناء Phase 3 إلا إذا كان dependency حقيقيًا.

---

## STEP E — Validate

اختبر:

```text
Happy path
Empty state
Invalid state
Permission denied
Migration
Existing data
Backward compatibility
Refresh
Reload
New browser
Mobile
```

---

## STEP F — Regression

اختبر أن:

```text
Existing ContentOS
```

ما زال يعمل.

---

## STEP G — Documentation

أنشئ/حدّث:

```text
PHASE_X_REPORT.md
CURRENT_STATE.md
CHANGELOG.md
```

---

## STEP H — Completion Gate

لا تعتبر المرحلة مكتملة إلا إذا:

- implementation done
- validation done
- regression done
- docs updated
- acceptance criteria passed

---

# 93. CONTINUATION PROTOCOL FOR FUTURE AI

إذا استلمت المشروع في جلسة جديدة:

**لا تبدأ من الصفر.**

ابحث أولًا عن:

```text
MASTER_BUILD_PROMPT.md
CURRENT_STATE.md
PHASE_STATUS.md
CHANGELOG.md
ARCHITECTURE.md
DATA_MODEL.md
```

ثم اقرأ آخر Phase Report.

حدد:

```text
Last Completed Phase
Current Phase
Next Phase
Known Issues
Known Risks
Pending Validation
```

ثم تابع من حيث توقف المشروع.

---

# 94. DO NOT REBUILD WORKING FEATURES

إذا وجدت feature تعمل بالفعل:

```text
Preserve
```

ولا:

```text
Rewrite
```

إلا إذا كان هناك سبب موثق.

إذا احتجت refactor:

1. اشرح السبب.
2. حدد impact.
3. حافظ على API/data compatibility.
4. migration.
5. tests.
6. rollback.

---

# 95. BACKWARD COMPATIBILITY

أي تغيير في data model يجب أن يدعم:

```text
old data
+
new data
```

حتى اكتمال migration.

لا تحذف legacy fields فورًا.

استخدم:

```text
schemaVersion
migration
normalization
fallback
```

---

# 96. HISTORICAL DATA SAFETY

هذه قاعدة صارمة.

لا تعيد تفسير البيانات التاريخية بسبب تغييرات مستقبلية.

مثال:

إذا تغير:

```text
KPI Formula
```

فلا تغير نتائج القياسات القديمة.

احفظ:

```text
definitionSnapshot
```

مع measurement.

نفس الشيء للـ:

- workflow
- stage
- task
- field
- KPI
- metric

---

# 97. CONFIGURATION SAFETY

أي configuration inheritance يجب أن يكون:

```text
Inherited
```

أو:

```text
Custom
```

ولا يتم تعديل parent تلقائيًا من child.

---

# 98. DELETE SAFETY

لا تسمح بحذف entity إذا كانت مرتبطة ببيانات تاريخية إلا إذا:

- soft delete
- archive
- migration
- explicit confirmation

خصوصًا:

- KPI
- Raw Metric
- Content Type
- Stage
- Account
- Project
- Finance records

---

# 99. UI PRINCIPLES

الواجهة يجب أن تكون:

- Clean
- Modern
- Fast
- Responsive
- Arabic-friendly
- RTL-aware
- Desktop-friendly
- Mobile-friendly
- Accessible

لا تجعل كل صفحة Dashboard ضخمة.

استخدم:

- progressive disclosure
- tabs
- filters
- drawers
- detail pages
- contextual actions

---

# 100. DASHBOARD PRINCIPLES

Dashboard لا يجب أن يعرض كل data.

Dashboard يعرض:

```text
What needs attention
+
What matters now
+
What changed
+
What requires decision
```

---

# 101. EMPTY STATES

كل Module يجب أن يحتوي Empty State مفيد.

مثال:

```text
No active projects
```

مع:

```text
Create Project
```

وليس شاشة فارغة.

---

# 102. ERROR STATES

الأخطاء يجب أن تكون:

- understandable
- actionable
- logged
- recoverable

لا تعرض:

```text
Unknown Error
```

فقط.

---

# 103. LOADING STATES

استخدم:

- skeleton
- progressive loading
- cached safe state

ولا تمنع النظام كله بسبب Module غير متاح إذا أمكن عزل المشكلة.

---

# 104. OFFLINE / NETWORK RESILIENCE

إذا كان النظام يدعم local caching:

```text
Local cache
≠
Source of truth
```

حدد بوضوح:

- cached
- synced
- pending sync
- conflict

لا تجعل localStorage بديلًا صامتًا عن backend.

---

# 105. OBSERVABILITY

أضف عند الحاجة:

- error logs
- audit logs
- migration logs
- sync logs
- analytics ingestion logs
- permission failures

---

# 106. TESTING MATRIX

يجب أن توجد tests للآتي:

## Core

- create
- edit
- delete/archive
- relations
- permissions

## ContentOS

- inheritance
- account override
- workflow
- approvals
- snapshot
- analytics
- KPI
- history

## Finance

- income
- expense
- transfer
- balance
- budgets
- duplicate prevention

## Project

- profile
- enabled modules
- project dashboard

## Commerce

- product
- stock
- order
- return

## Product

- PRD
- feature
- bug
- QA
- release

## Recovery

- backup
- migration
- restore
- rollback

---

# 107. ACCEPTANCE CRITERIA FOR THE WHOLE SYSTEM

The system is considered complete only when:

## Navigation

- Home opens
- every major system is reachable
- global search works
- quick actions work

## Core

- Projects work
- Tasks work
- Goals work
- Calendar works
- Resources work

## Finance

- Ledger is source of truth
- balances are correct
- project finance works
- home finance sync works
- duplicate prevention works

## ContentOS

- existing features preserved
- account customization works
- workflow works
- approvals work
- snapshots work
- analytics works
- KPIs work
- history works
- intelligence works

## Projects

- profiles work
- modules can be enabled/disabled
- dashboards adapt

## Product

- PRD
- features
- releases
- bugs
- QA
- support

## Commerce

- products
- inventory
- orders
- customers
- returns

## Operations

- routes
- slots
- delivery

## Personal

- learning
- habits
- fitness
- home

## Safety

- permissions
- audit
- migration
- backup
- restore

---

# 108. WHAT NOT TO DO

Never:

1. Build everything in one giant change.
2. Rewrite ContentOS unnecessarily.
3. Delete existing data to simplify migration.
4. Hard-code workflows that are supposed to be configurable.
5. Duplicate the same entity in different modules.
6. Create separate finance ledgers for projects.
7. Create separate task databases per project.
8. Claim an integration exists when it does not.
9. Treat localStorage as authoritative when backend exists.
10. use eval/Function for KPI formulas.
11. rewrite historical analytics after definition changes.
12. mark runtime tests PASS when they were not actually run.
13. hide errors.
14. skip migrations.
15. skip regression testing.
16. move to next phase before completion gate.

---

# 109. REQUIRED PROJECT FILE STRUCTURE

Maintain a clear internal documentation structure:

```text
/docs
  MASTER_BUILD_PROMPT.md
  ARCHITECTURE.md
  DATA_MODEL.md
  SECURITY.md
  INTEGRATIONS.md
  CURRENT_STATE.md
  PHASE_STATUS.md
  CHANGELOG.md

  /phases
    PHASE_00_REPORT.md
    PHASE_01_REPORT.md
    PHASE_02_REPORT.md
    ...
    PHASE_20_REPORT.md

  /migrations
  /decisions
  /qa
```

If the codebase has a different structure, adapt without losing these logical documents.

---

# 110. ARCHITECTURE DECISION RECORDS

For important decisions create ADRs.

Format:

```text
ADR-001
Title:
Context:
Decision:
Alternatives:
Consequences:
Migration:
Status:
```

---

# 111. CHANGELOG

Every phase must record:

```text
Added
Changed
Fixed
Migrated
Deprecated
Known limitations
```

---

# 112. CURRENT_STATE

At the end of every phase update:

```text
Completed:
In Progress:
Blocked:
Next:
Known Risks:
Known Limitations:
Last Validation:
```

---

# 113. PHASE REPORT TEMPLATE

Use:

```markdown
# Phase X — Name

## Goal

## Scope

## Files Changed

## Data Model Changes

## UI Changes

## Backend Changes

## Migration

## Security

## Tests

## Regression

## Known Limitations

## Acceptance Criteria

## Final Status

## Next Phase
```

---

# 114. CHANGE CONTROL

Any architectural change must answer:

1. Why?
2. What breaks?
3. What data is affected?
4. Is migration needed?
5. Can old data still be read?
6. Can it be rolled back?
7. What tests prove safety?

---

# 115. PRIORITY RULE

When requirements conflict, prioritize:

```text
1. Data safety
2. Backward compatibility
3. Existing ContentOS capabilities
4. Security
5. Correctness
6. Architecture consistency
7. Maintainability
8. UX
9. Performance
10. New features
```

Do not sacrifice historical data or working architecture for convenience.

---

# 116. FINAL SYSTEM VISION

The final product should feel like one operating system, not 15 disconnected apps.

Conceptually:

```text
                         ┌─────────────────────┐
                         │   GLOBAL HOME / OS  │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
          ┌──────▼─────┐     ┌──────▼─────┐     ┌──────▼─────┐
          │  PERSONAL  │     │  PROJECTS  │     │  BUSINESS  │
          └──────┬─────┘     └──────┬─────┘     └──────┬─────┘
                 │                  │                  │
       ┌─────────┼─────────┐  ┌─────┼──────────┐  ┌────┼─────────────┐
       │         │         │  │     │          │  │    │             │
    Learning  Habits   Fitness Content Product Commerce Operations
       │         │         │    │      │          │      │
       └─────────┴─────────┴────┴──────┴──────────┴──────┘
                              │
                       ┌──────▼──────┐
                       │ SHARED CORE │
                       ├─────────────┤
                       │ Projects    │
                       │ Tasks       │
                       │ Goals       │
                       │ Finance     │
                       │ People      │
                       │ Calendar    │
                       │ Resources   │
                       └─────────────┘
```

---

# 117. MASTER RULE

**One Core.**

**One Source of Truth per entity.**

**Multiple Project Profiles.**

**Selective Modules.**

**Configurable Workflows.**

**Account-level ContentOS customization.**

**Historical snapshots.**

**Safe analytics.**

**Central Command Center.**

**Contextual dashboards.**

**No unnecessary duplication.**

**No destructive migrations.**

**No false test passes.**

**Complete one phase before starting the next.**

---

# 118. FIRST TASK FOR THE AI

Do NOT immediately start coding.

Your first response/action must be:

## 1. Inspect the attached ContentOS codebase completely.

## 2. Produce:

```text
CURRENT_ARCHITECTURE.md
CURRENT_DATA_MODEL.md
CURRENT_FEATURE_MAP.md
CURRENT_PHASE_STATUS.md
CURRENT_RISK_REGISTER.md
```

## 3. Compare the existing implementation against this Master Prompt.

Create:

```text
UNIFIED_OS_GAP_ANALYSIS.md
```

with:

```text
Existing
Already Compatible
Needs Refactor
Needs New Entity
Needs New Module
Needs Migration
Needs UI
Needs Backend
Needs Security
Needs Testing
```

## 4. DO NOT implement all missing features yet.

## 5. Recommend the exact next implementation phase.

## 6. Wait for the next phase instruction unless the environment explicitly authorizes autonomous phased execution.

---

# 119. WHEN AUTONOMOUS EXECUTION IS AUTHORIZED

If the user explicitly says:

> "نفذ النظام كله مرحلة مرحلة"

then:

1. Start at the earliest incomplete phase.
2. Complete it.
3. Test it.
4. Document it.
5. Update current state.
6. Continue to next phase.
7. Never skip acceptance gates.
8. Stop and report if a destructive architectural decision is required.

---

# 120. FINAL INSTRUCTION TO THE AI

Treat this repository as an existing production-grade architecture that is being expanded, not as a blank project.

The existing ContentOS architecture is valuable and must be preserved.

The objective is not:

```text
build many dashboards
```

The objective is:

```text
build a coherent operating system
```

where:

```text
Personal life
+
Projects
+
Businesses
+
Content
+
Products
+
Finance
+
Operations
+
Knowledge
```

share one coherent data model while remaining modular.

The user must be able to open one Home/Command Center and understand:

```text
What do I need to do?
What needs attention?
What is happening across my projects?
What is happening financially?
What content needs action?
What products/releases need action?
What business operations need action?
What goals are behind?
What changed?
What decision is needed?
```

without manually opening ten unrelated systems.

At the same time, opening a Project must show only the modules relevant to that Project.

The final architecture must therefore behave as:

```text
ONE SYSTEM
    ↓
SHARED CORE
    ↓
PROJECT PROFILES
    ↓
SELECTIVE MODULES
    ↓
CONFIGURABLE WORKFLOWS
    ↓
CENTRAL COMMAND CENTER
    ↓
CONTEXTUAL DASHBOARDS
    ↓
DATA-DRIVEN INTELLIGENCE
```

**Build it incrementally. Preserve the existing ContentOS. Protect historical data. Avoid duplication. Test every phase. Document every decision. Never claim success without validation.**
