'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/Select';
import { CHAT_LANGUAGES, Language } from '@/core/features/chat/data/languages';
import {
  createChatSchema,
  CreateChatSchema,
} from '@/core/features/chat/schemas/chat';
import { CreateChatData } from '@/core/features/chat/types/chat';

interface CreateChatProps {
  isPending: boolean;
  isActive: boolean;
  onSubmit: (values: CreateChatSchema) => void;
  onCancel: () => void;
  userName?: string | null;
}

const NewChatForm = ({
  isActive,
  isPending,
  onCancel,
  onSubmit,
  userName,
}: CreateChatProps) => {
  const form = useForm<CreateChatSchema>({
    resolver: zodResolver(createChatSchema),
    defaultValues: {
      userName: userName ? userName.split(' ')[0] : '',
      personName: '',
    },
  });

  const [language, setLanguage] = useState<Language>('English');

  const handleSubmit = async (values: CreateChatSchema) => {
    const data: CreateChatData = { ...values };
    if (language !== 'English') {
      data.language = language;
    }
    onSubmit(data);
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
        <div className="flex items-center justify-between sm:w-1/2">
          <div className="text-sm font-semibold leading-tight">
            Preferred language
          </div>

          <Select
            value={language}
            onValueChange={(value) => setLanguage(value as Language)}
          >
            <SelectTrigger className="w-34">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {CHAT_LANGUAGES.map((lang) => (
                  <SelectItem
                    value={lang}
                    key={lang}
                    defaultChecked={lang === 'English'}
                  >
                    {lang}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="new-chat-form_fields">
          <FormField
            control={form.control}
            name="userName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="new-chat-form_label">
                  Your name for chat
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
