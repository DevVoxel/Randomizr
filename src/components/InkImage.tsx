import { useState } from 'react'

/**
 * Image with a pulsing halftone placeholder while it loads: the site's
 * dot grid standing in for the pixels that have not arrived yet.
 */
export default function InkImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
}: {
  src: string
  alt: string
  className?: string
  wrapperClassName?: string
}) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={`relative ${loaded ? '' : 'min-h-48'} ${wrapperClassName}`}>
      {!loaded && <div className="absolute inset-0 halftone-faint animate-dots" aria-hidden />}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}
