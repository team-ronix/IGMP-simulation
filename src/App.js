import React, { useState, useRef, useEffect } from 'react';
import { Router, Network, Monitor, Radio, Trash2, Zap, Server, Filter } from 'lucide-react';
import './App.css';

const App = () => {
  const groupAddress = '224.0.0.1';
  
  // --- STATE ---
  const [sources, setSources] = useState([
    { id: 0, name: 'Source A', ip: '10.0.1.10', active: false, color: 'blue' },
    { id: 1, name: 'Source B', ip: '10.0.2.20', active: false, color: 'green' },
    { id: 2, name: 'Source C', ip: '10.0.3.30', active: false, color: 'orange' },
  ]);

  const [switches, setSwitches] = useState([
    { id: 0, name: 'Switch 1', network: '192.168.1.0/24', snooping: true },
    { id: 1, name: 'Switch 2', network: '192.168.2.0/24', snooping: true },
    { id: 2, name: 'Switch 3', network: '192.168.3.0/24', snooping: true },
  ]);

  const [hosts, setHosts] = useState([
    { id: 0, name: 'Host A', network: 0, ip: '192.168.1.10', joined: false, ssmMode: false, allowedSources: [] },
    { id: 1, name: 'Host B', network: 0, ip: '192.168.1.11', joined: false, ssmMode: false, allowedSources: [] },
    { id: 2, name: 'Host C', network: 1, ip: '192.168.2.10', joined: false, ssmMode: false, allowedSources: [] },
    { id: 3, name: 'Host D', network: 1, ip: '192.168.2.11', joined: false, ssmMode: false, allowedSources: [] },
    { id: 4, name: 'Host E', network: 2, ip: '192.168.3.10', joined: false, ssmMode: false, allowedSources: [] },
    { id: 5, name: 'Host F', network: 2, ip: '192.168.3.11', joined: false, ssmMode: false, allowedSources: [] },
  ]);
  
  const [logs, setLogs] = useState([]);
  const [selectedHost, setSelectedHost] = useState(null);
  const [selectedSwitch, setSelectedSwitch] = useState(null);
  const packetLayerRef = useRef(null);

  // --- LOGIC ---

  const addLog = (msg, type) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs(prevLogs => [{
      id: Date.now() + Math.random(),
      time,
      msg,
      type
    }, ...prevLogs.slice(0, 9)]);
  };

  const clearLogs = () => setLogs([]);

  // PACKET SPAWNING LOGIC - EXPANDED TREE COORDINATES
  const spawnPacket = (type, path, delay = 0, color = null) => {
    setTimeout(() => {
      if (!packetLayerRef.current) return;
      
      const p = document.createElement('div');
      p.classList.add('packet');
      
      // Packet Styling
      if (type === 'query') p.classList.add('bg-purple-500', 'shadow-[0_0_10px_#a855f7]');
      else if (type === 'report') p.classList.add('bg-emerald-400', 'shadow-[0_0_10px_#34d399]');
      else if (type === 'leave') p.classList.add('bg-red-500', 'shadow-[0_0_10px_#ef4444]');
      else if (type === 'data') {
        if (color === 'blue') p.classList.add('bg-blue-400', 'shadow-[0_0_10px_#60a5fa]');
        else if (color === 'green') p.classList.add('bg-green-400', 'shadow-[0_0_10px_#4ade80]');
        else if (color === 'orange') p.classList.add('bg-orange-400', 'shadow-[0_0_10px_#fb923c]');
        else p.classList.add('bg-yellow-400', 'shadow-[0_0_10px_#facc15]');
      }

      // --- PATH LOGIC (Matching NEW Expanded SVG Lines) ---
      // Vertical Levels: Sources(80px) -> Router(250px) -> Switches(450px) -> Hosts(700px)

      // 1. Source to Router
      if (path.startsWith('source')) {
        const parts = path.split('-');
        const sourceIdx = parseInt(parts[0].replace('source', ''));
        // Start: Top 80px (Source)
        p.style.top = '80px'; 
        if (sourceIdx === 0) p.style.left = '20%';
        else if (sourceIdx === 1) p.style.left = '50%';
        else if (sourceIdx === 2) p.style.left = '80%';
        
        p.classList.add(`animate-source${sourceIdx}-router`);
      }
      
      // 2. Router to Switch
      else if (path.startsWith('router-switch')) {
        const switchId = path.split('-')[2];
        p.style.top = '250px'; // Router Center
        p.style.left = '50%';  
        p.classList.add(`animate-router-switch${switchId}`);
      }
      
      // 3. Switch to Router
      else if (path.startsWith('switch') && path.endsWith('-router')) {
        const switchId = path.split('-')[0].replace('switch', '');
        p.style.top = '450px'; // Switch Center
        if (switchId === '0') p.style.left = '20%';
        else if (switchId === '1') p.style.left = '50%';
        else if (switchId === '2') p.style.left = '80%';
        
        p.classList.add(`animate-switch${switchId}-router`);
      }
      
      // 4. Switch to Host
      else if (path.startsWith('switch') && path.includes('-host')) {
        const parts = path.split('-');
        const switchId = parts[0].replace('switch', '');
        const hostId = parts[1].replace('host', '');
        
        p.style.top = '450px'; // Switch Center
        if (switchId === '0') p.style.left = '20%';
        else if (switchId === '1') p.style.left = '50%';
        else if (switchId === '2') p.style.left = '80%';
        
        p.classList.add(`animate-switch${switchId}-host${hostId}`);
      }
      
      // 5. Host to Switch
      else if (path.startsWith('host') && path.includes('-switch')) {
        const parts = path.split('-');
        const hostId = parts[0].replace('host', '');
        const switchId = parts[1].replace('switch', '');
        
        p.style.top = '700px'; // Host Center (Lower now)
        // Host Centers
        if (hostId === '0') p.style.left = '12%';
        if (hostId === '1') p.style.left = '28%';
        if (hostId === '2') p.style.left = '42%';
        if (hostId === '3') p.style.left = '58%';
        if (hostId === '4') p.style.left = '72%';
        if (hostId === '5') p.style.left = '88%';

        p.classList.add(`animate-host${hostId}-switch${switchId}`);
      }

      packetLayerRef.current.appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }, delay);
  };

  const toggleJoin = (index) => {
    setHosts(prevHosts => {
      const newHosts = [...prevHosts];
      newHosts[index] = { ...newHosts[index], joined: !newHosts[index].joined };
      
      const host = newHosts[index];
      const switchId = host.network;
      
      if (host.joined) {
        if (host.ssmMode && host.allowedSources.length > 0) {
          addLog(`${host.name} (Net ${switchId + 1}) sent SSM Report (${host.allowedSources.length} sources)`, 'report');
        } else {
          addLog(`${host.name} (Net ${switchId + 1}) sent Membership Report`, 'report');
        }
        // Host to switch with immediate delay
        spawnPacket('report', `host${index}-switch${switchId}`, 0);
        // Switch to router with 800ms delay (time for switch to process)
        spawnPacket('report', `switch${switchId}-router`, 800);
      } else {
        addLog(`${host.name} (Net ${switchId + 1}) sent Leave Group`, 'leave');
        // Host to switch with immediate delay
        spawnPacket('leave', `host${index}-switch${switchId}`, 0);
        // Switch to router with 800ms delay
        spawnPacket('leave', `switch${switchId}-router`, 800);
        newHosts[index].ssmMode = false;
        newHosts[index].allowedSources = [];
      }
      return newHosts;
    });
  };

  const toggleSSM = (hostIndex) => {
    setHosts(prevHosts => {
      const newHosts = [...prevHosts];
      newHosts[hostIndex] = { ...newHosts[hostIndex], ssmMode: !newHosts[hostIndex].ssmMode };
      if (!newHosts[hostIndex].ssmMode) {
        newHosts[hostIndex].allowedSources = [];
      }
      addLog(`${newHosts[hostIndex].name} ${newHosts[hostIndex].ssmMode ? 'enabled' : 'disabled'} SSM mode`, 'report');
      return newHosts;
    });
  };

  const toggleSourceForHost = (hostIndex, sourceId) => {
    setHosts(prevHosts => {
      const newHosts = [...prevHosts];
      const host = newHosts[hostIndex];
      const sourceIndex = host.allowedSources.indexOf(sourceId);
      
      if (sourceIndex > -1) {
        host.allowedSources.splice(sourceIndex, 1);
        addLog(`${host.name} blocked ${sources[sourceId].name}`, 'leave');
      } else {
        host.allowedSources.push(sourceId);
        addLog(`${host.name} allowed ${sources[sourceId].name}`, 'report');
      }
      return newHosts;
    });
  };

  const toggleSource = (sourceIndex) => {
    setSources(prevSources => {
      const newSources = [...prevSources];
      newSources[sourceIndex] = { ...newSources[sourceIndex], active: !newSources[sourceIndex].active };
      const source = newSources[sourceIndex];
      if (source.active) {
        addLog(`${source.name} started streaming to ${groupAddress}`, 'data');
      } else {
        addLog(`${source.name} stopped streaming`, 'leave');
      }
      return newSources;
    });
  };

  const sendGeneralQuery = () => {
    addLog(`Router sent General Query to all networks (${groupAddress})`, 'query');
    
    // Router sends query to each switch (staggered by 300ms)
    switches.forEach((sw, idx) => {
      spawnPacket('query', `router-switch-${sw.id}`, idx * 300);
    });

    // Each switch forwards to its hosts (staggered)
    hosts.forEach((host, idx) => {
      const switchDelay = 1000 + host.network * 300; // Wait for switch to receive
      const hostOffset = (idx % 2) * 200; // Offset between hosts on same switch
      setTimeout(() => {
        spawnPacket('query', `switch${host.network}-host${idx}`, 0);
      }, switchDelay + hostOffset);
    });

    // Hosts respond if joined (staggered responses)
    hosts.forEach((host, idx) => {
      if (host.joined) {
        const baseDelay = 2500 + host.network * 300; // Base delay per network
        const hostOffset = (idx % 2) * 250; // Offset between hosts
        const randomJitter = Math.random() * 300; // Random jitter
        setTimeout(() => {
          addLog(`${host.name} (Net ${host.network + 1}) responding to Query`, 'report');
          spawnPacket('report', `host${idx}-switch${host.network}`, 0);
          spawnPacket('report', `switch${host.network}-router`, 1000);
        }, baseDelay + hostOffset + randomJitter);
      }
    });
  };

  const streamFromSources = () => {
    const activeSources = sources.filter(s => s.active);
    if (activeSources.length === 0) return;

    activeSources.forEach((source, srcIdx) => {
      // Stagger packets from different sources
      const sourceDelay = srcIdx * 150;
      spawnPacket('data', `source${source.id}-router`, sourceDelay, source.color);
      
      setTimeout(() => {
        switches.forEach((sw, swIdx) => {
          const needsSource = hosts.some(h => 
            h.network === sw.id && h.joined && 
            (!h.ssmMode || h.allowedSources.includes(source.id))
          );
          
          if (needsSource || !sw.snooping) {
            // Stagger packets to different switches
            spawnPacket('data', `router-switch-${sw.id}`, swIdx * 200, source.color);
            
            setTimeout(() => {
              hosts.forEach((host, hostIdx) => {
                if (host.network !== sw.id) return;
                
                let shouldReceive = false;
                if (host.joined) {
                  if (host.ssmMode) {
                    shouldReceive = host.allowedSources.includes(source.id);
                  } else {
                    shouldReceive = true;
                  }
                }
                
                // Stagger packets to different hosts
                const hostOffset = (hostIdx % 2) * 150;
                if (sw.snooping) {
                  if (shouldReceive) spawnPacket('data', `switch${sw.id}-host${hostIdx}`, hostOffset, source.color);
                } else {
                  spawnPacket('data', `switch${sw.id}-host${hostIdx}`, hostOffset, source.color);
                }
              });
            }, 1000);
          }
        });
      }, 800 + sourceDelay);
    });
  };

  useEffect(() => {
    let interval;
    if (sources.some(s => s.active)) {
      interval = setInterval(streamFromSources, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sources, hosts, switches]);

  const toggleSnooping = (switchId) => {
    setSwitches(prevSwitches => {
      const newSwitches = [...prevSwitches];
      newSwitches[switchId] = { ...newSwitches[switchId], snooping: !newSwitches[switchId].snooping };
      addLog(`${newSwitches[switchId].name} snooping ${newSwitches[switchId].snooping ? 'enabled' : 'disabled'}`, 'query');
      return newSwitches;
    });
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans">
      {/* HEADER */}
      <div className="bg-[#0f172a]/80 backdrop-blur border-b border-slate-800 p-6 text-center relative z-20">
        <div className="inline-block px-3 py-1 rounded-full bg-cyan-900/30 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-wider mb-2">
          PROTOCOL VISUALIZER - IGMPv3 with SSM
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
          <span className="text-cyan-400">Multi-Network IGMP:</span> <span className="bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">Long-Edge Topology</span>
        </h1>
        <p className="text-slate-400 max-w-3xl mx-auto text-sm md:text-base">
          <span className="text-emerald-400 font-semibold">3 Network Segments</span> connected via expanded links for better visibility.
        </p>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* LEFT SIDEBAR: CONTROLS */}
        <div className="space-y-4">
          
          {/* Source Controls */}
          <div className="bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden">
            <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-700 font-bold text-slate-200 text-sm tracking-wide flex items-center gap-2">
              <Server className="w-4 h-4" />
              MULTICAST SOURCES
            </div>
            <div className="p-4 space-y-2">
              {sources.map((source) => (
                <button 
                  key={source.id}
                  onClick={() => toggleSource(source.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    source.active 
                      ? `bg-${source.color}-900/20 border-${source.color}-500` 
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="text-left">
                    <div className={`font-bold text-sm ${source.active ? `text-${source.color}-400` : 'text-slate-400'}`}>
                      {source.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">{source.ip}</div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    source.active ? `bg-${source.color}-400 shadow-[0_0_8px] shadow-${source.color}-400` : 'bg-slate-600'
                  }`}></div>
                </button>
              ))}
            </div>
          </div>

          {/* Router Actions */}
          <div className="bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden">
            <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-700 font-bold text-slate-200 text-sm tracking-wide">
              ROUTER ACTIONS
            </div>
            <div className="p-4">
              <button 
                onClick={sendGeneralQuery} 
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-2.5 rounded-lg font-semibold transition-all active:scale-95 shadow-lg cursor-pointer"
              >
                <Radio className="w-4 h-4" /> Send General Query
              </button>
            </div>
          </div>

          {/* Network Switches Config */}
          <div className="bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden">
            <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-700 font-bold text-slate-200 text-sm tracking-wide flex items-center gap-2">
              <Network className="w-4 h-4" />
              NETWORK SWITCHES
            </div>
            <div className="p-4 space-y-2">
              {switches.map((sw) => (
                <div key={sw.id} className="bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs font-bold text-slate-300">{sw.name}</div>
                    <button 
                      onClick={() => toggleSnooping(sw.id)} 
                      className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                        sw.snooping ? 'bg-cyan-500' : 'bg-red-500'
                      }`}
                    >
                      <span className={`inline-block w-3 h-3 transform transition rounded-full bg-white shadow-sm mt-1 ml-1 ${
                        sw.snooping ? 'translate-x-4' : 'translate-x-0'
                      }`}></span>
                    </button>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{sw.network}</div>
                  <div className="text-[9px] text-slate-400 mt-1">
                    Snooping: {sw.snooping ? '✓ ON' : '✗ OFF'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Packet Legend */}
          <div className="bg-[#1e293b] rounded-xl border border-slate-700 p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Packet Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span>Query</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span>Report/Join</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span>Data (Source A)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span>Data (Source B)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                <span>Data (Source C)</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: TREE TOPOLOGY VISUALIZATION (EXPANDED HEIGHT) */}
        <div className="lg:col-span-2 relative min-h-[850px] bg-[#111827] rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
          
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>

          {/* PACKET LAYER */}
          <div ref={packetLayerRef} className="absolute inset-0 pointer-events-none z-50"></div>

          {/* SVG CONNECTIONS (Full Overlay - Expanded Edges) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {/* 1. SOURCES to ROUTER (y: 80 -> 250) */}
            <line x1="20%" y1="80" x2="50%" y2="250" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />
            <line x1="50%" y1="80" x2="50%" y2="250" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />
            <line x1="80%" y1="80" x2="50%" y2="250" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" className="opacity-40" />

            {/* 2. ROUTER to SWITCHES (y: 250 -> 450) */}
            <line x1="50%" y1="250" x2="20%" y2="450" stroke="#64748b" strokeWidth="3" />
            <line x1="50%" y1="250" x2="50%" y2="450" stroke="#64748b" strokeWidth="3" />
            <line x1="50%" y1="250" x2="80%" y2="450" stroke="#64748b" strokeWidth="3" />

            {/* 3. SWITCHES to HOSTS (y: 450 -> 700) */}
            {/* Switch 1 Hosts */}
            <line x1="20%" y1="450" x2="12%" y2="700" stroke="#475569" strokeWidth="2" />
            <line x1="20%" y1="450" x2="28%" y2="700" stroke="#475569" strokeWidth="2" />
            
            {/* Switch 2 Hosts */}
            <line x1="50%" y1="450" x2="42%" y2="700" stroke="#475569" strokeWidth="2" />
            <line x1="50%" y1="450" x2="58%" y2="700" stroke="#475569" strokeWidth="2" />

            {/* Switch 3 Hosts */}
            <line x1="80%" y1="450" x2="72%" y2="700" stroke="#475569" strokeWidth="2" />
            <line x1="80%" y1="450" x2="88%" y2="700" stroke="#475569" strokeWidth="2" />
          </svg>

          {/* --- TOPOLOGY LAYOUT --- */}
          <div className="absolute inset-0 flex flex-col items-center pt-8">

            {/* LEVEL 1: SOURCES (at approx 80px top) */}
            <div className="w-full flex justify-around px-10 relative z-10 h-[100px]">
              {sources.map((source, i) => (
                <div key={source.id} className="flex flex-col items-center w-24 relative">
                  <div className={`p-3 rounded-lg border-2 transition-all z-20 bg-[#0B1120] ${
                    source.active 
                      ? `border-${source.color}-500 shadow-[0_0_15px] shadow-${source.color}-500/40` 
                      : 'border-slate-700'
                  }`}>
                    <Server className={`w-6 h-6 ${source.active ? `text-${source.color}-400` : 'text-slate-500'}`} />
                  </div>
                  <span className="mt-2 text-xs font-bold text-slate-300">{source.name}</span>
                </div>
              ))}
            </div>

            {/* LEVEL 2: ROUTER (at approx 250px top) */}
            <div className="absolute top-[250px] left-1/2 -translate-x-1/2 z-10 flex flex-col items-center -translate-y-1/2">
              <div className="bg-[#1e293b] p-4 rounded-xl border-2 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.2)] z-20 relative">
                <Router className="w-8 h-8 text-purple-400" />
              </div>
              <span className="mt-1 text-sm font-bold text-slate-200">Multicast Router</span>
            </div>

            {/* LEVEL 3: SWITCHES (at approx 450px top) */}
            <div className="absolute top-[450px] w-full flex justify-around px-4 z-10">
              {switches.map((sw) => (
                <div key={sw.id} className="flex flex-col items-center relative w-1/3 -translate-y-1/2">
                  <button
                    onClick={() => setSelectedSwitch(selectedSwitch === sw.id ? null : sw.id)}
                    className={`p-3 rounded-lg border-2 transition-all cursor-pointer z-20 bg-[#0B1120] ${
                      sw.snooping 
                        ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' 
                        : 'border-red-500/50'
                    } ${selectedSwitch === sw.id ? 'ring-2 ring-yellow-400' : ''}`}
                  >
                    <Network className={`w-6 h-6 ${sw.snooping ? 'text-cyan-400' : 'text-red-400'}`} />
                  </button>
                  <span className="mt-2 text-xs font-bold text-slate-300">{sw.name}</span>
                </div>
              ))}
            </div>

            {/* LEVEL 4: HOSTS (at approx 700px top) */}
            <div className="absolute top-[700px] w-full flex justify-around px-2 z-10">
              {switches.map((sw) => (
                <div key={`network-${sw.id}`} className="flex justify-center gap-4 w-1/3 -translate-y-1/2">
                  {hosts.filter(h => h.network === sw.id).map((host) => (
                    <div key={host.id} className="flex flex-col items-center">
                      <button 
                        onClick={() => setSelectedHost(selectedHost === host.id ? null : host.id)}
                        className={`relative p-3 rounded-lg border-2 transition-all w-14 h-14 flex flex-col items-center justify-center cursor-pointer bg-[#0B1120] ${
                          host.joined 
                            ? 'border-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                            : 'border-slate-700 hover:border-slate-500'
                        } ${selectedHost === host.id ? 'ring-2 ring-yellow-400' : ''}`}
                      >
                        <Monitor className={`w-5 h-5 ${host.joined ? 'text-emerald-400' : 'text-slate-500'}`} />
                        {host.ssmMode && <Filter className="w-3 h-3 text-yellow-400 absolute top-0.5 right-0.5" />}
                      </button>
                      <span className="mt-1 text-[9px] font-medium text-slate-300">{host.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* RIGHT SIDEBAR: HOST CONFIG & LOGS */}
        <div className="space-y-4">
          
          {/* Host Configuration */}
          {selectedHost !== null && (
            <div className="bg-[#1e293b] rounded-xl border border-yellow-500/50 overflow-hidden">
              <div className="bg-[#0f172a] px-4 py-3 border-b border-yellow-500/30 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-yellow-400" />
                <span className="font-bold text-yellow-400 text-sm">{hosts[selectedHost].name} CONFIG</span>
              </div>
              <div className="p-4 space-y-3">
                
                {/* Join/Leave Button */}
                <button 
                  onClick={() => toggleJoin(selectedHost)}
                  className={`w-full py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                    hosts[selectedHost].joined 
                      ? 'bg-red-600 hover:bg-red-500 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {hosts[selectedHost].joined ? 'Leave Group' : 'Join Group'}
                </button>

                {/* SSM Toggle */}
                {hosts[selectedHost].joined && (
                  <>
                    <div className="flex items-center justify-between bg-slate-800/50 p-2 rounded border border-slate-700">
                      <span className="text-xs font-medium">SSM Mode (IGMPv3)</span>
                      <button 
                        onClick={() => toggleSSM(selectedHost)}
                        className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                          hosts[selectedHost].ssmMode ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                      >
                        <span className={`inline-block w-3 h-3 transform transition rounded-full bg-white shadow-sm mt-1 ml-1 ${
                          hosts[selectedHost].ssmMode ? 'translate-x-5' : 'translate-x-0'
                        }`}></span>
                      </button>
                    </div>

                    {/* Source Filtering */}
                    {hosts[selectedHost].ssmMode && (
                      <div className="border border-slate-700 rounded-lg p-3 bg-slate-800/30">
                        <div className="text-xs font-bold text-slate-300 mb-2">Allowed Sources:</div>
                        <div className="space-y-1">
                          {sources.map((source) => (
                            <button
                              key={source.id}
                              onClick={() => toggleSourceForHost(selectedHost, source.id)}
                              className={`w-full flex items-center justify-between p-2 rounded text-xs transition-all cursor-pointer ${
                                hosts[selectedHost].allowedSources.includes(source.id)
                                  ? `bg-${source.color}-900/30 border border-${source.color}-500/50`
                                  : 'bg-slate-700/50 border border-slate-600 hover:border-slate-500'
                              }`}
                            >
                              <span className={hosts[selectedHost].allowedSources.includes(source.id) ? `text-${source.color}-400` : 'text-slate-400'}>
                                {source.name}
                              </span>
                              <div className={`w-2 h-2 rounded-full ${
                                hosts[selectedHost].allowedSources.includes(source.id) ? `bg-${source.color}-400` : 'bg-slate-600'
                              }`}></div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Event Log */}
          <div className="bg-[#1e293b] rounded-xl border border-slate-700 flex flex-col overflow-hidden h-[400px]">
            <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-700 flex justify-between items-center">
              <span className="font-bold text-slate-200 text-sm">EVENT LOG</span>
              <button 
                onClick={clearLogs} 
                className="text-xs text-slate-500 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Clear
              </button>
            </div>
            <div className="p-3 overflow-y-auto flex-1 font-mono text-xs space-y-2">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-center italic mt-10">
                  System Ready
                </div>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="border-l-2 border-slate-700 pl-2 py-1">
                    <span className="text-slate-500 block text-[10px]">{log.time}</span>
                    <span className={
                      log.type === 'query' ? 'text-purple-400' :
                      log.type === 'report' ? 'text-emerald-400' :
                      log.type === 'leave' ? 'text-red-400' :
                      log.type === 'data' ? 'text-yellow-400' :
                      'text-slate-300'
                    }>{log.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM INFO */}
      <div className="max-w-7xl mx-auto p-6 pb-12">
        
        {/* Network Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {switches.map((sw) => {
            const networkHosts = hosts.filter(h => h.network === sw.id);
            const joinedHosts = networkHosts.filter(h => h.joined);
            return (
              <div key={sw.id} className="bg-[#1e293b] rounded-xl border border-slate-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-200">{sw.name}</h3>
                  <Network className={`w-5 h-5 ${sw.snooping ? 'text-cyan-400' : 'text-red-400'}`} />
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span className="font-mono text-slate-300">{sw.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hosts:</span>
                    <span className="text-slate-300">{networkHosts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Members:</span>
                    <span className="text-emerald-400 font-bold">{joinedHosts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IGMP Snooping:</span>
                    <span className={sw.snooping ? 'text-cyan-400' : 'text-red-400'}>
                      {sw.snooping ? '✓ Enabled' : '✗ Disabled'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700 p-6">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
            <Zap className="w-6 h-6 text-cyan-400" /> Multi-Network Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-cyan-400 font-bold mb-2">Distributed Networks</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Hosts are distributed across <span className="text-cyan-400 font-bold">3 independent networks</span>, 
                each with its own switch. The router manages multicast distribution across all networks efficiently.
              </p>
            </div>
            <div>
              <h3 className="text-emerald-400 font-bold mb-2">Per-Network Snooping</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Each switch can independently enable/disable <span className="text-emerald-400 font-bold">IGMP Snooping</span>. 
                Compare bandwidth efficiency across networks with different snooping configurations.
              </p>
            </div>
            <div>
              <h3 className="text-purple-400 font-bold mb-2">SSM Filtering</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Hosts in any network can use <span className="text-purple-400 font-bold">IGMPv3 SSM</span> to filter sources. 
                The router only forwards requested streams to each network.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;