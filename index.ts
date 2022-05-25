import axios from "axios";
import { stringify } from "qs";

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
  .then((res) => res.data.access_token)
  .then((res) =>
    axios
      .get("https://api.spotify.com/v1/recommendations", {
        headers: {
          Accepted: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${res}`,
        },
        params: {
          limit: "3",
          market: "US",
          seed_artists: "4NHQUGzhtTLFvgF5SZesLK",
          seed_tracks: "0c6xIDDpzE81m2q797ordA",
          seed_genres: "country",
        },
      })
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err))
  )
  .catch((err) => console.log(err));
