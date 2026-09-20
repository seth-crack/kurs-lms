import { Routes, Route, Navigate } from 'react-router-dom';
import { useThemeSync } from './lib/theme';
import { useAuth } from './store/useAuth';
import AppLayout from './layout/AppLayout';
import Auth from './pages/Auth';

// -------- Student --------
import StudentHome from './pages/student/Home';
import StudentSubjects from './pages/student/Subjects';
import StudentHomework from './pages/student/Homework';
import StudentSchedule from './pages/student/Schedule';
import StudentChat from './pages/student/Chat';
import StudentGrades from './pages/student/Grades';
import StudentProfile from './pages/student/Profile';

// -------- Teacher --------
import TeacherHome from './pages/teacher/Home';
import TeacherStudents from './pages/teacher/Students';
import TeacherGroups from './pages/teacher/Groups';
import TeacherHomework from './pages/teacher/Homework';
import TeacherGrades from './pages/teacher/Grades';
import TeacherMaterials from './pages/teacher/Materials';
import TeacherSettings from './pages/teacher/Settings';

export default function App() {
  useThemeSync();
  const user = useAuth((s) => s.user);

  if (!user) return <Auth />;

  const isTeacher = user.role === 'teacher';

  if (isTeacher) {
    return (
      <AppLayout>
        <Routes>
          <Route path="/" element={<TeacherHome />} />
          <Route path="/students" element={<TeacherStudents />} />
          <Route path="/groups" element={<TeacherGroups />} />
          <Route path="/homework" element={<TeacherHomework />} />
          <Route
            path="/schedule"
            element={<StudentSchedule asTeacher={true} />}
          />
          <Route path="/chat" element={<StudentChat />} />
          <Route path="/grades" element={<TeacherGrades />} />
          <Route path="/materials" element={<TeacherMaterials />} />
          <Route path="/settings" element={<TeacherSettings />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<StudentHome />} />
        <Route path="/subjects" element={<StudentSubjects />} />
        <Route path="/homework" element={<StudentHomework />} />
        <Route
          path="/schedule"
          element={<StudentSchedule asTeacher={false} />}
        />
        <Route path="/chat" element={<StudentChat />} />
        <Route path="/grades" element={<StudentGrades />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}