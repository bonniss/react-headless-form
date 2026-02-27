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

* ✅ **Mức ưu tiên**: P0 (critical), P1 (high), P2 (improvement), P3 (nice-to-have)
* 🗂 **Phân loại**:

  * 🧠 Business / Nghiệp vụ (API design, DX, UX, extensibility)
  * ⚙️ Technical / Kỹ thuật (performance, architecture, correctness)

### 🚀 React Headless Form – TODO Roadmap

### 🟥 P0 – Critical (Ảnh hưởng performance & correctness rõ rệt)

#### ⚙️ Technical

##### 1. ❗ Loại bỏ `watch()` toàn form trong `BlueFormEngine`

* **Vấn đề**: `watch()` không truyền name ⇒ mỗi keystroke re-render toàn bộ engine.
* **Impact**: Form dài sẽ lag nặng.
* **Action**:

  * Tách mỗi field thành `<FieldNode />` riêng.
  * Dùng `useWatch({ name: deps })` thay vì `watch()` global.
* **Outcome**: Re-render theo dependency thay vì toàn form.

##### 2. ❗ Stop mutate `rules` trong render

* **Vấn đề**: Engine đang mutate object `rules` khi resolve i18n.
* **Risk**:

  * Side-effect trong render.
  * Khó debug.
  * Có thể phá referential equality.
* **Action**:

  * Clone rules trước khi resolve.
  * Hoặc precompile config (memo hóa trước render loop).

##### 3. ❗ Thu hẹp subscription `formState.errors` trong FieldArray

* **Vấn đề**: Dùng `formState.errors` toàn cục.
* **Impact**: Lỗi field khác cũng làm array re-render.
* **Action**:

  * Dùng `useFormState({ name: path })`
* **Outcome**: Isolated re-render theo namespace.

### 🟧 P1 – High Priority (Scale & DX)

#### ⚙️ Technical

##### 4. Tách `FieldNode` + `React.memo`

* Isolate logic visible/disabled/rules.
* Memo theo:

  * path
  * deps
  * config
* Outcome: engine không phải re-render toàn bộ subtree.

##### 5. Thêm dependency-based visibility API

```ts
visible?: boolean | ((values) => boolean)
visibleDeps?: FieldPath[]
disabledDeps?: FieldPath[]
```

* Tránh phải watch toàn form.
* Declarative hơn.
* Performance predictable hơn.

##### 6. Precompile config (compile phase)

* Resolve:

  * i18n label
  * description
  * validation message
* Làm 1 lần bằng `useMemo`.
* Tách render phase và compile phase.

##### 7. Memoize plugin rendering

Hiện tại:

* Plugins re-render mỗi khi form render.

Action:

* Cho plugin khai báo deps:

  * `"none"`
  * `"formState"`
  * `FieldPath[]`

#### 🧠 Business / Nghiệp vụ

##### 8. Cải thiện error message cho `useField()` / `useArrayField()`

* Hiện tại: non-null assertion → crash khó hiểu.
* Action:

  * Throw error rõ ràng nếu dùng ngoài provider.

Outcome:

* DX tốt hơn.
* Debug dễ hơn.

##### 9. Chuẩn hóa Field API để predictable hơn

Hiện tại:

* Field config có thể chứa logic + mutation.

Đề xuất:

* Rõ ràng 3 phase:

  1. compile
  2. runtime evaluation
  3. render

### 🟨 P2 – Medium (Ergonomic + maintainability)

#### ⚙️ Technical

##### 10. Memo hóa debounce logic trong BlueFormContent

* Debounce function nên stable.
* Observer nên `useCallback`.

##### 11. Giảm object churn trong engine

* `resolvedProps` đang tạo mới mỗi render.
* Có thể cache theo path + config hash.

##### 12. Tránh fallback `key={index}` trong FieldArray

* Chỉ dùng `field.id`.
* Tránh remount khi reorder.

##### 13. Tối ưu deep `getProperty()` lookup

* Có thể:

  * cache path accessor
  * hoặc precompute accessor function

#### 🧠 Business / Nghiệp vụ

##### 14. Hỗ trợ async visibility / conditional schema

Hiện tại visibility sync.
Có thể mở rộng:

* async condition
* server-driven condition

##### 15. Form-level middleware / interceptor

Cho phép:

* transform values trước submit
* sanitize input
* audit logging

##### 16. DevTools integration mode

Expose:

* current visibility map
* dependency graph
* re-render trace

=> rất mạnh khi scale form lớn.

### 🟩 P3 – Nice to Have / Scale Future

#### ⚙️ Technical

##### 17. Static config analysis tool

CLI hoặc helper:

* Detect circular deps
* Detect unused fields
* Detect unreachable visibility

##### 18. Partial hydration support (Next.js / RSC friendly)

* Tách logic khỏi render layer.
* Chuẩn bị cho concurrent features.

#### 🧠 Business / Nghiệp vụ

##### 19. Plugin marketplace pattern

* External plugin registry
* Plugin lifecycle hooks

##### 20. Preset bundles

* CRUD preset
* Wizard preset
* Dynamic table preset

### 📊 Tổng kết ưu tiên

| Priority | Focus                   |
| -------- | ----------------------- |
| P0       | Performance correctness |
| P1       | Scale architecture      |
| P2       | DX + maintainability    |
| P3       | Strategic growth        |
