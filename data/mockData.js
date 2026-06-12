const projectSeeds = [
  {
    id: "lumen-skincare",
    name: "Lumen Skincare",
    clientName: "Lumen Labs",
    type: "DTC e-commerce brand launch",
    brandPrimary: "#E8A6A1",
    brandAccent: "#3B2F2F",
    status: "Active",
    createdDate: "2026-01-10",
    topKpiLabel: "Launch ROI",
    topKpiValue: "3.84x",
  },
  {
    id: "northpeak-outdoor-co",
    name: "Northpeak Outdoor Co.",
    clientName: "Northpeak Outdoor Co.",
    type: "Retail / outdoor apparel brand",
    brandPrimary: "#2F5D50",
    brandAccent: "#D9A441",
    status: "Active",
    createdDate: "2025-10-01",
    topKpiLabel: "Seasonal Revenue",
    topKpiValue: "EUR86.4k",
  },
  {
    id: "vaultline",
    name: "Vaultline",
    clientName: "Vaultline GmbH",
    type: "B2B fintech SaaS",
    brandPrimary: "#1F3A5F",
    brandAccent: "#4CC9B0",
    status: "Active",
    createdDate: "2025-12-04",
    topKpiLabel: "Pipeline Value",
    topKpiValue: "EUR420k",
  },
];

const teamMembers = [
  {
    id: "tm-alex",
    name: "Alex Morgan",
    email: "alex@ledger.demo",
    role: "Admin",
    avatarColor: "#2B58E8",
    assignedProjectIds: projectSeeds.map((project) => project.id),
  },
  {
    id: "tm-isla",
    name: "Isla Chen",
    email: "isla@ledger.demo",
    role: "Manager",
    avatarColor: "#5B82F5",
    assignedProjectIds: ["lumen-skincare", "northpeak-outdoor-co"],
  },
  {
    id: "tm-emma",
    name: "Emma Johnson",
    email: "emma@ledger.demo",
    role: "Member",
    avatarColor: "#0EA5A3",
    assignedProjectIds: ["lumen-skincare", "vaultline"],
  },
  {
    id: "tm-liam",
    name: "Liam Smith",
    email: "liam@ledger.demo",
    role: "Member",
    avatarColor: "#F59E0B",
    assignedProjectIds: ["northpeak-outdoor-co"],
  },
  {
    id: "tm-noah",
    name: "Noah Williams",
    email: "noah@ledger.demo",
    role: "Manager",
    avatarColor: "#10B981",
    assignedProjectIds: ["vaultline"],
  },
];

const monthKeys = [
  "2025-07-01",
  "2025-08-01",
  "2025-09-01",
  "2025-10-01",
  "2025-11-01",
  "2025-12-01",
  "2026-01-01",
  "2026-02-01",
  "2026-03-01",
  "2026-04-01",
  "2026-05-01",
  "2026-06-01",
];

const timeSeries = {
  "lumen-skincare": monthKeys.map((month, index) => ({
    month,
    traffic: 6200 + index * 780 + (index % 2 === 0 ? 220 : 480),
    conversions: 110 + index * 10 + (index % 3) * 6,
    spend: 8200 + index * 680 + (index % 2 === 0 ? 180 : 420),
    leads: 70 + index * 5 + (index % 4) * 4,
  })),
  "northpeak-outdoor-co": monthKeys.map((month, index) => {
    const winterBoost = index === 4 || index === 5 || index === 6 ? 1900 : 0;
    return {
      month,
      traffic: 3900 + index * 160 + winterBoost,
      conversions: 66 + index * 2 + (winterBoost ? 22 : 0),
      spend: 4300 + index * 120 + (winterBoost ? 520 : 0),
      leads: 34 + index + (winterBoost ? 14 : 0),
    };
  }),
  vaultline: monthKeys.map((month, index) => ({
    month,
    traffic: 920 + index * 65,
    conversions: 12 + index,
    spend: 3600 + index * 210,
    leads: 8 + Math.floor(index / 2),
  })),
};

