import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CustomerHomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-8">
      
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Your SaaS
        </h1>
        
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Build and grow your business with a modern SaaS platform.
        </p>
        
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      </div>

    </main>
  );
}