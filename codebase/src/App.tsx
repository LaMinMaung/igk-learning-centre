import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import ProtectedRoute from "./components/lms/ProtectedRoute";
import SandboxRoute from "./components/SandboxRoute";
import Analytics from "./components/Analytics";
import EnvironmentBadge from "./components/EnvironmentBadge";

// Main Website Pages
import Index from "./pages/Index";
import MontessoriPage from "./pages/programs/MontessoriPage";
import CambridgePage from "./pages/programs/CambridgePage";
import TestPrepPage from "./pages/programs/TestPrepPage";
import SingaporeMathPage from "./pages/programs/SingaporeMathPage";
import LanguagesPage from "./pages/programs/LanguagesPage";
import BookAppointment from "./pages/BookAppointment";
import StudentExperiences from "./pages/StudentExperiences";
import ApplicationForm from "./pages/ApplicationForm";
import ExtracurricularsPage from "./pages/ExtracurricularsPage";

// LMS Pages
import Login from "./pages/lms/Login";
import Unauthorized from "./pages/lms/Unauthorized";
import AdminDashboard from "./pages/lms/admin/Dashboard";
import AdminUsers from "./pages/lms/admin/Users";
import AdminCourses from "./pages/lms/admin/Courses";
import AdminQuizzes from "./pages/lms/admin/Quizzes";
import TeacherDashboard from "./pages/lms/teacher/Dashboard";
import TeacherCourseView from "./pages/lms/teacher/CourseView";
import StudentDashboard from "./pages/lms/student/Dashboard";
import CourseView from "./pages/lms/student/CourseView";
import LessonViewer from "./pages/lms/student/LessonViewer";
import MockTestHub from "./pages/lms/student/MockTestHub";
import MockTestSession from "./pages/lms/student/MockTestSession";
import MockTestResults from "./pages/lms/student/MockTestResults";
import AITutor from "./pages/lms/student/AITutor";
import ResourceLibrary from "./pages/lms/student/ResourceLibrary";
import ResourceReader from "./pages/lms/student/ResourceReader";
import ParentDashboard from "./pages/lms/parent/Dashboard";

// Owner dashboard
import OwnerDashboard from "./pages/lms/owner/Dashboard";

// System Pages
import HealthCheck from "./pages/HealthCheck";
import NotFound from "./pages/NotFound";

// Sandbox / Dev Pages (non-production only — guarded by SandboxRoute)
import DevDashboard from "./pages/dev/DevDashboard";
import SandboxPage from "./pages/dev/SandboxPage";
import ComponentsTest from "./pages/dev/ComponentsTest";
import ApiTest from "./pages/dev/ApiTest";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      {/* GA4 route-change tracker — renders nothing, fires page_view on navigation */}
      <Analytics />

      <Routes>
        {/* ── Main Website ─────────────────────────────────────────────── */}
        <Route path="/" element={<Index />} />
        <Route path="/programs/montessori"    element={<MontessoriPage />} />
        <Route path="/programs/cambridge"     element={<CambridgePage />} />
        <Route path="/programs/test-prep"     element={<TestPrepPage />} />
        <Route path="/programs/singapore-math" element={<SingaporeMathPage />} />
        <Route path="/programs/languages"     element={<LanguagesPage />} />
        <Route path="/book-appointment"       element={<BookAppointment />} />
        <Route path="/student-experiences"    element={<StudentExperiences />} />
        <Route path="/apply"                  element={<ApplicationForm />} />
        <Route path="/extracurriculars"       element={<ExtracurricularsPage />} />

        {/* ── System (all environments) ─────────────────────────────────── */}
        <Route path="/health" element={<HealthCheck />} />

        {/* ── Sandbox / Dev Tools (non-production only) ─────────────────── */}
        <Route path="/dev" element={
          <SandboxRoute><DevDashboard /></SandboxRoute>
        } />
        <Route path="/sandbox" element={
          <SandboxRoute><SandboxPage /></SandboxRoute>
        } />
        <Route path="/test/components" element={
          <SandboxRoute><ComponentsTest /></SandboxRoute>
        } />
        <Route path="/test/api" element={
          <SandboxRoute><ApiTest /></SandboxRoute>
        } />

        {/* ── LMS ──────────────────────────────────────────────────────── */}
        <Route path="/lms/login"       element={<Login />} />
        <Route path="/lms/unauthorized" element={<Unauthorized />} />

        <Route path="/lms/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/lms/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>
        } />
        <Route path="/lms/admin/courses" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminCourses /></ProtectedRoute>
        } />
        <Route path="/lms/admin/quizzes" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminQuizzes /></ProtectedRoute>
        } />

        <Route path="/lms/teacher/dashboard" element={
          <ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>
        } />
        <Route path="/lms/teacher/course/:courseId" element={
          <ProtectedRoute allowedRoles={['teacher']}><TeacherCourseView /></ProtectedRoute>
        } />

        <Route path="/lms/student/dashboard" element={
          <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
        } />
        <Route path="/lms/student/course/:courseId" element={
          <ProtectedRoute allowedRoles={['student']}><CourseView /></ProtectedRoute>
        } />
        <Route path="/lms/student/lesson/:lessonId" element={
          <ProtectedRoute allowedRoles={['student']}><LessonViewer /></ProtectedRoute>
        } />
        <Route path="/lms/student/mock-test" element={
          <ProtectedRoute allowedRoles={['student']}><MockTestHub /></ProtectedRoute>
        } />
        <Route path="/lms/student/mock-test/session" element={
          <ProtectedRoute allowedRoles={['student']}><MockTestSession /></ProtectedRoute>
        } />
        <Route path="/lms/student/mock-test/results/:resultId" element={
          <ProtectedRoute allowedRoles={['student']}><MockTestResults /></ProtectedRoute>
        } />
        <Route path="/lms/student/ai-tutor" element={
          <ProtectedRoute allowedRoles={['student']}><AITutor /></ProtectedRoute>
        } />
        <Route path="/lms/student/ai-tutor/:conversationId" element={
          <ProtectedRoute allowedRoles={['student']}><AITutor /></ProtectedRoute>
        } />
        <Route path="/lms/student/resources" element={
          <ProtectedRoute allowedRoles={['student']}><ResourceLibrary /></ProtectedRoute>
        } />
        <Route path="/lms/student/resources/read/:resourceId" element={
          <ProtectedRoute allowedRoles={['student']}><ResourceReader /></ProtectedRoute>
        } />

        <Route path="/lms/parent/dashboard" element={
          <ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>
        } />

        {/* Owner Routes */}
        <Route path="/lms/owner/dashboard" element={
          <ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>
        } />

        <Route path="/lms" element={<Navigate to="/lms/login" replace />} />

        {/* ── 404 — must be last ────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Non-prod sticky banner — zero DOM output in production */}
      <EnvironmentBadge />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
