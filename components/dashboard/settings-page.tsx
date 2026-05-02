"use client";

import { useState } from "react";

import { useCampusMonitoring } from "@/hooks/use-campus-monitoring";

export function SettingsPage() {
  const { bins, addCustomLocation, deleteCustomLocation } = useCampusMonitoring();
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleAddLocation() {
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (!name.trim() || !Number.isFinite(parsedLatitude) || !Number.isFinite(parsedLongitude)) {
      setFeedback("Please provide a valid name, latitude, and longitude.");
      return;
    }

    try {
      const createdName = await addCustomLocation({
        name,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
      });

      setName("");
      setLatitude("");
      setLongitude("");
      setFeedback(`Added ${createdName}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to add the location.");
    }
  }

  async function handleDeleteLocation(locationId: string) {
    try {
      const deletedName = await deleteCustomLocation(locationId);
      setFeedback(`Deleted ${deletedName}.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Unable to delete the location.");
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#121d30_0%,#0c1422_100%)] p-7 shadow-[0_18px_50px_rgba(2,6,23,0.34)] xl:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-200">
          Settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Manage bin locations
        </h1>

        <div className="mt-7 grid gap-5">
          <label className="text-sm text-slate-300">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Bin Name
            </span>
            <input
              className="w-full rounded-2xl border border-cyan-500/15 bg-[#101b33] px-5 py-4 text-base text-white outline-none"
              onChange={(event) => setName(event.target.value)}
              placeholder="New campus location"
              value={name}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Latitude
              </span>
              <input
                className="w-full rounded-2xl border border-cyan-500/15 bg-[#101b33] px-5 py-4 text-base text-white outline-none"
                onChange={(event) => setLatitude(event.target.value)}
                placeholder="16.8450"
                value={latitude}
              />
            </label>
            <label className="text-sm text-slate-300">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Longitude
              </span>
              <input
                className="w-full rounded-2xl border border-cyan-500/15 bg-[#101b33] px-5 py-4 text-base text-white outline-none"
                onChange={(event) => setLongitude(event.target.value)}
                placeholder="74.6020"
                value={longitude}
              />
            </label>
          </div>

          <button
            className="w-full rounded-2xl bg-[linear-gradient(135deg,#00d4ff,#0099cc)] px-5 py-4 text-base font-semibold text-slate-950 transition hover:brightness-110"
            onClick={handleAddLocation}
            type="button"
          >
            Add bin location
          </button>
        </div>

        {feedback ? (
          <div className="mt-5 rounded-[22px] border border-cyan-500/12 bg-cyan-500/8 px-5 py-4 text-base text-cyan-100">
            {feedback}
          </div>
        ) : null}
      </section>

      <section className="rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,#121d30_0%,#0c1422_100%)] p-7 shadow-[0_18px_50px_rgba(2,6,23,0.34)] xl:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-amber-200">
          Delete Bins
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Existing bin list
        </h2>
        <div className="mt-6 space-y-4">
          {bins.length === 0 ? (
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-5 py-5 text-base text-slate-300">
              No bins available.
            </div>
          ) : (
            bins.map((bin) => (
              <div
                key={bin.id}
                className="flex flex-col gap-4 rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5 xl:flex-row xl:items-center xl:justify-between xl:px-6 xl:py-6"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-lg font-semibold text-white">{bin.name}</p>
                    <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                      {bin.isDefault ? "Default" : "Custom"}
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {bin.id}
                  </p>
                </div>
                <button
                  className="rounded-full bg-[linear-gradient(135deg,#ff3b3b,#cc0000)] px-5 py-3 text-base font-semibold text-white transition hover:brightness-110"
                  onClick={() => handleDeleteLocation(bin.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
