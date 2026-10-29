import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Loader2, BarChart3, KeyRound, ArrowRight, RefreshCw } from "lucide-react";

export interface PollResults {
  totalVotes: number;
  breakdown: Record<string, number>;
  percentages: Record<string, number>;
}

export interface PollWidgetProps {
  pollId: string;
  defaultQuestion?: string;
  defaultOptions?: string[];
  className?: string;
}

export type WidgetStep = "voting" | "otp_verification" | "results";

export const PollWidget: React.FC<PollWidgetProps> = ({
  pollId,
  defaultQuestion = "Which piano practice technique yields the fastest progress for you?",
  defaultOptions = [
    "Slow-tempo metronome drilling",
    "Hands-separate practice first",
    "Short 20-minute focused bursts",
    "Mental practice away from the piano",
    "Recording and self-critiquing",
  ],
  className = "",
}) => {
  const webhookUrl = import.meta.env.VITE_POLL_WEBHOOK_URL;

  // Poll configuration state
  const [question, setQuestion] = useState(defaultQuestion);
  const [options, setOptions] = useState<string[]>(defaultOptions);

  // User input states
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [honeypot, setHoneypot] = useState<string>("");

  // Flow & UI states
  const [step, setStep] = useState<WidgetStep>("voting");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [userVote, setUserVote] = useState<string>("");
  const [results, setResults] = useState<PollResults | null>(null);

  // Check localStorage on mount for previous vote in this browser
  useEffect(() => {
    const savedVote = localStorage.getItem(`poll_${pollId}_vote`);
    const savedEmail = localStorage.getItem(`poll_${pollId}_email`);

    if (savedVote && savedEmail) {
      setUserVote(savedVote);
      setEmail(savedEmail);

      if (webhookUrl) {
        fetch(
          `${webhookUrl}?action=get_results&pollId=${encodeURIComponent(pollId)}&email=${encodeURIComponent(savedEmail)}`,
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "success" && data.results) {
              setResults(data.results);
              setStep("results");
            }
          })
          .catch(() => {
            // Keep voting view or fallback
          });
      }
    }
  }, [pollId, webhookUrl]);

  // Dynamic poll configuration from Google Sheet on mount
  useEffect(() => {
    if (!webhookUrl) return;
    fetch(`${webhookUrl}?action=get_poll&pollId=${encodeURIComponent(pollId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success" && data.poll) {
          if (data.poll.question) setQuestion(data.poll.question);
          if (data.poll.options && data.poll.options.length > 0) {
            setOptions(data.poll.options);
          }
        }
      })
      .catch((err) => {
        console.log("Using default fallback poll options:", err);
      });
  }, [pollId, webhookUrl]);

  // Step 1: Submit Vote & Request OTP (or reveal if already voted)
  const handleSubmitVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Drop spam silently

    if (!selectedOption) {
      setErrorMessage("Please select one option to vote.");
      return;
    }
    if (!email) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!webhookUrl) {
      // Offline/demo mode fallback: simulate successful vote for development preview
      setUserVote(selectedOption);
      const mockResults: PollResults = {
        totalVotes: 142,
        breakdown: {
          [selectedOption]: 58,
          [options[0] !== selectedOption ? options[0] : options[1] || "Other"]: 42,
          [options[2] || "Other"]: 42,
        },
        percentages: {
          [selectedOption]: 40.8,
          [options[0] !== selectedOption ? options[0] : options[1] || "Other"]: 29.6,
          [options[2] || "Other"]: 29.6,
        },
      };
      setResults(mockResults);
      setStep("results");
      setStatusMessage("Vote recorded (Demo Mode). Deploy Google Apps Script to enable live OTP email ballots.");
      localStorage.setItem(`poll_${pollId}_vote`, selectedOption);
      localStorage.setItem(`poll_${pollId}_email`, email);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const payload = {
        action: "submit_vote",
        pollId,
        email: email.trim().toLowerCase(),
        option: selectedOption,
        referrer: typeof window !== "undefined" ? window.location.href : "",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      };

      const res = await fetch(webhookUrl, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "already_voted") {
        setUserVote(data.userVote || selectedOption);
        setResults(data.results);
        setStep("results");
        setStatusMessage("You have already voted in this poll! Here are the live results.");
        localStorage.setItem(`poll_${pollId}_vote`, data.userVote || selectedOption);
        localStorage.setItem(`poll_${pollId}_email`, email);
      } else if (data.status === "success" && data.results) {
        // Pre-verified user recognized by server
        setUserVote(data.userVote || selectedOption);
        setResults(data.results);
        setStep("results");
        setStatusMessage(data.message || "Thank you! Your vote has been recorded.");
        localStorage.setItem(`poll_${pollId}_vote`, data.userVote || selectedOption);
        localStorage.setItem(`poll_${pollId}_email`, email);
      } else if (data.status === "otp_sent") {
        setStep("otp_verification");
        setStatusMessage(data.message || `A 6-digit verification code was sent to ${email}.`);
      } else {
        throw new Error(data.message || "Failed to submit ballot.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while submitting your vote.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        action: "verify_otp",
        pollId,
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      };

      const res = await fetch(webhookUrl, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "success") {
        setUserVote(data.userVote || selectedOption);
        setResults(data.results);
        setStep("results");
        localStorage.setItem(`poll_${pollId}_vote`, data.userVote || selectedOption);
        localStorage.setItem(`poll_${pollId}_email`, email);
      } else {
        throw new Error(data.message || "Invalid or expired verification code.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!webhookUrl) return;
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: "resend_otp", pollId, email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      setStatusMessage(data.message || "A new code has been sent to your email.");
    } catch {
      setErrorMessage("Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`rounded-xl border border-border bg-card p-6 shadow-xs ${className}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent mb-2">
        <BarChart3 className="h-4 w-4" />
        <span>Community Pulse</span>
      </div>

      <h3 className="text-xl font-bold text-foreground leading-snug">{question}</h3>

      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {statusMessage && step !== "results" && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 p-3 text-xs text-accent">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* STEP 1: VOTING FORM */}
      {step === "voting" && (
        <form onSubmit={handleSubmitVote} className="mt-5 space-y-4">
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            {options.map((opt) => (
              <label
                key={opt}
                className={`flex items-center justify-between rounded-lg border p-3 text-sm cursor-pointer transition-all ${
                  selectedOption === opt
                    ? "border-accent bg-accent/5 font-medium text-foreground ring-1 ring-accent"
                    : "border-border bg-background text-foreground hover:border-accent/40 hover:bg-muted/40"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name={`poll_${pollId}`}
                    value={opt}
                    checked={selectedOption === opt}
                    onChange={() => setSelectedOption(opt)}
                    className="h-4 w-4 text-accent border-input focus:ring-accent"
                  />
                  <span>{opt}</span>
                </div>
              </label>
            ))}
          </div>

          <div className="pt-3 border-t border-border">
            <label htmlFor={`poll-email-${pollId}`} className="block text-xs font-medium text-muted-foreground mb-1.5">
              Enter your email to verify vote & reveal live results <span className="text-destructive">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id={`poll-email-${pollId}`}
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="flex-1 rounded-lg border border-input bg-background px-3.5 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Vote</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Strict one-vote-per-email. A fast 6-digit confirmation code verifies genuine participation.
            </p>
          </div>
        </form>
      )}

      {/* STEP 2: OTP VERIFICATION */}
      {step === "otp_verification" && (
        <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4 animate-in fade-in">
          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 text-center">
            <KeyRound className="mx-auto h-8 w-8 text-accent mb-2" />
            <h4 className="text-sm font-semibold text-foreground">Verify Your Ballot</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              We sent a 6-digit confirmation code to <strong>{email}</strong>.
            </p>
          </div>

          <div>
            <label htmlFor={`poll-otp-${pollId}`} className="block text-xs font-medium text-muted-foreground mb-1.5 text-center">
              6-Digit Verification Code
            </label>
            <input
              id={`poll-otp-${pollId}`}
              type="text"
              maxLength={6}
              required
              autoFocus
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              disabled={isLoading}
              className="w-full text-center tracking-[8px] font-mono font-bold text-lg rounded-lg border border-input bg-background py-2.5 focus-visible:outline-2 focus-visible:outline-accent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length < 6}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-foreground hover:bg-accent/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Confirm & Reveal Results</span>
            )}
          </button>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <button
              type="button"
              onClick={() => setStep("voting")}
              className="hover:text-foreground underline cursor-pointer"
            >
              Change choice or email
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="inline-flex items-center gap-1 text-accent hover:underline disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" /> Resend code
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: LIVE RESULTS DISPLAY */}
      {step === "results" && results && (
        <div className="mt-5 space-y-4 animate-in fade-in">
          {statusMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 p-3 text-xs text-accent">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="space-y-3">
            {options.map((opt) => {
              const count = results.breakdown[opt] || 0;
              const percentage = results.percentages[opt] || 0;
              const isSelected = userVote === opt;

              return (
                <div key={opt} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${isSelected ? "text-accent font-bold" : "text-foreground"}`}>
                      {opt} {isSelected && "(Your Vote)"}
                    </span>
                    <span className="text-muted-foreground font-mono">
                      {percentage}% ({count})
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full transition-all duration-700 ease-out rounded-full ${
                        isSelected ? "bg-accent" : "bg-primary/50"
                      }`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border text-xs text-muted-foreground">
            <span>Total verified ballots: {results.totalVotes}</span>
            <span className="flex items-center gap-1 text-accent">
              <CheckCircle2 className="h-3.5 w-3.5" /> Ballot Verified
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PollWidget;
