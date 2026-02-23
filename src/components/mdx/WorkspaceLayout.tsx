interface DirectoryNode {
  name: string;
  category?: string;
  agent?: string;
  purpose?: string;
  status?: string;
  children?: DirectoryNode[];
}

const DEFAULT_DATA: DirectoryNode[] = [
  {
    name: 'projects',
    category: 'projects',
    children: [
      {
        name: 'web-app',
        agent: 'Executor: Build API',
        purpose: 'Frontend application with server-rendered pages and API routes',
        status: 'active',
      },
      {
        name: 'infra-tool',
        agent: 'Executor: Deploy Pipeline',
        purpose: 'CLI tooling for infrastructure provisioning and teardown',
        status: 'active',
      },
      {
        name: 'ml-pipeline',
        agent: 'Researcher: Data Patterns',
        purpose: 'Data ingestion and model training orchestration',
        status: 'paused',
      },
    ],
  },
  {
    name: 'ideas',
    category: 'ideas',
    children: [
      {
        name: 'cli-prototype',
        agent: 'Researcher: CLI UX',
        purpose: 'Exploring interactive terminal interfaces for developer workflows',
        status: 'exploring',
      },
      {
        name: 'data-pipeline',
        agent: 'Researcher: Stream Processing',
        purpose: 'Event-driven data flow between microservices',
        status: 'exploring',
      },
    ],
  },
];

function parseDirectories(directories: string | DirectoryNode[]): DirectoryNode[] {
  if (typeof directories === 'string') {
    try {
      return JSON.parse(directories);
    } catch {
      return [];
    }
  }
  return Array.isArray(directories) ? directories : [];
}

const statusClass: Record<string, string> = {
  active: 'wl-status-active',
  paused: 'wl-status-paused',
  exploring: 'wl-status-exploring',
};

function StaticDirectoryCard({ node }: { node: DirectoryNode }) {
  const hasChildren = node.children && node.children.length > 0;
  const hasAnnotation = node.agent || node.purpose || node.status;
  const isCategory = node.category != null;

  if (isCategory) {
    return (
      <div className="wl-category">
        <div className="wl-category-label wl-category-expanded">
          <span className="wl-card-expand">{'\u25BC'}</span>
          <span>{node.name}/</span>
        </div>
        <div className="wl-children wl-children-open">
          <div className="wl-grid">
            {node.children?.map((child) => (
              <StaticDirectoryCard key={child.name} node={child} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wl-card-wrapper">
      <div className="wl-card">
        <span className="wl-card-name">{node.name}</span>
      </div>
      {hasAnnotation && (
        <div className="wl-detail wl-detail-open">
          <div className="wl-detail-inner">
            {node.agent && (
              <div className="wl-detail-row">
                <span className="wl-detail-label">Agent:</span>
                <span className="wl-detail-value">{node.agent}</span>
              </div>
            )}
            {node.purpose && (
              <div className="wl-detail-row">
                <span className="wl-detail-label">Purpose:</span>
                <span className="wl-detail-value">{node.purpose}</span>
              </div>
            )}
            {node.status && (
              <div className="wl-detail-row">
                <span className="wl-detail-label">Status:</span>
                <span className={`wl-detail-value ${statusClass[node.status] || ''}`}>
                  {node.status}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      {hasChildren && (
        <div className="wl-children wl-children-open">
          <div className="wl-grid">
            {node.children?.map((child) => (
              <StaticDirectoryCard key={child.name} node={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface WorkspaceLayoutProps {
  directories?: string;
  title?: string;
}

export default function WorkspaceLayout({
  directories,
  title = 'Workspace Layout',
}: WorkspaceLayoutProps) {
  const nodes = directories ? parseDirectories(directories) : DEFAULT_DATA;

  return (
    <figure className="wl not-prose" role="figure" aria-label={title}>
      <div className="wl-header">
        <span className="wl-title">{title}</span>
      </div>
      <div className="wl-tree">
        {nodes.map((node) => (
          <StaticDirectoryCard key={node.name} node={node} />
        ))}
      </div>
    </figure>
  );
}