const kpiSnapshots = {
  "lumen-skincare": {
    traffic: { current: 14820, previous: 12420, sparkline: [11, 13, 14, 12, 16, 17, 19] },
    conversions: { current: 432, previous: 362, sparkline: [6, 7, 8, 7, 9, 10, 11] },
    costPerLead: { current: 18.4, previous: 21.1, sparkline: [22, 21, 20, 19, 18.5, 18.8, 18.4] },
    roi: { current: 3.84, previous: 3.22, sparkline: [2.5, 2.8, 3.1, 3.0, 3.4, 3.6, 3.84] },
  },
  "northpeak-outdoor-co": {
    traffic: { current: 9260, previous: 8140, sparkline: [7, 7.4, 7.8, 8.2, 8.1, 8.9, 9.2] },
    conversions: { current: 204, previous: 181, sparkline: [4, 4.4, 4.5, 5, 5.1, 5.4, 5.7] },
    costPerLead: { current: 24.7, previous: 26.4, sparkline: [27, 26.7, 26, 25.6, 25.2, 24.8, 24.7] },
    roi: { current: 2.96, previous: 2.68, sparkline: [2, 2.2, 2.3, 2.4, 2.6, 2.8, 2.96] },
  },
  vaultline: {
    traffic: { current: 1540, previous: 1390, sparkline: [1.1, 1.15, 1.2, 1.26, 1.32, 1.4, 1.54] },
    conversions: { current: 34, previous: 30, sparkline: [1.2, 1.3, 1.4, 1.5, 1.55, 1.62, 1.7] },
    costPerLead: { current: 218.6, previous: 231.4, sparkline: [240, 236, 233, 230, 226, 221, 218.6] },
    roi: { current: 4.6, previous: 4.1, sparkline: [3.2, 3.5, 3.6, 3.9, 4.1, 4.3, 4.6] },
  },
};

const channelBreakdowns = {
  "lumen-skincare": [
    { channel: "Search", visits: 2480, conversions: 88, spend: 5400, costPerLead: 23.2 },
    { channel: "Social", visits: 5160, conversions: 164, spend: 10200, costPerLead: 17.4 },
    { channel: "Email", visits: 1320, conversions: 48, spend: 1200, costPerLead: 8.2 },
    { channel: "Paid", visits: 5860, conversions: 132, spend: 12600, costPerLead: 21.5 },
  ],
  "northpeak-outdoor-co": [
    { channel: "Search", visits: 3620, conversions: 82, spend: 4100, costPerLead: 19.8 },
    { channel: "Social", visits: 1180, conversions: 24, spend: 1800, costPerLead: 30.2 },
    { channel: "Email", visits: 2440, conversions: 64, spend: 900, costPerLead: 10.9 },
    { channel: "Paid", visits: 2020, conversions: 34, spend: 3100, costPerLead: 27.3 },
  ],
  vaultline: [
    { channel: "Search", visits: 540, conversions: 11, spend: 2800, costPerLead: 168.5 },
    { channel: "Social", visits: 170, conversions: 2, spend: 760, costPerLead: 310.4 },
    { channel: "Email", visits: 230, conversions: 5, spend: 420, costPerLead: 83.6 },
    { channel: "Paid", visits: 600, conversions: 16, spend: 4680, costPerLead: 222.9 },
  ],
};

const timelineAnnotations = {
  "lumen-skincare": [
    { date: "2025-10-15", label: "Holiday creative", note: "New paid social creative went live.", author: "Isla Chen" },
    { date: "2026-02-12", label: "Landing page v2", note: "Friction reduced on the checkout funnel.", author: "Emma Johnson" },
    { date: "2026-05-20", label: "Creator burst", note: "Influencer collaboration week lifted referral traffic.", author: "Alex Morgan" },
  ],
  "northpeak-outdoor-co": [
    { date: "2025-11-08", label: "Winter launch", note: "Seasonal collection launch pushed search demand higher.", author: "Liam Smith" },
    { date: "2026-01-22", label: "Email relaunch", note: "Lifecycle refresh improved repeat purchase conversion.", author: "Alex Morgan" },
  ],
  vaultline: [
    { date: "2025-12-10", label: "Demo page refresh", note: "Shorter form raised qualified request volume.", author: "Noah Williams" },
    { date: "2026-04-06", label: "Paid search test", note: "Higher-intent campaigns improved meeting quality.", author: "Emma Johnson" },
  ],
};

