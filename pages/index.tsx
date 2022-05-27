import axios from "axios";
import type { NextPage } from "next";
import { stringify } from "qs";
import { useEffect, useState } from "react";
import { useBetween } from "use-between";

interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  popularity: number;
  artists: [
    {
      id: string;
      name: string;
    }
  ];
  album: {
    id: string;
    name: string;
    album_type: "album" | "single" | "compilation";
    release_date: string;
    images: [
      {
        url: string;
        width: number;
        height: number;
      }
    ];
  };
}

const useFormState = () => {
  const [formStep, setFormStep] = useState(0);
  const [authToken, setAuthToken] = useState("");

  const [seedTracks, setSeedTracks] = useState<SpotifyTrack[]>([]);
  const [seedGenre, setSeedGenre] = useState<string[]>([]);

  const [musicProperties, setMusicProperties] = useState<{
    danceability: number;
    energy: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    speechiness: number;
    valence: number;
    tempo: number;
  }>({
    danceability: 0,
    energy: 0,
    acousticness: 0,
    instrumentalness: 0,
    liveness: 0,
    speechiness: 0,
    valence: 0,
    tempo: 0,
  });
  const [recommendations, setRecommendations] = useState<SpotifyTrack[]>([]);

  return {
    formStep,
    setFormStep,
    authToken,
    setAuthToken,
    seedTracks,
    setSeedTracks,
    seedGenre,
    setSeedGenre,
    musicProperties,
    setMusicProperties,
    recommendations,
    setRecommendations,
  };
};

const useSharedState = () => useBetween(useFormState);

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
      <p>
        Please select upto 5 Songs that you're enjoying right now so we can
        tailor our results
      </p>

      <input
        type="text"
        className="w-full bg-gray-100 p-2 my-2"
        onChange={async (event) => {
          event.preventDefault();

          if (event.target.value.length < 1) return setSearchResults([]);

          const { data } = await axios.get(
            "https://api.spotify.com/v1/search",
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },

              params: {
                limit: 20,
                type: "track",
                q: event.target.value,
              },
            }
          );

          return setSearchResults(data.tracks.items);
        }}
        placeholder="Search for a song"
      />

      <div className="space-y-2">
        {seedTracks.map((track) => (
          <div
            className="flex h-16 bg-yellow-300"
            onClick={() => handleSeedTrackChange(track)}
          >
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
            <div
              className="flex h-16"
              onClick={() => handleSeedTrackChange(track)}
            >
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
  const {
    authToken,
    setSeedGenre,
    seedGenre,
    musicProperties,
    setMusicProperties,
  } = useSharedState();

  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const handleGenreSelect = (genre: string) => {
    seedGenre.find((g) => g === genre)
      ? seedGenre.splice(seedGenre.indexOf(genre), 1)
      : seedGenre.push(genre);
    setSeedGenre([...seedGenre]);
  };

  return (
    <div className="p-4">
      <h1>How should our recommendations sound?</h1>
      <p>
        Adjust the sliders to find the perfect mood, tempo, and energy for you
      </p>
      <div className="my-2">
        <h2>Genre</h2>
        <input
          type="text"
          className="w-full bg-gray-100 p-2 my-2"
          onChange={async (event) => {
            event.preventDefault();

            if (event.target.value.length < 1) return setSearchResults([]);

            const { data } = await axios.get(
              "https://api.spotify.com/v1/recommendations/available-genre-seeds",
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            return setSearchResults(
              data.genres.filter((g: string) =>
                g.startsWith(event.target.value)
              )
            );
          }}
          placeholder="Search for a song"
        />
        <ul>
          {seedGenre.map((genre) => (
            <li
              className="bg-yellow-300"
              onClick={() => handleGenreSelect(genre)}
            >
              {genre}
            </li>
          ))}
          {searchResults.slice(0, 5).map((genre) => (
            <li onClick={() => handleGenreSelect(genre)}>{genre}</li>
          ))}
        </ul>
      </div>

      <div className="my-2">
        <h2>Emotion</h2>

        <h3>Mood</h3>
        <div>
          <label>Angry</label>
          <input
            type="range"
            id="mood"
            value={musicProperties.valence}
            onChange={(event) =>
              setMusicProperties({
                ...musicProperties,
                valence: parseFloat(event.target.value),
              })
            }
            min="0"
            max="1"
            step="0.01"
          ></input>
          <label>Happy</label>
        </div>

        <h3>Liveness</h3>
        <div>
          <label>Low</label>
          <input
            type="range"
            id="mood"
            value={musicProperties.liveness}
            onChange={(event) =>
              setMusicProperties({
                ...musicProperties,
                liveness: parseFloat(event.target.value),
              })
            }
            min="0"
            max="1"
            step="0.01"
          ></input>
          <label>High</label>
        </div>
      </div>

      <div className="my-2">
        <h2>Pace</h2>

        <h3>Energy</h3>
        <div>
          <label>Low</label>
          <input
            type="range"
            id="energy"
            value={musicProperties.energy}
            onChange={(event) =>
              setMusicProperties({
                ...musicProperties,
                energy: parseFloat(event.target.value),
              })
            }
            min="0"
            max="1"
            step="0.01"
          ></input>
          <label>High</label>
        </div>
        <h3>BPM</h3>
        <div>
          <label>60</label>
          <input
            type="range"
            id="bpm"
            value={musicProperties.tempo}
            onChange={(event) =>
              setMusicProperties({
                ...musicProperties,
                tempo: parseFloat(event.target.value),
              })
            }
            min="60"
            max="180"
            step="1"
          ></input>
          <label>180</label>
        </div>
      </div>

      <div className="my-2">
        <h2>Sound</h2>

        <h3>Instrumentalness</h3>
        <div>
          <label>Low</label>
          <input
            type="range"
            id="instrumentalness"
            value={musicProperties.instrumentalness}
            onChange={(event) =>
              setMusicProperties({
                ...musicProperties,
                instrumentalness: parseFloat(event.target.value),
              })
            }
            min="0"
            max="1"
            step="0.01"
          ></input>
          <label>High</label>
        </div>

        <h3>Acousticness</h3>
        <div>
          <label>Low</label>
          <input
            type="range"
            id="instrumentalness"
            value={musicProperties.acousticness}
            onChange={(event) =>
              setMusicProperties({
                ...musicProperties,
                acousticness: parseFloat(event.target.value),
              })
            }
            min="0"
            max="1"
            step="0.01"
          ></input>
          <label>High</label>
        </div>

        <h3>Speechiness</h3>
        <div>
          <label>Low</label>
          <input
            type="range"
            id="instrumentalness"
            value={musicProperties.speechiness}
            onChange={(event) =>
              setMusicProperties({
                ...musicProperties,
                speechiness: parseFloat(event.target.value),
              })
            }
            min="0"
            max="1"
            step="0.01"
          ></input>
          <label>High</label>
        </div>
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
        username: "545a4de4f8b4437cb20eae874f4d9550",
        password: "b214499792fa4c98863e90612a5065f5",
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
