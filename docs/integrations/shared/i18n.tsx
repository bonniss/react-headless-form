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
    'field.settings': 'Settings',
    'field.newsletter': 'Newsletter',
    'field.theme': 'Theme',
    'field.addresses': 'Addresses',
    'field.street': 'Street',
    'field.city': 'City',
    'field.addressCount': 'Number of addresses',
    'role.viewer': 'Viewer (cannot edit bio)',
    'role.editor': 'Editor',
    'role.admin': 'Admin',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'validation.required': '{field} is required',
    'validation.pattern': '{field} is invalid',
    'action.save': 'Save',
    'action.add': 'Add address',
    'action.remove': 'Remove',
  },
  ja: {
    'field.name': '名前',
    'field.slug': 'スラッグ',
    'field.email': 'メールアドレス',
    'field.role': '役割',
    'field.adminCode': '管理者コード',
    'field.bio': '自己紹介',
    'field.settings': '設定',
    'field.newsletter': 'ニュースレター',
    'field.theme': 'テーマ',
    'field.addresses': '住所',
    'field.street': '番地',
    'field.city': '市区町村',
    'field.addressCount': '住所の数',
    'role.viewer': '閲覧者（自己紹介は編集不可）',
    'role.editor': '編集者',
    'role.admin': '管理者',
    'theme.light': 'ライト',
    'theme.dark': 'ダーク',
    'validation.required': '{field}は必須です',
    'validation.pattern': '{field}の形式が正しくありません',
    'action.save': '保存',
    'action.add': '住所を追加',
    'action.remove': '削除',
  },
}

/** A minimal translator: looks up the key and fills `{param}` placeholders. */
export function createTranslator(lang: Lang) {
  return (key: string, params?: Record<string, unknown>) =>
    (messages[lang][key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(params?.[name] ?? ''))
}

export const TranslatorContext = createContext(createTranslator('en'))

/** For texts outside the form config (buttons in the layout shells). */
export const useT = () => useContext(TranslatorContext)
