# React headless form

## General

- Dựa trên React hook form.
- Không nhất thiết phải lưu JSON mà lưu bằng code Typescript để value có thể là function
- Type safe nhất có thể: ví dụ tao truyền vào model là `UserCreatePayload` thì phải gợi ý được các field name khi tạo form config.
- Các field được cấu hình khai báo thay vì lập trình cụ thể.
- Đầy đủ cấu hình validation cho từng field và liên field.
- Dễ dàng mở rộng các loại field.
- Dễ dàng customize field cho một số trường hợp biên.
- Headless nhất có thể, cho phép cấu hình được `type: text` thì ra UI thế nào, `type: radio` thì ra UI thế nào, ví dụ vậy
- Có layout mặc định đủ tốt, dễ dàng điều chỉnh layout nếu cần.
- Chia đc các UI chuyên dụng độ phức tạp cao hơn như: Tabs, Steps, Wizard.
- Hỗ trợ các nested form: như array các object.
- Có các lifecycle event hooks
- Cho phép ẩn hiện cơ bản theo giá trị của field khác
- Cho phép transform field trước khi submit
- Cho phép virtual field (bị loại khỏi payload) trước khi submit (ưu tiên rất thấp)

## Structure

```md
FormContext
-> FormEngine
  -> Form
    -> Field
```

## Notes on RHF

### `getValues` vs `watch` vs `useWatch`

An optimized helper for reading form values. The difference between `watch` and `getValues` is that `getValues` will not trigger re-renders or subscribe to input changes.

`getValues` = đọc form state giống đọc biến thường
Không subscribe, không re-render.

Khi nên dùng

✅ Trong event handler không cần reactive UI

```ts
const onClick = () => {
  const values = getValues()
  doSomething(values)
}
```

✅ Trong effect chạy 1 lần

```ts
useEffect(() => {
  console.log(getValues())
}, [])
```

Khi KHÔNG nên dùng

❌ Muốn UI update khi giá trị thay đổi
→ getValues không trigger re-render.

| API         | Reactive | Trigger re-render | Scope     | Dùng khi              |
| ----------- | -------- | ----------------- | --------- | --------------------- |
| getValues   | ❌        | ❌                 | none      | đọc snapshot          |
| watch() all | ✅        | component gọi     | toàn form | debug / form nhỏ      |
| watch('a')  | ✅        | component gọi     | 1 field   | simple conditional    |
| useWatch    | ✅        | component đó      | granular  | form lớn / clean arch |

## Roadmap

> Một roadmap duy nhất, hợp nhất danh sách 20 mục cũ và kế hoạch sau 0.14. Mọi mục phải giữ các **Core guarantees** (G1–G8) trong `CONTRIBUTING.md`; CI chạy `pnpm verify` trên mỗi PR.
>
> **Định vị:** lớp *config → UI* trên react-hook-form, không phải một form engine mới. RHF là lợi thế hệ sinh thái nên không tự viết engine, không đa framework.

### ✅ Đã xong

| Mục | Phiên bản |
|---|---|
| Không mutate `rules` khi resolve i18n | 0.14 |
| Array subscribe `useFormState({ name })` thay vì `formState.errors` toàn cục | 0.14 |
| `key={field.id}`, bỏ fallback `key={index}` trong array | 0.14 |
| `deps` cho trường điều kiện (bước đầu, xem 0.16) | 0.14 |
| Lưới an toàn: CI, type test từ góc nhìn người dùng trên `dist`, publint/attw, ngân sách bundle 7 KB, test form lớn (300 trường, array 200 dòng) | 0.15 |
| Lỗi rõ ràng khi dùng `useField`/`useArrayField` ngoài form | 0.15 |
| Bỏ hết dependency runtime (`react-easy-provider`, `just-debounce-it`); debounce ổn định, có `flush` | 0.15 |
| Types: giữ field type có sẵn khi `fieldMapping` là object thường; kiểm tra config lồng trong section/array; ESM `node16` | 0.15 |
| Re-render theo từng trường: `FieldNode`, tự suy deps, compile phase, benchmark (chi tiết bên dưới) | 0.16 |

