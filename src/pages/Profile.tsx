import { useState, useEffect } from 'react';
import { useUsers } from '@/lib/hooks/useUsers';
import { useProjects } from '@/lib/hooks/useProjects';
import { useRoles } from '@/lib/hooks/useRoles';
import { useClients } from '@/lib/hooks/useClients';
import { auth } from '@/lib/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Loader2, Briefcase } from 'lucide-react';
import { Table, TableHeader, TableBody, Th, Td } from '@/components/ui/Table';

export default function Profile() {
  const { currentUser, updateUser, isUpdating, sendPasswordReset } = useUsers();
  const { projects } = useProjects();
  const { roles } = useRoles();
  const { clients } = useClients();
  const user = auth.currentUser;
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  const assignments = currentUser?.projectAssignments || [];

  useEffect(() => {
    if (currentUser?.name) {
      setName(currentUser.name);
    }
  }, [currentUser?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await updateUser(currentUser.id, { name, email });
      setMessage('Profile updated successfully');
    } catch (error) {
      setMessage('Failed to update profile');
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      await sendPasswordReset(user.email);
      setMessage('Password reset email sent');
    } catch (error) {
      setMessage('Failed to send password reset email');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <FormField label="Name">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>

          <FormField label="Email">
            <input
              type="email"
              disabled
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>

          {message && (
            <div className={`text-sm ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={handlePasswordReset}
            >
              Reset Password
            </Button>

            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
        </Card>

        <Card>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-medium">Project Assignments</h2>
            </div>
            
            {assignments.length > 0 ? (
              <Table>
                <TableHeader>
                  <tr>
                    <Th>Client</Th>
                    <Th>Project</Th>
                    <Th>Role</Th>
                  </tr>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => {
                    const project = projects.find(p => p.id === assignment.projectId);
                    const role = roles.find(r => r.id === assignment.roleId);
                    const client = clients.find(c => c.id === assignment.clientId);
                    
                    return (
                      <tr key={assignment.id}>
                        <Td className="font-medium">{client?.name || 'Unknown Client'}</Td>
                        <Td className="font-medium">{project?.name || 'Unknown Project'}</Td>
                        <Td>{role?.name || 'Unknown Role'}</Td>
                      </tr>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-sm text-gray-500 py-4 text-center">
                No project assignments
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}