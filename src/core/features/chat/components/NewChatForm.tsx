'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/core/components/ui/Button';
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/core/components/ui/Form';
import {
  createChatSchema,
  CreateChatSchema,
} from '@/core/features/chat/schemas/chat';
import { cn } from '@/core/utils';

type TCreateChatProps = {
  isPending: boolean;
  isActive: boolean;
  onSubmit: (values: CreateChatSchema) => void;
  onCancel: () => void;
};

const NewChatForm = ({
  isActive,
  isPending,
  onCancel,
  onSubmit,
}: TCreateChatProps) => {
  const form = useForm<CreateChatSchema>({
    resolver: zodResolver(createChatSchema),
    defaultValues: {
      personName: '',
      title: '',
    },
  });

  const handleSubmit = async (values: CreateChatSchema) => {
    onSubmit(values);
    form.reset();
  };

  const optionalEl = <span className="text-muted font-normal">optional</span>;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn('new-chat-form card', {
          inactive: isPending || !isActive,
        })}
      >
        <div className="new-chat-form_fields">
          <FormField
            control={form.control}
            name="personName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="new-chat-form_label">
                  AI person name
                  {optionalEl}
                </FormLabel>
                <FormControl>
                  <FormInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="new-chat-form_label">
                  Chat title
                  {optionalEl}
                </FormLabel>
                <FormControl>
                  <FormInput {...field} />
                </FormControl>
                {/* <FormDescription>The field is optional</FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="new-chat-form_buttons flex my-2 justify-center gap-4">
          <Button loading={isPending} type="submit">
            Start chat
          </Button>
          <Button
            loading={isPending}
            variant="secondary"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
};

NewChatForm.displayName = 'NewChatForm';

export default NewChatForm;
