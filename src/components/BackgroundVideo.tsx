import { useEffect, useRef } from 'react'

// Served from public/ — copied verbatim into dist/ on build, so it works on Vercel too.
const VIDEO_SRC = '/hero.mp4'

// Seeking to exactly `duration` can land past the final decodable frame and
// show a stale/blank picture, so we stop one frame short of the end.
const END_MARGIN = 1 / 30

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let targetTime = 0
    let seeking = false

    const seekTo = (time: number) => {
      seeking = true
      video.currentTime = time
    }

    const onSeeked = () => {
      seeking = false
      // If the target moved while we were seeking, queue the next seek.
      if (Math.abs(video.currentTime - targetTime) > 0.001) {
        seekTo(targetTime)
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      const duration = video.duration
      if (!duration || Number.isNaN(duration)) return

      // Absolute mapping: far-left edge = first frame, far-right edge = last frame.
      const progress = Math.min(1, Math.max(0, e.clientX / window.innerWidth))
      targetTime = progress * (duration - END_MARGIN)

      if (!seeking) seekTo(targetTime)
    }

    video.addEventListener('seeked', onSeeked)
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      video.removeEventListener('seeked', onSeeked)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <video
      ref={videoRef}
      src={VIDEO_SRC}
      muted
      playsInline
      preload="auto"
      className="fixed inset-0 z-0 h-full w-full object-cover"
      style={{ objectPosition: '70% center' }}
    />
  )
}
