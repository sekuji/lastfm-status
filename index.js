import fetch from 'node-fetch';
import dotenv from 'dotenv';
import express from 'express';
import nunjucks from 'nunjucks';

dotenv.config();

const app = express();
const PORT = 3000;

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_USERNAME = process.env.LASTFM_USERNAME;
const DEFAULT_COVER = 'https://res.cloudinary.com/dk5jbudni/image/upload/v1746998415/cover-placeholder_wk5psj.png';

if (!LASTFM_API_KEY || !LASTFM_USERNAME) {
    console.error('Missing LASTFM_API_KEY or LASTFM_USERNAME in environment variables.');
    process.exit(1);
}

// Visualization configuration
const CONFIG = {
    num_bars: 24,         // Fewer bars for cleaner look
    gap_size: 3,          // Slightly larger gap for better spacing
    bar_width: 5,         // Wider bars
    bar_color: 'rgb(201,215,227)', // Updated to silver/gray accent color
    bar_length: 12,       // Taller bars for more dynamic visualization
    get container_width() {
        return this.num_bars * this.bar_width + (this.num_bars - 1) * this.gap_size;
    }
};

// Truncate text to prevent overflow
function truncateText(text, maxWidth, charWidth = 7) {
    const maxChars = Math.floor(maxWidth / charWidth);
    return text.length > maxChars ? text.slice(0, maxChars - 3) + '...' : text;
}

// Convert image URL to Base64 for embedding in SVG
async function fetchImageAsBase64(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Error fetching image: ${response.status} ${response.statusText}`);
            return null;
        }
        const buffer = await response.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = response.headers.get('content-type');
        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error('Error converting image to Base64:', error.message);
        return null;
    }
}

// Fetch data from Last.fm API
async function getLastFmData() {
    try {
        const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USERNAME}&api_key=${LASTFM_API_KEY}&format=json&limit=1`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Error fetching data: ${response.status} ${response.statusText}`);
            return { error: 'Error fetching data' };
        }

        const data = await response.json();

        // Check if we have track data
        if (data.recenttracks?.track?.length > 0) {
            const track = data.recenttracks.track[0];
            const nowPlaying = track['@attr']?.nowplaying === 'true';
            
            // Get cover image, ignoring the Last.fm default image
            let coverUrl = null;
            if (track.image && track.image.length > 0) {
                const lastImage = track.image[track.image.length - 1]['#text'];
                // Check if it's the Last.fm default star image
                if (lastImage && !lastImage.includes('2a96cbd8b46e442fc41c2b86b821562f')) {
                    coverUrl = lastImage;
                }
            }
            
            // Use default cover if none provided
                let cover, isDefaultCover;
                if (coverUrl) {
                    cover = await fetchImageAsBase64(coverUrl);
                    isDefaultCover = false;
                } else {
                    cover = 'YOUR_BASE64_PLACEHOLDER'; // Replace this string later
                    isDefaultCover = true;
                }

                            if (nowPlaying) {
                return {
                    nowPlaying: true,
                    title: truncateText(track.name, 220),
                    artist: truncateText(track.artist['#text'], 185),
                    cover: cover || DEFAULT_COVER,
                    bar_color: CONFIG.bar_color,
                    bar_positions: Array.from({ length: CONFIG.num_bars }, 
                        (_, i) => i * (CONFIG.bar_width + CONFIG.gap_size)),
                    bar_width: CONFIG.bar_width,
                    bar_length: CONFIG.bar_length,
                    container_width: CONFIG.container_width,
                    num_bars: CONFIG.num_bars
                };
            } else {
                // Not currently playing
                return {
                    nowPlaying: false,
                    title: 'Not listening right now',
                    artist: 'Last.fm',
                    cover: DEFAULT_COVER,
                    bar_color: CONFIG.bar_color,
                    bar_positions: Array.from({ length: CONFIG.num_bars }, 
                        (_, i) => i * (CONFIG.bar_width + CONFIG.gap_size)),
                    bar_width: CONFIG.bar_width,
                    bar_length: CONFIG.bar_length,
                    container_width: CONFIG.container_width,
                    num_bars: CONFIG.num_bars
                };
            }
        } else {
            // No track data available
            return {
                nowPlaying: false,
                title: 'Not listening right now',
                artist: 'Last.fm Status',
                cover: DEFAULT_COVER,
                bar_color: CONFIG.bar_color,
                bar_positions: Array.from({ length: CONFIG.num_bars }, 
                    (_, i) => i * (CONFIG.bar_width + CONFIG.gap_size)),
                bar_width: CONFIG.bar_width,
                bar_length: CONFIG.bar_length,
                container_width: CONFIG.container_width
            };
        }
    } catch (error) {
        console.error('Error occurred:', error.message);
        // Return a graceful error state
        return {
            nowPlaying: false,
            title: 'Error fetching data',
            artist: 'Last.fm Status',
            cover: DEFAULT_COVER,
            bar_color: CONFIG.bar_color,
            bar_positions: Array.from({ length: CONFIG.num_bars }, 
                (_, i) => i * (CONFIG.bar_width + CONFIG.gap_size)),
            bar_width: CONFIG.bar_width,
            bar_length: CONFIG.bar_length,
            container_width: CONFIG.container_width
        };
    }
}

// Route for the main widget
app.get('/now-playing', async (req, res) => {
    const trackData = await getLastFmData();
    res.setHeader('Content-Type', 'image/svg+xml');
    res.render('now-playing.html.j2', trackData);
});

// Home route
app.get('/', (req, res) => {
    res.send('Welcome! Visit <a href="/now-playing">/now-playing</a> to see your Last.fm status.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});