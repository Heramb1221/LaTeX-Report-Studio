// ─── draw.io embed configuration ──────────────────────────────────────────────
// embed=1        : enables embed mode (required)
// ui=min         : minimal UI chrome
// spin=1         : allow us to show/hide draw.io's own spinner overlay
// proto=json     : postMessage payloads are JSON strings (not just XML)
// noSaveBtn=1    : hide draw.io's own Save button — we use our own
// noExitBtn=1    : hide draw.io's own Exit (X) button — we use our own Close
// libraries=1    : show the shape library panel (UML, ER, BPMN, Network, etc.)

export const DRAWIO_EMBED_URL =
  'https://embed.diagrams.net/?embed=1&ui=min&spin=1&proto=json&noSaveBtn=1&noExitBtn=1&libraries=1';

export const DRAWIO_ORIGIN = 'https://embed.diagrams.net';

// ─── Blank starter diagram ────────────────────────────────────────────────────
// Minimal valid mxfile XML — an empty canvas with the default page size.
// Passed as the `xml` value in the initial {action: 'load'} message for
// brand-new diagrams that have no saved content yet.

export const BLANK_DIAGRAM_XML =
  '<mxfile><diagram name="Page-1" id="page-1">' +
  '<mxGraphModel dx="800" dy="600" grid="1" gridSize="10" guides="1" ' +
  'tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" ' +
  'pageWidth="850" pageHeight="1100" math="0" shadow="0">' +
  '<root><mxCell id="0" /><mxCell id="1" parent="0" /></root>' +
  '</mxGraphModel></diagram></mxfile>';

// ─── Diagram type labels (organizational only — see PHASE8-SETUP.md) ─────────
// draw.io's built-in shape library already covers all 9 of these via its
// "More Shapes" panel. This list is purely for labeling/organization in
// our own UI (the explorer badge, the create-diagram dropdown).

export const DIAGRAM_TYPES = [
  'dfd',
  'uml',
  'flowchart',
  'er',
  'sequence',
  'activity',
  'state_machine',
  'component',
  'architecture',
] as const;

export type DiagramType = (typeof DIAGRAM_TYPES)[number];

export const DIAGRAM_TYPE_LABELS: Record<DiagramType, string> = {
  dfd: 'Data Flow Diagram (DFD)',
  uml: 'UML Diagram',
  flowchart: 'Flowchart',
  er: 'Entity Relationship (ER)',
  sequence: 'Sequence Diagram',
  activity: 'Activity Diagram',
  state_machine: 'State Machine',
  component: 'Component Diagram',
  architecture: 'Architecture Diagram',
};

export const DIAGRAM_TYPE_LIST: { value: DiagramType; label: string }[] =
  DIAGRAM_TYPES.map((value) => ({ value, label: DIAGRAM_TYPE_LABELS[value] }));
