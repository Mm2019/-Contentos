// Lightweight runtime Arabic localization layer.
//
// Why this exists: the "Unified OS" wrapper UI (Home, Finance, Business, Fitness,
// nav, etc.) has hundreds of English strings hardcoded directly in JSX across ~30
// files, with no i18n system. Rewriting every file by hand is slow and risky
// (easy to break JSX while editing dense one-line components).
//
// Instead, this translates the rendered page: it walks visible text nodes and a
// few label-carrying attributes, and swaps any English phrase it recognizes for
// its Arabic equivalent from the dictionary below. It runs once on load and again
// whenever the DOM changes (route change, data loading, etc.) via MutationObserver.
//
// Scope: only the main app document. The embedded ContentOS module lives in its
// own <iframe> (a separate document) and is untouched by this — it's already
// fully Arabic on its own.
//
// Extending coverage: if you spot an English label that didn't get translated,
// just add "English phrase": "الترجمة" to DICTIONARY below. No other code needs
// to change.

export const DICTIONARY = {
  // Brand / shell
  'UNIFIED OS': 'الأنظمة الموحدة', 'Foundation': 'الأساس', 'Workspace': 'مساحة العمل',
  'Refresh': 'تحديث', '↻ Refresh': '↻ تحديث', 'Sign out': 'تسجيل خروج', '⇥ Sign out': '⇥ تسجيل خروج',

  // Nav
  'Command Center': 'مركز التحكم', 'Today': 'اليوم', 'Notion OS Parity': 'التطابق مع Notion',
  'Projects': 'المشاريع', 'Project': 'المشروع', 'Personal': 'شخصي', 'Business OS': 'نظام الأعمال',
  'Fitness': 'اللياقة', 'Habits': 'العادات', 'Home OS': 'نظام المنزل', 'Tasks': 'المهام',
  'Goals': 'الأهداف', 'Goal': 'الهدف', 'Finance': 'المالية', 'Calendar': 'التقويم',
  'Knowledge': 'المعرفة', 'Learning': 'التعلّم', 'Resources': 'الموارد', 'ContentOS': 'نظام المحتوى',
  'ContentOS Config': 'إعدادات نظام المحتوى', 'ContentOS Analytics': 'تحليلات نظام المحتوى',
  'Content Intelligence': 'ذكاء المحتوى', 'Product / SaaS': 'المنتج / SaaS', 'Commerce': 'التجارة',
  'Marketplace': 'السوق', 'Global Intelligence': 'الذكاء الشامل', 'Security & Audit': 'الأمان والتدقيق',
  'Security & Permissions': 'الأمان والصلاحيات', 'Versioning & Recovery': 'النسخ والاسترجاع',
  'Data Manager': 'مدير البيانات', 'Existing ContentOS': 'نظام المحتوى الحالي',

  // Common actions / buttons
  'Save': 'حفظ', 'Cancel': 'إلغاء', 'Add': 'إضافة', 'Edit': 'تعديل', 'Delete': 'حذف',
  'Create': 'إنشاء', 'Update': 'تحديث', 'Submit': 'إرسال', 'Close': 'إغلاق', 'Back': 'رجوع',
  'Search': 'بحث', 'Search records': 'بحث في السجلات', 'Filter': 'تصفية', 'Loading': 'جارٍ التحميل',
  'Loading…': 'جارٍ التحميل…', 'No data': 'لا توجد بيانات', 'Confirm': 'تأكيد', 'Yes': 'نعم', 'No': 'لا',
  'Name': 'الاسم', 'Name / Title': 'الاسم / العنوان', 'Description': 'الوصف', 'Type': 'النوع',
  'Status': 'الحالة', 'Role': 'الدور', 'Category': 'الفئة', 'Categories': 'الفئات',
  'Notes': 'ملاحظات', 'Content': 'المحتوى', 'Location': 'الموقع', 'URL': 'الرابط',
  'Profile': 'الملف الشخصي', 'Records:': 'السجلات:', 'Entity / Table': 'الكيان / الجدول',
  'custom': 'مخصص', 'critical': 'حرج', 'daily': 'يومي', 'weekly': 'أسبوعي',
  'Not started': 'لم يبدأ', 'In progress': 'قيد التنفيذ', 'Completed': 'مكتمل',
  'Published': 'منشور', 'Report': 'تقرير', 'Reports': 'التقارير',

  // Fitness
  'Cycle': 'الدورة', 'Phase': 'المرحلة', 'Week': 'الأسبوع', 'Program': 'البرنامج',
  'Weight': 'الوزن', 'Reps': 'التكرارات', 'Load': 'الحمل', 'Rest': 'الراحة', 'RPE': 'معدل الجهد المُدرك',
  'Duration': 'المدة', 'Start Workout': 'بدء التمرين', 'Progress': 'التقدم', 'Remaining': 'المتبقي',

  // Finance / commerce
  'Order': 'الطلب', 'Orders': 'الطلبات', 'Open Orders': 'الطلبات المفتوحة', 'Products': 'المنتجات',
  'Product Variant': 'متغيّر المنتج', 'Variants': 'المتغيّرات', 'Customer': 'العميل', 'Customers': 'العملاء',
  'Supplier': 'المورّد', 'Suppliers': 'الموردون', 'Return': 'الإرجاع', 'Returns': 'المرتجعات',
  'Promotion': 'العرض', 'Promotions': 'العروض', 'Campaign': 'الحملة', 'Campaigns': 'الحملات',
  'Inventory': 'المخزون', 'Inventory alerts': 'تنبيهات المخزون', 'Stock Attention': 'حالات تحتاج متابعة بالمخزون',
  'Log Payment': 'تسجيل دفعة', 'Estimated cost': 'التكلفة التقديرية', 'Commerce Attention': 'حالات تحتاج متابعة بالتجارة',

  // Learning
  'Courses': 'الدورات', 'No courses': 'لا توجد دورات', 'New Course': 'دورة جديدة',
  'Lessons': 'الدروس', 'Skill': 'المهارة', 'New Skill': 'مهارة جديدة', 'Target level': 'المستوى المستهدف',
  'Current level': 'المستوى الحالي', 'Proven level': 'المستوى المثبت', 'Level Tests': 'اختبارات المستوى',
  'Study Sessions': 'جلسات الدراسة', 'New Study Session': 'جلسة دراسة جديدة', 'Schedule Study Session': 'جدولة جلسة دراسة',
  'Planned minutes': 'الدقائق المخطط لها', 'Study minutes': 'دقائق الدراسة', 'Watched': 'تمت المشاهدة',
  'Vocabulary': 'المفردات', 'Professional Goals': 'الأهداف المهنية', 'Learning Signals': 'مؤشرات التعلّم',
  'Learning progress': 'تقدّم التعلّم', 'Learning rollups': 'ملخصات التعلّم', 'Time-weighted progress': 'التقدّم الموزون بالوقت',

  // Knowledge
  'Inbox': 'الوارد', 'Reading': 'القراءة', 'Reference': 'مرجع', 'Clarify': 'توضيح',
  'Article': 'مقال', 'Video': 'فيديو', 'Website': 'موقع', 'Tool': 'أداة', 'Bookmark Type': 'نوع الإشارة المرجعية',
  'Bookmark Types': 'أنواع الإشارات المرجعية', 'Bookmarks / Resources': 'الإشارات المرجعية / الموارد',
  'Add Bookmark': 'إضافة إشارة مرجعية', 'Idea title': 'عنوان الفكرة', 'Add Idea': 'إضافة فكرة',
  'Active Ideas': 'الأفكار النشطة', 'To Idea': 'تحويل لفكرة', 'Related Resource': 'مورد ذو صلة',
  'Meetings': 'الاجتماعات', 'Recent Meetings': 'أحدث الاجتماعات', 'Log Meeting': 'تسجيل اجتماع',
  'Meeting title': 'عنوان الاجتماع', 'People': 'الأشخاص', 'Decisions': 'القرارات',
  'Decisions summary': 'ملخص القرارات', 'Action items summary': 'ملخص الإجراءات',
  'Events': 'الفعاليات', 'Event Calendar': 'تقويم الفعاليات', 'Add Event': 'إضافة فعالية',
  'Event name': 'اسم الفعالية', 'Event URL': 'رابط الفعالية', 'Conference': 'مؤتمر',
  'Workshop': 'ورشة عمل', 'Webinar': 'ندوة إلكترونية', 'Upcoming Events': 'الفعاليات القادمة',
  'Takeaways': 'أهم النقاط', 'Follow-up': 'متابعة', 'Quick Capture': 'تسجيل سريع',
  'Knowledge Hub': 'مركز المعرفة', 'Shared Resources': 'الموارد المشتركة',

  // Product / project
  'PRD': 'وثيقة متطلبات المنتج', 'Requirements': 'المتطلبات', 'Epics': 'الملاحم', 'Feature': 'الميزة',
  'Features': 'الميزات', 'Release': 'الإصدار', 'Releases': 'الإصدارات', 'Bug': 'الخطأ البرمجي',
  'Bugs': 'الأخطاء البرمجية', 'Test Case': 'حالة اختبار', 'Test Cases': 'حالات الاختبار',
  'Test Run': 'تشغيل اختبار', 'Test Runs': 'تشغيلات الاختبار', 'Result': 'النتيجة', 'Results': 'النتائج',
  'Support Ticket': 'تذكرة دعم', 'Tickets': 'التذاكر', 'Subscription': 'الاشتراك', 'Subscriptions': 'الاشتراكات',
  'Team Member': 'عضو الفريق', 'Team': 'الفريق', 'Technical Asset': 'أصل تقني', 'Technical Assets': 'الأصول التقنية',
  'Work Sessions': 'جلسات العمل', 'Risk Register': 'سجل المخاطر', 'Issues': 'المشكلات', 'Contacts': 'جهات الاتصال',
  'OKRs': 'الأهداف والنتائج الرئيسية', 'Key Results': 'النتائج الرئيسية', 'Project Outputs': 'مخرجات المشروع',
  'Tasks today': 'مهام اليوم', 'Overdue': 'متأخر', 'Habits logged': 'العادات المسجّلة',

  // Marketplace
  'Listings': 'الإعلانات', 'Listing': 'الإعلان', 'Deal': 'الصفقة', 'Deals': 'الصفقات',
  'Open Deals': 'الصفقات المفتوحة', 'Trust / Verification': 'الثقة / التحقق', 'Verification': 'التحقق',
  'Verification Records': 'سجلات التحقق', 'Trust Score': 'درجة الثقة', 'Trust Records': 'سجلات الثقة',
  'Dispute': 'النزاع', 'Disputes': 'النزاعات', 'Safety Event': 'حدث أمان', 'Safety Events': 'أحداث الأمان',
  'Safety Attention': 'حالات تحتاج متابعة أمنية', 'Reviews': 'التقييمات', 'Feedback': 'الملاحظات',

  // Home
  'Maintenance': 'الصيانة', 'Maintenance:': 'الصيانة:', 'Maintenance open': 'صيانة مفتوحة',
  'Shopping': 'التسوق', 'Warranty expiring': 'ضمان قارب على الانتهاء', 'Warranty expired': 'ضمان منتهي',
  'Home intelligence': 'ذكاء المنزل',

  // Habits / journal
  'Journal': 'اليوميات', 'Books': 'الكتب', 'Achievements': 'الإنجازات', 'Weekly Focus': 'تركيز الأسبوع',
  'Weekly Review': 'المراجعة الأسبوعية', 'Recent Reviews': 'أحدث المراجعات', 'Wins': 'الإنجازات الإيجابية',
  'Misses': 'الإخفاقات', 'Blockers': 'العوائق', 'Next focus': 'التركيز القادم', 'Relapses': 'الانتكاسات',
  'Habit success': 'نجاح العادات', 'Personal OS': 'النظام الشخصي',

  // Security / recovery
  'ROLE MODEL': 'نموذج الأدوار', 'Workspace Membership': 'عضوية مساحة العمل',
  'Owner is derived from workspace owner.': 'المالك يُستمد من مالك مساحة العمل.',
  'Add / update member': 'إضافة / تحديث عضو', 'Save member': 'حفظ العضو',
  'PROJECT PERMISSIONS': 'صلاحيات المشروع', 'Project Members': 'أعضاء المشروع',
  'Choose project': 'اختر المشروع', 'Grant project access': 'منح صلاحية الوصول للمشروع',
  'Save project permission': 'حفظ صلاحية المشروع', 'FINANCE RESTRICTIONS': 'قيود المالية',
  'Finance Visibility / Edit / Export': 'رؤية / تعديل / تصدير المالية', 'Save finance permission': 'حفظ صلاحية المالية',
  'AUDIT LOG': 'سجل التدقيق', 'Recent Security-Sensitive Changes': 'أحدث التغييرات الحساسة أمنيًا',
  'Database trigger generated': 'تم إنشاؤه بواسطة مُشغّل قاعدة البيانات', 'No audit events yet.': 'لا توجد أحداث تدقيق بعد.',
  'RECOVERY CONTROL PLANE': 'لوحة التحكم بالاسترجاع', 'Snapshot / Backup': 'لقطة / نسخة احتياطية',
  'Create Snapshot': 'إنشاء لقطة', 'Create Pre-Migration Snapshot': 'إنشاء لقطة قبل الترحيل', 'SNAPSHOTS': 'اللقطات',

  // Content intelligence
  'Current Signals': 'المؤشرات الحالية', 'Content Intelligence Snapshot': 'لقطة ذكاء المحتوى',
  'Open Intelligence Events': 'أحداث الذكاء المفتوحة', 'Acknowledge': 'إقرار', 'Dismiss': 'تجاهل',
  'Sources': 'المصادر', 'Analytics Entries': 'إدخالات التحليلات', 'Conversions': 'التحويلات',

  // Misc labels seen across pages
  'Full Parity': 'التطابق الكامل', 'Notion Parity': 'التطابق مع Notion', 'Shared Core': 'النواة المشتركة',
  'Shared Tasks / Decisions / Calendar': 'مهام / قرارات / تقويم مشتركة', 'Quick access': 'وصول سريع',
  'Customize enabled modules': 'تخصيص الوحدات المفعّلة', 'Content Accounts': 'حسابات المحتوى',
  'Tags comma-separated': 'الوسوم مفصولة بفواصل', 'Next Action': 'الإجراء التالي',
  'Description / Insight': 'الوصف / الملاحظة', 'Idea title': 'عنوان الفكرة', 'Client': 'العميل',
  'Planning': 'التخطيط', 'Related Resource': 'مورد ذو صلة',
}

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'CODE', 'PRE'])
const ATTR_LIST = ['placeholder', 'title', 'aria-label']