const goals = {
  "lumen-skincare": [
    { label: "Qualified leads", targetValue: 150, currentValue: 128, unit: "leads", period: "This month" },
    { label: "Launch ROI", targetValue: 4.2, currentValue: 3.84, unit: "x", period: "Quarter" },
    { label: "Email signups", targetValue: 2800, currentValue: 2140, unit: "contacts", period: "This month" },
  ],
  "northpeak-outdoor-co": [
    { label: "Organic sessions", targetValue: 6400, currentValue: 5780, unit: "visits", period: "This month" },
    { label: "Seasonal revenue", targetValue: 92000, currentValue: 86400, unit: "EUR", period: "Quarter" },
    { label: "Email conversion", targetValue: 3.8, currentValue: 3.2, unit: "%", period: "This month" },
  ],
  vaultline: [
    { label: "Pipeline value", targetValue: 500000, currentValue: 420000, unit: "EUR", period: "Quarter" },
    { label: "Demo requests", targetValue: 24, currentValue: 18, unit: "requests", period: "This quarter" },
    { label: "CAC payback", targetValue: 7, currentValue: 5.8, unit: "months", period: "This quarter" },
  ],
};

function createLead(projectId, index, overrides = {}) {
  const sourcePool = ["Website form", "Manual", "Referral", "Paid ad", "Event"];
  const statusPool = ["New", "Contacted", "Qualified", "Won", "Lost"];
  return {
    id: `${projectId}-lead-${index + 1}`,
    projectId,
    name: overrides.name || `Lead ${index + 1}`,
    email: overrides.email || `lead${index + 1}@example.com`,
    company: overrides.company || "Individual Customer",
    phone: overrides.phone || `+1-555-01${String(index).padStart(2, "0")}`,
    source: overrides.source || sourcePool[index % sourcePool.length],
    status: overrides.status || statusPool[index % statusPool.length],
    estimatedValue: overrides.estimatedValue || 120 + (index % 8) * 35,
    capturedFrom: overrides.capturedFrom || (index % 2 === 0 ? "Landing page" : "Retargeting campaign"),
    assignedTeamMember: overrides.assignedTeamMember || teamMembers[index % teamMembers.length].name,
    createdDate: overrides.createdDate || `2026-05-${String((index % 28) + 1).padStart(2, "0")}`,
    lastContactedDate: overrides.lastContactedDate || `2026-06-${String((index % 11) + 1).padStart(2, "0")}`,
  };
}

const lumenLeadNames = [
  "Aria Bell", "Mila Brooks", "Zoe Carter", "Ella Foster", "Mason Hall", "Ava Reed",
  "Luca Hayes", "Ruby Price", "Nina Walsh", "Sage Turner", "Leah Cole", "Ivy Dean",
];

const northpeakLeadNames = [
  "Owen Frost", "Maya Bennett", "Levi Stone", "Hannah Pike", "Ethan Marsh", "Lila Grant",
  "Nora Fields", "Jack Carter", "Miles Avery", "Eva Quinn",
];

const vaultlineCompanies = [
  "Nordspan Systems", "Hexa Core Capital", "Lynx Harbor Tech", "Praxis Grid", "Riverbank Metrics",
  "Brightforge Finance", "Atlas Compliance", "Kitewave Analytics", "Bluewell Insurance", "Quantis Data",
];

