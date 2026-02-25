"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARS =
	"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

interface DecryptedTextProps {
	children: string;
	className?: string;
	style?: React.CSSProperties;
	delay?: number;
	duration?: number;
	speed?: number;
	startWhen?: boolean;
}

export function DecryptedText({
	children,
	className,
	style,
	delay = 0,
	duration = 2000,
	speed = 50,
	startWhen = true,
}: DecryptedTextProps) {
	const [displayText, setDisplayText] = useState(children);
	const [mounted, setMounted] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const text = children;

	const getRandomChar = useCallback(() => {
		const randomIndex = Math.floor(Math.random() * SCRAMBLE_CHARS.length);
		return SCRAMBLE_CHARS[randomIndex] ?? "";
	}, []);

	const scrambleText = useCallback(
		(revealProgress: number) => {
			let result = "";
			for (let i = 0; i < text.length; i++) {
				const char = text[i];
				if (char === " ") {
					result += " ";
				} else if (i < revealProgress) {
					result += char;
				} else {
					result += getRandomChar();
				}
			}
			return result;
		},
		[text, getRandomChar]
	);

	const startAnimation = useCallback(() => {
		const totalChars = text.length;
		const startTime = Date.now();
		const endTime = startTime + duration;

		intervalRef.current = setInterval(() => {
			const now = Date.now();
			const elapsed = now - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const revealProgress = Math.floor(progress * totalChars);

			if (now >= endTime) {
				setDisplayText(text);
				if (intervalRef.current) {
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
			} else {
				setDisplayText(scrambleText(revealProgress));
			}
		}, speed);
	}, [text, duration, speed, scrambleText]);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) {
			return;
		}

		const clearTimers = () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
				timeoutRef.current = null;
			}
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};

		if (startWhen) {
			// If it's the clear text (e.g. first mount with startWhen=true), scramble it during the delay
			setDisplayText((prev) => {
				if (prev === text) {
					return text
						.split("")
						.map((char) => (char === " " ? " " : getRandomChar()))
						.join("");
				}
				return prev;
			});

			timeoutRef.current = setTimeout(() => {
				startAnimation();
			}, delay);
		} else {
			clearTimers();
			// scramble the text initially if startWhen is false
			setDisplayText(
				text
					.split("")
					.map((char) => (char === " " ? " " : getRandomChar()))
					.join("")
			);
		}

		return clearTimers;
	}, [mounted, startWhen, delay, startAnimation, text, getRandomChar]);

	return (
		<span className={className} style={style}>
			<span className="sr-only">{text}</span>
			<span aria-hidden="true">{displayText}</span>
		</span>
	);
}
