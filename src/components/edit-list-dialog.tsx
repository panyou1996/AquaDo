
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useTasksDispatch } from '@/hooks/use-tasks';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Palette, Save } from 'lucide-react';
import type { List } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import React, { useEffect } from 'react';

const listColors = [
  'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'gray', 'pink', 'brown'
] as const;

const listSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  color: z.enum(listColors).default('gray'),
});

type ListFormValues = z.infer<typeof listSchema>;

interface EditListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  list: List;
}

export function EditListDialog({ open, onOpenChange, list }: EditListDialogProps) {
  const dispatch = useTasksDispatch();
  const { toast } = useToast();

  const form = useForm<ListFormValues>({
    resolver: zodResolver(listSchema),
    defaultValues: {
      title: list.title,
      color: list.color || 'gray',
    }
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    if (list) {
      reset({
        title: list.title,
        color: list.color || 'gray',
      });
    }
  }, [list, reset]);

  const onSubmit = (data: ListFormValues) => {
    const updatedList: List = {
      ...list,
      title: data.title,
      color: data.color,
    };
    dispatch({ type: 'UPDATE_LIST', payload: updatedList });
    toast({
      title: 'List Updated',
      description: `"${data.title}" list has been updated.`,
    });
    onOpenChange(false);
  };

  const listColorMap: Record<NonNullable<List['color']>, string> = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    green: "bg-green-500",
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    gray: "bg-gray-500",
    pink: "bg-pink-500",
    brown: "bg-stone-500",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit list</DialogTitle>
          <DialogDescription>
            Update the title and color of your list.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Input id="title" {...register('title')} placeholder="e.g. Project Phoenix" />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <Controller
            name="color"
            control={control}
            render={({ field }) => (
                <div className="flex items-center gap-4">
                    <label className="text-sm font-medium">Color</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <div className={cn("h-4 w-4 rounded-full", listColorMap[field.value])} />
                                <span>{field.value.charAt(0).toUpperCase() + field.value.slice(1)}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto">
                           <div className="grid grid-cols-5 gap-2">
                                {listColors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        className={cn("h-6 w-6 rounded-full", listColorMap[color])}
                                        onClick={() => field.onChange(color)}
                                    />
                                ))}
                           </div>
                        </PopoverContent>
                    </Popover>
                </div>
            )}
            />

          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
