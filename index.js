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
const DEFAULT_COVER = 'data:image/png;base64,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';

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
                    cover = DEFAULT_COVER;
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
                    title: 'Awaiting music',
                    artist: 'Status • Offline',
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
    res.send('Visit <a href="/now-playing">/now-playing</a> to see my Last.fm status.');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});