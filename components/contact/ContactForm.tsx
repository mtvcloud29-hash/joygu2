"use client";
import { useRef, useState, useTransition } from "react";
import { submitContact } from "@/actions/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
export function ContactForm() { const ref = useRef<HTMLFormElement>(null); const [pending, startTransition] = useTransition(); const [message, setMessage] = useState(""); return <form ref={ref} action={(fd) => startTransition(async () => { const result = await submitContact(fd); setMessage(result.message); if (result.ok) ref.current?.reset(); })} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><div><Label htmlFor="name">Name</Label><Input id="name" name="name" required /></div><div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required /></div></div><div className="grid gap-5 sm:grid-cols-2"><div><Label htmlFor="phone">Phone <span className="font-normal normal-case tracking-normal">(optional)</span></Label><Input id="phone" name="phone" type="tel" /></div><div><Label htmlFor="subject">Subject</Label><Input id="subject" name="subject" required /></div></div><div><Label htmlFor="message">How can we help?</Label><Textarea id="message" name="message" required minLength={20} /></div><Button type="submit" disabled={pending}>{pending ? "Sending…" : "Send message"}</Button>{message && <p className="text-sm text-muted">{message}</p>}</form>; }
