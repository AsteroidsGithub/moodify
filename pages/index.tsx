import type { NextPage } from "next";
import { useState } from "react";

const BaseStep: React.FC = () => {
  return (
    <div>
      <h1>Let's get a taste of what you like</h1>
      <h3>
        Please select upto 5 Songs, Artists and Genres that you're enjoying
        right now so we can tailor our results
      </h3>
    </div>
  );
};

const CharacterStep: React.FC = () => {
  return (
    <div>
      <h1>How should our recommendations sound?</h1>
      <h3>
        Adjust the sliders to find the perfect mood, tempo, and energy for you
      </h3>

      <div>
        <label>Angry</label>
        <input type="range" id="mood" min="0" max="1" step="0.01"></input>
        <label>Happy</label>
      </div>

      <div>
        <label>60</label>
        <input type="range" id="bpm" min="60" max="180" step="1"></input>
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

const Home: NextPage = () => {
  const [formStep, setFormStep] = useState(2);

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

export default Home;
