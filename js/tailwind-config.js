tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
            display: ['Space Grotesk', 'sans-serif'],
          },
          colors: {
            hero: {
              indigo: '#2D2654',
              violet: '#5B3281',
              crimson: '#D9536F',
            },
            surface: {
              body: '#F8F9FC',
              card: '#FFFFFF',
              border: '#E0E5F5',
            },
            text: {
              heading: '#1E1B2E',
              body: '#64748B',
              inverse: '#FFFFFF',
            },
            accent: {
              purple: '#7C3AED',
              pink: '#E11D48',
              teal: '#0D9488',
            },
            canvas: { dark: '#1E1B2E' },
            indigo: {50:'#F5F3FF',100:'#EDE9FE',200:'#DDD6FE',300:'#C4B5FD',400:'#A78BFA',500:'#8B5CF6',600:'#7C3AED',700:'#6D28D9',800:'#5B21B6',900:'#2D2654'}, purple: {50:'#F5F3FF',100:'#EDE9FE',200:'#DDD6FE',300:'#C4B5FD',400:'#A78BFA',500:'#8B5CF6',600:'#7C3AED',700:'#6D28D9',800:'#5B21B6',900:'#2D2654'}, pink: {50:'#FFF1F2',100:'#FFE4E6',200:'#FECDD3',300:'#FDA4AF',400:'#FB7185',500:'#F43F5E',600:'#E11D48',700:'#BE123C',800:'#9F1239',900:'#881337'},
          },
          animation: {
            'float': 'float 6s ease-in-out infinite',
            'float-delayed': 'float 7s ease-in-out 2s infinite',
            'float-reverse': 'floatReverse 5.5s ease-in-out 1s infinite',
            'pulse-ring': 'pulseRing 2.5s ease-in-out infinite',
            'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
            'fade-up-delayed': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
            'fade-up-delayed-2': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
            'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
            'gradient-shift': 'gradientShift 8s ease infinite',
          },
          keyframes: {
            float: {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-14px)' },
            },
            floatReverse: {
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
              '50%': { transform: 'translateY(10px) rotate(-2deg)' },
            },
            pulseRing: {
              '0%, 100%': { opacity: '0.3', transform: 'scale(1)' },
              '50%': { opacity: '0.08', transform: 'scale(1.15)' },
            },
            fadeUp: {
              '0%': { opacity: '0', transform: 'translateY(24px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            slideInRight: {
              '0%': { opacity: '0', transform: 'translateX(30px)' },
              '100%': { opacity: '1', transform: 'translateX(0)' },
            },
            gradientShift: {
              '0%, 100%': { backgroundPosition: '0% 50%' },
              '50%': { backgroundPosition: '100% 50%' },
            },
          },
        },
      },
    }
