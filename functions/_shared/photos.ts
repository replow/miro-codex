export const photoEntries = [
  {
    "path": "/photos/ronova-anitoon.jpg",
    "orientation": "landscape"
  },
  {
    "path": "/photos/ronova-arrival.webp",
    "orientation": "landscape"
  },
  {
    "path": "/photos/ronova-boss.webp",
    "orientation": "landscape"
  },
  {
    "path": "/photos/ronova-devart-2609-2.jpg",
    "orientation": "portrait"
  },
  {
    "path": "/photos/ronova-devart-2609-4.jpg",
    "orientation": "landscape"
  },
  {
    "path": "/photos/ronova-dialogue.jpg",
    "orientation": "landscape"
  },
  {
    "path": "/photos/ronova-key-art.png",
    "orientation": "landscape"
  },
  {
    "path": "/photos/ronova-motionbgs.jpg",
    "orientation": "landscape"
  },
  {
    "path": "/photos/ronova-poster.webp",
    "orientation": "landscape"
  },
  {
    "path": "/photos/ronova-ruler.jpg",
    "orientation": "landscape"
  },
  {
    "path": "/photos/ronova-zerochan.jpg",
    "orientation": "portrait"
  }
] as const;
export const photoPaths = photoEntries.map(({ path }) => path);
