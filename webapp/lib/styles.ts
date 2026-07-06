import type { CSSProperties } from 'react';

export const card: CSSProperties = {
  border: '1px solid #d0d5dd',
  borderRadius: 8,
  padding: '1rem 1.25rem',
  marginBottom: '1.5rem',
  background: '#fff',
};

export const table: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.92rem',
};

export const th: CSSProperties = {
  textAlign: 'left',
  borderBottom: '2px solid #344054',
  padding: '0.4rem 0.5rem',
  background: '#f2f4f7',
};

export const td: CSSProperties = {
  borderBottom: '1px solid #eaecf0',
  padding: '0.35rem 0.5rem',
};

export const totalRow: CSSProperties = {
  fontWeight: 700,
  background: '#f9fafb',
};

export const input: CSSProperties = {
  border: '1px solid #d0d5dd',
  borderRadius: 4,
  padding: '0.3rem 0.5rem',
  width: '100%',
};

export const button: CSSProperties = {
  border: '1px solid #344054',
  background: '#344054',
  color: '#fff',
  borderRadius: 4,
  padding: '0.4rem 0.8rem',
  cursor: 'pointer',
};

export const buttonSecondary: CSSProperties = {
  ...button,
  background: '#fff',
  color: '#344054',
};
