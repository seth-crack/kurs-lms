export const SUBJECTS = [
  'Математика',
  'Русский язык',
  'Физика',
  'Английский язык',
  'Информатика',
];

export const TEACHERS = [
  { id: 't1', name: 'Андрей Волков', short: 'АВ', color: '#4F46E5', subject: 'Математика', email: 'a.volkov@kurs.ru' },
  { id: 't2', name: 'Мария Иванова', short: 'МИ', color: '#0EA5E9', subject: 'Русский язык', email: 'm.ivanova@kurs.ru' },
  { id: 't3', name: 'Дмитрий Орлов', short: 'ДО', color: '#16A34A', subject: 'Физика', email: 'd.orlov@kurs.ru' },
  { id: 't4', name: 'Елена Соколова', short: 'ЕС', color: '#D97706', subject: 'Английский язык', email: 'e.sokolova@kurs.ru' },
  { id: 't5', name: 'Олег Романов', short: 'ОР', color: '#DB2777', subject: 'Информатика', email: 'o.romanov@kurs.ru' },
];

export const STUDENTS = [
  { id: 's1', name: 'Алексей Смирнов', short: 'АС', color: '#4F46E5', group: '10-А', email: 'a.smirnov@kurs.ru', avg: 4.6, done: 24, overdue: 2, attendance: 96 },
  { id: 's2', name: 'Максим Иванов', short: 'МИ', color: '#0EA5E9', group: '10-А', email: 'm.ivanov@kurs.ru', avg: 4.1, done: 22, overdue: 4, attendance: 92 },
  { id: 's3', name: 'София Петрова', short: 'СП', color: '#DB2777', group: '10-Б', email: 's.petrova@kurs.ru', avg: 4.9, done: 26, overdue: 0, attendance: 99 },
  { id: 's4', name: 'Анна Кузнецова', short: 'АК', color: '#16A34A', group: '10-Б', email: 'a.kuznetsova@kurs.ru', avg: 3.9, done: 20, overdue: 5, attendance: 88 },
  { id: 's5', name: 'Иван Морозов', short: 'ИМ', color: '#D97706', group: '10-А', email: 'i.morozov@kurs.ru', avg: 4.3, done: 21, overdue: 1, attendance: 94 },
  { id: 's6', name: 'Дарья Волкова', short: 'ДВ', color: '#7C3AED', group: '10-Б', email: 'd.volkova@kurs.ru', avg: 4.7, done: 25, overdue: 1, attendance: 97 },
];

export const GROUPS = [
  { id: 'g1', name: '10-А', students: ['s1', 's2', 's5'], subject: 'Математика', teacher: 't1' },
  { id: 'g2', name: '10-Б', students: ['s3', 's4', 's6'], subject: 'Математика', teacher: 't1' },
  { id: 'g3', name: '10-А', students: ['s1', 's2'], subject: 'Физика', teacher: 't3' },
  { id: 'g4', name: '10-Б', students: ['s3', 's4', 's6'], subject: 'Русский язык', teacher: 't2' },
];

const now = Date.now();
const H = 3600 * 1000;
const D = 24 * H;

