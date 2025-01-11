import { memo, useMemo } from 'react';
import { format } from 'date-fns';
import { Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { EditableTimeCell } from './EditableTimeCell';
import { cn } from '@/lib/utils/styles';
import { X, Lock } from 'lucide-react';
import { useApprovals } from '@/lib/hooks/useApprovals'; 
import { useUsers } from '@/lib/hooks/useUsers';
import { useProjects } from '@/lib/hooks/useProjects';
import { useClients } from '@/lib/hooks/useClients';
import type { TimeEntry } from '@/types';

interface TimesheetRowProps {
  index: number;
  row: {
    clientId: string;
    projectId: string;
    taskId: string;
  };
  weekKey: string;
  weekDays: Date[];
  timeEntries: TimeEntry[];
  editingCell: string | null;
  onUpdateRow: (index: number, updates: any) => void;
  onRemoveRow: (index: number) => void;
  onCellChange: (date: string, row: any, value: number | null) => void;
  onStartEdit: (key: string) => void;
  onEndEdit: () => void;
}

export const TimesheetRow = memo(function TimesheetRow({
  index,
  row,
  weekKey,
  weekDays,
  timeEntries,
  editingCell,
  onUpdateRow,
  onRemoveRow,
  onCellChange,
  onStartEdit,
  onEndEdit,
}: TimesheetRowProps) {
  const { effectiveUser } = useUsers();
  const { projects } = useProjects();
  const { clients } = useClients();
  const { useApprovalsForDate } = useApprovals();

  // Get available clients and projects based on user assignments
  const availableClients = useMemo(() => {
    if (!effectiveUser || !projects) return [];
    
    // Get unique client IDs from projects where user is assigned to any task
    const clientIds = new Set(
      projects
        .filter(project => 
          project.tasks.some(task => 
            task.userAssignments?.some(a => a.userId === effectiveUser.id)
          )
        )
        .map(p => p.clientId)
    );
    
    return clients.filter(client => clientIds.has(client.id));
  }, [effectiveUser, projects, clients]);
  
  const availableProjects = useMemo(() => {
    if (!row.clientId || !effectiveUser) return [];
    
    return projects.filter(project => 
      project.clientId === row.clientId &&
      project.tasks.some(task => 
        task.userAssignments?.some(a => a.userId === effectiveUser.id)
      )
    );
  }, [row.clientId, effectiveUser, projects]);

  const availableTasks = useMemo(() => {
    if (!row.projectId || !effectiveUser) return [];
    
    const project = projects.find(p => p.id === row.projectId);
    if (!project) return [];
    
    return project.tasks.filter(task =>
      task.userAssignments?.some(a => a.userId === effectiveUser.id)
    );
  }, [row.projectId, effectiveUser, projects]);

  // Get row entries
  const rowEntries = !row.clientId || !row.projectId || !row.taskId 
    ? []
    : timeEntries.filter(entry =>
      entry.clientId === row.clientId &&
      entry.projectId === row.projectId &&
      entry.taskId === row.taskId
    );

  // Calculate row total
  const rowTotal = rowEntries.reduce((sum, entry) => sum + entry.hours, 0);

  // Query approvals for each date in the week
  const approvalQueries = weekDays.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const query = useApprovalsForDate(dateStr, effectiveUser?.id, row.projectId);
    return query;
  });

  // Check if the entire row is locked
  const hasLockedEntries = approvalQueries.some(query => 
    query.data && query.data.length > 0 && 
    query.data.some(a => ['pending', 'approved'].includes(a.status))
  );

  return (
    <tr>
      <Td>
        <select
          value={row.clientId}
          disabled={hasLockedEntries}
          onChange={(e) => onUpdateRow(index, { 
            clientId: e.target.value,
            projectId: '',
            taskId: ''
          })}
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm",
            hasLockedEntries && "opacity-50 cursor-not-allowed bg-gray-50"
          )}
          title={hasLockedEntries ? "Cannot modify row with pending or approved entries" : undefined}
        >
          <option value="">Select Client</option>
          {availableClients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </Td>
      <Td>
        <select
          value={row.projectId}
          onChange={(e) => onUpdateRow(index, {
            projectId: e.target.value,
            taskId: ''
          })}
          disabled={!row.clientId || hasLockedEntries}
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm",
            hasLockedEntries && "opacity-50 cursor-not-allowed bg-gray-50"
          )}
          title={hasLockedEntries ? "Cannot modify row with pending or approved entries" : undefined}
        >
          <option value="">Select Project</option>
          {availableProjects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </Td>
      <Td>
        <select
          value={row.taskId}
          onChange={(e) => onUpdateRow(index, {
            taskId: e.target.value
          })}
          disabled={!row.projectId || hasLockedEntries}
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm",
            hasLockedEntries && "opacity-50 cursor-not-allowed bg-gray-50"
          )}
          title={hasLockedEntries ? "Cannot modify row with pending or approved entries" : undefined}
        >
          <option value="">Select Task</option>
          {availableTasks.map(task => (
            <option key={task.id} value={task.id}>
              {task.name}
            </option>
          ))}
        </select>
      </Td>
      {weekDays.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const entry = rowEntries.find(e => e.date === dateStr);
        const cellKey = `${dateStr}-${row.projectId}-${row.taskId}`;
        const approvalQuery = approvalQueries[weekDays.indexOf(date)];
        const isLocked = approvalQuery.data && approvalQuery.data.length > 0;
        const approvalStatus = isLocked ? approvalQuery.data[0].status : undefined;
        const isRowComplete = row.clientId && row.projectId && row.taskId;
        
        return (
          <Td key={dateStr} className="text-center p-0">
            <EditableTimeCell
              value={entry?.hours || null}
              onChange={(value) => onCellChange(dateStr, row, value)}
              isEditing={editingCell === cellKey}
              onStartEdit={() => onStartEdit(cellKey)}
              onEndEdit={onEndEdit}
              isDisabled={!isRowComplete}
              approvalStatus={approvalStatus}
            />
          </Td>
        );
      })}
      <Td className="text-center font-medium">
        {rowTotal.toFixed(2)}
      </Td>
      <Td>
        <Button
          variant="secondary"
          size="sm"
          disabled={hasLockedEntries}
          title={hasLockedEntries ? "Cannot delete row with locked entries" : undefined}
          onClick={() => onRemoveRow(index)}
          className={hasLockedEntries ? "opacity-50 cursor-not-allowed" : ""}
        >
          {hasLockedEntries ? (
            <Lock className="h-4 w-4 text-gray-400" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </Td>
    </tr>
  );
});

TimesheetRow.displayName = 'TimesheetRow';