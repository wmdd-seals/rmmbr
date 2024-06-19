import type { Config } from 'tailwindcss'

export default {
    content: ['./index.html', './src/**/*.{ts,html}'],
    theme: {
        extend: {
            colors: {
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