const leads = [
  ...Array.from({ length: 120 }, (_, index) =>
    createLead("lumen-skincare", index, {
      name: lumenLeadNames[index % lumenLeadNames.length],
      email: `${lumenLeadNames[index % lumenLeadNames.length].toLowerCase().replace(/ /g, ".")}@maildemo.com`,
      source: ["Paid ad", "Website form", "Referral", "Paid ad", "Event"][index % 5],
      status: index < 34 ? "New" : index < 64 ? "Contacted" : index < 94 ? "Qualified" : index < 108 ? "Won" : "Lost",
      estimatedValue: 90 + (index % 9) * 25,
      capturedFrom: index % 3 === 0 ? "Instagram lead form" : "Launch landing page",
      assignedTeamMember: ["Alex Morgan", "Isla Chen", "Emma Johnson"][index % 3],
    })
  ),
  ...Array.from({ length: 60 }, (_, index) =>
    createLead("northpeak-outdoor-co", index, {
      name: northpeakLeadNames[index % northpeakLeadNames.length],
      email: `${northpeakLeadNames[index % northpeakLeadNames.length].toLowerCase().replace(/ /g, ".")}@northpeakmail.com`,
      source: ["Website form", "Manual", "Referral", "Paid ad", "Event"][index % 5],
      status: index < 16 ? "New" : index < 30 ? "Contacted" : index < 44 ? "Qualified" : index < 52 ? "Won" : "Lost",
      estimatedValue: 180 + (index % 7) * 70,
      capturedFrom: index % 2 === 0 ? "Winter guide download" : "Newsletter signup",
      assignedTeamMember: ["Alex Morgan", "Isla Chen", "Liam Smith"][index % 3],
    })
  ),
  ...Array.from({ length: 18 }, (_, index) =>
    createLead("vaultline", index, {
      name: ["Sophie Keller", "Jonas Meyer", "Amelia Roth", "Felix Weber", "Clara Hoffmann"][index % 5],
      email: `contact${index + 1}@${vaultlineCompanies[index % vaultlineCompanies.length].toLowerCase().replace(/ /g, "").replace(/[^a-z]/g, "")}.com`,
      company: vaultlineCompanies[index % vaultlineCompanies.length],
      source: ["Paid ad", "Website form", "Referral", "Event", "Manual"][index % 5],
      status: index < 4 ? "New" : index < 8 ? "Contacted" : index < 13 ? "Qualified" : index < 16 ? "Won" : "Lost",
      estimatedValue: 18000 + (index % 6) * 7000,
      capturedFrom: index % 2 === 0 ? "Demo request page" : "Fintech summit booth",
      assignedTeamMember: ["Alex Morgan", "Emma Johnson", "Noah Williams"][index % 3],
    })
  ),
];

const leadActivities = leads.flatMap((lead, index) => [
  {
    id: `${lead.id}-activity-1`,
    leadId: lead.id,
    projectId: lead.projectId,
    activityType: "Form submission",
    content: `${lead.name} entered from ${lead.capturedFrom}.`,
    author: "System",
    timestamp: `${lead.createdDate}T09:00:00Z`,
  },
  {
    id: `${lead.id}-activity-2`,
    leadId: lead.id,
    projectId: lead.projectId,
    activityType: index % 2 === 0 ? "Email" : "Note",
    content: index % 2 === 0 ? "Sent first-touch outreach sequence." : "Lead aligned with current campaign priorities.",
    author: lead.assignedTeamMember,
    timestamp: `${lead.lastContactedDate}T14:30:00Z`,
  },
]);

