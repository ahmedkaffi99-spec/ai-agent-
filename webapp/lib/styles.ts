import type { CSSProperties } from 'react';

export const colors = {
  bg: '#f5f6f8',
  surface: '#ffffff',
  border: '#d9dce1',
  text: '#1d2433',
  muted: '#667085',
  primary: '#2f3b52',
  primaryDark: '#1d2433',
  accent: '#3b6ef6',
  danger: '#c0362c',
  success: '#1a7f5a',
};

export const page: CSSProperties = {
  maxWidth: 980,
  margin: '0 auto',
  padding: '2rem 1.25rem 4rem',
};

export const pageTitle: CSSProperties = {
  fontSize: '1.6rem',
  fontWeight: 700,
  color: colors.text,
  margin: '0 0 0.25rem',
};

export const pageSubtitle: CSSProperties = {
  color: colors.muted,
  margin: '0 0 1.5rem',
  fontSize: '0.95rem',
};

export const card: CSSProperties = {
  border: `1px solid ${colors.border}`,
  borderRadius: 10,
  padding: '1.25rem 1.5rem',
  marginBottom: '1.5rem',
  background: colors.surface,
  boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
};

export const cardTitle: CSSProperties = {
  marginTop: 0,
  marginBottom: '1rem',
  fontSize: '1.05rem',
  fontWeight: 600,
  color: colors.text,
};

export const table: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.92rem',
};

export const th: CSSProperties = {
  textAlign: 'left',
  borderBottom: `2px solid ${colors.primary}`,
  padding: '0.5rem 0.6rem',
  background: '#f2f4f7',
  color: colors.text,
  fontWeight: 600,
};

export const td: CSSProperties = {
  borderBottom: `1px solid ${colors.border}`,
  padding: '0.45rem 0.6rem',
  color: colors.text,
};

export const totalRow: CSSProperties = {
  fontWeight: 700,
  background: '#eef1f5',
};

export const label: CSSProperties = {
  display: 'block',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: colors.muted,
  marginBottom: '0.3rem',
};

export const input: CSSProperties = {
  border: `1px solid ${colors.border}`,
  borderRadius: 6,
  padding: '0.45rem 0.6rem',
  width: '100%',
  fontSize: '0.92rem',
  color: colors.text,
  background: colors.surface,
};

export const select: CSSProperties = { ...input };

export const button: CSSProperties = {
  border: `1px solid ${colors.primary}`,
  background: colors.primary,
  color: '#fff',
  borderRadius: 6,
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 600,
};

export const buttonSecondary: CSSProperties = {
  ...button,
  background: colors.surface,
  color: colors.primary,
};

export const buttonDanger: CSSProperties = {
  ...buttonSecondary,
  border: `1px solid ${colors.danger}`,
  color: colors.danger,
};

export const errorText: CSSProperties = {
  color: colors.danger,
  background: '#fdf1f0',
  border: '1px solid #f3d3d0',
  borderRadius: 6,
  padding: '0.5rem 0.75rem',
  marginBottom: '1rem',
  fontSize: '0.9rem',
};

export const toolbar: CSSProperties = {
  display: 'flex',
  gap: '0.6rem',
  alignItems: 'center',
  marginBottom: '1.5rem',
  flexWrap: 'wrap',
};
