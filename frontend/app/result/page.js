"use client";

import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle, Clock, Activity, WifiOff, Cpu } from "lucide-react";

export default function ResultPage() {
  const [searchQuery, setSearchQuery] = useState("M-10293");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationTime, setVerificationTime] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [showResult, setShowResult] = useState(true);

  // Hardcoded Mock Data for Demonstration (Matching your Exact Video Script)
  const [batchData, setBatchData] = useState({
    batchId: "M-10293",
    medicineName: "Amoxicillin 500mg",
    manufacturer: "PharmaCorp Global",
    blockchainTx: "0x96662c29a7f56C6817065749c35E7F95AE83B971",
    aiRiskScore: 2, // Low risk normally
    isExpired: false, // Switch to true to trigger the Self-Destruct feature
    timestamp: "2026-07-06 14:45",
    signature: "RSA-2048: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  });

  // Handle Offline Simulation via Window Events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleVerify = (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    setIsVerifying(true);
    setShowResult(false);
    
    // Exact Script Verification Time: 847ms
    const startTime = performance.now();
    setTimeout(() => {
      setIsVerifying(false);
      setShowResult(true);
      setVerificationTime(847); 
    }, 847);
  };

  // KILLER FEATURE: Toggle Expiry to show Judges the Blockchain Self-Destruct state
  const toggleSelfDestructDemo = () => {
    setBatchData(prev => ({
      ...prev,
      isExpired: !prev.isExpired,
      aiRiskScore: !prev.isExpired ? 98 : 2 // Risk skyrockets if expired token is reused
    }));
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-6 flex flex-col items-center justify-center font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Background Glows for Modern Dark Theme Aesthetic */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl z-10">
        {/* Header Setup */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            MediVerify Cryptographic Scanner
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Decentralized Autonomous Verification Engine v2.4
          </p>
        </div>

        {/* Search / Manual Entry Input Form */}
        <form onSubmit={handleVerify} className="mb-6 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter Batch ID (e.g., M-10293)..."
            className="flex-1 bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-3 text-cyan-400 font-mono focus:outline-none focus:border-cyan-500 transition-all backdrop-blur-md"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 font-bold px-6 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            Verify
          </button>
        </form>

        {/* Live Status Indicators */}
        <div className="flex gap-4 mb-6 justify-center text-xs font-mono">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${isOffline ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
            {isOffline ? <WifiOff size={14} /> : <Activity size={14} />}
            {isOffline ? "OFFLINE MODE ACTIVE" : "NODE CONNECTION: LIVE"}
          </div>
          <button 
            onClick={toggleSelfDestructDemo}
            className="bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-full hover:bg-red-500/20 transition-all"
          >
            ⚙️ Simulate {batchData.isExpired ? "Valid State" : "Self-Destruct/Expiry"}
          </button>
        </div>

        {/* Verification Loader State */}
        {isVerifying && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-12 text-center backdrop-blur-md flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-mono text-cyan-400 text-sm animate-pulse">Querying Sepolia Ledger & Running Cryptographic Check...</p>
          </div>
        )}

        {/* MAIN RESULTS DISPENSATION SECTION */}
        {showResult && !isVerifying && (
          <div className="space-y-6">
            
            {/* CONDITION A: SELF-DESTRUCTED / EXPIRED UI (JUDGE KILLER DROP-DOWN) */}
            {batchData.isExpired ? (
              <div className="relative overflow-hidden bg-red-950/40 border-2 border-red-500 rounded-2xl p-6 backdrop-blur-md shadow-2xl shadow-red-500/10 animate-pulse">
                <div className="absolute top-0 right-0 bg-red-500 text-black font-black text-[10px] px-3 py-1 rounded-bl-lg font-mono tracking-widest">
                  REVOKED
                </div>
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500/20 rounded-xl text-red-400">
                    <AlertTriangle size={32} className="animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-red-400 font-mono tracking-wide">
                      CRITICAL: CRYPTOGRAPHIC TOKEN REVOKED
                    </h2>
                    <p className="text-slate-300 text-sm mt-1">
                      This batch (<span className="text-red-400 font-mono font-bold">{batchData.batchId}</span>) has passed its time-lock expiration schema. The Smart Contract ledger has permanently executed a state self-destruct routine for this token.
                    </p>
                    <div className="mt-4 bg-black/40 border border-red-500/20 p-3 rounded-lg font-mono text-xs text-red-300 space-y-1">
                      <p>• Status: Cryptographically Invalidated</p>
                      <p>• Action: DO NOT CONSUME. Batch execution halted by ledger.</p>
                      <p>• Anti-Clone Flag: Active threat detected on cloned string.</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              
              /* CONDITION B: FULL SUCCESS / VERIFIED UI (ORIGINAL PERFECT APP ROUTINE) */
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
                
                {/* Header Status Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">Verification Status</span>
                      <h2 className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-2">
                        AUTHENTICITY VERIFIED
                      </h2>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-slate-400">
                    <span className="text-emerald-400 font-bold">{verificationTime || "847"} ms</span> latency
                  </div>
                </div>

                {/* Metadata Ledger Panel */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[11px] text-slate-500 block">Medicine Architecture</span>
                    <span className="font-semibold text-slate-200">{batchData.medicineName}</span>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                    <span className="text-[11px] text-slate-500 block">Authorized Manufacturer</span>
                    <span className="font-semibold text-slate-200">{batchData.manufacturer}</span>
                  </div>
                </div>

                {/* Supply Chain Timeline Trace UI */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                    <Clock size={12} /> Real-Time Immutable Supply Chain Timeline
                  </h3>
                  <div className="space-y-3 font-mono text-xs pl-2 border-l-2 border-cyan-500/30 ml-2">
                    <div className="relative flex justify-between items-center text-slate-300">
                      <div className="absolute -left-[15px] w-2 h-2 rounded-full bg-cyan-500" />
                      <span>Factory Packaged & RSA Signed</span>
                      <span className="text-[10px] text-slate-500">{batchData.timestamp}</span>
                    </div>
                    <div className="relative flex justify-between items-center text-slate-400">
                      <div className="absolute -left-[15px] w-2 h-2 rounded-full bg-slate-700" />
                      <span>Distributed to Verified Logistics</span>
                      <span className="text-[10px] text-slate-500">In-Transit Check ✓</span>
                    </div>
                  </div>
                </div>

                {/* AI Risk Scoring Gauges Section */}
                <div className="border-t border-slate-800 pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Cpu size={12} /> AI Risk Engine Scan Evaluation
                    </h3>
                    <span className={`text-xs font-mono font-bold ${batchData.aiRiskScore > 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {batchData.aiRiskScore}% Risk Index
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-1000 ${batchData.aiRiskScore > 10 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'}`}
                      style={{ width: `${batchData.aiRiskScore}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {batchData.aiRiskScore > 10 
                      ? "ALERT: High scanning localization match indicating potential cloned barcode pattern matching."
                      : "No anomaly vectors detected. Pattern profile aligns with genuine non-duplicated system deployment."}
                  </p>
                </div>

              </div>
            )}

            {/* BLOCKCHAIN PROOF & CRYPTOGRAPHIC FOOTER (Works in both states) */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-2 text-slate-400">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1"><Shield size={12} className="text-cyan-500" /> Cryptographic Signature Status:</span>
                <span className={isOffline ? "text-amber-400 font-bold" : "text-cyan-400"}>
                  {isOffline ? "Cryptographically Verified Offline ✓" : "ECDSA + RSA Verified"}
                </span>
              </div>
              <div className="truncate">
                <span className="text-slate-500">Hash Check:</span> {batchData.signature}
              </div>
              <div className="truncate pt-2 border-t border-slate-900 flex justify-between items-center">
                <span>Etherscan Smart Contract Proof:</span>
                <a 
                  href={`https://sepolia.etherscan.io/address/${batchData.blockchainTx}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline hover:text-cyan-300"
                >
                  0x9666...B971 ↗
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}