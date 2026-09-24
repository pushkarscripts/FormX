import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FormBuilder from './pages/FormBuilder.jsx';
import PublicForm from './pages/PublicForm.jsx';
import Responses from './pages/Responses.jsx';
import ResponseDetail from './pages/ResponseDetail.jsx';
import Home from './pages/Home.jsx';

export default function App() {
  const { admin, logout } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold tracking-tight text-indigo-600">FormX</span>
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Tag 7 of 8
            </span>
          </div>
          <nav className="flex items-center space-x-4 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            {admin ? (
              <>
                <Link to="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link>
                <button className="hover:text-indigo-600" type="button" onClick={logout}>Log out</button>
              </>
            ) : (
              <Link to="/login" className="hover:text-indigo-600 transition-colors">Admin login</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
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

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        FormX &bull; Formal Language &amp; Automata Theory Academic Project
      </footer>
    </div>
  );
}
