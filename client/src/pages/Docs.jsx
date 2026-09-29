import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import AutomataDiagram from '../components/AutomataDiagram.jsx';

export default function Docs() {
  const supportedSyntax = [
    {
      feature: 'Literals',
      syntax: 'a, b, 123, hello',
      example: 'form',
      matches: '"form"',
      rejects: '"format", "Form"',
      description: 'Matches exact sequence of alphanumeric and space characters.'
    },
    {
      feature: 'Concatenation',
      syntax: 'ab',
      example: 'cat',
      matches: '"cat"',
      rejects: '"ca", "dog"',
      description: 'Implicit concatenation between sequential tokens.'
    },
    {
      feature: 'Alternation / Union',
      syntax: 'a|b',
      example: 'cat|dog',
      matches: '"cat", "dog"',
      rejects: '"fish", "catdog"',
      description: 'Matches either the left or right subexpression.'
    },
    {
      feature: 'Kleene Star',
      syntax: 'a*',
      example: 'ba*',
      matches: '"b", "ba", "baaa"',
      rejects: '"", "a", "bba"',
      description: 'Matches zero or more repetitions of the preceding element.'
    },
    {
      feature: 'Grouping',
      syntax: '(ab)*',
      example: '(ha)*',
      matches: '"", "ha", "haha"',
      rejects: '"h", "hah"',
      description: 'Enforces precedence and groups tokens for repetition or alternation.'
    },
    {
      feature: 'Character Classes',
      syntax: '[abc]',
      example: '[aeiou]',
      matches: '"a", "e", "i", "o", "u"',
      rejects: '"b", "ae"',
      description: 'Matches any single character listed inside brackets.'
    },
    {
      feature: 'Character Ranges',
      syntax: '[a-z], [0-9], [A-Z]',
      example: '[0-9]*',
      matches: '"", "7", "42"',
      rejects: '"a", "12a"',
      description: 'Specifies continuous inclusive ASCII code ranges.'
    },
    {
      feature: 'Escaped Characters',
      syntax: '\\*, \\|, \\(, \\), \\\\',
      example: 'a\\*b',
      matches: '"a*b"',
      rejects: '"ab", "aaab"',
      description: 'Treats metacharacters literally when escaped with backslash.'
    }
  ];

  const unsupportedSyntax = [
    {
      operator: '+',
      name: 'Plus (One-or-more)',
      workaround: 'Use aa* instead of a+'
    },
    {
      operator: '?',
      name: 'Optional (Zero-or-one)',
      workaround: 'Use (a|) or factor pattern explicitly'
    },
    {
      operator: '{n,m}',
      name: 'Bounded Repetition',
      workaround: 'Write out explicit concatenations'
    },
    {
      operator: '^ / $',
      name: 'Anchors',
      workaround: 'Implicit: FormX validates complete string from start state to final state'
    },
    {
      operator: '.',
      name: 'Wildcard Dot',
      workaround: 'Use explicit character ranges like [a-zA-Z0-9 ]'
    },
    {
      operator: '[^abc]',
      name: 'Negated Classes',
      workaround: 'Specify allowed character set directly'
    }
  ];

  return (
    <div className="space-y-10 py-2">
      {/* Header Banner */}
      <div className="border-2 border-black bg-white p-6 sm:p-8 shadow-brutal relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none select-none text-9xl font-mono font-black">
          Σ*
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <Badge variant="cyan" dot>
            Theoretical Documentation
          </Badge>
          <h1 className="font-sans font-black text-3xl sm:text-4xl uppercase tracking-tight text-black">
            FormX Architecture &amp; Regex Syntax Guide
          </h1>
          <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-sans">
            FormX replaces standard JavaScript RegExp engines with pure, mathematically sound automata theory. Learn how FormX translates regular expressions into Deterministic Finite Automata (DFA) to validate form fields.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Button to="/forms/new" variant="primary" size="sm">
              Build a Form
            </Button>
            <Button to="/dashboard" variant="secondary" size="sm">
              Admin Workspace
            </Button>
          </div>
        </div>
      </div>

      {/* Section 1: What is FormX? */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-black bg-black text-white px-2 py-1">01</span>
          <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-black">
            What is FormX?
          </h2>
        </div>
        <Card>
          <p className="text-sm sm:text-base text-neutral-800 leading-relaxed mb-4">
            <strong>FormX</strong> is a university capstone project created to bridge academic theoretical computer science with everyday web engineering. Most web platforms validate user text fields using the runtime’s built-in regular expression engine (e.g., JavaScript’s <code className="bg-neutral-100 px-1.5 py-0.5 border border-black font-mono text-xs">new RegExp()</code>).
          </p>
          <p className="text-sm sm:text-base text-neutral-800 leading-relaxed mb-4">
            Instead of treating regex as a black box, FormX runs a <strong>custom-built formal language engine</strong>. When an administrator writes a validation pattern, FormX tokenizes the pattern, builds an Abstract Syntax Tree (AST), translates it into an Non-deterministic Finite Automaton with ε-transitions (ε-NFA) using <strong>Thompson’s Construction</strong>, computes ε-closure, converts the automaton into a Deterministic Finite Automaton (DFA) using <strong>Subset Construction</strong>, and simulates DFA transitions in linear O(n) time on submissions.
          </p>
          <div className="border-l-4 border-[#00f0ff] bg-[#f8f8f5] p-3 text-xs sm:text-sm font-mono text-neutral-700">
            <strong>Rule:</strong> The backend and frontend never fall back to JS RegExp for custom patterns. Every validation pass is a textbook state traversal: <code className="font-bold">δ(current_state, char) → next_state</code>.
          </div>
        </Card>
      </section>

      {/* Section 2: How FormX Works (The Pipeline) */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-black bg-black text-white px-2 py-1">02</span>
          <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-black">
            How FormX Works (The Automata Pipeline)
          </h2>
        </div>

        <AutomataDiagram variant="pipeline" className="mb-2" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="font-bold uppercase text-sm mb-2 text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#00f0ff] border border-black" />
              1. Parsing &amp; Thompson's ε-NFA
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              The regex parser creates an AST adhering strictly to operator precedence: Parentheses &gt; Kleene Star &gt; Concatenation &gt; Union (<code className="font-mono font-bold">|</code>). Thompson’s construction inductively produces an ε-NFA with guaranteed single start and single accept states.
            </p>
          </Card>

          <Card>
            <h3 className="font-bold uppercase text-sm mb-2 text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#ffe600] border border-black" />
              2. ε-Closure &amp; Powerset Construction
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              The engine explores the ε-transition reachability graph. Powerset (subset) construction bundles equivalent NFA states into discrete DFA states, eliminating all non-determinism and dead-end backtracking.
            </p>
          </Card>

          <Card>
            <h3 className="font-bold uppercase text-sm mb-2 text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#00d66c] border border-black" />
              3. Deterministic DFA Simulation
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              When a respondent submits text, FormX processes characters one by one. The machine starts at state <code className="font-mono">q₀</code>. After reading all characters of the input string <code className="font-mono">w</code>, if the current state belongs to the set of accept states <code className="font-mono">F</code>, the input is valid; otherwise, it is rejected.
            </p>
          </Card>

          <Card>
            <h3 className="font-bold uppercase text-sm mb-2 text-black flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-black border border-black" />
              4. Full-Chain Integration
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              Validation is executed uniformly during respondent submissions on the server, guaranteeing that invalid data can never bypass the automata engine into MongoDB.
            </p>
          </Card>
        </div>
      </section>

      {/* Section 3: Supported Regex Syntax */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-black bg-black text-white px-2 py-1">03</span>
          <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-black">
            Supported Regex Grammar
          </h2>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse font-sans">
              <thead>
                <tr className="border-b-2 border-black bg-[#fafaf7]">
                  <th className="p-3 font-bold uppercase tracking-wider text-black">Feature</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-black">Syntax</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-black">Example</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-black">Matches</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-black">Rejects</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-neutral-200">
                {supportedSyntax.map((item) => (
                  <tr key={item.feature} className="hover:bg-[#f6fcfd] transition-colors">
                    <td className="p-3 font-bold text-black whitespace-nowrap">
                      {item.feature}
                    </td>
                    <td className="p-3 font-mono font-bold text-[#008f9c] whitespace-nowrap">
                      {item.syntax}
                    </td>
                    <td className="p-3 font-mono text-neutral-900 bg-neutral-50 border-x border-neutral-100 whitespace-nowrap">
                      {item.example}
                    </td>
                    <td className="p-3 font-mono text-[#008544] whitespace-nowrap">
                      {item.matches}
                    </td>
                    <td className="p-3 font-mono text-[#d62828] whitespace-nowrap">
                      {item.rejects}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Unsupported Syntax Callout */}
        <div className="border-2 border-black bg-[#fff5f5] p-5 shadow-brutal space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="red">Strict FLAT Limitations</Badge>
            <span className="font-bold text-sm uppercase text-[#b91c1c]">
              Unsupported Operators &amp; Workarounds
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed">
            To preserve strict correspondence with formal regular languages and textbook automata theory, advanced extensions outside pure regular grammar are excluded:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {unsupportedSyntax.map((item) => (
              <div key={item.operator} className="border-2 border-black bg-white p-3 shadow-brutal-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-sm bg-red-100 text-red-800 px-1.5 border border-red-300">
                    {item.operator}
                  </span>
                  <span className="font-bold text-xs text-neutral-700">{item.name}</span>
                </div>
                <p className="text-[11px] font-mono text-neutral-600 mt-1">
                  <strong>Equiv:</strong> {item.workaround}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Workflow Guides */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-black bg-black text-white px-2 py-1">04</span>
          <h2 className="font-sans text-2xl font-bold uppercase tracking-tight text-black">
            Platform Workflow Guides
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Guide 1: Creating a Form */}
          <Card>
            <div className="font-mono text-xs font-black bg-[#00f0ff] border border-black inline-block px-2 py-0.5 mb-2">
              STEP 1 // BUILD
            </div>
            <h3 className="font-bold text-base uppercase text-black mb-2">
              Form Creation &amp; Questions
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed mb-3">
              Configure form title, description, and add from 6 question types: Short Text, Long Text, Number, Multiple Choice, Checkbox, and Email. Reorder questions dynamically with the ↑ and ↓ controls.
            </p>
            <p className="text-xs text-neutral-700 leading-relaxed font-mono bg-neutral-50 p-2 border border-black/10">
              Regex rules apply to Short Text &amp; Long Text fields.
            </p>
          </Card>

          {/* Guide 2: Sharing a Form */}
          <Card>
            <div className="font-mono text-xs font-black bg-[#ffe600] border border-black inline-block px-2 py-0.5 mb-2">
              STEP 2 // PUBLISH
            </div>
            <h3 className="font-bold text-base uppercase text-black mb-2">
              Sharing &amp; Respondent Access
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed mb-3">
              Toggle <strong>Published</strong> to generate a shareable public URL (<code className="font-mono text-[11px]">/public/forms/:id</code>). Toggle <strong>Accepting responses</strong> to open or freeze submissions.
            </p>
            <p className="text-xs text-neutral-700 leading-relaxed font-mono bg-neutral-50 p-2 border border-black/10">
              Respondents do not need accounts to submit responses.
            </p>
          </Card>

          {/* Guide 3: Responses & Export */}
          <Card>
            <div className="font-mono text-xs font-black bg-[#00d66c] border border-black inline-block px-2 py-0.5 mb-2">
              STEP 3 // COLLECT
            </div>
            <h3 className="font-bold text-base uppercase text-black mb-2">
              Responses &amp; CSV Export
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed mb-3">
              Inspect submitted forms individually in chronological order. Export the entire dataset as an escaped CSV file with formula-injection sanitization for Excel/Sheets.
            </p>
            <p className="text-xs text-neutral-700 leading-relaxed font-mono bg-neutral-50 p-2 border border-black/10">
              Data remains accessible even if a form is closed.
            </p>
          </Card>
        </div>
      </section>

      {/* Bottom CTA Card */}
      <Card variant="dark" className="text-center py-8">
        <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">
          Experience FLAT Validation in Practice
        </h3>
        <p className="text-sm font-mono text-neutral-300 max-w-xl mx-auto mb-6">
          Log in to your admin workspace, build a form with custom automata validation, and share it with respondents.
        </p>
        <div className="flex justify-center gap-4">
          <Button to="/forms/new" variant="primary" size="md">
            + Create New Form
          </Button>
          <Button to="/" variant="secondary" size="md">
            Return Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
