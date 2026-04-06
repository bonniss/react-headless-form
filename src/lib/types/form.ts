/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  TranslateFn,
  TranslationResolver,
  ValidationResolver,
  ValidationTranslationMap,
} from '@/components/i18n';
import type { BaseSyntheticEvent, ReactNode } from 'react';
import type {
  FieldErrors,
  FieldValues,
  PathValue,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
  Path,
} from 'react-hook-form';
import type { ComponentMap, FormConfig } from './config';

export type SubmitHandlerWithFormMethods<
  TModel extends FieldValues = FieldValues,
> = (
  data: TModel,
  formMethods: UseFormReturn<TModel>,
  event?: React.BaseSyntheticEvent,
) => ReturnType<SubmitHandler<TModel>>;

export type ExposedFormMethods<TModel extends FieldValues> = Pick<
  UseFormReturn<TModel>,
  | 'control'
  | 'formState'
  | 'clearErrors'
  | 'setError'
  | 'getFieldState'
  | 'getValues'
  | 'setFocus'
  | 'setValue'
  | 'trigger'
  | 'reset'
  | 'resetField'
>;

export type RootRendererArgs<TModel extends FieldValues = FieldValues> = {
  children: ReactNode;
  onSubmit: (e?: BaseSyntheticEvent) => Promise<void>;
  onError?: (errors: FieldErrors) => void;
} & ExposedFormMethods<TModel>;

/**
 * Custom root wrapper renderer. Useful for replacing the default <form> with any custom structure.
 */
export type RootRenderer<TModel extends FieldValues = FieldValues> = (
  args: RootRendererArgs<TModel>,
) => ReactNode;

export type FieldChangeHandler<
  TModel extends FieldValues,
  TName extends Path<TModel>,
> = (
  value: PathValue<TModel, TName>,
  form: UseFormReturn<TModel>,
) => void;

export type FieldChangeHandlerMap<TModel extends FieldValues> = Partial<{
  [K in Path<TModel>]: FieldChangeHandler<TModel, K>;
}>;

export type OnFieldChange<TModel extends FieldValues> =
  | ((
      name: Path<TModel>,
      value: PathValue<TModel, Path<TModel>>,
      form: UseFormReturn<TModel>,
    ) => void)
  | FieldChangeHandlerMap<TModel>;

export type BlueFormRef<TModel = FieldValues> = UseFormReturn<
  any,
  any,
  TModel
> | null;

export type I18nConfig = {
  /**
   * Whether to enable i18n support for validation messages.
   * If false or omitted, messages will fallback to raw/default text.
   */
  enabled?: boolean;

  /**
   * Translation function used to resolve localized message strings.
   * If not provided, defaults to an identity function: (key) => key
   */
  t?: TranslateFn;

  /**
   * Custom resolver for formatting validation messages.
   * Allows overriding or extending default error message generation logic.
   */
  validationTranslation?: ValidationTranslationMap;
};

export type I18nResolvedConfig = {
  /**
   * Translation function used to resolve localized message strings.
   * If not provided, defaults to an identity function: (key) => key
   */
  t: TranslationResolver;

  /**
   * Custom resolver for formatting validation messages.
   * Allows overriding or extending default error message generation logic.
   */
  validationResolver: ValidationResolver;
};

// Type hẹp cho setupForm level
export type BaseFormOptions = Omit<
  UseFormProps,
  | 'resolver'
  | 'defaultValues'
  | 'context'
  | 'errors'
  | 'values'
  | 'resetOptions'
  | 'disabled'
>;

export interface BlueFormBaseConfig<
  TComponentMap extends ComponentMap = ComponentMap,
> {
  /**
   * Mapping between field types and React components used to render them.
   * Example: `{ text: TextField, select: SelectField }`
   */
  fieldMapping?: TComponentMap;

  /**
   * Renderer for root form element.
   */
  renderRoot?: RootRenderer;

  /**
   * Internationalization (i18n) and validation message configuration.
   */
  i18nConfig?: I18nConfig;

  /**
   * Props to pass to RHF's `useForm` hook.
   * @see https://react-hook-form.com/docs/useform
   */
  formOptions?: BaseFormOptions;
}

export interface BlueFormProps<
  TModel extends FieldValues,
  TComponentMap extends ComponentMap,
> extends Omit<BlueFormBaseConfig<TComponentMap>, 'formOptions'> {
  /**
   * Form field configuration including field type, name, label,Ï props, etc.
   */
  config: FormConfig<TModel, TComponentMap>;

  /**
   * Options passed to RHF's `useForm` for this specific form instance.
   * Merges over `formOptions` from `setupForm`. `defaultValues` always wins.
   * Unlike `setupForm`, per-form `formOptions` also accepts `resolver`, `context`, etc.
   *
   * @see https://react-hook-form.com/docs/useform
   */
  formOptions?: UseFormProps<TModel>;

  /**
   * Called when the form is submitted successfully and passes validation.
   */
  onSubmit?: SubmitHandlerWithFormMethods<TModel>;

  /**
   * Called after a successful form submission.
   */
  onSubmitSuccess?: SubmitHandlerWithFormMethods<TModel>;

  /**
   * Called when form submission fails due to validation errors.
   */
  onSubmitError?: SubmitErrorHandler<TModel>;

  /**
   * Initial values for the form.
   */
  defaultValues?: Partial<TModel>;

  /**
   * When true, the form renders in read-only mode with static text instead of inputs.
   */
  readOnly?: boolean;

  /**
   * Called when a single field value changes.
   */
  onFieldChange?: OnFieldChange<TModel>;

  /**
   * Called whenever the entire form state changes.
   */
  onFormChange?: (values: TModel, form: UseFormReturn<TModel>) => void;

  /**
   * Delay in milliseconds before reacting to form value changes.
   * Useful for debouncing side effects such as conditional logic,
   * dynamic field updates, or remote data fetching based on form state.
   *
   * Example: changeDebounceDelay = 300 → triggers logic only after 300ms
   * of no further changes.
   *
   * Set to 0 or leave undefined to disable debounce.
   */
  debounceMs?: number;

  /**
   * Custom content to render inside the form. Can be a React node or a render prop function.
   */
  children?:
    | ReactNode
    | ((formMethods: ExposedFormMethods<TModel>) => ReactNode);
}
