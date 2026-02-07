"use client";

import { useEffect, useState } from "react";

type WeatherState =
  | { status: "loading" }
  | { status: "ok"; temp: number | null; wind: number | null }
  | { status: "error"; message: string };

type CountryState =
  | { status: "loading" }
  | { status: "ok"; flag?: string; region?: string; capital?: string }
  | { status: "error"; message: string };

export default function ExternalApiDemo() {
  const [weather, setWeather] = useState<WeatherState>({ status: "loading" });
  const [country, setCountry] = useState<CountryState>({ status: "loading" });

  async function load() {
    setWeather({ status: "loading" });
    setCountry({ status: "loading" });

    // WEATHER
    try {
      const r = await fetch("/api/external/weather?lat=44.7866&lon=20.4489", {
        cache: "no-store",
      });

      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`HTTP ${r.status}: ${txt}`);
      }

      const data = await r.json();
      const temp = data?.current?.temperature_2m ?? null;
      const wind = data?.current?.wind_speed_10m ?? null;

      setWeather({ status: "ok", temp, wind });
    } catch (e: any) {
      console.error("Weather API error:", e?.message ?? e);
      setWeather({
        status: "error",
        message: "Vremenska prognoza trenutno nije dostupna.",
      });
    }

    // COUNTRY
    try {
      const r = await fetch("/api/external/country?name=Serbia", {
        cache: "no-store",
      });

      if (!r.ok) {
        const txt = await r.text();
        throw new Error(`HTTP ${r.status}: ${txt}`);
      }

      const data = await r.json();
      const c = Array.isArray(data) ? data[0] : data;

      setCountry({
        status: "ok",
        flag: c?.flags?.png,
        region: c?.region,
        capital: c?.capital?.[0],
      });
    } catch (e: any) {
      console.error("Country API error:", e?.message ?? e);
      setCountry({
        status: "error",
        message: "Podaci o državi trenutno nisu dostupni.",
      });
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div style={{ marginTop: 28 }}>
      {/* “profi” rounded pravougaonik u širini grida */}
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: 18,
          boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18 }}>Eksterni API podaci</h3>
            <p style={{ margin: "6px 0 0", opacity: 0.75 }}>
              (Open-Meteo i REST Countries)
            </p>
          </div>

          <button
            onClick={load}
            style={{
              borderRadius: 12,
              padding: "10px 14px",
              border: "1px solid rgba(0,0,0,0.10)",
              background: "transparent",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Osveži
          </button>
        </div>

        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {/* Weather card */}
          <div
            style={{
              borderRadius: 14,
              padding: 14,
              background: "rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Vreme</div>

            {weather.status === "loading" && <div style={{ opacity: 0.7 }}>Učitavanje…</div>}

            {weather.status === "error" && (
              <div style={{ opacity: 0.85 }}>
                {weather.message}
                <div style={{ marginTop: 6, opacity: 0.7, fontSize: 13 }}>
                  (Proveri da li radi: <code>/api/external/weather</code>)
                </div>
              </div>
            )}

            {weather.status === "ok" && (
              <div style={{ opacity: 0.9 }}>
                Temperatura: <b>{weather.temp ?? "—"}</b> °C <br />
                Vetar: <b>{weather.wind ?? "—"}</b> km/h
              </div>
            )}
          </div>

          {/* Country card */}
          <div
            style={{
              borderRadius: 14,
              padding: 14,
              background: "rgba(0,0,0,0.03)",
              display: "flex",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div style={{ minWidth: 60 }}>
              {country.status === "ok" && country.flag ? (
                <img
                  src={country.flag}
                  alt="flag"
                  width={54}
                  style={{ borderRadius: 8, display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: 54,
                    height: 36,
                    borderRadius: 8,
                    background: "rgba(0,0,0,0.08)",
                  }}
                />
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Republika Srbija</div>

              {country.status === "loading" && <div style={{ opacity: 0.7 }}>Učitavanje…</div>}

              {country.status === "error" && <div style={{ opacity: 0.85 }}>{country.message}</div>}

              {country.status === "ok" && (
                <div style={{ opacity: 0.9 }}>
                  Region: <b>{country.region ?? "—"}</b> <br />
                  Glavni grad: <b>{country.capital ?? "—"}</b>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
