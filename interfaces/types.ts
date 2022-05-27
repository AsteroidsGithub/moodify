import { type } from 'os';

export interface SpotifyTrack {
    id: string;
    name: string;
    duration_ms: number;
    popularity: number;
    artists: [
        {
            id: string;
            name: string;
        },
    ];
    album: {
        id: string;
        name: string;
        album_type: 'album' | 'single' | 'compilation';
        release_date: string;
        images: [
            {
                url: string;
                width: number;
                height: number;
            },
        ];
    };
}

export interface SpotifyTrackProperties {
    danceability: number;
    energy: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    speechiness: number;
    valence: number;
    tempo: number;
}

export type TrackProperty = keyof SpotifyTrackProperties;
