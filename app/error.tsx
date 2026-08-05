"use client";
"use client";
export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="container-shell flex min-h-[55vh] flex-col items-center justify-center text-center"><p className="eyebrow">A quiet interruption</p><h1 className="section-title mt-4">Something didn’t load.</h1><p className="body-copy mt-5 max-w-md">Please try again. If the problem continues, we’re here at sujit@joyguruenterprise.in.</p><button onClick={reset} className="button-primary mt-8">Try again</button></main>; }
