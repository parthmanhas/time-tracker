import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function SciFiClock() {
    const [time, setTime] = useState(new Date())
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date())
        }, 1000)

        // Start assembly animation after a short delay
        const visibilityTimer = setTimeout(() => {
            setIsVisible(true)
        }, 100)

        return () => {
            clearInterval(timer)
            clearTimeout(visibilityTimer)
        }
    }, [])

    const hours = time.getHours()
    const minutes = time.getMinutes()
    const seconds = time.getSeconds()

    return (
        <div className="relative w-1 h-1 rounded-full bg-black z-10">

            {/* Outer ring */}
            <div
                className={cn(
                    "absolute top-1/2 left-1/2 w-[80vh] h-[80vh] rounded-full border-2 border-primary/20",
                    isVisible ? "animate-[assemble_2s_ease-out_forwards]" : "opacity-0"
                )}
            />

            {/* Inner ring */}
            <div
                className={cn(
                    "absolute top-1/2 left-1/2 w-[70vh] h-[70vh] rounded-full border border-primary/50",
                    isVisible ? "animate-[assembleInner_2.2s_ease-out_forwards]" : "opacity-0"
                )}
            />

            {/* create filled circle that expands and is smaller than inner ring */}
            <div className="absolute z-10 top-1/2 left-1/2 w-[65vh] h-[65vh] rounded-full bg-white animate-[assembleInner_2.2s_ease-out_forwards]"></div>

            {/* Hour markers */}
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    style={{ '--rotate': `${i * 30}deg` } as React.CSSProperties}
                    className={cn(
                        "absolute top-1/2 left-1/2 w-1 h-[75vh] bg-primary/30",
                        isVisible ? "animate-slide-in" : "opacity-0",
                        `[animation-delay:${1500 + i * 100}ms]`
                    )}
                />
            ))}

            {/* Hour hand */}
            <div
                style={{ '--rotate': `${hours * 30 + (minutes / 60) * 30}deg` } as React.CSSProperties}
                className={cn(
                    "absolute opacity-0 z-20 top-0 left-0 rounded-full w-1 h-[28vh] bg-primary/50 origin-top",
                    isVisible ? "animate-[hourHand_1.5s_ease-out_2s_forwards]" : "opacity-0"
                )}
            />

            {/* Minute hand */}
            <div
                style={{ '--rotate': `${minutes * 6 + (seconds / 60) * 6}deg` } as React.CSSProperties}
                className={cn(
                    "absolute opacity-0 z-20 top-0 left-1/2 w-1 h-[35vh] bg-primary/50 origin-top",
                    isVisible ? "animate-[minuteHand_1.5s_ease-out_2.2s_forwards]" : "opacity-0"
                )}
            />

            {/* Second hand */}
            <div
                style={{ '--rotate': `${seconds * 6}deg` } as React.CSSProperties}
                className={cn(
                    "absolute opacity-0 z-20 top-1/2 left-1/2 w-0.5 h-[38vh] bg-primary/50 origin-top",
                    isVisible ? "animate-[secondHand_1.5s_ease-out_2.4s_forwards]" : "opacity-0"
                )}
            />

            {/* Outer decorative ring */}
            <div
                className={cn(
                    "absolute z-30 top-1/2 left-1/2 w-[85vh] h-[85vh] rounded-full border border-primary/20",
                    isVisible ? "animate-[assembleInner_2.2s_ease-out_forwards]" : "opacity-0"
                )}
            />

            {/* Center dot */}
            <div
                className={cn(
                    "absolute z-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary/80 rounded-full",
                )}
            />

            {/* Scanning line */}
            

        </div>


    )

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">






            {/* Digital time display */}
            {/* <div
                className={cn(
                    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-primary text-8xl tracking-widest",
                    isVisible ? "animate-[fade-in_1s_ease-out_2.5s_forwards]" : "opacity-0"
                )}
            >
                {`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`}
            </div> */}












        </div>
    )
} 