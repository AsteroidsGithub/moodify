import axios from "axios";
import type { NextPage } from "next";
import { stringify } from "qs";
import { useEffect, useState } from "react";
import PropertySlider from '../components/propertySlider';
import useSharedState from '../hooks/useSharedState';
import { SpotifyTrack } from '../interfaces/types';

const BaseStep: React.FC = () => {
  const { authToken, seedTracks, setSeedTracks } = useSharedState();
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);

  const handleSeedTrackChange = (track: SpotifyTrack) => {
    seedTracks.find((t) => t.id === track.id)
      ? seedTracks.splice(seedTracks.indexOf(track), 1)
      : seedTracks.push(track);
    setSeedTracks([...seedTracks]);
  };

  return (
    <div className="p-4">
      <h1>Let's get a taste of what you like</h1>
      <p>Please select upto 5 Songs that you're enjoying right now so we can tailor our results</p>

      <input
        type="text"
        className="w-full bg-gray-100 p-2 my-2"
        onChange={async (event) => {
          event.preventDefault();

          if (event.target.value.length < 1) return setSearchResults([]);

          const { data } = await axios.get('https://api.spotify.com/v1/search', {
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },

            params: {
              limit: 20,
              type: 'track',
              q: event.target.value,
            },
          });

          return setSearchResults(data.tracks.items);
        }}
        placeholder="Search for a song"
      />

      <div className="space-y-2">
        {seedTracks.map((track) => (
          <div className="flex h-16 bg-yellow-300" onClick={() => handleSeedTrackChange(track)}>
            <img src={track.album.images[0].url} />
            <div className="flex flex-col px-2">
              <h3>{track.name}</h3>
              <p>{track.artists[0].name}</p>
            </div>
          </div>
        ))}

        {searchResults
          .filter((track) => !seedTracks.find((t) => t.id === track.id))
          .map((track) => (
            <div className="flex h-16" onClick={() => handleSeedTrackChange(track)}>
              <img src={track.album.images[0].url} />
              <div className="flex flex-col px-2">
                <h3>{track.name}</h3>
                <p>{track.artists[0].name}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

const CharacterStep: React.FC = () => {
  const { authToken, setSeedGenre, seedGenre, musicProperties, setMusicProperties } =
    useSharedState();

  const [searchResults, setSearchResults] = useState<string[]>([]);

  const handleGenreSelect = (genre: string) => {
    seedGenre.find((g) => g === genre)
      ? seedGenre.splice(seedGenre.indexOf(genre), 1)
      : seedGenre.push(genre);
    setSeedGenre([...seedGenre]);
  };

  return (
    <div className="p-4">
      <h1>How should our recommendations sound?</h1>
      <p>Adjust the sliders to find the perfect mood, tempo, and energy for you</p>
      <div className="my-2">
        <h2>Genre</h2>
        <input
          type="text"
          className="w-full bg-gray-100 p-2 my-2"
          onChange={async (event) => {
            event.preventDefault();

            if (event.target.value.length < 1) return setSearchResults([]);

            const { data } = await axios.get(
              'https://api.spotify.com/v1/recommendations/available-genre-seeds',
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              },
            );

            return setSearchResults(
              data.genres.filter((g: string) => g.startsWith(event.target.value)),
            );
          }}
          placeholder="Search for a song"
        />
        <ul>
          {seedGenre.map((genre) => (
            <li className="bg-yellow-300" onClick={() => handleGenreSelect(genre)}>
              {genre}
            </li>
          ))}
          {searchResults.slice(0, 5).map((genre) => (
            <li onClick={() => handleGenreSelect(genre)}>{genre}</li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col space-y-2">
        <h2>Emotion</h2>

        <PropertySlider property="valence" minLabel="Sad" maxLabel="Happy" />
        <PropertySlider property="liveness" minLabel="Low" maxLabel="High" />

        <h2>Pace</h2>

        <PropertySlider property="energy" minLabel="Low" maxLabel="High" />
        <PropertySlider
          property="tempo"
          minLabel="60 bpm"
          maxLabel="180 bpm"
          min={60}
          max={180}
          step={1}
        />

        <h2>Sound</h2>

        <PropertySlider property="instrumentalness" minLabel="Low" maxLabel="High" />
        <PropertySlider property="acousticness" minLabel="Low" maxLabel="High" />
        <PropertySlider property="speechiness" minLabel="Low" maxLabel="High" />
      </div>
    </div>
  );
};

const ResultsStep: React.FC = () => {
  const {
    authToken,
    seedTracks,
    seedGenre,
    musicProperties,
    setRecommendations,
    recommendations,
  } = useSharedState();
  useEffect(() => {
    const fetchRecommendations = async () => {
      console.log(seedTracks.map((t) => t.artists[0].id).join(","));
      console.log(seedTracks.map((t) => t.id).join(","));
      const { data } = await axios.get(
        "https://api.spotify.com/v1/recommendations",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          params: {
            limit: 20,
            market: "US",
            seed_artists: seedTracks.map((t) => t.artists[0].id).join(","),
            seed_tracks: seedTracks.map((t) => t.id).join(","),
            seed_genres: seedGenre.join(","),
            target_valence: musicProperties.valence,
            target_energy: musicProperties.energy,
            target_liveness: musicProperties.liveness,
            target_acousticness: musicProperties.acousticness,
            target_instrumentalness: musicProperties.instrumentalness,
            target_speechiness: musicProperties.speechiness,
            target_tempo: musicProperties.tempo,
          },
        }
      );
      setRecommendations(data.tracks);
    };
    fetchRecommendations();
  }, [seedTracks]);

  return (
    <div className="p-4">
      <h1>and... TADA!</h1>
      <p>
        We've got your recommendations, here are some of the songs that fit what
        you want to listen to
      </p>

      {recommendations.map((track) => (
        <div className="flex h-16">
          <img src={track.album.images[0].url} />
          <div className="flex flex-col px-2">
            <h3>{track.name}</h3>
            <p>{track.artists[0].name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const Home: NextPage<{
  authToken: string;
}> = ({ authToken }) => {
  const { formStep, setFormStep, setAuthToken } = useSharedState();

  useEffect(() => setAuthToken(authToken), [authToken]);

  return (
    <div className=" flex-col h-screen w-screen">
      <div className="flex-grow">
        {
          {
            0: <BaseStep />,
            1: <CharacterStep />,
            2: <ResultsStep />,
          }[formStep]
        }
      </div>
      <div className="fixed  bottom-0 flex  w-full space-x-1 px-1 pb-1">
        {formStep > 0 && (
          <button
            className="bg-yellow-500 font-medium flex-grow py-2 text-lg w-1/2"
            onClick={() => setFormStep(formStep - 1)}
          >
            Back
          </button>
        )}
        {formStep < 2 && (
          <button
            className="bg-yellow-400 font-medium py-2 flex-grow text-lg w-1/2"
            onClick={() => setFormStep(formStep + 1)}
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps = async () => {
  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    stringify({
      grant_type: "client_credentials",
    }),
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      auth: {
        username: process.env.SPOTIFY_ID ?? "",
        password: process.env.SPOTIFY_SECRET ?? "",
      },
    }
  );

  return {
    props: {
      authToken: res.data.access_token,
    },
  };
};

export default Home;
