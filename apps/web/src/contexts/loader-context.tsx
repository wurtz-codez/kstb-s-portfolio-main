"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useState } from "react";

interface LoaderContextType {
	isLoading: boolean;
	isFadingOut: boolean;
	loaderComplete: boolean;
	startFadeOut: () => void;
	setLoaderComplete: () => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

interface LoaderProviderProps {
	children: ReactNode;
}

export function LoaderProvider({ children }: LoaderProviderProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [isFadingOut, setIsFadingOut] = useState(false);
	const [loaderComplete, setLoaderCompleteState] = useState(false);

	const startFadeOut = useCallback(() => {
		setIsFadingOut(true);
	}, []);

	const setLoaderComplete = useCallback(() => {
		setIsLoading(false);
		setLoaderCompleteState(true);
	}, []);

	const value: LoaderContextType = {
		isLoading,
		isFadingOut,
		loaderComplete,
		startFadeOut,
		setLoaderComplete,
	};

	return (
		<LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>
	);
}

export function useLoader(): LoaderContextType {
	const context = useContext(LoaderContext);

	if (context === undefined) {
		throw new Error("useLoader must be used within a LoaderProvider");
	}

	return context;
}
