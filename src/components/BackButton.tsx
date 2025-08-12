'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({ 
  href = '/', 
  label = 'กลับหน้าหลัก',
  className = ''
}: BackButtonProps) {
  return (
    <Link 
      href={href} 
      className={`inline-flex items-center gap-2 text-[var(--coffee-brown)] hover:text-[var(--coffee-brown-dark)] transition-colors duration-200 font-medium ${className}`}
    >
      <ArrowLeft className="w-5 h-5" />
      {label}
    </Link>
  );
}
