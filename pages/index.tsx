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

  return {
    formStep,
    setFormStep,
    authToken,
    setAuthToken,
    seedTracks,
    setSeedTracks,
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
      <h2>
        Please select upto 5 Songs, Artists and Genres that you're enjoying
        right now so we can tailor our results
      </h2>

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
                limit: 5,
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
  return (
    <div>
      <h1>How should our recommendations sound?</h1>
      <h2>
        Adjust the sliders to find the perfect mood, tempo, and energy for you
      </h2>

      <h3>Mood</h3>
      <div>
        <label>Angry</label>
        <input
          type="range"
          id="mood"
          defaultValue="0.5"
          min="0"
          max="1"
          step="0.01"
        ></input>
        <label>Happy</label>
      </div>

      <h3>Energy</h3>
      <div>
        <label>Low</label>
        <input
          type="range"
          id="energy"
          defaultValue="0.5"
          min="0"
          max="1"
          step="0.01"
        ></input>
        <label>High</label>
      </div>

      <h3>Instrumentalness</h3>
      <div>
        <label>Low</label>
        <input
          type="range"
          id="instrumentalness"
          defaultValue="0.5"
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
          defaultValue="120"
          min="60"
          max="180"
          step="1"
        ></input>
        <label>180</label>
      </div>
    </div>
  );
};

const ResultsStep: React.FC = () => {
  return (
    <div>
      <h1>and... TADA!</h1>
      <h2>
        We've got your recommendations, here are some of the songs that fit what
        you want to listen to
      </h2>
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
            className="bg-yellow-600 font-medium flex-grow py-2 text-lg w-1/2"
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
