import type { Config } from 'tailwindcss'

export default {
    content: ['./src/**/*.{ts,html}'],
    theme: {
        extend: {
            backgroundImage: {
                cta: 'radial-gradient(818.93% 100% at 100% 50%, #242759 0%, #464BAA 100%)',
                'cta-hover': 'radial-gradient(818.93% 100% at 100% 50%, #353980 0%, #646ADB 100%)',
                'cta-active': 'radial-gradient(818.93% 100% at 100% 50%, #242759 0%, #353980 100%)',
                'cta-focus': 'radial-gradient(818.93% 100% at 100% 50%, #242759 0%, #464BAA 100%)'
            },
            boxShadow: {
                'input-focus': '0px 0px 8px 0px #646ADB',
                cta: '0px 4px 12px 0px rgba(0, 0, 0, 0.25), 0px -3px 16px 0px #575ED5 inset',
                'cta-active': '0px 4px 12px 0px rgba(0, 0, 0, 0.25), 0px -3px 16px 0px #575ED5 inset',
                'cta-focus': '0px -3px 16px 0px #575ED5 inset'
            },
            colors: {
                ui: {
                    50: '#F6F7FA',
                    100: '#EDEEF5',
                    150: '#E6E8F0',
                    200: '#D5D9E5',
                    300: '#B4BCCC',
                    400: '#929EB2',
                    500: '#718299'
                },
                type: {
                    50: '#111433',
                    100: '#14213B',
                    200: '#2B3C5F',
                    300: '#4B6384',
                    400: '#7389A8',
                    500: '#A3B4CC'
                },
                basketball: {
                    50: '#FDEDE7',
                    100: '#FCE0D4',
                    200: '#F8BEA7',
                    300: '#F59C79',
                    400: '#F17645',
                    500: '#E64F12',
                    600: '#BF410F',
                    700: '#98340C',
                    800: '#742809',
                    900: '#511B06',
                    950: '#301104'
                },
                'pale-marigold': {
                    50: '#FFF8EC',
                    100: '#FFF3DC',
                    200: '#FFE7B9',
                    300: '#FEDB96',
                    400: '#FECF73',
                    500: '#FEC350',
                    600: '#FEB323',
                    700: '#E69801',
                    800: '#AC7201',
                    900: '#734C01',
                    950: '#392600'
                },
                'thick-blue': {
                    50: '#F0F0FA',
                    100: '#E3E4F7',
                    200: '#C7C9EF',
                    300: '#ABAEE8',
                    400: '#9093E2',
                    500: '#646ADB',
                    600: '#575ED5',
                    700: '#464BAA',
                    800: '#353980',
                    900: '#242759',
                    950: '#151734'
                }
            }
        }
    },
    plugins: []
} satisfies Config
