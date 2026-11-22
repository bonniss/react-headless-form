import { createContext, useContext } from 'react'

export type Lang = 'en' | 'ja'

const messages: Record<Lang, Record<string, string>> = {
  en: {
    'field.name': 'Name',
    'field.slug': 'Slug',
    'field.email': 'Email',
    'field.role': 'Role',
    'field.adminCode': 'Admin code',
    'field.bio': 'Bio',
    'field.health': 'Health check',
    'field.weight': 'Weight (kg)',
    'field.height': 'Height (cm)',
    'field.bmi': 'BMI',
    'field.bmiClass': 'BMI class',
    'field.settings': 'Settings',
    'field.newsletter': 'Newsletter',
    'field.theme': 'Theme',
    'field.lines': 'Invoice lines',
    'field.item': 'Item',
    'field.qty': 'Qty',
    'field.price': 'Price',
    'field.total': 'Total',
    'field.subtotal': 'Subtotal',
    'field.vat': 'VAT 10%',
    'field.grandTotal': 'Grand total',
    'role.viewer': 'Viewer (cannot edit bio)',
    'role.editor': 'Editor',
    'role.admin': 'Admin (needs a code)',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'validation.required': '{field} is required',
    'validation.pattern': '{field} is invalid',
    'validation.maxLength': '{field}: at most {maxLength}',
    'action.save': 'Save',
    'action.addLine': 'Add line',
    'action.remove': 'Remove',
    'shell.errors': '{count} errors',
    'shell.submitted': 'Submitted',
    'shell.payload': 'Submitted payload',
    'shell.computed': 'computed',
    'shell.dropped': 'Not submitted (hidden)',
    'shell.close': 'Close',
  },
  ja: {
    'field.name': '名前',
    'field.slug': 'スラッグ',
    'field.email': 'メールアドレス',
    'field.role': '役割',
    'field.adminCode': '管理者コード',
    'field.bio': '自己紹介',
    'field.health': '健康診断',
    'field.weight': '体重 (kg)',
    'field.height': '身長 (cm)',
    'field.bmi': 'BMI',
    'field.bmiClass': 'BMI 判定',
    'field.settings': '設定',
    'field.newsletter': 'ニュースレター',
    'field.theme': 'テーマ',
    'field.lines': '請求明細',
    'field.item': '品目',
    'field.qty': '数量',
    'field.price': '単価',
    'field.total': '小計',
    'field.subtotal': '合計（税抜）',
    'field.vat': '消費税 10%',
    'field.grandTotal': '総額',
    'role.viewer': '閲覧者（自己紹介は編集不可）',
    'role.editor': '編集者',
    'role.admin': '管理者（コードが必要）',
    'theme.light': 'ライト',
    'theme.dark': 'ダーク',
    'validation.required': '{field}は必須です',
    'validation.pattern': '{field}の形式が正しくありません',
    'validation.maxLength': '{field}は最大{maxLength}件までです',
    'action.save': '保存',
    'action.addLine': '明細を追加',
    'action.remove': '削除',
    'shell.errors': 'エラー {count} 件',
    'shell.submitted': '送信済み',
    'shell.payload': '送信データ',
    'shell.computed': '計算値',
    'shell.dropped': '未送信（非表示）',
    'shell.close': '閉じる',
  },
}

export const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
]

export type Translator = (key: string, params?: Record<string, unknown>) => string

/** A minimal translator: looks up the key and fills `{param}` placeholders. */
export function createTranslator(lang: Lang): Translator {
  return (key, params) =>
    (messages[lang][key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(params?.[name] ?? ''))
}

export const TranslatorContext = createContext<Translator>(createTranslator('en'))

/** For texts outside the form config (buttons in the layout shells). */
export const useT = () => useContext(TranslatorContext)