### ✅ 0.16 — Kiến trúc: core mỏng + re-render theo từng trường

Đã bỏ hẳn `watch()` toàn form. Không đổi kiểu của API công khai; có một thay đổi hành vi (xem cuối mục).

1. **Tách `BlueFormEngine.tsx`** (349 → ~40 dòng): `BlueFormEngine` chỉ còn dispatcher; `internal/FieldNode.tsx` (memo); renderer `field/ArrayField`, `field/SectionField`, `field/StandardField` (hidden/inline/mapped), `field/slots`. Renderer không dùng hook và được gọi như hàm thường để mỗi trường bớt một fiber.
2. **`FieldNode` + `React.memo`:** mỗi trường tự tính `visible/disabled/required` (`internal/use-field-conditions.ts`). Không dùng `useWatch` mà dùng `subscribe()` của RHF (public từ 7.55): chạy lại hàm khi path liên quan đổi, **chỉ re-render khi kết quả đổi**. Đã bỏ ràng buộc "mọi trường điều kiện cùng cấp phải có `deps`".
3. **Tự suy deps** (`helper/track-reads.ts`): Proxy ghi lại path đọc qua `values`, ghi lại sau mỗi lần chạy (đúng với `a && b`). Mảng / Date / `Object.keys` coi như đọc cả path; liệt kê root ⇒ chạy lại với mọi thay đổi. `deps` khai báo tay = override.
4. **Compile phase** (`internal/compile-field.ts`): path, dịch label/description/props, `resolveRules` chạy trong `useMemo` theo `[config, i18nConfig, readOnly]`; `resolvedProps` giữ identity khi điều kiện không đổi.
5. **Benchmark:** `pnpm bench` (`bench/form.bench.tsx`, `vitest.bench.config.ts`): 500 trường, React production, so với 0.14.0 (cài dạng alias), RHF `useController` / `register`, Formisch. In số lần render và thời gian, không chặn CI.

**G3 đã siết** (`core-guarantees.test.tsx`): không có `deps` vẫn 0 trường khác re-render; gõ vào trường dep mà điều kiện không đổi → 0; append array 200 dòng → 0 dòng cũ re-render. Ba test này fail trên engine cũ.

**Kết quả `pnpm bench`** (input re-render mỗi keystroke, form 500 trường, 49 trường điều kiện theo `f0`):

| | Gõ trường không liên quan | Gõ `f0`, điều kiện không đổi | `f0` bật/tắt 49 trường |
|---|---|---|---|
| 0.16 (nhánh này) | **1** | **1** | 25.5 |
| 0.14.0 | 500 | 500 | 475.5 |
| 0.14.0 + `deps` | 1 | 500 | 475.5 |
| RHF `useController` | 1 | 50 | 25.5 |
| Formisch | 1 | 50 | 25.5 |

Thời gian: ngang RHF `useController` ở cả ba kịch bản gõ phím, nhanh hơn 0.14 khoảng 2–10 lần; mount ngang 0.14. Formisch vẫn nhanh hơn ~2–3 lần khi mount và bật/tắt. Phần chênh này đến từ `useController` so với signal (RHF `register` gần bằng Formisch), là giới hạn của định vị "lớp trên RHF".

**Thay đổi hành vi (ghi vào release note):** trước đây, khi có trường điều kiện không khai báo `deps`, mọi keystroke đều chạy lại mọi hàm điều kiện cùng cấp. Giờ hàm chỉ chạy lại khi path nó đọc qua `values` thay đổi, hoặc khi form render lại từ component cha. Hàm đọc `getValues()` từ closure hay store bên ngoài (không qua React state) sẽ không còn "tình cờ" được cập nhật. Docs: `conditional-rendering.mdx`, `pitfalls.mdx` #12. Ngoài ra, kết quả của `visible/disabled/required` dạng hàm giờ được ép về boolean (trước đây `(v) => v.locked` có thể làm `useArrayField().disabled` là `undefined`).

