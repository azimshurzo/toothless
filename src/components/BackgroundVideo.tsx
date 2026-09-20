import { useEffect, useRef } from 'react'

// Served from public/ — copied verbatim into dist/ on build, so it works on Vercel too.
const VIDEO_SRC = '/hero.mp4'

const SENSITIVITY = 0.8

export default function BackgroundVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let prevX: number | null = null
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
      if (prevX === null) {
        prevX = e.clientX
        return
      }
      const duration = video.duration
      if (!duration || Number.isNaN(duration)) {
        prevX = e.clientX
        return
      }

      const delta = e.clientX - prevX
      prevX = e.clientX

      const offset = (delta / window.innerWidth) * SENSITIVITY * duration
      targetTime = Math.min(duration, Math.max(0, targetTime + offset))

      if (!seeking) seekTo(targetTime)
    }

    const onLoadedMetadata = () => {
      targetTime = video.currentTime
    }

    video.addEventListener('seeked', onSeeked)
    video.addEventListener('loadedmetadata', onLoadedMetadata)
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      video.removeEventListener('seeked', onSeeked)
      video.removeEventListener('loadedmetadata', onLoadedMetadata)
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
