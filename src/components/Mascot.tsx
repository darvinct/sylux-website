import { useEffect, useId, useRef } from "react";
import "../mascot.css";

export function Mascot() {
  const stage = useRef<HTMLDivElement>(null);
  const id = useId().replace(/:/g, "");
  const hand = `${id}-hand`;
  const body = `${id}-body`;
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    let visible = false;
    const update = () => element.classList.toggle("is-animated", visible && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, []);
  return (
    <div className="community-mascot-stage" ref={stage} aria-hidden="true">
      <svg className="mascot-art" viewBox="0 0 1536 865" focusable="false">
        <defs>
          <clipPath id={hand}><path d="M445 347 L490 345 L507 350 L525 349 L537 365 L551 400 L556 416 L518 457 L490 457 L450 428 L435 387 Z" /></clipPath>
          <clipPath id={body}><path clipRule="evenodd" d="M0 0 H1536 V865 H0 Z M445 347 L490 345 L507 350 L525 349 L537 365 L551 400 L556 416 L518 452 L492 452 L450 428 L435 387 Z" /></clipPath>
        </defs>
        <g className="mascot-breathe">
          <image href="/images/sylux-community-mascot-blue.webp" width="1536" height="865" clipPath={`url(#${body})`} />
          <g className="mascot-wave">
            <image href="/images/sylux-community-mascot-blue.webp" width="1536" height="865" clipPath={`url(#${hand})`} />
          </g>
        </g>
      </svg>
    </div>
  );
}
