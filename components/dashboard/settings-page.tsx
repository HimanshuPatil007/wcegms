"use client";

import { useState } from "react";

import { useCampusMonitoring } from "@/hooks/use-campus-monitoring";

export function SettingsPage() {
  const { bins, addCustomLocation, deleteCustomLocation } = useCampusMonitoring();
  const [name, setName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const customBins = bins.filter((bin) => !bin.isDefault);

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
      <section className="rounded-[30px] border border-cyan-500/12 bg-[#0f1a30] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
          Settings
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Manage custom locations
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          This carries over the add and delete controls from the HTML reference.
          Default campus bins stay protected, while custom bins can be created
          and removed.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="text-sm text-slate-300">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Bin Name
            </span>
            <input
              className="w-full rounded-xl border border-cyan-500/15 bg-[#101b33] px-4 py-3 text-white outline-none"
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
                className="w-full rounded-xl border border-cyan-500/15 bg-[#101b33] px-4 py-3 text-white outline-none"
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
                className="w-full rounded-xl border border-cyan-500/15 bg-[#101b33] px-4 py-3 text-white outline-none"
                onChange={(event) => setLongitude(event.target.value)}
                placeholder="74.6020"
                value={longitude}
              />
            </label>
          </div>

          <button
            className="w-full rounded-xl bg-[linear-gradient(135deg,#00d4ff,#0099cc)] px-4 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110"
            onClick={handleAddLocation}
            type="button"
          >
            Add custom location
          </button>
        </div>

        {feedback ? (
          <div className="mt-4 rounded-[18px] border border-cyan-500/12 bg-cyan-500/8 px-4 py-3 text-sm text-cyan-100">
            {feedback}
          </div>
        ) : null}
      </section>

      <section className="rounded-[30px] border border-cyan-500/12 bg-[#0f1a30] p-6 shadow-[0_18px_50px_rgba(2,6,23,0.28)]">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
          Delete Bins
        </p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">
          Custom location list
        </h2>
        <div className="mt-5 space-y-3">
          {customBins.length === 0 ? (
            <div className="rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
              No custom bins yet. The list will populate after you add one.
            </div>
          ) : (
            customBins.map((bin) => (
              <div
                key={bin.id}
                className="flex items-center justify-between gap-4 rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-4"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{bin.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                    {bin.id}
                  </p>
                </div>
                <button
                  className="rounded-full bg-[linear-gradient(135deg,#ff3b3b,#cc0000)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
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
