const MV_URL = process.env.NEXT_PUBLIC_ENV == "prod" ? process.env.NEXT_PUBLIC_MV_URL_PROD : (process.env.NEXT_PUBLIC_MV_URL || "");
const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
};

export default async function Fetch({url = MV_URL, method = "get", api, body, query}: FetchProps) {
  try {
    if (!url) {
      return {ok: false, data: {}};
    }

    url += api;
    if (query) url += new URLSearchParams(JSON.stringify(query))

    let response = await fetch(url,
      {
        method: method,
        headers: {...headers, authorization: `Bearer ${localStorage.getItem('token')}`},
        ...(method == "get" ? {} : {body: JSON.stringify(body)})
      }
    );
    let res = await response.json();

    return {ok: response.ok, data: res};
  } catch (error) {
    return {ok: false, data: {}};
  }
}

export type FetchProps = {
  url?: string,
  method?: "get" | "post" | "put" | "patch" | "delete",
  api: string,
  body?: object,
  query?: object,
  headers?: object
};
