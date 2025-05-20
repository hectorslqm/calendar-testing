"use client";

import { useState } from "react";
import ICAL from "ical.js";

export default function IcsReaderFromUrl() {
	const [url, setUrl] = useState("");
	const [events, setEvents] = useState<
		{ summary: string; duration: ICAL.Duration, uid: string, start: string; end: string }[]
	>([]);
	const [error, setError] = useState("");

	const fetchAndParseICS = async () => {
		console.log("Fetching and parsing ICS file from URL:", url);
		setError("");
		setEvents([]);
		try {
			const apiUrl = `/api/read-calendar?url=${encodeURIComponent(url)}`;
			const res = await fetch(apiUrl);
			console.log("Response from API:", res);
			if (!res.ok) throw new Error("Error while loading .ics");

			const text = await res.text();
			const jcalData = ICAL.parse(text);
			const comp = new ICAL.Component(jcalData);
			const vevents = comp.getAllSubcomponents("vevent");

			const parsedEvents = vevents.map((vevent) => {
				const event = new ICAL.Event(vevent);
				return {
					summary: event.summary,
					uid: event.uid,
					duration: event.duration,
					start: event.startDate.toString(),
					end: event.endDate.toString(),
				};
			});

			setEvents(parsedEvents);
		} catch (err: unknown) {
			if (err instanceof Error) {
				setError(err.message || "Error while loading .ics");
			} else {
				setError("Error while loading .ics");
			}
		}
	};

	return (
		<div className="p-2 space-y-4">
			<input
				type="text"
				placeholder="Paste the URL of the .ics file here"
				value={url}
				onChange={(e) => setUrl(e.target.value)}
				className="input input-bordered w-full border-2 p-2 rounded-2xl"
			/>
			<button
				onClick={fetchAndParseICS}
				className="btn btn-primary cursor-pointer border-2 p-2 rounded-2xl hover:bg-blue-500"
			>
				Fetch Calendar
			</button>

			{error && <p className="text-red-500">{error}</p>}

			{events.length > 0 && (
				<ul className="space-y-2">
					{events.map((event, i) => (
						<li key={i} className="p-2 border rounded shadow">
							<p className="font-bold">{event.summary}</p>
							<p className="text-sm text-gray-500">{event.uid}</p>
							<p>
								🕒 {event.start} → {event.end}
							</p>
							<p>
								⏳ Duration: {event.duration.days} Days {event.duration.hours}h {event.duration.minutes}m
							</p>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}