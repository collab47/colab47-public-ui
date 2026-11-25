export interface CountryDialCodeOption {
  iso: string;
  country: string;
  dialCode: string;
}

export function getCountryFlagSrc(iso: string): string {
  return `/images/flags/${iso.toLowerCase()}.svg`;
}

export const COUNTRY_DIAL_CODES: readonly CountryDialCodeOption[] = [
  { iso: 'IN', country: 'India', dialCode: '+91' },
  { iso: 'US', country: 'United States', dialCode: '+1' },
  { iso: 'GB', country: 'United Kingdom', dialCode: '+44' },
  { iso: 'AE', country: 'United Arab Emirates', dialCode: '+971' },
  { iso: 'SG', country: 'Singapore', dialCode: '+65' },
  { iso: 'AU', country: 'Australia', dialCode: '+61' },
  { iso: 'CA', country: 'Canada', dialCode: '+1' },
  { iso: 'DE', country: 'Germany', dialCode: '+49' },
  { iso: 'FR', country: 'France', dialCode: '+33' },
  { iso: 'JP', country: 'Japan', dialCode: '+81' },
  { iso: 'KR', country: 'South Korea', dialCode: '+82' },
  { iso: 'CN', country: 'China', dialCode: '+86' },
  { iso: 'NL', country: 'Netherlands', dialCode: '+31' },
  { iso: 'CH', country: 'Switzerland', dialCode: '+41' },
  { iso: 'SE', country: 'Sweden', dialCode: '+46' },
  { iso: 'IL', country: 'Israel', dialCode: '+972' },
  { iso: 'SA', country: 'Saudi Arabia', dialCode: '+966' },
  { iso: 'QA', country: 'Qatar', dialCode: '+974' },
  { iso: 'OM', country: 'Oman', dialCode: '+968' },
  { iso: 'KW', country: 'Kuwait', dialCode: '+965' },
  { iso: 'MY', country: 'Malaysia', dialCode: '+60' },
  { iso: 'ID', country: 'Indonesia', dialCode: '+62' },
  { iso: 'TH', country: 'Thailand', dialCode: '+66' },
  { iso: 'VN', country: 'Vietnam', dialCode: '+84' },
  { iso: 'PH', country: 'Philippines', dialCode: '+63' },
  { iso: 'NP', country: 'Nepal', dialCode: '+977' },
  { iso: 'LK', country: 'Sri Lanka', dialCode: '+94' },
  { iso: 'BD', country: 'Bangladesh', dialCode: '+880' },
  { iso: 'BT', country: 'Bhutan', dialCode: '+975' },
  { iso: 'IT', country: 'Italy', dialCode: '+39' },
  { iso: 'ES', country: 'Spain', dialCode: '+34' },
  { iso: 'IE', country: 'Ireland', dialCode: '+353' },
  { iso: 'PL', country: 'Poland', dialCode: '+48' },
  { iso: 'NZ', country: 'New Zealand', dialCode: '+64' },
  { iso: 'BR', country: 'Brazil', dialCode: '+55' },
  { iso: 'MX', country: 'Mexico', dialCode: '+52' },
  { iso: 'ZA', country: 'South Africa', dialCode: '+27' },
  { iso: 'KE', country: 'Kenya', dialCode: '+254' },
  { iso: 'NG', country: 'Nigeria', dialCode: '+234' },
] as const;
