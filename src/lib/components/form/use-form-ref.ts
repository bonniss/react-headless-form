import type { BlueFormRefValue } from "@/types/form";
import { useRef } from "react";
import type { FieldValues } from "react-hook-form";

/**
 * Typed ref for `<Form ref>`.
 *
 * @example
 * const formRef = useFormRef<LoginData>();
 * <Form<LoginData> ref={formRef} ... />
 * formRef.current?.reset();
 */
export function useFormRef<TModel extends FieldValues = FieldValues>() {
  return useRef<BlueFormRefValue<TModel>>(null);
}
