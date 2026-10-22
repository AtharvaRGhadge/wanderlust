import * as maplibregl from "https://unpkg.com/maplibre-gl@6.15.0/dist/maplibre-gl.mjs";

const mapContainer = document.getElementById("map");

if (mapContainer) {
    const coordinates = [
        Number(mapContainer.dataset.longitude),
        Number(mapContainer.dataset.latitude)
    ];

    if (!coordinates.every(Number.isFinite)) {
        console.error("Listing GeoJSON coordinates are missing or invalid.");
    } else {
        const map = new maplibregl.Map({
            container: mapContainer,
            style: "https://tiles.openfreemap.org/styles/liberty",
            center: coordinates,
            zoom: 12
        });
        map.on("error", event => {
            console.error("MapLibre map error:", event.error);
        });

        const popupContent = document.createElement("div");
        const locationHeading = document.createElement("h4");
        locationHeading.textContent = mapContainer.dataset.location || "Listing location";
        const privacyNote = document.createElement("p");
        privacyNote.textContent = "Exact location provided after booking.";
        popupContent.append(locationHeading, privacyNote);

        const popup = new maplibregl.Popup({ offset: 25 })
            .setDOMContent(popupContent);

        new maplibregl.Marker({ color: "#fe424d" })
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map);
    }
}