const campaigns = [
  {
    id: "camp-lumen-hydration",
    projectId: "lumen-skincare",
    name: "Hydration Boost",
    channel: "Paid",
    status: "Active",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    budget: 28000,
    spent: 22340,
    impressions: 842000,
    clicks: 31240,
    conversions: 164,
  },
  {
    id: "camp-lumen-glow",
    projectId: "lumen-skincare",
    name: "Glow Awareness",
    channel: "Social",
    status: "Active",
    startDate: "2026-03-10",
    endDate: "2026-06-20",
    budget: 22000,
    spent: 17400,
    impressions: 690000,
    clicks: 26510,
    conversions: 128,
  },
  {
    id: "camp-lumen-retargeting",
    projectId: "lumen-skincare",
    name: "Retargeting Q2",
    channel: "Paid",
    status: "Scheduled",
    startDate: "2026-06-18",
    endDate: "2026-07-28",
    budget: 10000,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
  },
  {
    id: "camp-northpeak-trails",
    projectId: "northpeak-outdoor-co",
    name: "Trail Jacket Push",
    channel: "Search",
    status: "Active",
    startDate: "2026-02-01",
    endDate: "2026-06-25",
    budget: 18000,
    spent: 14450,
    impressions: 420000,
    clicks: 15800,
    conversions: 78,
  },
  {
    id: "camp-northpeak-winter",
    projectId: "northpeak-outdoor-co",
    name: "Winter Readiness",
    channel: "Email",
    status: "Ended",
    startDate: "2025-11-15",
    endDate: "2026-01-15",
    budget: 4600,
    spent: 4600,
    impressions: 98000,
    clicks: 9200,
    conversions: 46,
  },
  {
    id: "camp-vaultline-demo",
    projectId: "vaultline",
    name: "Demo Intent Search",
    channel: "Paid",
    status: "Active",
    startDate: "2026-03-01",
    endDate: "2026-07-01",
    budget: 24000,
    spent: 18640,
    impressions: 128000,
    clicks: 4760,
    conversions: 16,
  },
  {
    id: "camp-vaultline-compliance",
    projectId: "vaultline",
    name: "Compliance Webinar",
    channel: "Email",
    status: "Scheduled",
    startDate: "2026-06-21",
    endDate: "2026-07-10",
    budget: 5200,
    spent: 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
  },
];

const tasks = [
  {
    id: "task-lumen-1",
    projectId: "lumen-skincare",
    title: "Review creator cutdowns",
    description: "Approve final 15 second social edits for paid launch.",
    column: "Review",
    assignee: "Emma Johnson",
    dueDate: "2026-06-13",
    priority: "High",
  },
  {
    id: "task-lumen-2",
    projectId: "lumen-skincare",
    title: "Refresh landing page FAQ",
    description: "Clarify launch bundle shipping and returns.",
    column: "In Progress",
    assignee: "Isla Chen",
    dueDate: "2026-06-15",
    priority: "Medium",
  },
  {
    id: "task-lumen-3",
    projectId: "lumen-skincare",
    title: "Follow up with new leads",
    description: "Qualify the latest paid social responses.",
    column: "To Do",
    assignee: "Alex Morgan",
    dueDate: "2026-06-12",
    priority: "High",
  },
  {
    id: "task-lumen-4",
    projectId: "lumen-skincare",
    title: "Weekly insights note",
    description: "Package campaign learnings for Monday review.",
    column: "Done",
    assignee: "Alex Morgan",
    dueDate: "2026-06-09",
    priority: "Low",
  },
  {
    id: "task-northpeak-1",
    projectId: "northpeak-outdoor-co",
    title: "Plan seasonal search copy",
    description: "Write winter hiking variant headlines.",
    column: "To Do",
    assignee: "Liam Smith",
    dueDate: "2026-06-18",
    priority: "Medium",
  },
  {
    id: "task-northpeak-2",
    projectId: "northpeak-outdoor-co",
    title: "Audit email flows",
    description: "Check abandoned cart timing before July promo.",
    column: "In Progress",
    assignee: "Isla Chen",
    dueDate: "2026-06-19",
    priority: "High",
  },
  {
    id: "task-vaultline-1",
    projectId: "vaultline",
    title: "Draft enterprise case study",
    description: "Support bottom-funnel demo requests with proof points.",
    column: "Review",
    assignee: "Noah Williams",
    dueDate: "2026-06-17",
    priority: "High",
  },
  {
    id: "task-vaultline-2",
    projectId: "vaultline",
    title: "Refine attribution notes",
    description: "Split webinar leads from paid search in reporting.",
    column: "Done",
    assignee: "Emma Johnson",
    dueDate: "2026-06-08",
    priority: "Low",
  },
];

