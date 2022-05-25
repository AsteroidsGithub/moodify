import axios from "axios";
import { stringify } from "qs";

// This will be filled in later by the token requests
var authToken = "";

// Referred to as "Valence" in spotify's API 
// 0 represents sad, depressing, or negative mood 
// 1 represents happy, cheerful, or positive mood
const moodInt: number = 0;



axios
  .post(
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
  )
  .then((res) => (authToken = res.data.access_token))
  .then(() =>
    axios
      .get("https://api.spotify.com/v1/search", {
        headers: {
          Accepted: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        params: {
          limit: 1,
          type: "track",
          q: "Call out my Name",
        },
      })

      .then((res) => res.data.tracks.items)
      .then((tracks) =>
        axios
          .get("https://api.spotify.com/v1/recommendations", {
            headers: {
              Accepted: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
            params: {
              limit: "3",
              market: "US",
              seed_artists: tracks[0].artists[0].id,
              seed_tracks: tracks[0].id,
              seed_genres: "rap",
              target_valence: moodInt,
            },
          })
          .then((res) => res.data)
          .then((data) => {
            console.log(
              `From the song:\nhttps://open.spotify.com/track/${data.seeds[1].id}\nWith the Genre: ${data.seeds[2].id}\n`
            );

            data.tracks.map((track, index) =>
              console.log(
                `${index + 1}. ${track.name} - ${track.artists[0].name}\n${
                  track.external_urls.spotify
                }\n`
              )
            );
          })

          .catch((err) => console.log(err))
      )
      .catch((err) => console.log(err))
  )
  .catch((err) => console.log(err));
