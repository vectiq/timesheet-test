import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { SlidePanel } from '@/components/ui/SlidePanel';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/ui/FormField';
import { Building2 } from 'lucide-react';
import type { Client } from '@/types';

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSubmit: (data: Client) => void;
}

export function ClientDialog({
  open,
  onOpenChange,
  client,
  onSubmit,
}: ClientDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: client || {
      name: '',
      email: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset(client || {
        name: '',
        email: '',
      });
    }
  }, [open, client, reset]);

  const handleFormSubmit = async (data: any) => {
    await onSubmit({ ...data, id: client?.id });
    onOpenChange(false);
  };

  return (
    <SlidePanel
      open={open}
      onClose={() => onOpenChange(false)}
      title={client ? 'Edit Client' : 'New Client'}
      icon={<Building2 className="h-5 w-5 text-indigo-500" />}
    >
      <div className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField label="Name">
            <input
              {...register('name')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>

          <FormField label="Email">
            <input
              type="email"
              {...register('email')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </FormField>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {client ? 'Update' : 'Create'} Client
            </Button>
          </div>
        </form>
      </div>
    </SlidePanel>
  );
}