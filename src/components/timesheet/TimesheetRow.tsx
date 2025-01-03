import { useMemo, useCallback, memo, useState } from 'react';
import { format } from 'date-fns';
import { Td } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { EditableTimeCell } from './EditableTimeCell';
import { cn } from '@/lib/utils/styles';
import { X } from 'lucide-react';
import { useApprovals } from '@/lib/hooks/useApprovals';
import type { TimeEntry, Project, Approval } from '@/types';

interface TimesheetRowProps {
  index: number;
  row: {
    clientId: string;
    projectId: string;
    roleId: string;
  };
  weekDays: Date[];
  timeEntries: TimeEntry[];
  clients: Array<{ id: string; name: string }>;
  userAssignments: Array<{
    clientId: string;
    projectId: string;
    roleId: string;
  }>;
  getProjectsForClient: (clientId: string) => Project[];
  getRolesForProject: (projectId: string) => Array<{ 
    role: { id: string; name: string };
    rates: { costRate: number; sellRate: number };
  }>;
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
  weekDays,
  timeEntries,
  clients,
  userAssignments,
  getProjectsForClient,
  getRolesForProject,
  editingCell,
  onUpdateRow,
  onRemoveRow,
  onCellChange,
  onStartEdit,
  onEndEdit,
}: TimesheetRowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { approvals } = useApprovals();

  // Filter clients based on user assignments
  const assignedClientIds = [...new Set(userAssignments.map(a => a.clientId))];
  const filteredClients = clients.filter(client => assignedClientIds.includes(client.id));

  // Filter projects based on selected client and user assignments
  const assignedProjects = userAssignments
    .filter(a => a.clientId === row.clientId)
    .map(a => a.projectId);
  const availableProjects = getProjectsForClient(row.clientId)
    .filter(project => assignedProjects.includes(project.id));

  // Filter roles based on selected project and user assignments
  const assignedRoles = userAssignments
    .filter(a => a.projectId === row.projectId)
    .map(a => a.roleId);
    
  const availableRoles = getRolesForProject(row.projectId)
    .filter(({ role }) => assignedRoles.includes(role.id));
    
  // Memoize row entries
  const rowEntries = useMemo(() => {
    if (!row.clientId || !row.projectId || !row.roleId) return [];
    return timeEntries.filter(entry =>
      entry.clientId === row.clientId &&
      entry.projectId === row.projectId &&
      entry.roleId === row.roleId
    );
  },
    [timeEntries, row]
  );

  // Memoize row total
  const rowTotal = useMemo(() => 
    rowEntries.reduce((sum, entry) => sum + entry.hours, 0),
    [rowEntries]
  );

  // Check if any entries in this row are locked
  const hasLockedEntries = useMemo(() => {
    return rowEntries.some(entry => {
      const approval = approvals.find(a => a.compositeKey === entry.compositeKey);
      return approval?.status === 'pending' || approval?.status === 'approved';
    });
  }, [rowEntries, approvals]);

  return (
    <tr>
      <Td>
        <select
          value={row.clientId}
          disabled={hasLockedEntries}
          onChange={(e) => onUpdateRow(index, { 
            clientId: e.target.value,
            projectId: '',
            roleId: ''
          })}
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm",
            hasLockedEntries && "opacity-50 cursor-not-allowed bg-gray-50"
          )}
          title={hasLockedEntries ? "Cannot modify row with pending or approved entries" : undefined}
        >
          <option value="">Select Client</option>
          {filteredClients.map(client => (
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
            roleId: ''
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
          value={row.roleId}
          onChange={(e) => onUpdateRow(index, {
            roleId: e.target.value
          })}
          disabled={!row.projectId || hasLockedEntries}
          className={cn(
            "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm",
            hasLockedEntries && "opacity-50 cursor-not-allowed bg-gray-50"
          )}
          title={hasLockedEntries ? "Cannot modify row with pending or approved entries" : undefined}
        >
          <option value="">Select Role</option>
          {availableRoles.map(({ role }) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
      </Td>
      {weekDays.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const entry = rowEntries.find(e => e.date === dateStr);
        const cellKey = `${dateStr}-${row.projectId}-${row.roleId}`;
        const approval = approvals.find(a => a.compositeKey === entry?.compositeKey);
        const isRowComplete = row.clientId && row.projectId && row.roleId;
        
        return (
          <Td key={dateStr} className="text-center p-0">
            <EditableTimeCell
              value={entry?.hours || null}
              onChange={(value) => onCellChange(dateStr, row, value)}
              isEditing={editingCell === cellKey}
              onStartEdit={() => onStartEdit(cellKey)}
              onEndEdit={onEndEdit}
              isDisabled={!isRowComplete}
              approvalStatus={approval?.status}
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
          title={hasLockedEntries ? "Cannot delete row with pending or approved entries" : undefined}
          onClick={() => onRemoveRow(index)}
          className={hasLockedEntries ? "opacity-50 cursor-not-allowed" : ""}
        >
          <X className="h-4 w-4" />
        </Button>
      </Td>
    </tr>
  );
});

TimesheetRow.displayName = 'TimesheetRow';