import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const resources = {
  kk: {
    translation: {
      app: { name: "MEKTEP AI", tagline: "Ақбөбек мектебі · AI" },
      lang: { title: "Тілді таңдаңыз", subtitle: "Қандай тілде жалғастырамыз?", continue: "Жалғастыру" },
      onboarding: {
        skip: "Өткізіп жіберу", next: "Келесі", start: "Бастау",
        s1_title: "Ақылды кесте", s1_desc: "AI мұғалімдер ауырғанда автоматты түрде алмастыру табады және кестені қайта жасайды.",
        s2_title: "Дауыстық тапсырмалар", s2_desc: "Микрофонға тапсырманы айтыңыз — AI оны қызметкерге автоматты түрде тағайындайды.",
        s3_title: "Бұйрықтар базасы (RAG)", s3_desc: "Заңды мәтіндерді мұғалімдер үшін бірнеше пунктке дейін жеңілдетіңіз.",
      },
      auth: {
        login: "Кіру", signup: "Тіркелу", email: "Электрондық пошта", password: "Құпия сөз",
        name: "Аты-жөні", school_name: "Мектеп атауы (міндетті емес)",
        submit_login: "Кіру", submit_signup: "Аккаунт жасау",
        no_account: "Аккаунт жоқ па?", have_account: "Аккаунтыңыз бар ма?",
        wrong: "Қате email немесе құпия сөз", exists: "Бұл email тіркелген",
        check_email: "Поштаңызды тексеріңіз",
        title_login: "Қош келдіңіз", title_signup: "Аккаунт жасаңыз",
        director: "Директор", teacher: "Мұғалім", staff: "Қызметкер", role: "Рөл", logout: "Шығу",
      },
      nav: {
        overview: "Шолу", schedule: "Кесте", tasks: "Тапсырмалар",
        incidents: "Оқиғалар", knowledge: "Бұйрықтар", employees: "Қызметкерлер",
      },
      stats: { canteen: "Асхана", portions: "порция", attendance: "Қатысу", tasks: "Белсенді тапсырмалар", chats: "Чаттар" },
      voice: {
        title: "Дауыстан тапсырмаға", listening: "Тыңдап жатырмын…",
        type: "Тапсырманы жазыңыз немесе айтыңыз", assign: "Тағайындау",
        not_supported: "Браузер дауысты қолдамайды — мәтінді теріңіз", try: "Мысал",
        ai_thinking: "AI ойлап жатыр…", task_created: "Тапсырма жасалды",
      },
      overview: {
        title: "Директор панелі",
        subtitle: "Чаттардан AI live деректерді өңдейді",
        attendance_live: "Қатысу · Live", live_feed: "Live чат",
        class: "Сынып", total: "Барлығы", present: "Келді", sick: "Ауру", status: "Күй",
        parsed: "Өңделді", waiting: "Күтуде", ai_parsing: "AI өңдеуде",
        insight_title: "AI күн кеңесі",
        team: "Команда",
      },
      schedule: {
        title: "Ақылды кесте", subtitle: "Мұғалім ауырғанда AI бірден алмастыру табады.",
        select_teacher: "Мұғалімді таңдаңыз…", report_sick: "Ауру деп белгілеу",
        ai_suggests: "AI алмастыруды ұсынады", generate: "Кестені AI арқылы жасау",
      },
      tasks: {
        title: "Тапсырмалар", subtitle: "Дауыстық тапсырмалар осында автоматты түрде түседі.",
        add: "Тапсырма қосу", todo: "Жоспар", doing: "Орындалуда", done: "Орындалды",
      },
      common: { loading: "Жүктелуде…", save: "Сақтау", cancel: "Болдырмау" },
    },
  },
  ru: {
    translation: {
      app: { name: "MEKTEP AI", tagline: "Школа Ақбөбек · AI" },
      lang: { title: "Выберите язык", subtitle: "На каком языке продолжим?", continue: "Продолжить" },
      onboarding: {
        skip: "Пропустить", next: "Далее", start: "Начать",
        s1_title: "Умное расписание", s1_desc: "AI автоматически найдёт замену и перестроит расписание, когда учитель заболел.",
        s2_title: "Голосовые задачи", s2_desc: "Скажите задачу в микрофон — AI назначит её сотруднику автоматически.",
        s3_title: "База приказов (RAG)", s3_desc: "Упрощайте сложные приказы до нескольких пунктов для учителей.",
      },
      auth: {
        login: "Вход", signup: "Регистрация", email: "Электронная почта", password: "Пароль",
        name: "ФИО", school_name: "Название школы (опционально)",
        submit_login: "Войти", submit_signup: "Создать аккаунт",
        no_account: "Нет аккаунта?", have_account: "Уже есть аккаунт?",
        wrong: "Неверный email или пароль", exists: "Этот email уже зарегистрирован",
        check_email: "Проверьте почту для подтверждения",
        title_login: "С возвращением", title_signup: "Создайте аккаунт",
        director: "Директор", teacher: "Учитель", staff: "Сотрудник", role: "Роль", logout: "Выйти",
      },
      nav: {
        overview: "Обзор", schedule: "Расписание", tasks: "Задачи",
        incidents: "Инциденты", knowledge: "Приказы", employees: "Сотрудники",
      },
      stats: { canteen: "Столовая", portions: "порций", attendance: "Посещаемость", tasks: "Активные задачи", chats: "Чаты" },
      voice: {
        title: "Голос → Задача", listening: "Слушаю…",
        type: "Введите или произнесите задачу", assign: "Назначить",
        not_supported: "Браузер не поддерживает голос — введите текст", try: "Пример",
        ai_thinking: "AI думает…", task_created: "Задача создана",
      },
      overview: {
        title: "Панель директора",
        subtitle: "AI в реальном времени читает чаты и извлекает данные",
        attendance_live: "Посещаемость · Live", live_feed: "Live чат",
        class: "Класс", total: "Всего", present: "Пришли", sick: "Болеют", status: "Статус",
        parsed: "Готово", waiting: "Ожидание", ai_parsing: "AI парсит",
        insight_title: "AI-инсайт дня",
        team: "Команда",
      },
      schedule: {
        title: "Умное расписание", subtitle: "AI находит замену сразу, как учитель сообщает о болезни.",
        select_teacher: "Выберите учителя…", report_sick: "Сообщить о болезни",
        ai_suggests: "AI предлагает замену", generate: "Сгенерировать расписание AI",
      },
      tasks: {
        title: "Задачи", subtitle: "Голосовые задачи появляются здесь автоматически.",
        add: "Добавить задачу", todo: "К выполнению", doing: "В работе", done: "Готово",
      },
      common: { loading: "Загрузка…", save: "Сохранить", cancel: "Отмена" },
    },
  },
  en: {
    translation: {
      app: { name: "MEKTEP AI", tagline: "Aqbobek School · AI" },
      lang: { title: "Choose your language", subtitle: "Which language do you prefer?", continue: "Continue" },
      onboarding: {
        skip: "Skip", next: "Next", start: "Get Started",
        s1_title: "Smart Schedule", s1_desc: "AI automatically finds substitutes and rebuilds the timetable when a teacher reports sick.",
        s2_title: "Voice-to-Task", s2_desc: "Speak a task into the mic — AI assigns it to the right person automatically.",
        s3_title: "Orders Knowledge (RAG)", s3_desc: "Simplify complex legal orders into a few clear bullet points for teachers.",
      },
      auth: {
        login: "Sign in", signup: "Sign up", email: "Email", password: "Password",
        name: "Full name", school_name: "School name (optional)",
        submit_login: "Sign in", submit_signup: "Create account",
        no_account: "No account yet?", have_account: "Already have an account?",
        wrong: "Invalid email or password", exists: "This email is already registered",
        check_email: "Check your email to confirm",
        title_login: "Welcome back", title_signup: "Create your account",
        director: "Director", teacher: "Teacher", staff: "Staff", role: "Role", logout: "Sign out",
      },
      nav: {
        overview: "Overview", schedule: "Schedule", tasks: "Tasks",
        incidents: "Incidents", knowledge: "Knowledge", employees: "Employees",
      },
      stats: { canteen: "Canteen", portions: "portions", attendance: "Attendance", tasks: "Active tasks", chats: "Chats" },
      voice: {
        title: "Voice-to-Task", listening: "Listening…",
        type: "Type or speak your task", assign: "Assign",
        not_supported: "Browser doesn't support voice — type instead", try: "Try",
        ai_thinking: "AI is thinking…", task_created: "Task created",
      },
      overview: {
        title: "Director Overview",
        subtitle: "Live AI parsing of WhatsApp/Telegram chats",
        attendance_live: "Attendance · Live", live_feed: "Live Chat Feed",
        class: "Class", total: "Total", present: "Present", sick: "Sick", status: "Status",
        parsed: "Parsed", waiting: "Waiting", ai_parsing: "AI parsing",
        insight_title: "AI Insight of the day",
        team: "Team",
      },
      schedule: {
        title: "Smart Schedule", subtitle: "AI suggests substitutes the moment a teacher reports sick.",
        select_teacher: "Select teacher…", report_sick: "Report sick",
        ai_suggests: "AI suggests substitute", generate: "Generate schedule with AI",
      },
      tasks: {
        title: "Task Manager", subtitle: "Voice-dictated tasks land here automatically.",
        add: "Add task", todo: "To Do", doing: "In Progress", done: "Done",
      },
      common: { loading: "Loading…", save: "Save", cancel: "Cancel" },
    },
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: "ru",
      supportedLngs: ["kk", "ru", "en"],
      interpolation: { escapeValue: false },
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: "mektep.lang",
        caches: ["localStorage"],
      },
    });
}

export default i18n;
