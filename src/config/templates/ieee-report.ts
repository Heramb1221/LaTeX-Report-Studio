import type { ProjectTemplate } from '@/types';

export interface TemplateConfig {
  id: ProjectTemplate;
  label: string;
  description: string;
  chapterCount: number;
  sectionCommand: string;
  defaultChapters: { title: string; order: number; stub: string }[];
  preamble: string;
  closing: string;
}

export const ieeeReportTemplate: TemplateConfig = {
  id: 'ieee_report',
  label: 'IEEE Standard Report',
  description: 'IEEE conference-format paper with abstract, keywords, and structured sections.',
  chapterCount: 5,
  sectionCommand: '\\section',

  defaultChapters: [
    {
      title: 'Introduction',
      order: 0,
      stub: `\\section{Introduction}

Introduce the problem domain and motivate the need for this work.

\\subsection{Problem Statement}

State the specific problem being addressed.

\\subsection{Objectives}

\\begin{itemize}
  \\item Objective 1
  \\item Objective 2
  \\item Objective 3
\\end{itemize}

\\subsection{Paper Organization}

Section~II reviews related work. Section~III describes the methodology. Section~IV presents results. Section~V concludes the paper.
`,
    },
    {
      title: 'Related Work',
      order: 1,
      stub: `\\section{Related Work}

Review existing literature relevant to this work.

\\subsection{Existing Approaches}

Describe prior approaches and their limitations.

\\subsection{Research Gap}

Identify the gap this work addresses.
`,
    },
    {
      title: 'Methodology',
      order: 2,
      stub: `\\section{Methodology}

Describe the proposed approach in detail.

\\subsection{System Architecture}

Explain the overall architecture.

\\subsection{Implementation Details}

Describe tools, frameworks, and implementation choices.
`,
    },
    {
      title: 'Results and Discussion',
      order: 3,
      stub: `\\section{Results and Discussion}

\\subsection{Experimental Setup}

Describe the evaluation environment and metrics.

\\subsection{Results}

Present and analyse the results obtained.

\\subsection{Comparison}

Compare with baseline or existing work.
`,
    },
    {
      title: 'Conclusion',
      order: 4,
      stub: `\\section{Conclusion}

Summarize contributions and conclusions.

\\subsection{Future Work}

Suggest directions for future research.
`,
    },
  ],

  preamble: `\\documentclass[conference]{IEEEtran}
\\usepackage{amsmath,amssymb,amsfonts}
\\usepackage{graphicx}
\\usepackage{textcomp}
\\usepackage{xcolor}
\\usepackage{hyperref}
\\usepackage{cite}

\\begin{document}

\\title{PROJECT TITLE}
\\author{%
  \\IEEEauthorblockN{Author Name}
  \\IEEEauthorblockA{%
    \\textit{Department of Computer Engineering}\\\\
    \\textit{R.C. Patel Institute of Technology}\\\\
    Shirpur, Maharashtra, India\\\\
    author@rcpit.ac.in
  }
}
\\maketitle

\\begin{abstract}
Replace this with your abstract (150--250 words). Summarise the problem, approach, key results, and conclusions.
\\end{abstract}

\\begin{IEEEkeywords}
keyword1, keyword2, keyword3
\\end{IEEEkeywords}
`,

  closing: `
\\bibliographystyle{IEEEtran}
\\bibliography{references}

\\end{document}`,
};
