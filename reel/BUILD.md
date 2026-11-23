# Rebuilding the reel

The reel is `reel.html` (540×960 CSS px, rendered at 2× = 1080×1920), driven by a timeline
in `data-a="anim start duration ..."` attributes. `window.seek(ms)` freezes every animation at a time.

## One-time tools (in any temp folder)
    npm init -y && npm install puppeteer-core@23 ffmpeg-static@5 ffprobe-static@3
    node node_modules/ffmpeg-static/install.js     # downloads the ffmpeg binary

## Render frames (30 fps) — uses installed Google Chrome
    node render.js /Users/apple/Documents/Project/Jitu/reel/reel.html ./frames all 30
    # quick check of single moments:  node render.js reel.html ./test test 1 14 33 77

## Encode with music
The song (music/wedding.mp3) has a quiet gap at 76.4–79.6 s; it is skipped with a crossfade.

    ffmpeg -framerate 30 -i frames/f_%05d.jpg -i ../music/wedding.mp3 \
      -filter_complex "[1:a]atrim=0:76.4,asetpts=PTS-STARTPTS[a1];[1:a]atrim=79.6:90,asetpts=PTS-STARTPTS[a2];[a1][a2]acrossfade=d=0.8:c1=tri:c2=tri,atrim=0:80.5,afade=t=in:st=0:d=1,afade=t=out:st=78:d=2.5[a]" \
      -map 0:v -map "[a]" -t 80.5 -c:v libx264 -preset slow -crf 24 -pix_fmt yuv420p \
      -c:a aac -b:a 160k -movflags +faststart Jitendra-Manisha-Wedding-Reel.mp4

If the reel length changes, update `window.DURATION` in reel.html and the `atrim`/`afade`/`-t` values.
