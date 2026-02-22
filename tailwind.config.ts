import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // =============================================
        // PALETA ANDINA - Seismiles Textil
        // Inspirada en el altiplano catamarqueno
        // =============================================

        // Volcanic Brown - texto principal, fondos oscuros
        volcanic: {
          50: '#FAF8F6',
          100: '#F0ECE8',
          200: '#DDD6CE',
          300: '#C4B8AA',
          400: '#A89A88',
          500: '#8B7355',
          600: '#6B5B45',
          700: '#524637',
          800: '#3D342A',
          900: '#2C2420',
          950: '#1A1614',
        },

        // Terracotta - acento principal, CTAs, highlights
        terra: {
          50: '#FDF5F2',
          100: '#FAEAE3',
          200: '#F3CFC2',
          300: '#E9AD97',
          400: '#DC8A6C',
          500: '#C75B39',
          600: '#A04830',
          700: '#7E3826',
          800: '#5E2A1D',
          900: '#3E1C13',
          950: '#270F0A',
        },

        // Sand/Cream - fondos principales
        sand: {
          50: '#FDFCFA',
          100: '#FAF8F4',
          200: '#F5F0E8',
          300: '#EDE5D8',
          400: '#DDD2C0',
          500: '#C8B99F',
          600: '#A89A7E',
          700: '#8A7D64',
          800: '#6B604D',
          900: '#4D4538',
          950: '#2F2A22',
        },

        // Colores legacy (backward compat con componentes existentes)
        primary: {
          50: '#FAF8F6',
          100: '#F0ECE8',
          200: '#DDD6CE',
          300: '#C4B8AA',
          400: '#A89A88',
          500: '#2C2420',
          600: '#241E1A',
          700: '#1C1714',
          800: '#14100E',
          900: '#0C0A08',
          950: '#060504',
        },
        secondary: {
          50: '#FDF5F2',
          100: '#FAEAE3',
          200: '#F3CFC2',
          300: '#E9AD97',
          400: '#DC8A6C',
          500: '#C75B39',
          600: '#A04830',
          700: '#7E3826',
          800: '#5E2A1D',
          900: '#3E1C13',
          950: '#270F0A',
        },
        accent: {
          50: '#FDF5F2',
          100: '#FAEAE3',
          200: '#F3CFC2',
          300: '#E9AD97',
          400: '#DC8A6C',
          500: '#C75B39',
          600: '#A04830',
          700: '#7E3826',
          800: '#5E2A1D',
          900: '#3E1C13',
          950: '#270F0A',
        },
        teal: {
          50: '#FAF8F6',
          100: '#F0ECE8',
          200: '#DDD6CE',
          300: '#C4B8AA',
          400: '#A89A88',
          500: '#8B7355',
          600: '#6B5B45',
          700: '#524637',
          800: '#3D342A',
          900: '#2C2420',
          950: '#1A1614',
        },

        background: '#FAFAF8',
        surface: '#FFFFFF',
        foreground: {
          DEFAULT: '#2C2420',
          secondary: '#6B5B45',
          muted: '#A89A88',
        },
        success: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
        border: {
          DEFAULT: '#EDE5D8',
          light: '#F5F0E8',
          dark: '#C4B8AA',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"DM Serif Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '400' }],
        'display-xl': ['3.75rem', { lineHeight: '1.08', letterSpacing: '-0.02em', fontWeight: '400' }],
        'display-lg': ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '400' }],
        'display-md': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '400' }],
        'display-sm': ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '400' }],
        'display-xs': ['1.5rem', { lineHeight: '1.3', fontWeight: '400' }],
        'body-xl': ['1.25rem', { lineHeight: '1.7' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body-md': ['1rem', { lineHeight: '1.7' }],
        'body-sm': ['0.875rem', { lineHeight: '1.6' }],
        'body-xs': ['0.75rem', { lineHeight: '1.5' }],
      },

      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },

      boxShadow: {
        'card': '0 1px 3px 0 rgb(44 36 32 / 0.04), 0 1px 2px -1px rgb(44 36 32 / 0.04)',
        'card-hover': '0 4px 6px -1px rgb(44 36 32 / 0.07), 0 2px 4px -2px rgb(44 36 32 / 0.05)',
        'elevated': '0 10px 15px -3px rgb(44 36 32 / 0.08), 0 4px 6px -4px rgb(44 36 32 / 0.04)',
        'modal': '0 25px 50px -12px rgb(44 36 32 / 0.15)',
      },

      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee 30s linear infinite reverse',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },

      backgroundImage: {
        'gradient-volcanic': 'linear-gradient(135deg, #2C2420 0%, #3D342A 100%)',
        'gradient-terra': 'linear-gradient(135deg, #C75B39 0%, #DC8A6C 100%)',
        'gradient-sand': 'linear-gradient(135deg, #FAF8F4 0%, #F5F0E8 100%)',
      },
    },
  },
  plugins: [],
}

export default config
