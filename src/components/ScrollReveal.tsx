import React, { useEffect, useRef, useMemo, type ReactNode, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  containerClassName?: string;
  textClassName?: string;
  rotationEnd?: string;
  wordAnimationEnd?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0,
  baseRotation = 2,
  blurStrength = 6,
  containerClassName = '',
  textClassName = '',
  rotationEnd = 'center center',
  wordAnimationEnd = 'center center'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isStringChild = typeof children === 'string';

  const splitText = useMemo(() => {
    if (!isStringChild) return null;
    const text = children as string;
    return text.split(/(\s+)/).map((word, index) => {
      if (word.match(/^\s+$/)) return word;
      return (
        <span className="inline-block word" key={index}>
          {word}
        </span>
      );
    });
  }, [children, isStringChild]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const scroller =
      scrollContainerRef && scrollContainerRef.current
        ? scrollContainerRef.current
        : window;

    // Rotation + Y-lift animation on the container
    gsap.fromTo(
      el,
      { transformOrigin: '0% 50%', rotate: baseRotation, y: 30 },
      {
        ease: 'power2.out',
        rotate: 0,
        y: 0,
        scrollTrigger: {
          trigger: el,
          scroller,
          start: 'top bottom-=10%',
          end: rotationEnd,
          scrub: 1.5
        }
      }
    );

    if (isStringChild) {
      // Per-word opacity + blur animation
      const wordElements = el.querySelectorAll<HTMLElement>('.word');

      gsap.fromTo(
        wordElements,
        { opacity: baseOpacity, willChange: 'opacity, filter' },
        {
          ease: 'power1.out',
          opacity: 1,
          stagger: 0.08,
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom-=5%',
            end: wordAnimationEnd,
            scrub: 1.5
          }
        }
      );

      if (enableBlur) {
        gsap.fromTo(
          wordElements,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: 'power2.out',
            filter: 'blur(0px)',
            stagger: 0.08,
            scrollTrigger: {
              trigger: el,
              scroller,
              start: 'top bottom-=5%',
              end: wordAnimationEnd,
              scrub: 1.5
            }
          }
        );
      }
    } else {
      // Whole-element fade + blur animation for non-string children
      gsap.fromTo(
        el,
        {
          opacity: baseOpacity,
          ...(enableBlur ? { filter: `blur(${blurStrength}px)` } : {})
        },
        {
          ease: 'power2.out',
          opacity: 1,
          ...(enableBlur ? { filter: 'blur(0px)' } : {}),
          scrollTrigger: {
            trigger: el,
            scroller,
            start: 'top bottom-=5%',
            end: wordAnimationEnd,
            scrub: 1.5
          }
        }
      );
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength, isStringChild]);

  if (isStringChild) {
    return (
      <div ref={containerRef} className={`my-5 ${containerClassName}`}>
        <p className={`text-[clamp(1.6rem,4vw,3rem)] leading-normal font-semibold ${textClassName}`}>
          {splitText}
        </p>
      </div>
    );
  }

  // For element children, render a div wrapper that animates
  return (
    <div ref={containerRef} className={containerClassName}>
      {children}
    </div>
  );
};

export default ScrollReveal;

