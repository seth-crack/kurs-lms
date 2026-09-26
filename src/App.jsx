import { Routes, Route, Navigate } from 'react-router-dom';
import { useThemeSync } from './lib/theme';
import { useAuth } from './store/useAuth';
import AppLayout from './layout/AppLayout';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';
import CmdK from './features/cmd-k/CmdK';

// -------- Student --------
import StudentHome from './pages/student/Home';
import StudentSubjects from './pages/student/Subjects';
import StudentHomework from './pages/student/Homework';
import StudentSchedule from './pages/student/Schedule';
import StudentChat from './pages/student/Chat';
import StudentGrades from './pages/student/Grades';
import StudentProfile from './pages/student/Profile';
import StudentAttendance from './pages/student/Attendance';

// -------- Teacher --------
import TeacherHome from './pages/teacher/Home';
import TeacherStudents from './pages/teacher/Students';
import TeacherGroups from './pages/teacher/Groups';
import TeacherHomework from './pages/teacher/Homework';
import TeacherSchedule from './pages/teacher/Schedule';
import TeacherGrades from './pages/teacher/Grades';
import TeacherMaterials from './pages/teacher/Materials';
import TeacherSettings from './pages/teacher/Settings';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherFinalGrades from './pages/teacher/FinalGrades';

export default function App() {
  useThemeSync();
  const user = useAuth((s) => s.user);
  const loading = useAuth((s) => s.loading);

  if (loading) {
    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '100vh',
          background: 'var(--bg)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            className="brand-mark"
            style={{
              width: 40,
              height: 40,
              fontSize: 18,
              margin: '0 auto 12px',
            }}
          >
            К
          </div>
          <div className="muted small">Загрузка…</div>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  const isTeacher = user.role === 'teacher';

  return (
    <>
      <AppLayout>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />

          {isTeacher ? (
            <>
              <Route path="/" element={<TeacherHome />} />
              <Route path="/students" element={<TeacherStudents />} />
              <Route path="/groups" element={<TeacherGroups />} />
              <Route path="/homework" element={<TeacherHomework />} />
              <Route path="/schedule" element={<TeacherSchedule />} />
              <Route path="/attendance" element={<TeacherAttendance />} />
              <Route path="/chat" element={<StudentChat />} />
              <Route path="/grades" element={<TeacherGrades />} />
              <Route path="/final-grades" element={<TeacherFinalGrades />} />
              <Route path="/materials" element={<TeacherMaterials />} />
              <Route path="/settings" element={<TeacherSettings />} />
              <Route path="/profile" element={<StudentProfile />} />
            </>
          ) : (
            <>
              <Route path="/" element={<StudentHome />} />
              <Route path="/subjects" element={<StudentSubjects />} />
              <Route path="/homework" element={<StudentHomework />} />
              <Route path="/schedule" element={<StudentSchedule />} />
              <Route path="/attendance" element={<StudentAttendance />} />
              <Route path="/chat" element={<StudentChat />} />
              <Route path="/grades" element={<StudentGrades />} />
              <Route path="/profile" element={<StudentProfile />} />
            </>
          )}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
      <CmdK />
    </>
  );
}