**Điều kiện theo từng dòng array (đã làm):** hàm điều kiện nhận tham số thứ hai `{ path, name, namespace, scope }`; `scope` là giá trị của dòng / section lồng nhau, được theo dõi deps chính xác tới từng dòng (`rows.2.kind`). Type `ConditionContext`, `ConditionFn`.

**Còn mở:** nếu `renderRoot` đọc `formState` (ví dụ `isDirty`), `BlueForm` re-render và `FormProvider` của RHF tạo context mới, nên mọi `useController` re-render. RHF thuần cũng như vậy; muốn tránh phải memo context của RHF, mà điều đó làm `useFormContext().formState` bị stale. Chưa làm.

### 0.17 — API cho form chạy bằng dữ liệu

6. ✅ **Suy ra `TModel` từ schema:** prop `schema` (Standard Schema; interface chép theo spec, không thêm dependency). Input của schema quy định type cho `config` / `defaultValues` / ref; output quy định type cho `onSubmit`, giống `TTransformedValues` của RHF. Có overload cho `<Form>`. Không kết hợp được với `formOptions.resolver`.
7. **Điều kiện khai báo bằng JSON:** `visible: { when: "role", eq: "student" }` (`eq/in/notEmpty/and/or`), deps tự suy ra; lưu được vào DB, dùng cùng `defineDynamicConfig`.
8. ~~`transform(values)` trước submit~~: bỏ, xem bảng "Không làm".
9. **Trường computed:** `compute: (values) => ...` kèm deps.
10. **Recipe wizard nhiều bước** dựa trên section + `trigger(paths)`; thêm recipe CRUD, bảng động.

### 1.0 — Ổn định API

11. **Deprecate trước (từ 0.16), xoá ở 1.0:** `onSubmitError` → `onInvalid` (đã `@deprecated`), `items` → `fields`, `push` → `append`. Xem lại `duplicate/pop/clear` của `useArrayField`: giữ hoặc chuyển thành recipe.
12. Chốt danh sách export (snapshot G8), chính sách SemVer, hướng dẫn migration 0.x → 1.0, bỏ `bump-minor-pre-major`.

### Sau 1.0 / tuỳ chọn

- **DevTools mode:** visibility map, đồ thị deps, re-render trace. Làm sau `FieldNode`, vì cần đồ thị deps.
- **Phân tích config tĩnh:** phát hiện deps vòng tròn, trường không dùng, điều kiện không bao giờ đúng. Dùng chung đồ thị deps với DevTools.
- **Recipe UI kit:** adapter Mantine/shadcn/MUI bằng code StackBlitz thật.

### ❌ Không làm (và lý do)

| Mục cũ | Lý do |
|---|---|
| Memo hoá plugin rendering | Lib không có hệ plugin; slot và `renderRoot` đã đủ |
| Plugin marketplace | Như trên, ngoài phạm vi headless |
| Cache `getProperty()` | Dùng `get` của RHF, không phải điểm nóng |
| Async / server-driven visibility | Làm được bằng cách cập nhật config (`defineDynamicConfig`); thêm async vào render làm phức tạp core |
| Partial hydration / RSC | Form là client component; không có lợi rõ ràng |
| Tách i18n thành plugin | ~200 dòng, gắn với message của rules; tách ra làm API phức tạp hơn |
| `transform` trước submit (#8) | RHF cũng không có. Đổi shape thì đi qua output của `schema` (có type); chuyển thành payload thì viết trong `onSubmit`. Một `transform` tự do phải thêm generic mà không làm được gì hơn `onSubmit` |
