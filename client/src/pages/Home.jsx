import React, { useState, useEffect } from 'react';

export default function Home() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome to FormX</h1>
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          FormX is a form creation and response collection platform designed to demonstrate{' '}
          <strong className="text-slate-800">Formal Language and Automata Theory</strong> in action
          through custom regular expression parsing, Thompson's construction, epsilon-closure,
          subset construction, and DFA simulation.
        </p>
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
          Tag 1: Initial Monorepo &amp; Dev Environment
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Frontend Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-1">Frontend (Client)</h2>
            <p className="text-xs text-slate-500 mb-4">React 18, Vite, Tailwind CSS, React Router</p>
          </div>
          <div>
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
              <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full"></span>
              Client Ready
            </span>
          </div>
        </div>

        {/* Backend Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-1">Backend (Server)</h2>
            <p className="text-xs text-slate-500 mb-4">Node.js, Express, Health Check API</p>
          </div>
          <div>
            {loading && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 rounded-md">
                Checking /api/health...
              </span>
            )}
            {error && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                <span className="w-1.5 h-1.5 mr-1.5 bg-amber-500 rounded-full"></span>
                Server Offline
              </span>
            )}
            {health && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full"></span>
                {health.status === 'ok' ? 'API Healthy' : 'Online'}
              </span>
            )}
          </div>
        </div>

        {/* Automata Engine Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 mb-1">Automata Engine</h2>
            <p className="text-xs text-slate-500 mb-4">Standalone Package, Vitest Runner</p>
          </div>
          <div>
            <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md">
              <span className="w-1.5 h-1.5 mr-1.5 bg-indigo-500 rounded-full"></span>
              Engine Initialized
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
