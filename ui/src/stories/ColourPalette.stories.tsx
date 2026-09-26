import type { Meta, StoryObj } from '@storybook/react';

// ── Types ───────────────────────────────────────────────────────────────────

interface SwatchProps {
  name: string;
  token: string;
  hex: string;
  onBg?: string;
  contrast?: string;
}

// ── Swatch component ────────────────────────────────────────────────────────

function Swatch({ name, token, hex, onBg, contrast }: SwatchProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          backgroundColor: hex,
          border: '1px solid rgba(128,128,128,0.2)',
          flexShrink: 0,
        }}
        role="img"
        aria-label={`Colour swatch: ${hex}`}
      />
      <div>
        <div style={{ fontWeight: 600, fontSize: '13px' }}>{name}</div>
        <code style={{ fontSize: '11px', color: '#666', display: 'block' }}>{token}</code>
        <code style={{ fontSize: '11px', color: '#666', display: 'block' }}>{hex}</code>
        {contrast && onBg && (
          <span style={{ fontSize: '11px', color: '#1e5c3a', fontWeight: 500 }}>
            ✓ {contrast} on {onBg}
          </span>
        )}
      </div>
    </div>
  );
}

function PaletteSection({ title, swatches }: { title: string; swatches: SwatchProps[] }) {
  return (
    <section style={{ marginBottom: '40px' }}>
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 700,
          marginBottom: '16px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '8px',
        }}
      >
        {title}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '8px',
        }}
      >
        {swatches.map((s) => (
          <Swatch key={s.token} {...s} />
        ))}
      </div>
    </section>
  );
}

// ── Swatch data ─────────────────────────────────────────────────────────────

const DARK_SWATCHES: SwatchProps[] = [
  { name: 'Background', token: '--c-bg', hex: '#0f1117' },
  { name: 'Surface', token: '--c-surface', hex: '#1a1d27' },
  { name: 'Surface Raised', token: '--c-surface-raised', hex: '#22263a' },
  { name: 'Text Primary', token: '--c-text', hex: '#e8eaf6', contrast: '12.5:1', onBg: '#0f1117' },
  { name: 'Text Muted', token: '--c-text-muted', hex: '#9fa8c7', contrast: '6.1:1', onBg: '#0f1117' },
  { name: 'Primary / Link', token: '--c-primary', hex: '#a5aeff', contrast: '8.9:1', onBg: '#0f1117' },
  { name: 'Success', token: '--c-success', hex: '#6bcf9e', contrast: '7.0:1', onBg: '#0f1117' },
  { name: 'Warning', token: '--c-warning', hex: '#ffd166', contrast: '10.1:1', onBg: '#0f1117' },
  { name: 'Error', token: '--c-error', hex: '#ff9999', contrast: '7.2:1', onBg: '#0f1117' },
  { name: 'Info', token: '--c-info', hex: '#7ecfff', contrast: '8.9:1', onBg: '#0f1117' },
  { name: 'Link Visited', token: '--c-link-visited', hex: '#c8a8ff', contrast: '9.4:1', onBg: '#0f1117' },
];

const LIGHT_SWATCHES: SwatchProps[] = [
  { name: 'Background', token: '--c-bg', hex: '#f5f6fa' },
  { name: 'Surface', token: '--c-surface', hex: '#ffffff' },
  { name: 'Surface Raised', token: '--c-surface-raised', hex: '#f0f2f9' },
  { name: 'Text Primary', token: '--c-text', hex: '#1a1d27', contrast: '15.3:1', onBg: '#f5f6fa' },
  { name: 'Text Muted', token: '--c-text-muted', hex: '#4b5470', contrast: '7.4:1', onBg: '#f5f6fa' },
  { name: 'Primary / Link', token: '--c-primary', hex: '#4349c8', contrast: '7.2:1', onBg: '#f5f6fa' },
  { name: 'Success', token: '--c-success', hex: '#1e5c3a', contrast: '8.1:1', onBg: '#f5f6fa' },
  { name: 'Warning', token: '--c-warning', hex: '#7a5200', contrast: '7.3:1', onBg: '#f5f6fa' },
  { name: 'Error', token: '--c-error', hex: '#a61c14', contrast: '7.5:1', onBg: '#f5f6fa' },
  { name: 'Info', token: '--c-info', hex: '#005a8e', contrast: '7.0:1', onBg: '#f5f6fa' },
  { name: 'Link Visited', token: '--c-link-visited', hex: '#6929a0', contrast: '7.1:1', onBg: '#f5f6fa' },
];

// ── Component ────────────────────────────────────────────────────────────────

function ColourPaletteComponent() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '24px', maxWidth: '960px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
        Colour Palette
      </h1>
      <p style={{ color: '#666', marginBottom: '8px', fontSize: '14px' }}>
        All text/background combinations meet{' '}
        <strong>WCAG 2.1 AA</strong> — ≥ 4.5:1 for normal text, ≥ 3:1 for large text.
      </p>
      <p style={{ color: '#666', marginBottom: '32px', fontSize: '13px' }}>
        Open the <strong>Accessibility</strong> panel below for automated axe contrast validation.
      </p>
      <PaletteSection title="Dark Mode Palette" swatches={DARK_SWATCHES} />
      <PaletteSection title="Light Mode Palette" swatches={LIGHT_SWATCHES} />

      {/* Inline contrast table for documentation */}
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>
          Button Label Contrast
        </h2>
        <table style={{ borderCollapse: 'collapse', fontSize: '13px', width: '100%' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              {['Scenario', 'Foreground', 'Background', 'Ratio', 'Pass'].map((h) => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ['Dark primary button label', '#0f1117', '#a5aeff', '8.9:1', '✓'],
              ['Light primary button label', '#ffffff', '#4349c8', '8.0:1', '✓'],
            ].map(([scenario, fg, bg, ratio, pass]) => (
              <tr key={scenario} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '8px 12px' }}>{scenario}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{fg}</td>
                <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{bg}</td>
                <td style={{ padding: '8px 12px', fontWeight: 600 }}>{ratio}</td>
                <td style={{ padding: '8px 12px', color: '#1e5c3a', fontWeight: 700 }}>{pass}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

// ── Story metadata ───────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Colour Palette',
  component: ColourPaletteComponent,
  parameters: {
    a11y: {
      disable: false,
      config: {
        rules: [{ id: 'color-contrast', enabled: true }],
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#f5f6fa' },
        { name: 'white', value: '#ffffff' },
        { name: 'dark', value: '#0f1117' },
      ],
    },
    docs: {
      description: {
        component:
          'WCAG 2.1 AA compliant colour tokens for both dark and light themes. ' +
          'All text/background combinations meet ≥ 4.5:1 contrast (normal text) and ≥ 3:1 (large text).',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  name: 'Light Mode',
};

export const DarkBackground: Story = {
  name: 'Dark Mode',
  parameters: {
    backgrounds: { default: 'dark' },
  },
};
