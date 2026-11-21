# Backup plan: record the run-through as a video

The classroom network may be slow or missing. Record the whole presentation once
at home, and bring the video file on your laptop and on a USB stick.

## Before recording

1. Start the server and open the page (see README): `python3 -m http.server 8000`,
   then <http://localhost:8000>.
2. Click through all slides once and back, so every map tile is in the browser cache.
3. Go back to slide 1 (`Home`), press `F` for fullscreen, and make sure the
   speaker notes are off (`N`).
4. Set the screen to 1920×1080 if you can, the size of most projectors.

## Record

**macOS**: press `Shift` + `Cmd` + `5`, choose "Record Entire Screen", click
"Record". Stop with the stop button in the menu bar (or `Cmd` + `Ctrl` + `Esc`).
The video is saved to the desktop as a `.mov` file.

**Windows 11**: open the Snipping Tool, switch to the video camera icon, click
"New", select the whole screen, click "Start". (Or `Win` + `Alt` + `R` with the
Game Bar while the browser is in focus.) The video is saved in `Videos`.

**Any system**: [OBS Studio](https://obsproject.com) with a "Display Capture"
source, 1920×1080, 30 fps, saved as `.mp4`.

While recording, press `→` at a calm pace and wait on each slide until the
camera has arrived and the panel has faded in, plus about two seconds. You will
pause the video on each slide while you talk, so the recording itself can be short.

## Present from the video

Open the video fullscreen (QuickTime, VLC or the Windows media player) and use
`Space` to pause on each slide. In VLC, `Shift` + `→` jumps forward a few seconds
if you paused too early.

## Other fallbacks

- The page itself keeps working without the map: slides, panels, legend, glossary
  and notes are local. You see a red "map offline" notice and a plain globe. Try it
  with <http://localhost:8000/?offline>.
- A phone hotspot is enough for the map tiles (a full run uses a few tens of MB).
- Test in the classroom before the lesson if you can: projector resolution,
  fullscreen (`F`) and the network.