export const HOMEWORK = [
  {
    id: 'h1', title: 'Квадратные уравнения', subject: 'Математика', teacherId: 't1',
    studentIds: ['s1'],
    desc: 'Решите задания 1–12 из прикреплённого файла. Обязательно распишите ход решения и укажите ответы в конце.',
    deadline: now + 8 * H, createdAt: now - 2 * D, status: 'in_progress',
    attachments: [{ name: 'Уравнения_1-12.pdf', size: '248 КБ', type: 'pdf' }],
    materials: [{ name: 'Метод дискриминанта', url: '#' }],
    answer: '', answerFiles: [], grade: null, comment: '',
  },
  {
    id: 'h2', title: 'Сочинение «Мой город»', subject: 'Русский язык', teacherId: 't2',
    studentIds: ['s1'],
    desc: 'Напишите сочинение объёмом 250–300 слов. Опишите любимое место в вашем городе.',
    deadline: now + 2 * D + 4 * H, createdAt: now - 1 * D, status: 'new',
    attachments: [], materials: [{ name: 'Критерии оценивания', url: '#' }],
    answer: '', answerFiles: [], grade: null, comment: '',
  },
  {
    id: 'h3', title: 'Законы Ньютона — задачи', subject: 'Физика', teacherId: 't3',
    studentIds: ['s1'],
    desc: 'Решите задачи 1–8 из сборника. Оформите решение с чертежами.',
    deadline: now - 4 * H, createdAt: now - 5 * D, status: 'overdue',
    attachments: [{ name: 'Физика_задачи.pdf', size: '512 КБ', type: 'pdf' }],
    materials: [], answer: '', answerFiles: [], grade: null, comment: '',
  },
  {
    id: 'h4', title: 'Present Perfect vs Past Simple', subject: 'Английский язык', teacherId: 't4',
    studentIds: ['s1'],
    desc: 'Выполните упражнения 1–5. Выпишите предложения в тетрадь, затем загрузите фото.',
    deadline: now + 3 * D, createdAt: now - 6 * H, status: 'submitted',
    attachments: [{ name: 'Grammar_ex.pdf', size: '180 КБ', type: 'pdf' }],
    materials: [{ name: 'Правило: Present Perfect', url: '#' }],
    answer: 'Выполнил все упражнения, фото в приложении.',
    answerFiles: [{ name: 'homework_ex.jpg', size: '1.2 МБ', type: 'img' }],
    grade: null, comment: '', submittedAt: now - 3 * H,
  },
  {
    id: 'h5', title: 'Алгоритмы сортировки', subject: 'Информатика', teacherId: 't5',
    studentIds: ['s1'],
    desc: 'Реализуйте пузырьковую сортировку и сортировку вставками на Python.',
    deadline: now - 2 * D, createdAt: now - 8 * D, status: 'graded',
    attachments: [], materials: [{ name: 'Конспект: сложность алгоритмов', url: '#' }],
    answer: 'Код и сравнение в файле.',
    answerFiles: [{ name: 'sorting.py', size: '3 КБ', type: 'code' }],
    grade: 5,
    comment: 'Отличная работа! Особенно понравился анализ сложности.',
    gradedAt: now - 1 * D,
  },
  {
    id: 'h6', title: 'Производная: контрольная', subject: 'Математика', teacherId: 't1',
    studentIds: ['s1'],
    desc: 'Контрольная работа по теме «Производная». Вариант 2.',
    deadline: now - 6 * D, createdAt: now - 10 * D, status: 'graded',
    attachments: [{ name: 'Вариант_2.pdf', size: '305 КБ', type: 'pdf' }],
    materials: [],
    answer: 'Решение в тетради, фото.',
    answerFiles: [{ name: 'derivative.jpg', size: '2.1 МБ', type: 'img' }],
    grade: 4,
    comment: 'Хорошо, но в задании 5 ошибка в знаке.',
    gradedAt: now - 5 * D,
  },
  {
    id: 'h7', title: 'Тригонометрия: формулы', subject: 'Математика', teacherId: 't1',
    studentIds: ['s1'],
    desc: 'Выучите основные тригонометрические формулы и решите 10 примеров.',
    deadline: now + 5 * D, createdAt: now - 1 * H, status: 'new',
    attachments: [{ name: 'Формулы.pdf', size: '210 КБ', type: 'pdf' }],
    materials: [{ name: 'Тригонометрический круг', url: '#' }],
    answer: '', answerFiles: [], grade: null, comment: '',
  },
  {
    id: 'h8', title: 'Квадратные уравнения', subject: 'Математика', teacherId: 't1',
    studentIds: ['s2'], desc: 'Задания 1–12.',
    deadline: now + 8 * H, createdAt: now - 2 * D, status: 'submitted',
    attachments: [{ name: 'Уравнения_1-12.pdf', size: '248 КБ', type: 'pdf' }],
    materials: [], answer: 'Решение приложено.',
    answerFiles: [{ name: 'kuznetsov_hw.jpg', size: '1.4 МБ', type: 'img' }],
    grade: null, comment: '', submittedAt: now - 1 * H,
  },
  {
    id: 'h9', title: 'Квадратные уравнения', subject: 'Математика', teacherId: 't1',
    studentIds: ['s5'], desc: 'Задания 1–12.',
    deadline: now + 8 * H, createdAt: now - 2 * D, status: 'submitted',
    attachments: [], materials: [], answer: 'Готово.',
    answerFiles: [{ name: 'morozov.jpg', size: '980 КБ', type: 'img' }],
    grade: null, comment: '', submittedAt: now - 20 * 60 * 1000,
  },
  {
    id: 'h10', title: 'Квадратные уравнения', subject: 'Математика', teacherId: 't1',
    studentIds: ['s3'], desc: 'Задания 1–12.',
    deadline: now + 8 * H, createdAt: now - 2 * D, status: 'graded',
    attachments: [], materials: [], answer: 'Решение.',
    answerFiles: [{ name: 'petrova.jpg', size: '1.1 МБ', type: 'img' }],
    grade: 5, comment: 'Всё верно.',
    submittedAt: now - 1 * D, gradedAt: now - 12 * H,
  },
];

