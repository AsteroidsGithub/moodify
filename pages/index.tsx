import axios from "axios";
import type { NextPage } from "next";
import { stringify } from "qs";
import { useEffect, useState } from "react";
import { useBetween } from "use-between";

const useFormState = () => {
  const [formStep, setFormStep] = useState(0);
  const [authToken, setAuthToken] = useState("");
  const [searchResults, setSearchResults] = useState<
    {
      id: string;
      name: string;
      duration_ms: number;
      popularity: number;
      artist: {
        id: string;
        name: string;
      };
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
    }[]
  >([]);

  return {
    formStep,
    setFormStep,
    authToken,
    setAuthToken,
    searchResults,
    setSearchResults,
  };
};

const useSharedState = () => useBetween(useFormState);

const BaseStep: React.FC = () => {
  const { authToken, searchResults, setSearchResults } = useSharedState();
  return (
    <div>
      <h1>Let's get a taste of what you like</h1>
      <h3>
        Please select upto 5 Songs, Artists and Genres that you're enjoying
        right now so we can tailor our results
      </h3>

      <div>
        <input
          type="text"
          onChange={async (event) => {
            event.preventDefault();

            const { data } = await axios.get(
              "https://api.spotify.com/v1/search",
              {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },

                params: {
                  type: "track",
                  q: event.target.value,
                },
              }
            );

            setSearchResults(data.tracks.items);

            console.log(data);
          }}
          placeholder="Search for a song"
        />
      </div>
      {searchResults.map((track) => (
        <div>
          <h3>{track.name}</h3>
          <img src={track.album.images[0].url} />
        </div>
      ))}
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
      <h3>
        We've got your recommendations, here are some of the songs that fit what
        you want to listen to
      </h3>
    </div>
  );
};

const Home: NextPage<{
  authToken: string;
}> = ({ authToken }) => {
  const { formStep, setFormStep, setAuthToken } = useSharedState();

  useEffect(() => setAuthToken(authToken), [authToken]);

  return (
    <>
      {
        {
          0: <BaseStep />,
          1: <CharacterStep />,
          2: <ResultsStep />,
        }[formStep]
      }
      <div>
        {formStep > 0 && (
          <button onClick={() => setFormStep(formStep - 1)}>Back</button>
        )}
        {formStep < 2 && (
          <button onClick={() => setFormStep(formStep + 1)}>Next</button>
        )}
      </div>
    </>
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
