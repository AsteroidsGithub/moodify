import useSharedState from '../hooks/useSharedState';
import { TrackProperty } from '../interfaces/types';

const PropertySlider: React.FC<{
  title?: string;
  property: TrackProperty;
  minLabel: string;
  maxLabel: string;
  min?: number;
  max?: number;
  step?: number;
}> = ({ title, property, minLabel, maxLabel, min = 0, max = 1, step = 0.01 }) => {
  const { musicProperties, setMusicProperties } = useSharedState();

  return (
    <div className="flex flex-col space-y-2">
      <h3>
        {title || (property && property[0].toUpperCase() + property.slice(1))}:{' '}
        {musicProperties[property as TrackProperty]}
      </h3>
      <div className="flex space-x-2">
        <label>{minLabel}</label>
        <input
          type="range"
          className="flex-grow"
          id={property}
          value={musicProperties[property as TrackProperty]}
          onChange={(event) =>
            setMusicProperties({
              ...musicProperties,
              [property as TrackProperty]: parseFloat(event.target.value),
            })
          }
          min={min}
          max={max}
          step={step}
        ></input>
        <label>{maxLabel}</label>
      </div>
    </div>
  );
};

export default PropertySlider;
