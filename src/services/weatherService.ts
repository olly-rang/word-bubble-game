import type { Theme } from '../types';

export async function detectWeather(): Promise<Theme> {
    try {
        // We use a simple public endpoint to get weather based on IP
        const response = await fetch('https://wttr.in/?format=j1');
        const data = await response.json();
        const condition = data.current_condition[0].weatherDesc[0].value.toLowerCase();

        const hour = new Date().getHours();

        if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunder')) {
            return 'rainy';
        }

        if (hour >= 19 || hour < 6) {
            return 'night';
        }

        return 'sunny';
    } catch (error) {
        console.warn("Weather detection failed, falling back to time-based theme:", error);
        const hour = new Date().getHours();
        if (hour >= 19 || hour < 6) return 'night';
        return 'sunny';
    }
}