const calendarEvents = [
  {
    id: "event-lumen-1",
    projectId: "lumen-skincare",
    title: "Hydration Boost Reel",
    channel: "Social",
    date: "2026-06-14",
    status: "Scheduled",
    assignee: "Emma Johnson",
  },
  {
    id: "event-lumen-2",
    projectId: "lumen-skincare",
    title: "Launch welcome flow",
    channel: "Email",
    date: "2026-06-16",
    status: "Draft",
    assignee: "Alex Morgan",
  },
  {
    id: "event-northpeak-1",
    projectId: "northpeak-outdoor-co",
    title: "Trail jacket blog update",
    channel: "Search",
    date: "2026-06-20",
    status: "Scheduled",
    assignee: "Liam Smith",
  },
  {
    id: "event-vaultline-1",
    projectId: "vaultline",
    title: "Compliance webinar invite",
    channel: "Email",
    date: "2026-06-24",
    status: "Draft",
    assignee: "Noah Williams",
  },
];

const approvals = [
  {
    id: "approval-lumen-1",
    projectId: "lumen-skincare",
    title: "Hydration Boost Hero",
    type: "Image",
    thumbnailColor: "#F5C2BF",
    status: "Pending",
    submittedBy: "Emma Johnson",
    submittedDate: "2026-06-11",
    comments: [
      { id: "approval-lumen-1-c1", author: "Alex Morgan", message: "Need final client signoff on the CTA lockup.", timestamp: "2026-06-11T10:00:00Z" },
    ],
  },
  {
    id: "approval-northpeak-1",
    projectId: "northpeak-outdoor-co",
    title: "Winter Trails Newsletter",
    type: "Copy",
    thumbnailColor: "#D9A441",
    status: "Approved",
    submittedBy: "Liam Smith",
    submittedDate: "2026-06-08",
    comments: [
      { id: "approval-northpeak-1-c1", author: "Isla Chen", message: "Approved after final subject line update.", timestamp: "2026-06-09T09:10:00Z" },
    ],
  },
  {
    id: "approval-vaultline-1",
    projectId: "vaultline",
    title: "Enterprise Demo Cut",
    type: "Video",
    thumbnailColor: "#4CC9B0",
    status: "Pending",
    submittedBy: "Noah Williams",
    submittedDate: "2026-06-10",
    comments: [],
  },
];

const reportConfigs = [
  {
    id: "report-lumen",
    projectId: "lumen-skincare",
    includedSections: ["Executive summary", "Channel performance", "Leads", "Campaign learnings"],
    frequency: "Weekly",
    internalReviewFirst: true,
    recipients: ["growth@lumenlabs.com", "ceo@lumenlabs.com"],
    lastSentDate: "2026-06-06",
    engagementStats: {
      opens: 42,
      downloads: 16,
      lastOpenedDate: "2026-06-07",
    },
  },
  {
    id: "report-northpeak",
    projectId: "northpeak-outdoor-co",
    includedSections: ["Executive summary", "SEO", "Email", "Revenue"],
    frequency: "Monthly",
    internalReviewFirst: true,
    recipients: ["marketing@northpeak.co"],
    lastSentDate: "2026-05-31",
    engagementStats: {
      opens: 18,
      downloads: 6,
      lastOpenedDate: "2026-06-01",
    },
  },
  {
    id: "report-vaultline",
    projectId: "vaultline",
    includedSections: ["Executive summary", "Pipeline", "Paid search", "Meetings"],
    frequency: "Weekly",
    internalReviewFirst: false,
    recipients: ["ops@vaultline.de", "cmo@vaultline.de"],
    lastSentDate: "2026-06-05",
    engagementStats: {
      opens: 24,
      downloads: 9,
      lastOpenedDate: "2026-06-06",
    },
  },
];

const agencySettings = {
  agencyName: "Ledger Studio",
  logoPlaceholder: "LS",
  notifications: {
    approvals: true,
    reports: true,
    tasks: false,
  },
  integrations: [
    { id: "google-ads", name: "Google Ads", connected: true },
    { id: "meta-ads", name: "Meta Ads", connected: true },
    { id: "hubspot", name: "HubSpot", connected: false },
  ],
};

export function createInitialData() {
  return {
    projects: projectSeeds,
    kpiSnapshots,
    timeSeries,
    channelBreakdowns,
    timelineAnnotations,
    goals,
    leads,
    leadActivities,
    campaigns,
    tasks,
    calendarEvents,
    approvals,
    teamMembers,
    reportConfigs,
    agencySettings,
  };
}
