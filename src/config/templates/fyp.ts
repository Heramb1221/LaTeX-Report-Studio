import type { TemplateConfig } from './ieee-report';

export const fypTemplate: TemplateConfig = {
  id: 'fyp',
  label: 'Final Year Project',
  description: 'Complete FYP report with 8-chapter structure including design, implementation, and testing.',
  chapterCount: 8,
  sectionCommand: '\\chapter',

  defaultChapters: [
    {
      title: 'Introduction',
      order: 0,
      stub: `\\chapter{Introduction}

\\section{Background}
Provide the context and background information necessary to understand the project. Explain the domain, current landscape, and why this project is needed.

\\section{Problem Statement}
Clearly define the specific problem this project solves and what gap exists in current solutions.

\\section{Project Objectives}
\\begin{enumerate}
  \\item Primary objective 1
  \\item Primary objective 2
  \\item Primary objective 3
\\end{enumerate}

\\section{Project Scope}
Define the boundaries of this project. Clearly state what is in scope and what is intentionally excluded.

\\section{Significance of the Project}
Explain the potential impact of solving this problem and who benefits from it.

\\section{Report Structure}
Chapter 2 reviews the related literature. Chapter 3 analyses the problem in detail. Chapter 4 specifies system requirements. Chapter 5 covers the system design. Chapter 6 describes the implementation. Chapter 7 presents testing and results. Chapter 8 concludes the report.
`,
    },
    {
      title: 'Literature Review',
      order: 1,
      stub: `\\chapter{Literature Review}

\\section{Introduction}
This chapter presents a comprehensive review of existing research, systems, and technologies related to this project.

\\section{Review of Existing Systems}

\\subsection{System 1}
Describe system 1, its approach, and its limitations.

\\subsection{System 2}
Describe system 2, its approach, and its limitations.

\\section{Comparative Study}
\\begin{table}[h!]
  \\centering
  \\caption{Comparison of Existing Systems}
  \\label{tab:comparison}
  \\begin{tabular}{|p{2.5cm}|c|c|c|c|}
    \\hline
    \\textbf{System} & \\textbf{Feature A} & \\textbf{Feature B} & \\textbf{Scalable} & \\textbf{Open Source} \\\\
    \\hline
    System 1 & Yes & No & No & No \\\\
    System 2 & No & Yes & Yes & No \\\\
    Proposed & Yes & Yes & Yes & Yes \\\\
    \\hline
  \\end{tabular}
\\end{table}

\\section{Technology Review}
Review the key technologies and frameworks that will be used in this project.

\\section{Summary and Research Gap}
Summarize the key findings from existing literature and identify the gap this project addresses.
`,
    },
    {
      title: 'Problem Analysis',
      order: 2,
      stub: `\\chapter{Problem Analysis}

\\section{Detailed Problem Description}
Provide a thorough analysis of the problem domain, identifying root causes.

\\section{Stakeholder Analysis}
\\begin{itemize}
  \\item \\textbf{End Users:} Who will use the system and what are their primary needs?
  \\item \\textbf{Administrators:} Who will manage and maintain the system?
\\end{itemize}

\\section{Proposed Solution}
Describe the proposed solution at a high level and justify why it addresses the identified problems.

\\section{Feasibility Study}

\\subsection{Technical Feasibility}
Discuss whether the proposed solution is technically achievable with current technology.

\\subsection{Economic Feasibility}
Estimate the cost and resources required for development and deployment.

\\subsection{Operational Feasibility}
Assess whether the solution can be operated and maintained effectively in a real environment.
`,
    },
    {
      title: 'System Requirements',
      order: 3,
      stub: `\\chapter{System Requirements}

\\section{Functional Requirements}

\\subsection{User Requirements}
\\begin{enumerate}
  \\item FR01: The system shall allow users to register and log in securely.
  \\item FR02: The system shall provide a dashboard displaying relevant information.
  \\item FR03: The system shall enable users to perform the core operation.
\\end{enumerate}

\\section{Non-Functional Requirements}
\\begin{itemize}
  \\item \\textbf{Performance:} Response time shall be under 2 seconds for all core operations.
  \\item \\textbf{Security:} All data shall be encrypted in transit and at rest.
  \\item \\textbf{Availability:} System shall maintain 99\\% uptime.
  \\item \\textbf{Usability:} New users shall be able to complete core tasks without training.
\\end{itemize}

\\section{Hardware Requirements}
\\begin{table}[h!]
  \\centering
  \\caption{Hardware Requirements}
  \\begin{tabular}{|l|l|l|}
    \\hline
    \\textbf{Component} & \\textbf{Minimum} & \\textbf{Recommended} \\\\
    \\hline
    Processor & Intel Core i3 & Intel Core i5 \\\\
    RAM & 4~GB & 8~GB \\\\
    Storage & 20~GB & 50~GB \\\\
    \\hline
  \\end{tabular}
\\end{table}

\\section{Software Requirements}
\\begin{itemize}
  \\item Operating System: Windows 10+ / Ubuntu 22.04+
  \\item Runtime: Node.js 20+ or Python 3.11+
  \\item Database: MongoDB 7.0+ or PostgreSQL 16+
  \\item Browser: Chrome 120+ or Firefox 120+
\\end{itemize}
`,
    },
    {
      title: 'System Design',
      order: 4,
      stub: `\\chapter{System Design}

\\section{System Architecture}
Describe the high-level architecture of the proposed system. Export an architecture diagram from the Diagram Editor and insert it using the Image Manager.

\\section{Data Flow Diagram}

\\subsection{Level 0 DFD}
Describe the system boundary and external entities.

\\subsection{Level 1 DFD}
Describe the main processes and data flows within the system.

\\section{Database Design}

\\subsection{Entity Relationship Diagram}
Describe the entities and their relationships.

\\subsection{Schema Design}
Document the key collections or tables and their fields.

\\section{Module Design}

\\subsection{Module 1}
Describe this module's responsibilities and its interfaces with other modules.

\\subsection{Module 2}
Describe this module's responsibilities and its interfaces with other modules.

\\section{Security Design}
Describe authentication, authorisation, and data protection mechanisms employed.
`,
    },
    {
      title: 'Implementation',
      order: 5,
      stub: `\\chapter{Implementation}

\\section{Development Environment}
\\begin{itemize}
  \\item IDE: Visual Studio Code
  \\item Version Control: Git / GitHub
  \\item Package Manager: npm / pip
\\end{itemize}

\\section{Technology Stack}
\\begin{table}[h!]
  \\centering
  \\caption{Technology Stack}
  \\begin{tabular}{|l|l|l|}
    \\hline
    \\textbf{Layer} & \\textbf{Technology} & \\textbf{Version} \\\\
    \\hline
    Frontend & Next.js & 15.x \\\\
    Backend & Node.js & 20.x \\\\
    Database & MongoDB & 7.0 \\\\
    Deployment & Vercel & -- \\\\
    \\hline
  \\end{tabular}
\\end{table}

\\section{Module Implementation}

\\subsection{Authentication Module}
Describe how authentication was implemented, including the approach to session management.

\\subsection{Core Feature Module}
Describe the implementation of the main features of the system.

\\section{API Design}
Document the key API endpoints, their methods, and expected request/response formats.

\\section{Key Implementation Challenges}
Describe significant challenges encountered during development and how they were resolved.
`,
    },
    {
      title: 'Testing and Results',
      order: 6,
      stub: `\\chapter{Testing and Results}

\\section{Testing Methodology}
This chapter describes the testing strategy adopted for this project.

\\section{Unit Testing}
\\begin{table}[h!]
  \\centering
  \\caption{Unit Test Results}
  \\begin{tabular}{|c|p{4cm}|p{3cm}|c|}
    \\hline
    \\textbf{TC\\#} & \\textbf{Test Case} & \\textbf{Expected Result} & \\textbf{Status} \\\\
    \\hline
    UT01 & User registration & Account created & Pass \\\\
    UT02 & User login & Session established & Pass \\\\
    UT03 & Input validation & Error returned & Pass \\\\
    \\hline
  \\end{tabular}
\\end{table}

\\section{Integration Testing}
Describe integration tests performed and their outcomes.

\\section{System Testing}
Describe end-to-end system tests verifying overall functionality.

\\section{Performance Testing}
Document performance benchmarks measured during testing.

\\section{Results and Analysis}
Analyse and interpret the overall testing results.
`,
    },
    {
      title: 'Conclusion and Future Work',
      order: 7,
      stub: `\\chapter{Conclusion and Future Work}

\\section{Conclusion}
Provide a comprehensive conclusion that ties together all aspects of the project. Refer to the objectives stated in Chapter~1 and confirm whether each was achieved.

\\section{Contributions}
Summarize the key contributions of this project:
\\begin{itemize}
  \\item Contribution 1
  \\item Contribution 2
  \\item Contribution 3
\\end{itemize}

\\section{Limitations}
Honestly discuss the current limitations of the system and areas for improvement.

\\section{Future Work}
\\begin{enumerate}
  \\item Enhancement 1 --- description and expected impact
  \\item Enhancement 2 --- description and expected impact
  \\item Enhancement 3 --- description and expected impact
\\end{enumerate}

\\section{Final Remarks}
End with a forward-looking statement about the significance and potential of this work.
`,
    },
  ],

  preamble: `\\documentclass[12pt,a4paper]{report}
\\usepackage[margin=1in]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath,amssymb}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{cite}
\\usepackage{setspace}
\\usepackage{fancyhdr}

\\onehalfspacing

\\pagestyle{fancy}
\\fancyhf{}
\\rhead{Final Year Project Report}
\\lhead{RCPIT, Shirpur}
\\cfoot{\\thepage}

\\begin{document}

\\begin{titlepage}
  \\centering
  \\vspace*{1cm}
  {\\LARGE\\bfseries R.C. Patel Institute of Technology, Shirpur}\\\\[0.3cm]
  {\\large (An Autonomous Institution)}\\\\[0.2cm]
  {\\large Department of Computer Engineering}\\\\[1.5cm]
  {\\Large\\bfseries FINAL YEAR PROJECT REPORT}\\\\[0.8cm]
  {\\large On}\\\\[0.4cm]
  {\\Large\\bfseries PROJECT TITLE}\\\\[1.5cm]
  {\\normalsize Submitted in partial fulfillment of the requirements}\\\\
  {\\normalsize for the degree of Bachelor of Engineering in Computer Engineering}\\\\[1.2cm]
  {\\normalsize Submitted by:}\\\\[0.3cm]
  {\\normalsize Student Name 1 (Roll No:~XX)\\quad Student Name 2 (Roll No:~XX)}\\\\[1.2cm]
  {\\normalsize Under the Guidance of:}\\\\[0.3cm]
  {\\normalsize Prof.~Guide Name}\\\\[1.5cm]
  {\\normalsize Academic Year: 2024--25}
\\end{titlepage}

\\tableofcontents
\\newpage
`,

  closing: `
\\bibliographystyle{IEEEtran}
\\bibliography{references}

\\end{document}`,
};
