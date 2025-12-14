export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === '') {
    return `${fieldName}ต้องไม่เว้นว่าง`;
  }
  return null;
}

export function validateNumber(value: string | number, fieldName: string): string | null {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) {
    return `${fieldName}ต้องเป็นตัวเลข`;
  }
  return null;
}

export function validatePositive(value: number, fieldName: string): string | null {
  if (value <= 0) {
    return `${fieldName}ต้องมากกว่า 0`;
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  const phoneRegex = /^[0-9]{9,10}$/;
  if (!phoneRegex.test(phone)) {
    return 'เบอร์โทรศัพท์ไม่ถูกต้อง (9-10 หลัก)';
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'อีเมลไม่ถูกต้อง';
  }
  return null;
}

export function validatePrice(price: number): string | null {
  const error = validateNumber(price, 'ราคา');
  if (error) return error;
  return validatePositive(price, 'ราคา');
}

export function validateQuantity(quantity: number): string | null {
  const error = validateNumber(quantity, 'จำนวน');
  if (error) return error;
  if (quantity < 0) {
    return 'จำนวนต้องไม่ติดลบ';
  }
  return null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateForm(
  data: Record<string, any>,
  rules: Record<string, ((value: any) => string | null)[]>
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field];
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
