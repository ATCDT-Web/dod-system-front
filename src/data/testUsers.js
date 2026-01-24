// Тестовые пользователи для демонстрации системы
export const testUsers = [
  {
    id: 1,
    fullName: 'Иванов Иван Иванович',
    email: 'admin@system.ru',
    password: 'admin123',
    role: 'admin_system',
    verified: true,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    fullName: 'Петрова Мария Сергеевна',
    email: 'petrova@school1.ru',
    password: 'password123',
    district: 'central',
    institution: 'МБОУ "Средняя школа №1"',
    institutionType: 'sosh',
    position: 'Директор',
    role: 'admin_ou',
    verified: true,
    createdAt: '2024-01-15T10:30:00.000Z'
  },
  {
    id: 3,
    fullName: 'Сидоров Алексей Петрович',
    email: 'sidorov@college.ru',
    password: 'password123',
    district: 'north',
    institution: 'ГБПОУ "Технический колледж"',
    institutionType: 'spo',
    position: 'Заместитель директора',
    role: 'admin_ou',
    verified: true,
    createdAt: '2024-02-01T14:20:00.000Z'
  }
]

// Функция для инициализации тестовых данных
export const initializeTestData = () => {
  const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
  
  if (existingUsers.length === 0) {
    localStorage.setItem('users', JSON.stringify(testUsers))
    console.log('Тестовые пользователи инициализированы')
  }
}
