import ArrowLeftIcon from '@mattermost/compass-icons/components/arrow-left';
import CreationOutlineIcon from '@mattermost/compass-icons/components/creation-outline';
import {
  Button,
  Icon,
  MenuItem,
  PopoverMenu,
  Tag,
} from '@mattermost/compass-ui';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { PaletteItem, WorkflowEdge, WorkflowNode } from '../../data/types';
import { useAutomations } from '../../context/AutomationsContext';
import AgentPanel from './AgentPanel';
import InspectorPanel from './InspectorPanel';
import StepsPalette from './StepsPalette';
import WorkflowNodeView from './WorkflowNode';
import styles from './editor.module.scss';

const BASE = '/prototypes/automations';
const nodeTypes: NodeTypes = { workflow: WorkflowNodeView };

type GraphSnapshot = { nodes: WorkflowNode[]; edges: WorkflowEdge[] };

function EditorInner() {
  const { id = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    getAutomation,
    setAutomationGraph,
    updateAutomation,
    appendHistory,
    recordRecent,
    showToast,
  } = useAutomations();
  const automation = getAutomation(id);
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode>(
    automation?.nodes ?? [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<WorkflowEdge>(
    automation?.edges ?? [],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [agentOpen, setAgentOpen] = useState(searchParams.get('agent') === '1');
  const [actionsOpen, setActionsOpen] = useState(false);
  const [past, setPast] = useState<GraphSnapshot[]>([]);
  const [future, setFuture] = useState<GraphSnapshot[]>([]);
  const hydrated = useRef<string | null>(null);

  useEffect(() => {
    if (!automation) return;
    recordRecent(automation.id);
  }, [automation, recordRecent]);

  useEffect(() => {
    if (!automation) return;
    if (hydrated.current === automation.id) return;
    hydrated.current = automation.id;
    setNodes(automation.nodes);
    setEdges(automation.edges);
    setPast([]);
    setFuture([]);
  }, [automation, setNodes, setEdges]);

  useEffect(() => {
    if (searchParams.get('agent') === '1') {
      setAgentOpen(true);
    }
  }, [searchParams]);

  const pushHistory = useCallback(
    (nextNodes: WorkflowNode[], nextEdges: WorkflowEdge[]) => {
      setPast((p) => [...p, { nodes, edges }]);
      setFuture([]);
      setNodes(nextNodes);
      setEdges(nextEdges);
    },
    [nodes, edges, setNodes, setEdges],
  );

  const undo = () => {
    setPast((p) => {
      if (p.length === 0) return p;
      const prev = p[p.length - 1];
      setFuture((f) => [{ nodes, edges }, ...f]);
      setNodes(prev.nodes);
      setEdges(prev.edges);
      return p.slice(0, -1);
    });
  };

  const redo = () => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const [next, ...rest] = f;
      setPast((p) => [...p, { nodes, edges }]);
      setNodes(next.nodes);
      setEdges(next.edges);
      return rest;
    });
  };

  const onConnect = useCallback(
    (connection: Connection) => {
      pushHistory(nodes, addEdge({ ...connection, type: 'smoothstep' }, edges));
    },
    [nodes, edges, pushHistory],
  );

  const addStep = useCallback(
    (item: PaletteItem, position?: { x: number; y: number }) => {
      const newNode: WorkflowNode = {
        id: `${item.stepType}-${Date.now()}`,
        type: 'workflow',
        position: position ?? {
          x: 120 + nodes.length * 24,
          y: 100 + (nodes.length % 5) * 40,
        },
        data: {
          label: item.label,
          kind: item.kind,
          stepType: item.stepType,
          verb: item.verb,
          helpText: item.helpText,
          fields: {},
        },
      };
      pushHistory([...nodes, newNode], edges);
      setSelectedId(newNode.id);
      setAgentOpen(false);
    },
    [nodes, edges, pushHistory],
  );

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/automations-step');
    if (!raw) return;
    const item = JSON.parse(raw) as PaletteItem;
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addStep(item, position);
  };

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId],
  );

  const save = () => {
    if (!automation) return;
    setAutomationGraph(automation.id, nodes, edges);
    appendHistory(automation.id, 'Saved');
    showToast('Automation saved', 'Success');
  };

  const testRun = () => {
    showToast('Test run completed successfully', 'Success');
  };

  if (!automation) {
    return (
      <div className={styles.editor}>
        <div className={styles.editor__toolbar}>
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
            onClick={() => navigate(BASE)}
          >
            Back
          </Button>
          <span>Automation not found</span>
        </div>
      </div>
    );
  }

  const statusLabel =
    automation.status === 'enabled'
      ? 'Enabled'
      : automation.status === 'draft'
        ? 'Draft'
        : 'Disabled';

  return (
    <div className={styles.editor}>
      <div className={styles.editor__toolbar}>
        <div className={styles['editor__toolbar-left']}>
          <Button
            emphasis="Tertiary"
            size="Small"
            leadingIcon={<Icon size="16" glyph={<ArrowLeftIcon />} />}
            onClick={() => navigate(BASE)}
          >
            Back
          </Button>
          <span className={styles.editor__crumb}>
            <button type="button" onClick={() => navigate(BASE)}>
              Automations
            </button>
            {' / '}
            {automation.name}
          </span>
          <h1 className={styles.editor__title}>{automation.name}</h1>
          <Tag
            label={statusLabel}
            size="X-Small"
            type={automation.status === 'enabled' ? 'Success' : 'Default'}
          />
        </div>
        <div className={styles['editor__toolbar-right']}>
          <Button
            emphasis="Tertiary"
            size="Small"
            disabled={past.length === 0}
            onClick={undo}
          >
            Undo
          </Button>
          <Button
            emphasis="Tertiary"
            size="Small"
            disabled={future.length === 0}
            onClick={redo}
          >
            Redo
          </Button>
          <div style={{ position: 'relative' }}>
            <Button
              emphasis="Tertiary"
              size="Small"
              onClick={() => setActionsOpen((v) => !v)}
            >
              Actions
            </Button>
            {actionsOpen ? (
              <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 20 }}>
                <PopoverMenu>
                  <MenuItem
                    label="Run history"
                    leadingElement={false}
                    onClick={() => {
                      setActionsOpen(false);
                      navigate(`${BASE}/${automation.id}/runs`);
                    }}
                  />
                  <MenuItem
                    label="Change history"
                    leadingElement={false}
                    onClick={() => {
                      setActionsOpen(false);
                      navigate(`${BASE}/${automation.id}/history`);
                    }}
                  />
                </PopoverMenu>
              </div>
            ) : null}
          </div>
          <Button emphasis="Tertiary" size="Small" onClick={testRun}>
            Test run
          </Button>
          <Button emphasis="Primary" size="Small" onClick={save}>
            Save
          </Button>
        </div>
      </div>

      <div className={styles.editor__body}>
        <div className={styles.editor__palette}>
          <StepsPalette onAdd={(item) => addStep(item)} />
        </div>

        <div className={styles.editor__canvas}>
          {nodes.length === 0 ? (
            <div className={styles.editor__blank}>
              Add a trigger from the left, or describe a workflow with AI
            </div>
          ) : null}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            fitView
            onNodeClick={(_, node) => {
              setSelectedId(node.id);
              setAgentOpen(false);
              if (searchParams.get('agent')) {
                searchParams.delete('agent');
                setSearchParams(searchParams, { replace: true });
              }
            }}
            onPaneClick={() => setSelectedId(null)}
          >
            <Background gap={18} size={1} />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
          <button
            type="button"
            className={styles.editor__fab}
            onClick={() => {
              setAgentOpen(true);
              setSelectedId(null);
            }}
          >
            <Icon size="16" glyph={<CreationOutlineIcon />} />
            AI agent
          </button>
        </div>

        <div className={styles.editor__side}>
          {agentOpen ? (
            <AgentPanel
              onClose={() => {
                setAgentOpen(false);
                if (searchParams.get('agent')) {
                  searchParams.delete('agent');
                  setSearchParams(searchParams, { replace: true });
                }
              }}
              onApplyGraph={(nextNodes, nextEdges) => {
                pushHistory(nextNodes, nextEdges);
              }}
            />
          ) : (
            <InspectorPanel
              automation={automation}
              selectedNode={selectedNode}
              onCloseNode={() => setSelectedId(null)}
              onUpdateAutomation={(patch) => updateAutomation(automation.id, patch)}
              onUpdateNode={(nodeId, fields, label) => {
                const next = nodes.map((n) =>
                  n.id === nodeId
                    ? {
                        ...n,
                        data: {
                          ...n.data,
                          fields,
                          label: label ?? n.data.label,
                        },
                      }
                    : n,
                );
                pushHistory(next, edges);
              }}
              onDuplicateNode={(nodeId) => {
                const source = nodes.find((n) => n.id === nodeId);
                if (!source) return;
                const copy: WorkflowNode = {
                  ...source,
                  id: `${source.id}-copy-${Date.now()}`,
                  position: {
                    x: source.position.x + 40,
                    y: source.position.y + 40,
                  },
                  data: {
                    ...source.data,
                    fields: source.data.fields
                      ? { ...source.data.fields }
                      : undefined,
                  },
                };
                pushHistory([...nodes, copy], edges);
                setSelectedId(copy.id);
              }}
              onDeleteNode={(nodeId) => {
                pushHistory(
                  nodes.filter((n) => n.id !== nodeId),
                  edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
                );
                setSelectedId(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <EditorInner />
    </ReactFlowProvider>
  );
}
