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

**Số liệu nền (G3):** khi không có `deps`, gõ 1 trường làm ~199/200 trường khác re-render. Đây là mục tiêu chính của 0.16.

### 0.16 — Kiến trúc: core mỏng + re-render theo từng trường

Mục tiêu: bỏ `watch()` toàn form trong `BlueFormEngine` (hiện vẫn dùng khi có trường điều kiện không khai báo `deps`). Không đổi API công khai.

1. **Tách `BlueFormEngine.tsx`** (349 dòng) thành dispatcher (duyệt config, chọn renderer) + renderer cho từng loại core (`ArrayField`, `SectionField`, `HiddenField`, `InlineField`) + `FieldNode`.
2. **`FieldNode` + `React.memo`:** mỗi trường tự tính `visible/disabled/required` và tự `useWatch({ name: deps })`. Bỏ ràng buộc "mọi trường điều kiện cùng cấp phải có `deps`".
   - *Xong khi:* G3 chặt hơn: không có `deps` vẫn chỉ trường liên quan re-render; số 199/200 về ~0.
3. **Tự suy ra deps:** chạy `visible(values)`/`disabled(values)` qua Proxy ghi lại các path đã đọc. `deps` khai báo tay vẫn dùng được để override.
4. **Precompile config** trong `useMemo`: resolve i18n label/description/message của rules một lần, tách compile phase khỏi render phase; giảm object churn (`resolvedProps` tạo mới mỗi render).
5. **Benchmark** (`vitest bench`, form 500 trường): đo mount và mỗi keystroke, so trước/sau và so với Formisch. Chỉ in số, không chặn CI.

### 0.17 — API cho form chạy bằng dữ liệu

6. **Suy ra `TModel` từ schema:** prop `schema` (Standard Schema: zod, valibot, arktype) tự cấp resolver và suy ra kiểu, không cần `<Form<User>>` hay `@hookform/resolvers`.
7. **Điều kiện khai báo bằng JSON:** `visible: { when: "role", eq: "student" }` (`eq/in/notEmpty/and/or`), deps tự suy ra; lưu được vào DB, dùng cùng `defineDynamicConfig`.
8. **`transform(values)` trước submit** (sanitize, đổi format), có thể ở cấp form và cấp trường.
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
