import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import AutomataDiagram from '../components/AutomataDiagram.jsx';

export default function Home() {
  const { admin } = useAuth();

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cyan" dot>
                Formal Language &amp; Automata Theory
              </Badge>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600 bg-neutral-200 px-2 py-0.5 border border-black">
                Capstone System
              </span>
            </div>

            <h1 className="font-sans font-black text-4xl sm:text-6xl tracking-tight text-black uppercase leading-[1.05]">
              Build forms.
              <br />
              <span className="bg-[#00f0ff] px-2 py-0.5 border-2 border-black inline-block shadow-brutal-sm mt-1">
                Validate with automata.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-800 leading-relaxed font-sans max-w-xl">
              FormX is an academic form platform that eliminates opaque regex engines in favor of
              <strong className="text-black font-bold"> pure finite automata theory</strong>.
              Patterns compile directly into an <code className="font-mono text-sm bg-neutral-100 px-1 border border-black">ε-NFA</code> and are determinized via subset construction for mathematical, deterministic validation.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {admin ? (
                <Button to="/forms/new" variant="primary" size="lg">
                  + Create a Form
                </Button>
              ) : (
                <Button to="/register" variant="primary" size="lg">
                  Create a Form ➔
                </Button>
              )}

              <Button to="/docs" variant="secondary" size="lg">
                Explore Documentation
              </Button>
            </div>

            {/* Quick stats / metrics banner */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t-2 border-black max-w-lg">
              <div>
                <div className="font-mono font-black text-xl text-black">O(n)</div>
                <div className="text-[11px] font-mono text-neutral-600 uppercase">
                  Linear DFA Matching
                </div>
              </div>
              <div>
                <div className="font-mono font-black text-xl text-black">0%</div>
                <div className="text-[11px] font-mono text-neutral-600 uppercase">
                  Native RegExp Dependency
                </div>
              </div>
              <div>
                <div className="font-mono font-black text-xl text-[#00c4d4]">100%</div>
                <div className="text-[11px] font-mono text-neutral-600 uppercase">
                  Thompson / Subset Pure
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Motif */}
          <div className="lg:col-span-5">
            <AutomataDiagram variant="hero" />
          </div>
        </div>
      </section>

      {/* Feature Blocks Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <div className="font-mono text-xs font-bold text-neutral-600 uppercase tracking-widest">
              // Core Capabilities
            </div>
            <h2 className="font-sans font-black text-3xl uppercase tracking-tight text-black mt-1">
              Engineering Built on Theory
            </h2>
          </div>
          <Link
            to="/docs"
            className="font-mono text-xs font-bold uppercase tracking-wider text-black hover:text-[#00c4d4] flex items-center gap-1"
          >
            <span>Read complete specifications</span>
            <span>➔</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <Card hoverable className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center font-mono font-black text-lg mb-4 shadow-brutal-sm">
                01
              </div>
              <h3 className="font-bold text-lg uppercase tracking-tight text-black mb-2">
                Visual Form Builder
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                Design custom dynamic forms with 6 question types, live reordering, optional answers, and multi-choice matrices.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-500">6 Input Types</span>
              <span className="bg-[#00f0ff] px-1.5 py-0.5 border border-black font-bold">Dynamic</span>
            </div>
          </Card>

          {/* Card 2 */}
          <Card hoverable className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 border-2 border-black bg-[#ffe600] flex items-center justify-center font-mono font-black text-lg mb-4 shadow-brutal-sm">
                02
              </div>
              <h3 className="font-bold text-lg uppercase tracking-tight text-black mb-2">
                Thompson's ε-NFA
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                Parses supported regex tokens (literals, concatenation, union, Kleene star) into an ε-NFA with guaranteed single start and accept states.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-500">Inductive Base</span>
              <span className="bg-[#ffe600] px-1.5 py-0.5 border border-black font-bold">ε-Transitions</span>
            </div>
          </Card>

          {/* Card 3 */}
          <Card hoverable className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 border-2 border-black bg-[#00f0ff] flex items-center justify-center font-mono font-black text-lg mb-4 shadow-brutal-sm">
                03
              </div>
              <h3 className="font-bold text-lg uppercase tracking-tight text-black mb-2">
                DFA Simulation
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                Converts NFA to DFA using powerset subset construction. Transitions are computed deterministically without backtracking or exponential blowup.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-500">Powerset Algo</span>
              <span className="bg-[#00f0ff] px-1.5 py-0.5 border border-black font-bold">O(n) Eval</span>
            </div>
          </Card>

          {/* Card 4 */}
          <Card hoverable className="flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 border-2 border-black bg-[#00d66c] flex items-center justify-center font-mono font-black text-lg mb-4 shadow-brutal-sm">
                04
              </div>
              <h3 className="font-bold text-lg uppercase tracking-tight text-black mb-2">
                Response Management
              </h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                Shareable public endpoints without respondent authentication. Inspect verified entries or export directly to CSV with spreadsheet safety.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t-2 border-black/10 flex items-center justify-between text-xs font-mono">
              <span className="text-neutral-500">Data Vault</span>
              <span className="bg-[#00d66c] px-1.5 py-0.5 border border-black font-bold">CSV Export</span>
            </div>
          </Card>
        </div>
      </section>

      {/* "How It Works" 3-Step Section */}
      <section className="border-2 border-black bg-white p-6 sm:p-10 shadow-brutal space-y-8">
        <div>
          <Badge variant="dark">Workflow Pipeline</Badge>
          <h2 className="font-sans font-black text-3xl sm:text-4xl uppercase tracking-tight text-black mt-2">
            Three Steps From Schema to Validated Data
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-2 border-black p-5 bg-[#fafaf7] shadow-brutal-sm flex flex-col justify-between">
            <div>
              <div className="font-mono text-3xl font-black text-black mb-2">01</div>
              <h3 className="font-bold uppercase text-lg text-black mb-2">Create Form</h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                Build questions using the form construction canvas. Define required rules and question labels.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/10 text-xs font-mono font-bold text-neutral-500">
              SCHEMA DEFINITION
            </div>
          </div>

          <div className="border-2 border-black p-5 bg-[#f6fcfe] shadow-brutal-sm flex flex-col justify-between">
            <div>
              <div className="font-mono text-3xl font-black text-[#00a8b5] mb-2">02</div>
              <h3 className="font-bold uppercase text-lg text-black mb-2">Configure Automata</h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                Write supported regular expressions for text fields. FormX translates rules into deterministic state machines.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/10 text-xs font-mono font-bold text-[#00a8b5]">
              REGEX → ε-NFA → DFA
            </div>
          </div>

          <div className="border-2 border-black p-5 bg-[#fafaf7] shadow-brutal-sm flex flex-col justify-between">
            <div>
              <div className="font-mono text-3xl font-black text-black mb-2">03</div>
              <h3 className="font-bold uppercase text-lg text-black mb-2">Collect Responses</h3>
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                Publish the shareable link. Respondent inputs are validated by DFA simulation before entering the database.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-black/10 text-xs font-mono font-bold text-neutral-500">
              PUBLIC ACCESS &amp; CSV
            </div>
          </div>
        </div>
      </section>

      {/* Theoretical "Why Automata?" Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-6 space-y-4">
          <Badge variant="yellow">Academic Rationale</Badge>
          <h2 className="font-sans font-black text-3xl sm:text-4xl uppercase tracking-tight text-black">
            Why finite automata instead of RegExp?
          </h2>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            In modern web software, regular expressions are universally delegated to black-box engines with potential backtracking vulnerabilities (ReDoS) and opaque internal mechanics.
          </p>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed">
            FormX was engineered as an applied computer science artifact. By modeling regex validation explicitly through <strong>Formal Language and Automata Theory</strong>, we achieve verifiable state transitions, linear-time execution guarantees, and full visibility into the Chomsky Type-3 regular language hierarchy.
          </p>
          <div className="pt-2">
            <Button to="/docs" variant="primary" size="md">
              Learn How the Pipeline Works ➔
            </Button>
          </div>
        </div>

        <div className="lg:col-span-6">
          <Card variant="dark" className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-700 pb-3">
              <span className="font-mono text-xs font-bold uppercase text-[#00f0ff]">
                Theoretical Pipeline Spec
              </span>
              <span className="font-mono text-xs text-neutral-400">Node / Browser Dual Run</span>
            </div>

            <div className="space-y-3 font-mono text-xs text-neutral-300">
              <div className="p-2.5 bg-neutral-900 border border-neutral-700">
                <span className="text-[#00f0ff] font-bold">1. Tokenize &amp; AST:</span>
                <p className="text-neutral-400 mt-0.5">
                  Converts input expression into typed AST nodes (Literal, Concat, Union, Star).
                </p>
              </div>

              <div className="p-2.5 bg-neutral-900 border border-neutral-700">
                <span className="text-[#ffe600] font-bold">2. Thompson's ε-NFA:</span>
                <p className="text-neutral-400 mt-0.5">
                  Builds inductive transition graph with ε-transitions for union and repetition.
                </p>
              </div>

              <div className="p-2.5 bg-neutral-900 border border-neutral-700">
                <span className="text-[#00d66c] font-bold">3. Powerset DFA:</span>
                <p className="text-neutral-400 mt-0.5">
                  Eliminates nondeterminism by computing ε-closure sets into deterministic DFA states.
                </p>
              </div>
            </div>

            <div className="pt-2 text-right">
              <span className="font-mono text-[11px] text-neutral-400">
                Zero external dependencies &bull; 100% test coverage
              </span>
            </div>
          </Card>
        </div>
      </section>

      {/* Bottom Call to Action Card */}
      <section>
        <div className="border-2 border-black bg-[#00f0ff] p-8 sm:p-12 shadow-brutal-lg text-center space-y-4 relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="font-sans font-black text-3xl sm:text-5xl uppercase tracking-tight text-black">
              Ready to construct your form?
            </h2>
            <p className="text-base sm:text-lg text-black/80 font-medium">
              Create an admin account, configure customized regex validation rules, and collect verified responses.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-4">
              {admin ? (
                <Button to="/dashboard" variant="dark" size="lg">
                  Go to Dashboard ➔
                </Button>
              ) : (
                <Button to="/register" variant="dark" size="lg">
                  Create Account ➔
                </Button>
              )}
              <Button to="/docs" variant="secondary" size="lg">
                View Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
