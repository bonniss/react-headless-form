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
  UseFormSetValue,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormProps,
  UseFormReturn,
  UseFormTrigger,
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
 * Renders the form root. **Required** — there is no default `<form>`; provide it
 * via `setupForm({ renderRoot })`, `<BlueFormProvider renderRoot>` or `<Form renderRoot>`.
 *
 * @example
 * renderRoot: ({ children, onSubmit }) => <form onSubmit={onSubmit}>{children}</form>
 */
export type RootRenderer<TModel extends FieldValues = FieldValues> = (
  args: RootRendererArgs<TModel>,
) => ReactNode;

export type FieldChangeContext<TModel extends FieldValues> = {
  name: Path<TModel>;
  value: PathValue<TModel, Path<TModel>>;
  values: TModel;
  setValue: UseFormSetValue<TModel>;
  trigger: UseFormTrigger<TModel>;
  formState: UseFormReturn<TModel>['formState'];
};

export type OnFieldChange<TModel extends FieldValues> = (
  context: FieldChangeContext<TModel>,
  form: UseFormReturn<TModel>,
) => void;

export type BlueFormRefValue<TModel extends FieldValues = FieldValues> =
  UseFormReturn<TModel> & {
    /**
     * Immediately delivers a pending debounced `onFieldChange` / `onFormChange`
     * call (see `debounceMs`). No-op when nothing is pending.
     */
    flushChanges: () => void;
  };

export type BlueFormRef<TModel extends FieldValues = FieldValues> =
  BlueFormRefValue<TModel> | null;

export type OnSubmitFailure<TModel extends FieldValues> = (
  error: unknown,
  values: TModel,
  form: UseFormReturn<TModel>,
) => unknown;

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
   * Called with the form values once validation passes.
   * May be async. If it throws/rejects, `onSubmitFailure` is called and
   * `onSubmitSuccess` is skipped.
   */
  onSubmit?: SubmitHandlerWithFormMethods<TModel>;

  /**
   * Called after `onSubmit` resolved without throwing.
   */
  onSubmitSuccess?: SubmitHandlerWithFormMethods<TModel>;

  /**
   * Called when `onSubmit` (or `onSubmitSuccess`) throws or rejects, e.g. an API error.
   * `formState.isSubmitSuccessful` stays `false`.
   * When omitted, the error is logged with `console.error` instead of becoming
   * an unhandled promise rejection.
   */
  onSubmitFailure?: OnSubmitFailure<TModel>;

  /**
   * Called when submission is blocked because validation failed.
   * `onSubmit` is not called in this case.
   */
  onInvalid?: SubmitErrorHandler<TModel>;

  /**
   * @deprecated Renamed to `onInvalid` (it only fires on validation errors,
   * never for errors thrown by `onSubmit` — use `onSubmitFailure` for those).
   * Ignored when `onInvalid` is provided. Will be removed in 1.0.
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
   * Example: debounceMs = 300 → triggers logic only after 300ms
   * of no further changes.
   *
   * A pending call is flushed (not dropped) when the form unmounts; call
   * `ref.current.flushChanges()` to deliver it earlier, e.g. before navigating.
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
