import { createContext, useContext } from 'react'

export type Lang = 'en' | 'ja'

const messages: Record<Lang, Record<string, string>> = {
  en: {
    title: 'Conference registration',
    'field.name': 'Full name',
    'field.email': 'Email',
    'field.ticket': 'Ticket',
    'field.studentId': 'Student ID',
    'field.promoCode': 'Promo code',
    'field.guests': 'Guests',
    'field.guestName': 'Guest name',
    'field.invoice': 'I need an invoice',
    'field.billing': 'Billing',
    'field.company': 'Company',
    'field.taxId': 'Tax ID',
    'field.total': 'Total ($)',
    'ticket.standard': 'Standard: $100',
    'ticket.student': 'Student: $50',
    'hint.email': 'you@company.com',
    'hint.promoCode': 'Not for student tickets',
    'validation.required': '{field} is required',
    'validation.pattern': '{field} is invalid',
    'validation.maxLength': '{field}: at most {maxLength}',
    'action.save': 'Register',
    'action.addGuest': 'Add guest',
    'action.remove': 'Remove',
    'shell.errors': '{count} errors',
    'shell.submitted': 'Submitted',
    'shell.payload': 'Submitted payload',
    'shell.computed': 'computed',
    'shell.dropped': 'Not submitted (hidden)',
    'shell.close': 'Close',
  },
  ja: {
    title: 'カンファレンス参加登録',
    'field.name': '氏名',
    'field.email': 'メールアドレス',
    'field.ticket': 'チケット',
    'field.studentId': '学籍番号',
    'field.promoCode': 'プロモコード',
    'field.guests': '同伴者',
    'field.guestName': '同伴者名',
    'field.invoice': '請求書が必要',
    'field.billing': '請求先',
    'field.company': '会社名',
    'field.taxId': '登録番号',
    'field.total': '合計 ($)',
    'ticket.standard': '一般: $100',
    'ticket.student': '学生: $50',
    'hint.email': 'you@example.jp',
    'hint.promoCode': '学生チケットには使えません',
    'validation.required': '{field}は必須です',
    'validation.pattern': '{field}の形式が正しくありません',
    'validation.maxLength': '{field}は最大{maxLength}名までです',
    'action.save': '登録する',
    'action.addGuest': '同伴者を追加',
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

/** For texts outside the form config (title, buttons); a real app uses its i18n hook. */
export const useT = () => useContext(TranslatorContext)
