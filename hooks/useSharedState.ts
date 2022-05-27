import { useState } from "react";
import { useBetween } from "use-between";
import { SpotifyTrack, SpotifyTrackProperties } from "../interfaces/types";

const useFormState = () => {
  const [formStep, setFormStep] = useState(0);
  const [authToken, setAuthToken] = useState("");

  const [seedTracks, setSeedTracks] = useState<SpotifyTrack[]>([]);
  const [seedGenre, setSeedGenre] = useState<string[]>([]);

  const [musicProperties, setMusicProperties] =
    useState<SpotifyTrackProperties>({
      danceability: 0.5,
      energy: 0.5,
      acousticness: 0.5,
      instrumentalness: 0.5,
      liveness: 0.5,
      speechiness: 0.5,
      valence: 0.5,
      tempo: 120,
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

export default () => useBetween(useFormState);
