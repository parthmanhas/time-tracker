/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ["class"],
	content: [
		"./index.html",
		"./src/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			animation: {
				'spin-slow': 'spin 20s linear infinite',
				'scan': 'scan 3s linear infinite',
				'assemble': 'assemble 2s ease-out forwards',
				'fade-in': 'fadeIn 2s ease-out forwards',
				'slide-in': 'slideIn 2s ease-out forwards',
				'fade-in': 'fade-in 1s ease-out',
				'fade-in-up': 'fade-in-up 1s ease-out',
				'scan': 'scan 8s linear infinite',
				'scan-reverse': 'scan-reverse 12s linear infinite',
			},
			keyframes: {
				scan: {
					'0%': { transform: 'translateY(0)' },
					'100%': { transform: 'translateY(100vh)' },
					'from': { transform: 'translateY(-100%)' },
					'to': { transform: 'translateY(100vh)' },
				},
				assemble: {
					'0%': { 
						opacity: '0',
						transform: 'translate(-150%, -150%) scale(1.2)'
					},
					'100%': { 
						opacity: '1',
						transform: 'translate(-50%, -50%) scale(1)'
					}
				},
				assembleInner: {
					'0%': { 
						opacity: '0',
						transform: 'translate(50%, 50%) scale(1.2)'
					},
					'100%': { 
						opacity: '1',
						transform: 'translate(-50%, -50%) scale(1)'
					}
				},
				hourHand: {
					'0%': { 
						opacity: '0',
						transform: 'translate(-150%, 50%) rotate(var(--rotate))'
					},
					'100%': { 
						opacity: '1',
						transform: 'translate(-50%, 0) rotate(var(--rotate))'
					}
				},
				minuteHand: {
					'0%': { 
						opacity: '0',
						transform: 'translate(50%, -150%) rotate(var(--rotate))'
					},
					'100%': { 
						opacity: '1',
						transform: 'translate(-50%, 0) rotate(var(--rotate))'
					}
				},
				secondHand: {
					'0%': { 
						opacity: '0',
						transform: 'translate(-50%, 100%) rotate(var(--rotate))'
					},
					'100%': { 
						opacity: '1',
						transform: 'translate(-50%, 0) rotate(var(--rotate))'
					}
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				slideIn: {
					'0%': { 
						opacity: '0',
						transform: 'translate(-50%, -50%) rotate(var(--rotate)) translateY(-100vh)'
					},
					'100%': { 
						opacity: '1',
						transform: 'translate(-50%, -50%) rotate(var(--rotate)) translateY(0)'
					}
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'scan-reverse': {
					'from': { transform: 'translateX(-100%)' },
					'to': { transform: 'translateX(100vw)' },
				},
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require('@tailwindcss/typography')
	],
}

