import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRoutine } from '@/context/routine-context';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  targetMinutes: z.coerce
    .number()
    .max(1440, 'Must be at most 1440'),
  targetCount: z.coerce
    .number()
    .max(100, 'Must be at most 100'),
  targetDays: z.coerce
    .number()
    .min(3, 'Must be at least 3, otherwise routine cannot be built')
    .max(7, 'Must be at most 7'),
}).refine(
  (data) => data.targetMinutes || data.targetCount,
  {
    message: 'Either Target Minutes or Target Count is required',
    path: ['targetMinutes'], // You can point to any field
  }
).refine(
  (data) => !(data.targetMinutes && data.targetCount),
  {
    message: 'Only one of Target minutes or Target Count can be provided',
    path: ['targetCount'], // You can point to any field
  }
);

type FormValues = z.infer<typeof formSchema>;

interface CreateRoutineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRoutineDialog({ open, onOpenChange }: CreateRoutineDialogProps) {
  const { addRoutine } = useRoutine();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      targetMinutes: 0,
      targetCount: 0,
      targetDays: 3,
    },
  });

  const onSubmit = (values: FormValues) => {
    addRoutine({
      title: values.title,
      description: values.description,
      daily_target: values.targetMinutes || values.targetCount,
      type: values.targetMinutes ? 'TIME' : 'COUNT'
    });
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Routine</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Routine Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter routine title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Count per day</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Minutes per day</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
