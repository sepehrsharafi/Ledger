create table projects (
  id text primary key,
  name text not null,
  client_name text not null,
  type text not null,
  status text not null,
  brand_primary text not null,
  brand_accent text not null,
  created_at date not null,
  top_kpi_label text not null,
  top_kpi_value text not null
);

create table team_members (
  id text primary key,
  name text not null,
  email text not null unique,
  role text not null,
  avatar_color text not null
);

create table project_members (
  project_id text not null references projects(id) on delete cascade,
  member_id text not null references team_members(id) on delete cascade,
  primary key (project_id, member_id)
);

create table kpi_snapshots (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  metric text not null,
  current_value numeric(14, 2) not null,
  previous_value numeric(14, 2) not null,
  sparkline jsonb not null default '[]'::jsonb
);

create table time_series (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  month_start date not null,
  traffic integer not null default 0,
  conversions integer not null default 0,
  spend numeric(14, 2) not null default 0,
  leads integer not null default 0
);

create table channel_breakdowns (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  channel text not null,
  visits integer not null default 0,
  conversions integer not null default 0,
  spend numeric(14, 2) not null default 0,
  cost_per_lead numeric(14, 2) not null default 0
);

create table timeline_annotations (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  annotation_date date not null,
  label text not null,
  note text not null,
  author text not null
);

create table goals (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  label text not null,
  target_value numeric(14, 2) not null,
  current_value numeric(14, 2) not null,
  unit text not null,
  period text not null
);

create table leads (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  name text not null,
  email text not null,
  company text not null,
  phone text not null,
  source text not null,
  status text not null,
  estimated_value numeric(12, 2),
  captured_from text not null,
  assigned_team_member text not null,
  created_at date not null,
  last_contacted_at date not null
);

create table lead_activities (
  id text primary key,
  lead_id text not null references leads(id) on delete cascade,
  project_id text not null references projects(id) on delete cascade,
  activity_type text not null,
  content text not null,
  author text not null,
  created_at timestamptz not null
);

create table campaigns (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  name text not null,
  channel text not null,
  status text not null,
  start_date date not null,
  end_date date not null,
  budget numeric(12, 2) not null default 0,
  spent numeric(12, 2) not null default 0,
  impressions integer not null default 0,
  clicks integer not null default 0,
  conversions integer not null default 0,
  owner text not null,
  notes text not null default ''
);

create table tasks (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  title text not null,
  description text not null,
  column_name text not null,
  assignee text not null,
  due_date date not null,
  priority text not null,
  notes text not null default ''
);

create table calendar_events (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  title text not null,
  channel text not null,
  event_date date not null,
  status text not null,
  assignee text not null
);

create table approvals (
  id text primary key,
  project_id text not null references projects(id) on delete cascade,
  title text not null,
  type text not null,
  request_type text not null,
  thumbnail_color text not null,
  status text not null,
  submitted_by text not null,
  submitted_at date not null,
  summary text not null,
  details text not null,
  pros text not null,
  cons text not null,
  recommendation text not null,
  attachments text not null default ''
);

create table approval_comments (
  id text primary key,
  approval_id text not null references approvals(id) on delete cascade,
  author text not null,
  message text not null,
  created_at timestamptz not null
);

create table report_configs (
  id text primary key,
  project_id text not null unique references projects(id) on delete cascade,
  included_sections jsonb not null default '[]'::jsonb,
  frequency text not null,
  internal_review_first boolean not null default true,
  last_sent_at date,
  engagement_stats jsonb not null default '{"opens":0,"downloads":0,"lastOpenedDate":null}'::jsonb
);

create table report_recipients (
  report_config_id text not null references report_configs(id) on delete cascade,
  email text not null,
  primary key (report_config_id, email)
);

create table agency_settings (
  id text primary key,
  agency_name text not null,
  logo_placeholder text not null,
  notifications jsonb not null default '{"approvals":true,"reports":true,"tasks":false}'::jsonb,
  integrations jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
