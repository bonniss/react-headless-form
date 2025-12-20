# Dreamy form builder

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
