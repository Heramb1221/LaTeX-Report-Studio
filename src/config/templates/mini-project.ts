import type { TemplateConfig } from './ieee-report';

export const miniProjectTemplate: TemplateConfig = {
  id: 'mini_project',
  label: 'Mini Project Report',
  description: 'Standard 3rd-year mini project format with title page, abstract, and structured chapters.',
  chapterCount: 7,
  sectionCommand: '\\chapter',

  defaultChapters: [
    {
      title: 'Introduction',
      order: 0,
      stub: `\\chapter{Introduction}

\\section{Overview}
Provide a brief overview of the project, the technology domain, and the context in which it operates.

\\section{Problem Statement}
Define the specific problem your project addresses and why it is significant.

\\section{Objectives}
\\begin{itemize}
  \\item Objective 1
  \\item Objective 2
  \\item Objective 3
\\end{itemize}

\\section{Scope}
Define what is included and excluded from the project.

\\section{Report Organization}
Chapter 2 presents a literature survey. Chapter 3 defines system requirements. Chapter 4 describes the system design. Chapter 5 covers implementation. Chapter 6 presents testing results. Chapter 7 concludes the report.
`,
    },
    {
      title: 'Literature Survey',
      order: 1,
      stub: `\\chapter{Literature Survey}

\\section{Introduction}
This chapter reviews existing literature and technologies related to the project.

\\section{Existing Systems}
Describe existing systems or approaches related to your work.

\\section{Comparative Analysis}
\\begin{table}[h!]
  \\centering
  \\caption{Comparison of Existing Systems}
  \\label{tab:comparison}
  \\begin{tabular}{|l|c|c|c|}
    \\hline
    \\textbf{System} & \\textbf{Feature A} & \\textbf{Feature B} & \\textbf{Open Source} \\\\
    \\hline
    System 1 & Yes & No & No \\\\
    System 2 & No & Yes & No \\\\
    Proposed & Yes & Yes & Yes \\\\
    \\hline
  \\end{tabular}
\\end{table}

\\section{Research Gap}
Identify what is missing in existing work and how your project addresses it.
`,
    },
    {
      title: 'System Requirements',
      order: 2,
      stub: `\\chapter{System Requirements}

\\section{Functional Requirements}
\\begin{enumerate}
  \\item The system shall allow users to perform action A.
  \\item The system shall provide feature B.
  \\item The system shall support operation C.
\\end{enumerate}

\\section{Non-Functional Requirements}
\\begin{itemize}
  \\item \\textbf{Performance:} The system shall respond within 2 seconds.
  \\item \\textbf{Security:} User data shall be encrypted in transit and at rest.
  \\item \\textbf{Scalability:} The system shall support up to 100 concurrent users.
\\end{itemize}

\\section{Hardware Requirements}
\\begin{itemize}
  \\item Processor: Intel Core i3 or equivalent
  \\item RAM: 4~GB minimum
  \\item Storage: 10~GB free space
\\end{itemize}

\\section{Software Requirements}
\\begin{itemize}
  \\item Operating System: Windows 10 / Ubuntu 22.04
  \\item Runtime: Node.js 20+ or Python 3.11+
  \\item Database: MongoDB / MySQL
\\end{itemize}
`,
    },
    {
      title: 'System Design',
      order: 3,
      stub: `\\chapter{System Design}

\\section{System Architecture}
Describe the high-level architecture of the proposed system. Add an architecture diagram exported from the Diagram Editor and insert it here using the Image Manager.

\\section{Data Flow Diagram}
Describe the flow of data through the system at Level 0 and Level 1.

\\section{Entity Relationship Diagram}
Describe the database entities and their relationships.

\\section{Use Case Diagram}
Identify the actors and use cases for the system.

\\section{Module Description}
Describe each module of the system and its responsibilities.
`,
    },
    {
      title: 'Implementation',
      order: 4,
      stub: `\\chapter{Implementation}

\\section{Technology Stack}
\\begin{itemize}
  \\item \\textbf{Frontend:} Technology name and version
  \\item \\textbf{Backend:} Technology name and version
  \\item \\textbf{Database:} Technology name and version
\\end{itemize}

\\section{Module Implementation}

\\subsection{Module 1}
Describe how this module was implemented.

\\subsection{Module 2}
Describe how this module was implemented.

\\section{Database Design}
Describe the schema or collections used in the database.

\\section{Key Algorithms}
Describe any significant algorithms implemented in the system.
`,
    },
    {
      title: 'Testing',
      order: 5,
      stub: `\\chapter{Testing}

\\section{Testing Strategy}
Describe the types of testing performed: unit testing, integration testing, system testing, and user acceptance testing.

\\section{Test Cases}
\\begin{table}[h!]
  \\centering
  \\caption{Test Cases}
  \\label{tab:testcases}
  \\begin{tabular}{|c|p{3cm}|p{3cm}|p{3cm}|c|}
    \\hline
    \\textbf{TC\\#} & \\textbf{Description} & \\textbf{Input} & \\textbf{Expected Output} & \\textbf{Status} \\\\
    \\hline
    TC01 & User login & Valid credentials & Dashboard displayed & Pass \\\\
    TC02 & Invalid login & Wrong password & Error message shown & Pass \\\\
    \\hline
  \\end{tabular}
\\end{table}

\\section{Test Results}
All test cases passed successfully. The system performed as expected under normal operating conditions.
`,
    },
    {
      title: 'Conclusion and Future Work',
      order: 6,
      stub: `\\chapter{Conclusion and Future Work}

\\section{Conclusion}
Summarize what was accomplished in this project. Refer to the objectives defined in Chapter 1 and confirm whether each was met.

\\section{Future Work}
Describe possible extensions or improvements to the system:
\\begin{itemize}
  \\item Enhancement 1: description and expected impact
  \\item Enhancement 2: description and expected impact
  \\item Enhancement 3: description and expected impact
\\end{itemize}
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
\\rhead{Mini Project Report}
\\lhead{RCPIT, Shirpur}
\\cfoot{\\thepage}

\\begin{document}

\\begin{titlepage}
  \\centering
  \\vspace*{1.5cm}
  {\\LARGE\\bfseries R.C. Patel Institute of Technology, Shirpur}\\\\[0.4cm]
  {\\large Department of Computer Engineering}\\\\[2cm]
  {\\Large\\bfseries MINI PROJECT REPORT}\\\\[1cm]
  {\\large On}\\\\[0.5cm]
  {\\Large\\bfseries PROJECT TITLE}\\\\[2cm]
  {\\normalsize Submitted by:}\\\\[0.3cm]
  {\\normalsize Student Name (Roll No:~XX)}\\\\[1.5cm]
  {\\normalsize Under the Guidance of:}\\\\[0.3cm]
  {\\normalsize Prof.~Guide Name}\\\\[2cm]
  {\\normalsize Academic Year: 2024--25}\\\\[0.3cm]
  {\\normalsize Semester: V}
\\end{titlepage}

\\tableofcontents
\\newpage
`,

  closing: `
\\bibliographystyle{IEEEtran}
\\bibliography{references}

\\end{document}`,
};
