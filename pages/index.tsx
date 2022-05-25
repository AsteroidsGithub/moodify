import type { NextPage } from "next";
import { useState } from "react";

const BaseStep: React.FC = () => {
  return (
    <div>
      <h1>Base Step of Form</h1>
    </div>
  );
};

const CharacterStep: React.FC = () => {
  return (
    <div>
      <h1>Character Step of Form</h1>
    </div>
  );
};

const ResultsStep: React.FC = () => {
  return (
    <div>
      <h1>Results Step of Form</h1>
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
          <button onClick={() => setFormStep(formStep - 1)}>Previous</button>
        )}
        {formStep < 2 && (
          <button onClick={() => setFormStep(formStep + 1)}>Next</button>
        )}
      </div>
    </>
  );
};

export default Home;
