'use client';

import { useState, useMemo, useCallback } from 'react';

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

/** Build the set of paths that should be expanded by default (top-level categories). */
function defaultExpanded(nodes: DirectoryNode[], parentPath = ''): Set<string> {
  const paths = new Set<string>();
  for (const node of nodes) {
    const path = parentPath ? `${parentPath}/${node.name}` : node.name;
    if (node.children && node.children.length > 0) {
      // Expand top-level categories (depth 0) so their children are visible
      if (!parentPath) {
        paths.add(path);
      }
    }
  }
  return paths;
}

const statusClass: Record<string, string> = {
  active: 'wl-status-active',
  paused: 'wl-status-paused',
  exploring: 'wl-status-exploring',
};

function DirectoryCard({
  node,
  path,
  depth,
  expanded,
  activeDetail,
  onToggleExpand,
  onToggleDetail,
}: {
  node: DirectoryNode;
  path: string;
  depth: number;
  expanded: Set<string>;
  activeDetail: string | null;
  onToggleExpand: (path: string) => void;
  onToggleDetail: (path: string) => void;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded.has(path);
  const isDetailOpen = activeDetail === path;
  const hasAnnotation = node.agent || node.purpose || node.status;
  const isCategory = node.category != null;

  if (isCategory) {
    return (
      <div className="wl-category">
        <button
          className={`wl-category-label${isExpanded ? ' wl-category-expanded' : ''}`}
          onClick={() => onToggleExpand(path)}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${node.name}`}
        >
          <span className="wl-card-expand">{isExpanded ? '\u25BC' : '\u25B6'}</span>
          <span>{node.name}/</span>
        </button>
        <div
          className={`wl-children${isExpanded ? ' wl-children-open' : ''}`}
          aria-hidden={!isExpanded}
        >
          {isExpanded && (
            <div className="wl-grid">
              {node.children?.map((child) => {
                const childPath = `${path}/${child.name}`;
                return (
                  <DirectoryCard
                    key={childPath}
                    node={child}
                    path={childPath}
                    depth={depth + 1}
                    expanded={expanded}
                    activeDetail={activeDetail}
                    onToggleExpand={onToggleExpand}
                    onToggleDetail={onToggleDetail}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="wl-card-wrapper">
      <button
        className={`wl-card${isDetailOpen ? ' wl-card-active' : ''}${hasChildren ? ' wl-card-branch' : ''}`}
        onClick={() => {
          if (hasAnnotation) onToggleDetail(path);
          if (hasChildren) onToggleExpand(path);
        }}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-label={node.name}
      >
        <span className="wl-card-name">{node.name}</span>
        {hasChildren && (
          <span className="wl-card-expand">{isExpanded ? '\u25BC' : '\u25B6'}</span>
        )}
      </button>
      {hasAnnotation && (
        <div
          className={`wl-detail${isDetailOpen ? ' wl-detail-open' : ''}`}
          aria-hidden={!isDetailOpen}
        >
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
      {hasChildren && isExpanded && (
        <div className="wl-children wl-children-open">
          <div className="wl-grid">
            {node.children?.map((child) => {
              const childPath = `${path}/${child.name}`;
              return (
                <DirectoryCard
                  key={childPath}
                  node={child}
                  path={childPath}
                  depth={depth + 1}
                  expanded={expanded}
                  activeDetail={activeDetail}
                  onToggleExpand={onToggleExpand}
                  onToggleDetail={onToggleDetail}
                />
              );
            })}
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
  const nodes = useMemo(
    () => (directories ? parseDirectories(directories) : DEFAULT_DATA),
    [directories],
  );

  const initialExpanded = useMemo(() => defaultExpanded(nodes), [nodes]);
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded);
  const [activeDetail, setActiveDetail] = useState<string | null>(null);

  const onToggleExpand = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const onToggleDetail = useCallback((path: string) => {
    setActiveDetail((prev) => (prev === path ? null : path));
  }, []);

  return (
    <figure className="wl not-prose" role="figure" aria-label={title}>
      <div className="wl-header">
        <span className="wl-title">{title}</span>
      </div>
      <div className="wl-tree">
        {nodes.map((node) => {
          const path = node.name;
          return (
            <DirectoryCard
              key={path}
              node={node}
              path={path}
              depth={0}
              expanded={expanded}
              activeDetail={activeDetail}
              onToggleExpand={onToggleExpand}
              onToggleDetail={onToggleDetail}
            />
          );
        })}
      </div>
    </figure>
  );
}
