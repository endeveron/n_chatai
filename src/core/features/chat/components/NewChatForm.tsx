'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
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

type TCreateChatProps = {
  isPending: boolean;
  isActive: boolean;
  onSubmit: (values: CreateChatSchema) => void;
  onCancel: () => void;
  userName?: string | null;
};

const NewChatForm = ({
  isActive,
  isPending,
  onCancel,
  onSubmit,
  userName,
}: TCreateChatProps) => {
  const form = useForm<CreateChatSchema>({
    resolver: zodResolver(createChatSchema),
    defaultValues: {
      userName: userName ?? '',
      personName: '',
    },
  });

  const handleSubmit = async (values: CreateChatSchema) => {
    onSubmit(values);
    form.reset();
  };

  useEffect(() => {
    if (isActive && !userName) {
      form.setFocus('userName');
    }
  }, [form, isActive, userName]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        data-active={!isPending && isActive}
        className="new-chat-form"
      >
        <div className="new-chat-form_fields">
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="new-chat-form_label">
                  Your name
                  <span className="text-title">required</span>
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
            name="personName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="new-chat-form_label">
                  Name of your chat buddy
                  <span className="text-muted font-normal">optional</span>
                </FormLabel>
                <FormControl>
                  <FormInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="new-chat-form_buttons flex my-2 justify-center gap-4">
          <Button loading={isPending} type="submit">
            I am 18 or older - Start chat
          </Button>
          <Button
            className="min-w-24"
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
