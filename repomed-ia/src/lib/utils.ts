import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string | number): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, "")
  
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i)
  }
  let digit1 = (sum * 10) % 11
  if (digit1 === 10) digit1 = 0
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i)
  }
  let digit2 = (sum * 10) % 11
  if (digit2 === 10) digit2 = 0
  
  return digit1 === parseInt(cpf[9]) && digit2 === parseInt(cpf[10])
}

export function validateCRM(crm: string): boolean {
  // Validação básica de CRM: formato UF/NÚMERO
  const crmPattern = /^[A-Z]{2}\/?\d{4,6}$/
  return crmPattern.test(crm.replace(/\s+/g, ""))
}

export function maskCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, "")
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

export function maskPhone(phone: string): string {
  phone = phone.replace(/[^\d]/g, "")
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
  }
  return phone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
}

export const medicalSpecialties = [
  'Clínica Geral',
  'Pediatria',
  'Ginecologia e Obstetrícia',
  'Cardiologia',
  'Dermatologia',
  'Ortopedia',
  'Neurologia',
  'Psiquiatria',
  'Endocrinologia',
  'Gastroenterologia',
  'Otorrinolaringologia',
  'Oftalmologia',
  'Urologia',
  'Oncologia',
  'Radiologia',
  'Anestesiologia',
  'Cirurgia Geral',
  'Medicina Intensiva',
  'Geriatria',
  'Infectologia'
] as const

export type MedicalSpecialty = typeof medicalSpecialties[number]