function translateString(s) {
  const trimmed = s.trim()
  if (!trimmed) return s
  const hit = DICTIONARY[trimmed]
  if (hit) return s.replace(trimmed, hit)
  return s
}

function walk(node) {
  if (!node) return
  if (node.nodeType === Node.TEXT_NODE) {
    const t = translateString(node.nodeValue)
    if (t !== node.nodeValue) node.nodeValue = t
    return
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return
  if (SKIP_TAGS.has(node.tagName)) return
  for (const attr of ATTR_LIST) {
    if (node.hasAttribute && node.hasAttribute(attr)) {
      const v = node.getAttribute(attr)
      const t = translateString(v)
      if (t !== v) node.setAttribute(attr, t)
    }
  }
  for (const child of node.childNodes) walk(child)
}

let scheduled = false
function scheduleTranslate(root) {
  if (scheduled) return
  scheduled = true
  requestAnimationFrame(() => { scheduled = false; walk(root) })
}

export function initArabicLocalization() {
  document.documentElement.setAttribute('lang', 'ar')
  document.documentElement.setAttribute('dir', 'rtl')

  const root = document.getElementById('root') || document.body
  scheduleTranslate(root)

  const observer = new MutationObserver(() => scheduleTranslate(root))
  observer.observe(root, { childList: true, subtree: true, characterData: true })
  return observer
}
