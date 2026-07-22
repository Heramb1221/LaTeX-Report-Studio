import type { TemplateConfig } from './ieee-report';

export const seminarTemplate: TemplateConfig = {
  id: 'seminar',
  label: 'Seminar Report',
  description: 'Technical seminar report presenting a survey of a specific topic.',
  chapterCount: 5,
  sectionCommand: '\\section',

  defaultChapters: [
    {
      title: 'Introduction',
      order: 0,
      stub: `\\section{Introduction}

Provide a concise introduction to the topic of the seminar. Explain its significance and relevance in the current technology landscape.

\\subsection{Motivation}
Explain why this topic was chosen and why it is important.

\\subsection{Objectives}
\\begin{itemize}
  \\item To study and understand the core concepts of the topic.
  \\item To review recent developments and research in this area.
  \\item To identify practical applications and open challenges.
\\end{itemize}

\\subsection{Report Organization}
Section~II presents the background and core concepts. Section~III reviews related literature. Section~IV discusses applications and case studies. Section~V concludes the report.
`,
    },
    {
      title: 'Background and Concepts',
      order: 1,
      stub: `\\section{Background and Concepts}

This section presents the foundational concepts required to understand the topic.

\\subsection{Key Concepts}
Explain the fundamental ideas, terminology, and principles underlying this topic.

\\subsection{Historical Background}
Briefly trace the evolution of this technology or concept.

\\subsection{Core Technologies}
Describe the underlying technologies and standards involved.
`,
    },
    {
      title: 'Literature Review',
      order: 2,
      stub: `\\section{Literature Review}

This section reviews significant research papers, articles, and developments related to the topic.

\\subsection{Survey of Existing Work}
Summarize key papers and findings from the literature.

\\subsection{Current State of the Art}
Describe the most advanced or widely adopted current approaches.

\\subsection{Research Challenges}
Identify open problems and challenges in this area.
`,
    },
    {
      title: 'Applications and Case Studies',
      order: 3,
      stub: `\\section{Applications and Case Studies}

\\subsection{Real-World Applications}
Describe practical applications where this technology is currently used.

\\subsection{Case Study}
Present a specific case study or example implementation to illustrate a real deployment.

\\subsection{Advantages and Limitations}
\\begin{itemize}
  \\item \\textbf{Advantages:} List the key benefits of this technology.
  \\item \\textbf{Limitations:} List current limitations or known challenges.
\\end{itemize}
`,
    },
    {
      title: 'Conclusion',
      order: 4,
      stub: `\\section{Conclusion}

\\subsection{Summary}
Briefly restate the main findings from each section of this report.

\\subsection{Future Directions}
Discuss how this area is expected to evolve and which research directions appear most promising.
`,
    },
  ],

  preamble: `\\documentclass[12pt,a4paper]{article}
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
\\rhead{Seminar Report}
\\lhead{RCPIT, Shirpur}
\\cfoot{\\thepage}

\\begin{document}

\\begin{titlepage}
  \\centering
  \\vspace*{1.5cm}
  {\\LARGE\\bfseries R.C. Patel Institute of Technology, Shirpur}\\\\[0.4cm]
  {\\large Department of Computer Engineering}\\\\[2cm]
  {\\Large\\bfseries SEMINAR REPORT}\\\\[1cm]
  {\\large On}\\\\[0.5cm]
  {\\Large\\bfseries SEMINAR TOPIC TITLE}\\\\[2cm]
  {\\normalsize Submitted by:}\\\\[0.3cm]
  {\\normalsize Student Name (Roll No:~XX)}\\\\[1.5cm]
  {\\normalsize Seminar Guide:}\\\\[0.3cm]
  {\\normalsize Prof.~Guide Name}\\\\[2cm]
  {\\normalsize Academic Year: 2024--25}\\\\[0.3cm]
  {\\normalsize Semester: VI}
\\end{titlepage}

\\tableofcontents
\\newpage
`,

  closing: `
\\bibliographystyle{IEEEtran}
\\bibliography{references}

\\end{document}`,
};
