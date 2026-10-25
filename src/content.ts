export const projects = [
  {
    id: 'gradguru', number: '01', title: 'A better first step.', name: 'GradGuru', category: 'AI-POWERED ONBOARDING',
    description: 'Turning a complex financial journey into a conversation. Configurable onboarding for students taking their next big step.',
    metric: '30–40%', metricLabel: 'reduction in onboarding dropout', tech: ['React', 'Redux Toolkit', 'Node.js'],
    context: 'At GradRight, GradGuru brings conversational onboarding into FundRight, helping students navigate financial checks and application steps.',
    contribution: ['Led frontend delivery of configurable conversational journeys for new and returning users, across India and abroad flows.', 'Integrated SurePass/CIBIL checks, KYC, and analytics into the onboarding experience.', 'Implemented GrowthBook experiments and used Mixpanel funnel analysis to inform onboarding decisions.'],
    outcome: 'The onboarding work reduced dropout by 30–40%. In a related KYC workflow, WhatsApp document uploads and delayed re-engagement improved completion by 20–25%.',
    color: 'mint'
  },
  {
    id: 'admitright', number: '02', title: 'Clarity in the complexity.', name: 'AdmitRight', category: 'B2B ANALYTICS PLATFORM',
    description: 'A shared view of the student funnel, from first impression to loan disbursement. Built for university teams to act on.',
    metric: '7+', metricLabel: 'universities served', tech: ['Next.js', 'Zustand', 'Data visualization'],
    context: 'University partners needed a unified dashboard for funnel performance, applicant insights, and campaigns.',
    contribution: ['Built the Next.js B2B dashboard, bringing funnel analytics and applicant insights into one experience.', 'Implemented API-controlled charts and filters, with Zustand store slices for configuration updates without frontend redeployment.', 'Delivered event tracking and campaign-management functionality for university teams.'],
    outcome: 'AdmitRight serves 7+ universities with visibility across the student journey and configurable analytics.',
    color: 'sand'
  },
  {
    id: 'crm', number: '03', title: 'Built to fit the team.', name: 'In-house CRM', category: 'FRONTEND ARCHITECTURE',
    description: 'An extensible platform for leads, contacts, and the people who work with them. A tailored replacement for Salesforce.',
    metric: '90%', metricLabel: 'reduction in CRM costs', tech: ['React', 'Reusable components', 'Role-based UI'],
    context: 'GradRight needed an in-house CRM that could support its workflows while reducing the cost of its existing Salesforce setup.',
    contribution: ['Led frontend architecture for an in-house CRM with feature parity.', 'Implemented configurable filters, reusable higher-order components, and role-based views.', 'Built extensible lead and contact workflows to support changing product requirements.'],
    outcome: 'The in-house CRM reduced CRM costs by 90%. The architecture emphasized reusable patterns and workflow flexibility.',
    color: 'clay'
  },
  {
    id: 'impactone', number: '04', title: 'Making impact visible.', name: 'ImpactOne', category: 'CSR & SOCIAL IMPACT',
    description: 'Less paperwork. More perspective. A platform connecting campaigns, funding, beneficiaries, and the impact they create.',
    metric: '70%', metricLabel: 'less recording and reporting time', tech: ['React', 'Node.js', 'MongoDB'],
    context: 'At ImpactDash, CSR teams needed to move from spreadsheets and paperwork to a centralized, accessible view of their programs.',
    contribution: ['Owned the frontend and a complete React UI revamp, including NGO onboarding, due diligence, and project monitoring.', 'Centralized campaigns, costs, fund allocations, and beneficiary records in filterable dashboards.', 'Built visualizations and Leaflet maps, downloadable reporting, and configurable Material UI themes for white-labelled deployments.'],
    outcome: 'The platform reduced combined CSR recording and monthly reporting time by 70%, with monthly reports generated in minutes.',
    color: 'blue'
  }
];

export const experience = [
  { dates:'NOV 2022 — PRESENT', company:'GradRight', role:'Senior Full Stack Developer · SDE II', detail:'Frontend architecture, AI-powered onboarding, university dashboards, and growth systems across fintech and edtech.', tags:['React / Next.js / Vue','Node.js','Architecture & mentoring'] },
  { dates:'SEP 2020 — NOV 2022', company:'ImpactDash', role:'Full Stack Developer · SDE I', detail:'Owned frontend delivery for CSR and volunteering platforms. Built dashboards that made social impact measurable.', tags:['React / Redux','Data visualization','B2B SaaS'] },
  { dates:'JAN 2020 — MAY 2020', company:'BulkMRO', role:'Frontend Developer', detail:'Built procurement interfaces and consolidated reusable UI patterns across a B2B wholesale platform.', tags:['JavaScript','Ruby on Rails views','Reusable UI'] }
];