export const MESSAGES = {
  c1: [
    { id: 'm1', from: 't1', text: 'Здравствуй, Алексей! Напоминаю про домашнее задание по квадратным уравнениям. Дедлайн сегодня вечером.', at: now - 3 * H, read: true },
    { id: 'm2', from: 's1', text: 'Здравствуйте! Да, я помню, уже почти доделал.', at: now - 2.5 * H, read: true },
    { id: 'm3', from: 't1', text: 'Отлично. Если будут вопросы — пиши.', at: now - 2 * H, read: true },
    {
      id: 'm4', from: 's1', text: 'Я выполнил домашнее задание',
      at: now - 40 * 60 * 1000, read: true,
      files: [{ name: 'homework_equations.pdf', size: '1.2 МБ', type: 'pdf' }],
    },
  ],
  c2: [
    { id: 'm5', from: 't2', text: 'Алексей, напоминаю про сочинение. Срок — послезавтра.', at: now - 5 * H, read: false },
  ],
  c3: [
    { id: 'm6', from: 't3', text: 'Задача 7 из вашего варианта решается через второй закон Ньютона.', at: now - 1 * D, read: true },
  ],
};

export const NOTIFICATIONS = [
  { id: 'n1', type: 'grade', title: 'Новая оценка', desc: 'Андрей Волков выставил вам оценку 5 по Информатике', at: now - 1 * D, read: false },
  { id: 'n2', type: 'hw', title: 'Новое задание', desc: 'По математике: «Тригонометрия: формулы»', at: now - 1 * H, read: false },
  { id: 'n3', type: 'remind', title: 'Скоро дедлайн', desc: 'До сдачи «Квадратные уравнения» осталось 8 часов', at: now - 30 * 60 * 1000, read: false },
  { id: 'n4', type: 'msg', title: 'Новое сообщение', desc: 'Мария Иванова: «Напоминаю про сочинение…»', at: now - 5 * H, read: true },
];

export const SCHEDULE = [
  { id: 'sc1', day: 0, time: '18:00', dur: '60 мин', subject: 'Математика', teacherId: 't1', group: '10-А', room: 'каб. 214' },
  { id: 'sc2', day: 1, time: '16:30', dur: '60 мин', subject: 'Физика', teacherId: 't3', group: '10-А', room: 'каб. 108' },
  { id: 'sc3', day: 1, time: '18:00', dur: '60 мин', subject: 'Русский язык', teacherId: 't2', group: '10-А', room: 'каб. 302' },
  { id: 'sc4', day: 2, time: '17:00', dur: '60 мин', subject: 'Английский язык', teacherId: 't4', group: '10-А', room: 'каб. 401' },
  { id: 'sc5', day: 3, time: '18:00', dur: '90 мин', subject: 'Информатика', teacherId: 't5', group: '10-А', room: 'каб. 115' },
  { id: 'sc6', day: 4, time: '16:00', dur: '60 мин', subject: 'Математика', teacherId: 't1', group: '10-А', room: 'каб. 214' },
];

export const teacherById = (id) => TEACHERS.find((t) => t.id === id);
export const studentById = (id) => STUDENTS.find((s) => s.id === id);