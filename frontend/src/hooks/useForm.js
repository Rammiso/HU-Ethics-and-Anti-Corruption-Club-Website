import { useForm as useReactHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNotification } from './useNotification';

export const useForm = (schema, defaultValues = {}, options = {}) => {
  const { success, error } = useNotification();
  
  const form = useReactHookForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
    mode: 'onChange',
    ...options
  });

  const handleSubmit = (onSubmit, onError) => {
    return form.handleSubmit(
      async (data) => {
        try {
          await onSubmit(data);
        } catch (err) {
          console.error('Form submission error:', err);
          if (onError) {
            onError(err);
          } else {
            error('Submission Failed', err.message || 'An error occurred while submitting the form');
          }
        }
      },
      (errors) => {
        console.error('Form validation errors:', errors);
        const firstError = Object.values(errors)[0];
        if (firstError?.message) {
          error('Validation Error', firstError.message);
        }
        if (onError) {
          onError(errors);
        }
      }
    );
  };

  const showSuccess = (title, message) => {
    success(title, message);
  };

  const showError = (title, message) => {
    error(title, message);
  };

  return {
    ...form,
    handleSubmit,
    showSuccess,
    showError,
    isSubmitting: form.formState.isSubmitting,
    isDirty: form.formState.isDirty,
    isValid: form.formState.isValid,
    errors: form.formState.errors
  };
};