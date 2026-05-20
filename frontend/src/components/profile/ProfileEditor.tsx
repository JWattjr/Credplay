"use client";

import { useState } from "react";
import { BadgeCheck, Save, ShieldCheck, TrendingUp } from "lucide-react";
import WalletConnectControl from "@/components/wallet/WalletConnectControl";
import { useWalletProfile } from "@/hooks/useWalletProfile";
import { displayHandle, displayName, updateProfile, type Profile } from "@/lib/credplay";

export default function ProfileEditor() {
  const { profile, setProfile, isConnected, loading, error } = useWalletProfile();

  return (
    <section className="rounded-[8px] border border-white/10 bg-[linear-gradient(160deg,rgba(21,22,24,0.98),rgba(5,5,5,0.98))] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.4)]">
      <div className="mb-5">
        <WalletConnectControl />
      </div>

      <div className="flex items-start gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black">
          {profile?.avatar_url ? (
            <div className="h-full w-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${profile.avatar_url})` }} />
          ) : (
            <TrendingUp className="h-9 w-9 text-brand-secondary" />
          )}
          {profile && (
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-black bg-brand-secondary text-black">
              <BadgeCheck className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-black leading-none text-white">
            {isConnected ? displayName(profile) : "Connect wallet"}
          </h2>
          <p className="mt-2 font-mono text-sm text-[var(--muted)]">
            {isConnected ? displayHandle(profile) : "@wallet"}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-secondary/30 bg-brand-secondary/10 px-3 py-1 font-mono text-[11px] font-black text-brand-secondary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Trusted World Cup Predictor
          </div>
        </div>
      </div>

      {profile && (
        <div className="mt-6 rounded-[8px] border border-white/10 bg-black/25 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[var(--muted)]">
              Reputation
            </span>
            <span className="text-2xl font-black text-brand-secondary">
              {profile.signalPoints || 98.7}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <SignalMetric label="Correct" value={profile.freeVotesCorrect || 0} />
            <SignalMetric label="Wrong" value={profile.freeVotesWrong || 0} />
            <SignalMetric label="Markets" value={profile.freeVotesTotal || 0} />
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            Building the most credible layer for football predictions.
          </p>
        </div>
      )}

      <ProfileForm
        error={error}
        key={profile?.id || "empty"}
        loading={loading}
        profile={profile}
        setProfile={setProfile}
      />
    </section>
  );
}

function SignalMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-white/10 bg-white/[0.03] p-3">
      <p className="font-mono text-base font-black text-white">{value}</p>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
    </div>
  );
}

function ProfileForm({
  profile,
  setProfile,
  loading,
  error,
}: {
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  loading: boolean;
  error: string | null;
}) {
  const [username, setUsername] = useState(profile?.username || "");
  const [display, setDisplay] = useState(profile?.display_name || "");
  const [avatar, setAvatar] = useState(profile?.avatar_url || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const nextProfile = await updateProfile(profile.id, {
        username: username.trim(),
        display_name: display.trim() || null,
        avatar_url: avatar.trim() || null,
        bio: bio.trim() || null,
      });
      setProfile(nextProfile);
      setMessage("Profile saved.");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mt-5 grid gap-3">
        <input
          className="h-11 rounded-[8px] border border-white/10 bg-black/35 px-3 text-sm text-white outline-none placeholder:text-[var(--muted)] focus:border-brand-secondary/50"
          disabled={!profile || saving}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="username"
          value={username}
        />
        <input
          className="h-11 rounded-[8px] border border-white/10 bg-black/35 px-3 text-sm text-white outline-none placeholder:text-[var(--muted)] focus:border-brand-secondary/50"
          disabled={!profile || saving}
          onChange={(event) => setDisplay(event.target.value)}
          placeholder="Display name"
          value={display}
        />
        <input
          className="h-11 rounded-[8px] border border-white/10 bg-black/35 px-3 text-sm text-white outline-none placeholder:text-[var(--muted)] focus:border-brand-secondary/50"
          disabled={!profile || saving}
          onChange={(event) => setAvatar(event.target.value)}
          placeholder="Avatar URL"
          value={avatar}
        />
        <textarea
          className="min-h-24 rounded-[8px] border border-white/10 bg-black/35 p-3 text-sm text-white outline-none placeholder:text-[var(--muted)] focus:border-brand-secondary/50"
          disabled={!profile || saving}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Bio"
          value={bio}
        />
      </div>

      {(message || error || loading) && (
        <p className="mt-3 text-sm text-[var(--muted)]">{loading ? "Loading profile..." : message || error}</p>
      )}

      <button
        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[8px] bg-brand-secondary font-mono text-xs font-black uppercase tracking-[0.14em] text-black transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!profile || saving}
        onClick={save}
        type="button"
      >
        {saving ? "Saving" : "Save Profile"} <Save className="h-4 w-4" />
      </button>
    </>
  );
}
