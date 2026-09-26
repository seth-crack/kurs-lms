export const NAV_STUDENT = [
  { id: 'home',      label: 'Главная',          icon: 'home',           path: '/' },
  { id: 'subjects',  label: 'Мои предметы',     icon: 'library',        path: '/subjects' },
  { id: 'hw',        label: 'Домашние задания', icon: 'file-text',      path: '/homework', badge: 3 },
  { id: 'schedule',  label: 'Расписание',       icon: 'calendar',       path: '/schedule' },
  { id: 'attendance',label: 'Посещаемость',     icon: 'check-circle-2', path: '/attendance' },
  { id: 'chat',      label: 'Чаты',             icon: 'message-circle', path: '/chat', badge: 2 },
  { id: 'grades',    label: 'Оценки',           icon: 'bar-chart-2',    path: '/grades' },
  { id: 'profile',   label: 'Профиль',          icon: 'user',           path: '/profile' },
];

export const NAV_TEACHER = [
  { id: 'home',       label: 'Главная',          icon: 'home',           path: '/' },
  { id: 'students',   label: 'Ученики',          icon: 'users',          path: '/students' },
  { id: 'groups',     label: 'Группы',           icon: 'layers',         path: '/groups' },
  { id: 'hw',         label: 'Задания',          icon: 'file-text',      path: '/homework', badge: 3 },
  { id: 'schedule',   label: 'Расписание',       icon: 'calendar',       path: '/schedule' },
  { id: 'attendance', label: 'Посещаемость',     icon: 'check-circle-2', path: '/attendance' },
  { id: 'chat',       label: 'Чаты',             icon: 'message-circle', path: '/chat', badge: 2 },
  { id: 'grades',     label: 'Оценки',           icon: 'bar-chart-2',    path: '/grades' },
  { id: 'final',      label: 'Итоговые',         icon: 'award',          path: '/final-grades' },
  { id: 'materials',  label: 'Материалы',        icon: 'folder',         path: '/materials' },
  { id: 'settings',   label: 'Настройки',        icon: 'settings',       path: '/settings' },
];

export const MOBILE_NAV_IDS = ['home', 'hw', 'chat', 'grades', 'profile'];