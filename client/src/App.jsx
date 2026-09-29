import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FormBuilder from './pages/FormBuilder.jsx';
import PublicForm from './pages/PublicForm.jsx';
import Responses from './pages/Responses.jsx';
import ResponseDetail from './pages/ResponseDetail.jsx';
import Home from './pages/Home.jsx';
import Docs from './pages/Docs.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f8f5] text-[#121212] font-sans antialiased selection:bg-[#00f0ff] selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/help" element={<Navigate to="/docs" replace />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/public/forms/:id" element={<PublicForm />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forms/new" element={<FormBuilder />} />
            <Route path="/forms/:id/edit" element={<FormBuilder />} />
            <Route path="/forms/:id/responses" element={<Responses />} />
            <Route path="/forms/:id/responses/:responseId" element={<ResponseDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
