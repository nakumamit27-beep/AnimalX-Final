import { useSocial } from "../context/SocialContext";
import BlueTick from "./BlueTick";

export default function AutoTickPopup() {
  const { autoTickPopup, dismissAutoTickPopup } = useSocial();
  if (!autoTickPopup) return null;
  return (
    <div className="auto-tick-backdrop" onClick={dismissAutoTickPopup}>
      <div className="auto-tick-popup" onClick={e => e.stopPropagation()}>
        <div className="auto-tick-confetti">🎉🎊🎉</div>
        <div className="auto-tick-icon"><BlueTick size={56} /></div>
        <div className="auto-tick-title">You're Verified!</div>
        <div className="auto-tick-sub">
          Congratulations — you've reached <b>100,000 followers</b>!<br />
          Your blue tick is now visible to everyone. 🎉
        </div>
        <button className="auto-tick-btn" onClick={dismissAutoTickPopup}>🎊 Awesome!</button>
      </div>
    </div>
  );
}
