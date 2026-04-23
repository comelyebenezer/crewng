import { useState, useEffect, useRef } from "react";

// ─── PRICE RANGES ─────────────────────────────────────────────────────────────
const PRICE_RANGES = {
  waiter:        { min: 10500,  max: 100000   },
  waitress:      { min: 10500,  max: 100000   },
  host:          { min: 15000,  max: 200000   },
  hostess:       { min: 15000,  max: 200000   },
  bouncer:       { min: 15000,  max: 200000   },
  coordinator:   { min: 30000,  max: 10000000 },
  event_planner: { min: 100000, max: 20000000 },
  bikini_girl:   { min: 15000,  max: 200000   },
  dancer:        { min: 15000,  max: 200000   },
  party_starter: { min: 15000,  max: 200000   },
};
const fmt  = n => `₦${Number(n).toLocaleString()}`;
const fmtR = id => { const r = PRICE_RANGES[id]; return r ? `${fmt(r.min)} – ${fmt(r.max)}` : ""; };

// ─── CATEGORIES ──────────────────────────────────────────────────────────────
const CATS = [
  { id:"waiter",        icon:"🍽️", label:"Waiters",       color:"#f5c842", sup:false },
  { id:"waitress",      icon:"🥂", label:"Waitresses",     color:"#e879a0", sup:false },
  { id:"host",          icon:"🤵", label:"Hosts",          color:"#60a5fa", sup:false },
  { id:"hostess",       icon:"💃", label:"Hostesses",      color:"#a78bfa", sup:false },
  { id:"bouncer",       icon:"🛡️", label:"Bouncers",       color:"#f97316", sup:false },
  { id:"coordinator",   icon:"📋", label:"Coordinators",   color:"#34d399", sup:true  },
  { id:"event_planner", icon:"🎯", label:"Event Planners", color:"#fb7185", sup:true  },
  { id:"bikini_girl",   icon:"👙", label:"Bikini Girls",   color:"#f472b6", sup:false },
  { id:"dancer",        icon:"💫", label:"Dancers",        color:"#c084fc", sup:false },
  { id:"party_starter", icon:"🎉", label:"Party Starters", color:"#fbbf24", sup:false },
];
const catById = id => CATS.find(c => c.id === id) || CATS[0];
const COMBOS = {
  event_planner:["coordinator","host","hostess"],
  coordinator:  ["host","hostess","waiter","waitress","bouncer"],
  bouncer:      ["coordinator"],
  host:[], hostess:[],
  waiter:       ["coordinator","host","event_planner"],
  waitress:     ["hostess","coordinator","event_planner"],
  bikini_girl:  ["dancer","hostess","waitress"],
  dancer:       ["bikini_girl","hostess","waitress"],
  party_starter:["dancer","bikini_girl","hostess"],
};

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const SKINS = ["Light","Medium Light","Medium","Medium Dark","Dark"];
const LOCS  = ["Lagos","Abuja","Port Harcourt","Ibadan","Kano","Enugu","Benin City","Owerri"];
const BGS   = ["linear-gradient(135deg,#2d1b00,#5c3800)","linear-gradient(135deg,#0d1f3c,#1a3a6b)","linear-gradient(135deg,#1a0d2e,#3d1f66)","linear-gradient(135deg,#0d2e1a,#1f6644)","linear-gradient(135deg,#2e1a0d,#6b3d1f)","linear-gradient(135deg,#1f0d2e,#4d1f5c)"];
const EMOJIS = { waiter:"👨🏾‍🍳",waitress:"👩🏾‍🍳",host:"🤵🏾",hostess:"💃🏾",bouncer:"💪🏾",coordinator:"👩🏾‍💼",event_planner:"🎯",bikini_girl:"👙",dancer:"💫",party_starter:"🎉" };
const FN = { waiter:["Emeka","Tunde","Chidi","Seun","Femi"],waitress:["Ngozi","Amaka","Temi","Sola","Chioma"],host:["Rotimi","Jide","Bayo","Lanre","Tobi"],hostess:["Zainab","Fatima","Aisha","Hadiza","Mariam"],bouncer:["Sunday","Musa","Ibrahim","Hassan","Lawal"],coordinator:["Adaora","Lola","Ify","Titi","Shade"],event_planner:["Funmilayo","Chiamaka","Oluwaseun","Temitope","Amara"],bikini_girl:["Sasha","Vivian","Precious","Diamond","Crystal"],dancer:["Glory","Miracle","Favour","Grace","Stella"],party_starter:["Hype","Blaze","Vibe","Energy","Sparks"] };
const LN = ["Okafor","Adeyemi","Nwosu","Balogun","Eze","Adeleke","Obi","Fashola","Nwankwo","Afolabi"];
const TAGS = { waiter:[["Fine Dining","Cocktails","Banquet"],["Silver Service","Buffet"]],waitress:[["Fine Dining","Table Service"],["Cocktail Events","Outdoor"]],host:[["MC","Guest Relations"],["VIP","Red Carpet"]],hostess:[["Welcome","VIP Protocol"],["Weddings","Gala"]],bouncer:[["Crowd Control","Entry Mgmt"],["VIP Security"]],coordinator:[["Wedding Planning","Vendor Mgmt"],["Corporate Events"]],event_planner:[["Full Planning","Design"],["Brand Activations"]],bikini_girl:[["Pool Parties","Brand Promos"],["Club Events"]],dancer:[["Afrobeats","Stage"],["Cultural Shows"]],party_starter:[["Crowd Hype","DJ Support"],["Club Events"]] };

function mkPeople(role, n) {
  const combos = COMBOS[role]||[];
  return Array.from({length:n},(_,i)=>{
    const fn=FN[role][i%FN[role].length], ln=LN[i%LN.length];
    const extra = combos.length>0&&i%3!==0?[combos[i%combos.length]]:[];
    // Simulate some booked dates
    const bookedDates = i%4===0 ? ["2026-06-15","2026-06-20"] : i%5===0 ? ["2026-06-18"] : [];
    return {
      id:`${role}_${i}`, name:`${fn} ${ln}`,
      rating:parseFloat((3.5+Math.random()*1.5).toFixed(1)),
      reviews:Math.floor(20+Math.random()*260),
      height:`${Math.floor(158+Math.random()*24)}cm`,
      skin:SKINS[Math.floor(Math.random()*SKINS.length)],
      location:LOCS[i%LOCS.length],
      jobs:Math.floor(10+Math.random()*180),
      exp:Math.floor(1+Math.random()*8),
      available:Math.random()>0.25,
      verified:Math.random()>0.3,
      emoji:EMOJIS[role], bg:BGS[i%BGS.length],
      role, isSuper:role==="coordinator"||role==="event_planner",
      extra, allRoles:[role,...extra],
      wa:`+23480${Math.floor(10000000+Math.random()*89999999)}`,
      hotline:Math.random()>0.45?`+23470${Math.floor(10000000+Math.random()*89999999)}`:null,
      ig:Math.random()>0.35?`@${fn.toLowerCase()}_ng`:null,
      x:Math.random()>0.55?`@${fn.toLowerCase()}ng`:null,
      tags:TAGS[role][i%2], price:PRICE_RANGES[role],
      bookedDates,
      totalEarned: Math.floor(Math.random()*500000),
    };
  });
}
const ALL = Object.fromEntries(CATS.map(c=>[c.id,mkPeople(c.id,12)]));

function pwStrength(pw) {
  let s=0;
  if(pw.length>=8)s++; if(/[A-Z]/.test(pw))s++; if(/[0-9]/.test(pw))s++; if(/[^A-Za-z0-9]/.test(pw))s++;
  return {score:s,label:["","Weak","Fair","Good","Strong"][s]||"",color:["","#ef4444","#f97316","#eab308","#22c55e"][s]||"#333",pct:`${s*25}%`};
}
const Stars = ({r}) => <span style={{color:"#f5c842",fontSize:11}}>{"★".repeat(Math.floor(r))}{"☆".repeat(5-Math.floor(r))}</span>;

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Playfair+Display:wght@700;900&display=swap');
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:#111}::-webkit-scrollbar-thumb{background:#333;border-radius:4px}
.btn-gold{background:linear-gradient(135deg,#f5c842,#e6a817);color:#000;padding:10px 22px;border-radius:50px;font-size:13.5px;font-weight:700;cursor:pointer;border:none;transition:all .25s;font-family:'Sora',sans-serif;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.btn-gold:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(245,200,66,.4)}
.btn-ghost{background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);color:rgba(255,255,255,.75);padding:9px 18px;border-radius:50px;font-size:13px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;white-space:nowrap;transition:all .2s}
.btn-ghost:hover{background:rgba(255,255,255,.13)}
.btn-outline{border:1.5px solid rgba(255,255,255,.22);background:transparent;color:#fff;padding:10px 20px;border-radius:50px;font-size:13.5px;font-weight:600;cursor:pointer;transition:all .2s;font-family:'Sora',sans-serif;white-space:nowrap}
.btn-outline:hover{border-color:#f5c842;color:#f5c842}
.btn-red{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#f87171;padding:8px 16px;border-radius:50px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;white-space:nowrap;transition:all .2s}
.btn-green{background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;padding:10px 22px;border-radius:50px;font-size:13.5px;font-weight:700;cursor:pointer;border:none;transition:all .25s;font-family:'Sora',sans-serif;white-space:nowrap;display:inline-flex;align-items:center;justify-content:center;gap:6px}
.btn-green:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(34,197,94,.4)}
.inp{width:100%;background:#1c1c1c;border:1px solid rgba(255,255,255,.12);border-radius:11px;padding:12px 14px;color:#fff;font-size:13px;font-family:'Sora',sans-serif;outline:none;transition:border-color .2s}
.inp:focus{border-color:#f5c842}.inp::placeholder{color:rgba(255,255,255,.3)}.inp.err{border-color:#ef4444}
.lbl{font-size:10.5px;color:rgba(255,255,255,.5);font-weight:700;margin-bottom:5px;display:block;letter-spacing:.5px;text-transform:uppercase}
.nav-a{color:rgba(255,255,255,.7);font-size:13.5px;font-weight:500;cursor:pointer;transition:color .2s;white-space:nowrap}
.nav-a:hover{color:#f5c842}
.hbg{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;gap:5px;padding:4px}
.hbar{width:22px;height:2px;background:#fff;border-radius:2px;transition:all .3s;display:block}
.mob-menu{position:fixed;top:64px;left:0;right:0;z-index:199;background:rgba(10,10,10,.97);backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.08);padding:18px 5%;display:flex;flex-direction:column;gap:16px}
.overlay{position:fixed;inset:0;z-index:400;background:rgba(0,0,0,.88);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:14px;overflow-y:auto}
.mbox{background:#0f0f0f;border-radius:22px;width:100%;border:1px solid rgba(255,255,255,.1);box-shadow:0 40px 100px rgba(0,0,0,.8)}
.prog-w{height:4px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;margin:11px 20px 0}
.prog-f{height:100%;background:linear-gradient(135deg,#f5c842,#e6a817);border-radius:4px;transition:width .4s}
.cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:11px}
@media(max-width:580px){.cat-grid{grid-template-columns:repeat(2,1fr);gap:9px}}
.prof-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
@media(max-width:600px){.prof-grid{grid-template-columns:repeat(2,1fr);gap:9px}}
@media(max-width:350px){.prof-grid{grid-template-columns:1fr}}
.fbar{display:flex;gap:9px;flex-wrap:wrap;align-items:center}
@media(max-width:640px){.fbar{flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}}
.fbar::-webkit-scrollbar{display:none}
.fsel{background:#1a1a1a;border:1px solid rgba(255,255,255,.1);color:#fff;padding:8px 12px;border-radius:9px;font-family:'Sora',sans-serif;font-size:12px;cursor:pointer;outline:none;appearance:none;flex-shrink:0}
.cpills{display:flex;gap:8px;overflow-x:auto;padding-bottom:3px;scrollbar-width:none}
.cpills::-webkit-scrollbar{display:none}
.cpill{display:flex;align-items:center;gap:6px;padding:7px 13px;border-radius:50px;cursor:pointer;transition:all .2s;border:1.5px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);font-size:12px;font-weight:600;white-space:nowrap;flex-shrink:0}
.pcard{background:#141414;border:1px solid rgba(255,255,255,.07);border-radius:17px;overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s;display:flex;flex-direction:column}
.pcard:hover{transform:translateY(-3px);box-shadow:0 16px 44px rgba(0,0,0,.55)}
.sbox{background:#141414;border:1px solid rgba(255,255,255,.07);border-radius:16px;padding:20px}
.dtab{padding:7px 15px;border-radius:50px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.6);font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;font-family:'Sora',sans-serif;white-space:nowrap}
.dtab.on{background:rgba(245,200,66,.14);border-color:#f5c842;color:#f5c842}
.atab{padding:7px 15px;border-radius:50px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.6);font-size:12px;font-weight:600;cursor:pointer;transition:all .2s;font-family:'Sora',sans-serif;white-space:nowrap}
.atab.on{background:rgba(245,200,66,.14);border-color:#f5c842;color:#f5c842}
.pw-w{height:5px;border-radius:3px;background:rgba(255,255,255,.08);margin-top:6px;overflow:hidden}
.pw-f{height:100%;border-radius:3px;transition:width .3s,background .3s}
.rdd{position:relative;width:100%}
.rdd-btn{width:100%;background:#1c1c1c;border:1px solid rgba(255,255,255,.12);border-radius:11px;padding:12px 14px;color:#fff;font-size:13px;font-family:'Sora',sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:8px;transition:border-color .2s;text-align:left}
.rdd-btn:hover,.rdd-btn.open{border-color:#f5c842}
.rdd-panel{position:absolute;top:calc(100% + 5px);left:0;right:0;background:#1a1a1a;border:1px solid rgba(255,255,255,.14);border-radius:13px;z-index:50;box-shadow:0 14px 44px rgba(0,0,0,.7);max-height:330px;overflow-y:auto}
.rdd-opt{display:flex;align-items:center;gap:10px;padding:11px 14px;cursor:pointer;transition:background .14s;border-bottom:1px solid rgba(255,255,255,.04)}
.rdd-opt:last-child{border-bottom:none}.rdd-opt:hover{background:rgba(255,255,255,.06)}.rdd-opt.sel{background:rgba(245,200,66,.08)}.rdd-opt.off{opacity:.33;cursor:not-allowed}
.mesh{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 700px 500px at 70% 25%,rgba(245,200,66,.08) 0%,transparent 70%),radial-gradient(ellipse 500px 400px at 10% 80%,rgba(180,120,20,.05) 0%,transparent 60%)}
.grid-l{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:60px 60px;mask-image:radial-gradient(ellipse at center,black 30%,transparent 80%)}
.fc{position:absolute;background:rgba(18,18,18,.96);border:1px solid rgba(255,255,255,.12);border-radius:15px;padding:12px 15px;backdrop-filter:blur(20px);box-shadow:0 18px 50px rgba(0,0,0,.5);display:flex;align-items:center;gap:10px}
@keyframes f1{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
@keyframes f2{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pop{0%{transform:scale(.85);opacity:0}100%{transform:scale(1);opacity:1}}
.fa1{animation:f1 3s ease-in-out infinite}.fa2{animation:f2 3.5s ease-in-out infinite}
@media(max-width:900px){.fc{display:none!important}}
.hero-badge{display:inline-flex;align-items:center;gap:7px;background:rgba(245,200,66,.12);border:1px solid rgba(245,200,66,.3);border-radius:50px;padding:7px 16px;font-size:12px;font-weight:600;color:#f5c842;margin-bottom:20px}
.sbar{display:flex;align-items:center;background:#fff;border-radius:60px;overflow:hidden;box-shadow:0 16px 50px rgba(0,0,0,.4);width:100%;max-width:620px}
.ssel{border:none;outline:none;padding:13px 14px;font-size:13px;font-family:'Sora',sans-serif;font-weight:600;color:#111;background:transparent;cursor:pointer;appearance:none;min-width:145px}
.sdiv{width:1px;height:24px;background:#e0e0e0;flex-shrink:0}
.sinp{border:none;outline:none;padding:13px 11px;font-size:13px;font-family:'Sora',sans-serif;color:#111;background:transparent;flex:1;min-width:0}
.sinp::placeholder{color:#aaa}
.sbtn{background:linear-gradient(135deg,#f5c842,#e6a817);color:#000;border:none;padding:10px 20px;margin:5px;border-radius:50px;font-weight:700;font-size:13px;cursor:pointer;font-family:'Sora',sans-serif;white-space:nowrap;flex-shrink:0}
@media(max-width:540px){.sbar{flex-direction:column;border-radius:18px;padding:7px}.ssel{width:100%;border-bottom:1px solid #eee;min-width:unset}.sdiv{display:none}.sinp{width:100%;padding:12px 13px}.sbtn{width:100%;margin:4px 0 0;border-radius:11px;padding:12px}}
.cam-box{position:relative;width:100%;aspect-ratio:1;border-radius:18px;overflow:hidden;background:#000;display:flex;align-items:center;justify-content:center}
.fring{position:absolute;width:66%;aspect-ratio:1;border-radius:50%;border:3px solid var(--rc,#f5c842);box-shadow:0 0 0 4px rgba(245,200,66,.14);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;transition:border-color .4s}
.lprompt{position:absolute;bottom:10px;left:0;right:0;text-align:center;font-size:12.5px;font-weight:700;color:#fff;background:rgba(0,0,0,.72);padding:7px;backdrop-filter:blur(5px)}
.cal-day{width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:12.5px;font-weight:600;cursor:pointer;transition:all .15s;border:1.5px solid transparent;flex-shrink:0}
.cal-day.today{border-color:rgba(245,200,66,.5);color:#f5c842}
.cal-day.booked{background:rgba(239,68,68,.2);color:#f87171;cursor:not-allowed;border-color:rgba(239,68,68,.3)}
.cal-day.selected{background:linear-gradient(135deg,#f5c842,#e6a817);color:#000;font-weight:800}
.cal-day.available:hover{background:rgba(245,200,66,.15);border-color:#f5c842}
.cal-day.other-month{opacity:.3}
.rating-star{font-size:28px;cursor:pointer;transition:transform .15s;display:inline-block}
.rating-star:hover{transform:scale(1.2)}
.booking-card{background:#141414;border:1px solid rgba(255,255,255,.07);border-radius:14px;padding:16px;display:flex;gap:12px;align-items:flex-start}
.booking-card:hover{border-color:rgba(255,255,255,.15)}
.status-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:50px;font-size:10.5px;font-weight:700}
.notif-dot{position:absolute;top:-2px;right:-2px;width:8px;height:8px;background:#ef4444;border-radius:50%;border:2px solid #0a0a0a}
`;

// ─── ROLE DROPDOWN ─────────────────────────────────────────────────────────────
function RoleDropdown({ selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const primary = selected[0]||null;
  const allowed = primary ? [primary,...(COMBOS[primary]||[])] : CATS.map(c=>c.id);
  useEffect(()=>{
    const h = e => { if(ref.current&&!ref.current.contains(e.target))setOpen(false); };
    document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h);
  },[]);
  const toggle = id => {
    if(!primary){onChange([id]);return;}
    if(id===primary)return;
    if(!allowed.includes(id))return;
    onChange(selected.includes(id)?selected.filter(r=>r!==id):[...selected,id]);
  };
  const label = selected.length===0?"Tap to select your role(s)…":selected.map(id=>catById(id).label.slice(0,-1)).join(", ");
  return (
    <div className="rdd" ref={ref}>
      <button type="button" className={`rdd-btn${open?" open":""}`} onClick={()=>setOpen(o=>!o)}>
        <span style={{flex:1,color:selected.length?"#fff":"rgba(255,255,255,.3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{label}</span>
        <span style={{color:"rgba(255,255,255,.4)",transition:"transform .2s",display:"inline-block",transform:open?"rotate(180deg)":"none",flexShrink:0}}>▾</span>
      </button>
      {open&&<div className="rdd-panel">
        {CATS.map(cat=>{
          const isSel=selected.includes(cat.id),isPrim=selected[0]===cat.id,isOff=primary&&!allowed.includes(cat.id)&&!isSel;
          return (
            <div key={cat.id} className={`rdd-opt${isSel?" sel":""}${isOff?" off":""}`} onClick={()=>!isOff&&toggle(cat.id)}>
              <span style={{fontSize:20,flexShrink:0}}>{cat.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12.5,fontWeight:700,color:isSel?cat.color:"#fff"}}>{cat.label}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:1}}>{fmtR(cat.id)}{isPrim?" · PRIMARY":""}{cat.sup?" · 👑 Super":""}{isOff?" · Not compatible":""}</div>
              </div>
              <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${isSel?cat.color:"rgba(255,255,255,.2)"}`,background:isSel?cat.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .14s"}}>
                {isSel&&<span style={{fontSize:10,color:"#000",fontWeight:800}}>✓</span>}
              </div>
            </div>
          );
        })}
        {primary&&<div style={{padding:"9px 14px",fontSize:10.5,color:"rgba(255,255,255,.3)",borderTop:"1px solid rgba(255,255,255,.06)",lineHeight:1.5}}>Greyed = not compatible with {catById(primary).label.slice(0,-1)}</div>}
      </div>}
      {selected.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginTop:8}}>
        {selected.map(id=>{const c=catById(id);return(
          <span key={id} style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:10.5,fontWeight:700,background:`${c.color}18`,color:c.color,border:`1px solid ${c.color}30`,padding:"3px 9px",borderRadius:50}}>
            {c.icon} {c.label.slice(0,-1)}
            {id!==primary&&<span style={{cursor:"pointer",opacity:.7}} onClick={()=>onChange(selected.filter(r=>r!==id))}>✕</span>}
          </span>
        );})}
      </div>}
    </div>
  );
}

// ─── MINI CALENDAR ────────────────────────────────────────────────────────────
function MiniCalendar({ bookedDates=[], selectedDates=[], onToggleDate, multi=false, minDate=null }) {
  const today = new Date();
  const [viewing, setViewing] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const firstDay = new Date(viewing.year, viewing.month, 1).getDay();
  const daysInMonth = new Date(viewing.year, viewing.month+1, 0).getDate();
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

  const toStr = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  const cells = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);

  return (
    <div style={{background:"#1a1a1a",borderRadius:16,padding:"16px",border:"1px solid rgba(255,255,255,.1)"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <button onClick={()=>setViewing(v=>({...v,month:v.month===0?11:v.month-1,year:v.month===0?v.year-1:v.year}))}
          style={{background:"rgba(255,255,255,.07)",border:"none",color:"#fff",width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:14}}>‹</button>
        <span style={{fontSize:13.5,fontWeight:700}}>{MONTHS[viewing.month]} {viewing.year}</span>
        <button onClick={()=>setViewing(v=>({...v,month:v.month===11?0:v.month+1,year:v.month===11?v.year+1:v.year}))}
          style={{background:"rgba(255,255,255,.07)",border:"none",color:"#fff",width:30,height:30,borderRadius:8,cursor:"pointer",fontSize:14}}>›</button>
      </div>
      {/* Day labels */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:6}}>
        {DAYS.map(d=><div key={d} style={{textAlign:"center",fontSize:10.5,color:"rgba(255,255,255,.35)",fontWeight:700,padding:"2px 0"}}>{d}</div>)}
      </div>
      {/* Date cells */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
        {cells.map((d,i)=>{
          if(!d) return <div key={i}/>;
          const dateStr = toStr(new Date(viewing.year,viewing.month,d));
          const isToday = toStr(today)===dateStr;
          const isBooked = bookedDates.includes(dateStr);
          const isSel = selectedDates.includes(dateStr);
          const isPast = new Date(viewing.year,viewing.month,d) < new Date(today.toDateString());
          const isMin = minDate && new Date(dateStr) < new Date(minDate);
          const disabled = isBooked || isPast || isMin;
          return (
            <div key={i}
              className={`cal-day${isToday&&!isSel?" today":""}${isBooked?" booked":isSel?" selected":disabled?"":" available"}`}
              style={{opacity:disabled&&!isBooked?0.35:1}}
              onClick={()=>!disabled&&onToggleDate&&onToggleDate(dateStr)}>
              {d}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div style={{display:"flex",gap:14,marginTop:12,flexWrap:"wrap"}}>
        {[{c:"rgba(239,68,68,.25)",label:"Booked"},{c:"linear-gradient(135deg,#f5c842,#e6a817)",label:"Selected"},{c:"rgba(255,255,255,.07)",label:"Available"}].map(l=>(
          <div key={l.label} style={{display:"flex",alignItems:"center",gap:5}}>
            <div style={{width:12,height:12,borderRadius:3,background:l.c}}/>
            <span style={{fontSize:10,color:"rgba(255,255,255,.45)"}}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BOOKING MODAL ────────────────────────────────────────────────────────────
function BookingModal({ person, onClose, onBooked }) {
  const cat = catById(person.role);
  const [step, setStep] = useState(1); // 1=dates, 2=details, 3=payment, 4=confirm
  const [selectedDates, setSelectedDates] = useState([]);
  const [form, setForm] = useState({
    eventName:"", eventType:"", location:"", startTime:"09:00", endTime:"18:00",
    outfit:"", notes:"", bookerName:"", bookerPhone:"", bookerEmail:"",
    payMethod:"card",
  });
  const [errs, setErrs] = useState({});
  const [submitting, setSub] = useState(false);
  const set = (k,v) => setF(p=>({...p,[k]:v}));

  function setF(updater) { setForm(updater); }

  const totalDays = selectedDates.length;
  // For multi-day, use midpoint of price range; coordinator can adjust
  const ratePerDay = Math.round((person.price.min + person.price.max) / 2);
  const totalAmount = ratePerDay * Math.max(1, totalDays);

  const toggleDate = dateStr => {
    setSelectedDates(prev =>
      prev.includes(dateStr) ? prev.filter(d=>d!==dateStr) : [...prev, dateStr].sort()
    );
  };

  const validate = () => {
    const e = {};
    if(step===1 && selectedDates.length===0) e.dates = "Please select at least one event date";
    if(step===2){
      if(!form.eventName.trim()) e.eventName = "Event name required";
      if(!form.location.trim()) e.location = "Event location required";
      if(!form.bookerName.trim()) e.bookerName = "Your name required";
      if(!form.bookerPhone.trim()) e.bookerPhone = "Your phone number required";
      if(!form.bookerEmail.includes("@")) e.bookerEmail = "Valid email required";
    }
    setErrs(e); return Object.keys(e).length===0;
  };
  const next = () => { if(validate()) setStep(s=>s+1); };
  const back = () => setStep(s=>s-1);

  const submit = () => {
    setSub(true);
    setTimeout(()=>{
      setSub(false);
      setStep(99);
      // In real app: POST /api/bookings
      onBooked && onBooked({
        person, dates: selectedDates, form, totalAmount,
        bookingRef: `CNG-${Math.random().toString(36).slice(2,8).toUpperCase()}`
      });
    }, 1500);
  };

  const F = ({k,label,placeholder,type="text",required=false})=>(
    <div>
      <label className="lbl">{label}{required&&<span style={{color:"#f5c842"}}> *</span>}</label>
      <input className={`inp${errs[k]?" err":""}`} type={type} placeholder={placeholder} value={form[k]} onChange={e=>setF(p=>({...p,[k]:e.target.value}))}/>
      {errs[k]&&<p style={{fontSize:10.5,color:"#ef4444",marginTop:3}}>⚠ {errs[k]}</p>}
    </div>
  );

  const TOTAL_STEPS = 4;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="mbox" onClick={e=>e.stopPropagation()} style={{maxWidth:520,maxHeight:"94vh",overflowY:"auto",animation:"pop .25s ease"}}>
        {/* Header */}
        <div style={{padding:"18px 20px 0",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:12,background:person.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{person.emoji}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:14,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{person.name}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.45)",marginTop:1}}>{catById(person.role).label.slice(0,-1)} · {person.location}</div>
          </div>
          {step < 99 && <div style={{fontSize:11,color:"rgba(255,255,255,.35)",flexShrink:0}}>Step {step}/{TOTAL_STEPS}</div>}
          <button onClick={onClose} style={{background:"rgba(255,255,255,.07)",border:"none",color:"rgba(255,255,255,.5)",width:30,height:30,borderRadius:"50%",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>✕</button>
        </div>

        {step<99&&<div className="prog-w"><div className="prog-f" style={{width:`${step/TOTAL_STEPS*100}%`}}/></div>}

        <div style={{padding:"18px 20px 24px",display:"flex",flexDirection:"column",gap:16}}>

          {/* ── STEP 1: SELECT DATES ── */}
          {step===1&&<>
            <div>
              <p style={{fontSize:13.5,fontWeight:700,marginBottom:4}}>Select Event Date(s)</p>
              <p style={{fontSize:11.5,color:"rgba(255,255,255,.45)",lineHeight:1.65,marginBottom:14}}>
                Tap dates to select. You can book for <strong style={{color:"#fff"}}>multiple days</strong>. Red dates are already booked.
              </p>
              <MiniCalendar
                bookedDates={person.bookedDates}
                selectedDates={selectedDates}
                onToggleDate={toggleDate}
                multi={true}
              />
              {errs.dates&&<p style={{fontSize:10.5,color:"#ef4444",marginTop:8}}>⚠ {errs.dates}</p>}
            </div>
            {selectedDates.length>0&&(
              <div style={{background:`${cat.color}10`,border:`1px solid ${cat.color}25`,borderRadius:12,padding:"12px 14px"}}>
                <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:6}}>SELECTED DATES</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                  {selectedDates.map(d=>(
                    <span key={d} style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,fontWeight:700,background:`${cat.color}18`,color:cat.color,border:`1px solid ${cat.color}33`,padding:"4px 10px",borderRadius:50}}>
                      📅 {d}
                      <span style={{cursor:"pointer",opacity:.7}} onClick={()=>toggleDate(d)}>✕</span>
                    </span>
                  ))}
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"rgba(255,255,255,.5)"}}>
                  <span>{totalDays} day{totalDays>1?"s":""} selected</span>
                  <span style={{color:cat.color,fontWeight:700}}>Est. {fmt(totalAmount)}</span>
                </div>
              </div>
            )}
            <div style={{display:"flex",gap:9}}>
              <button onClick={onClose} className="btn-ghost" style={{flex:1}}>Cancel</button>
              <button onClick={next} className="btn-gold" style={{flex:2}}>Next: Event Details →</button>
            </div>
          </>}

          {/* ── STEP 2: EVENT DETAILS ── */}
          {step===2&&<>
            <p style={{fontSize:13.5,fontWeight:700}}>Event Details</p>
            <F k="eventName" label="Event Name" placeholder="e.g. Amaka's Wedding Reception" required/>
            <div>
              <label className="lbl">Event Type</label>
              <select className="inp" style={{cursor:"pointer"}} value={form.eventType} onChange={e=>setF(p=>({...p,eventType:e.target.value}))}>
                <option value="">Select event type…</option>
                {["Wedding","Birthday Party","Corporate Event","Pool Party","Anniversary","Concert","Product Launch","Religious Event","Other"].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <F k="location" label="Event Venue / Location" placeholder="Full address with city" required/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label className="lbl">Start Time</label>
                <input className="inp" type="time" style={{colorScheme:"dark"}} value={form.startTime} onChange={e=>setF(p=>({...p,startTime:e.target.value}))}/>
              </div>
              <div>
                <label className="lbl">End Time</label>
                <input className="inp" type="time" style={{colorScheme:"dark"}} value={form.endTime} onChange={e=>setF(p=>({...p,endTime:e.target.value}))}/>
              </div>
            </div>
            <div>
              <label className="lbl">Dress Code / Outfit (optional)</label>
              <input className="inp" placeholder="e.g. Black trousers, white shirt, bow tie" value={form.outfit} onChange={e=>setF(p=>({...p,outfit:e.target.value}))}/>
            </div>
            <div>
              <label className="lbl">Additional Notes (optional)</label>
              <textarea className="inp" rows={2} style={{resize:"vertical"}} placeholder="Any special instructions…" value={form.notes} onChange={e=>setF(p=>({...p,notes:e.target.value}))}/>
            </div>
            <hr style={{borderColor:"rgba(255,255,255,.07)",borderStyle:"solid",borderWidth:"1px 0 0 0"}}/>
            <p style={{fontSize:12,color:"rgba(255,255,255,.4)"}}>Your Contact Details</p>
            <F k="bookerName" label="Your Full Name" placeholder="e.g. Chidi Okafor" required/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <F k="bookerPhone" label="Phone Number" placeholder="+234…" required/>
              <F k="bookerEmail" label="Email Address" placeholder="you@email.com" type="email" required/>
            </div>
            <div style={{display:"flex",gap:9}}>
              <button onClick={back} className="btn-ghost" style={{flex:1}}>← Back</button>
              <button onClick={next} className="btn-gold" style={{flex:2}}>Next: Review & Pay →</button>
            </div>
          </>}

          {/* ── STEP 3: REVIEW + PAYMENT ── */}
          {step===3&&<>
            <p style={{fontSize:13.5,fontWeight:700}}>Review Booking</p>

            {/* Booking summary */}
            <div style={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,.09)",borderRadius:14,padding:"14px",display:"flex",flexDirection:"column",gap:9}}>
              {[
                {l:"Professional",  v:`${person.name} · ${catById(person.role).label.slice(0,-1)}`},
                {l:"Event",         v:form.eventName},
                {l:"Type",          v:form.eventType||"—"},
                {l:"Venue",         v:form.location},
                {l:"Time",          v:`${form.startTime} – ${form.endTime}`},
                {l:"Date(s)",       v:selectedDates.join(", ")},
                ...(form.outfit?[{l:"Outfit",v:form.outfit}]:[]),
              ].map(r=>(
                <div key={r.l} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
                  <span style={{fontSize:11.5,color:"rgba(255,255,255,.4)",flexShrink:0}}>{r.l}</span>
                  <span style={{fontSize:12,fontWeight:600,textAlign:"right",wordBreak:"break-word"}}>{r.v}</span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div style={{background:`${cat.color}0d`,border:`1px solid ${cat.color}22`,borderRadius:14,padding:"14px"}}>
              <div style={{fontSize:10.5,color:"rgba(255,255,255,.4)",marginBottom:10,letterSpacing:.5}}>PAYMENT BREAKDOWN</div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <span style={{fontSize:12.5,color:"rgba(255,255,255,.6)"}}>Rate × {totalDays} day{totalDays>1?"s":""}</span>
                <span style={{fontSize:12.5,fontWeight:700}}>{fmt(ratePerDay)} × {totalDays}</span>
              </div>
              <div style={{height:1,background:"rgba(255,255,255,.07)",marginBottom:10}}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13.5,fontWeight:700}}>Total</span>
                <span style={{fontSize:20,fontWeight:900,color:cat.color,fontFamily:"'Playfair Display',serif"}}>{fmt(totalAmount)}</span>
              </div>
              <p style={{fontSize:10.5,color:"rgba(255,255,255,.35)",marginTop:8,lineHeight:1.5}}>
                💡 Final amount is set by the coordinator. Payment is held securely and released only after both parties rate each other post-event.
              </p>
            </div>

            {/* Payment method */}
            <div>
              <label className="lbl">Payment Method</label>
              <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
                {[{id:"card",label:"💳 Card",desc:"Debit/Credit"},{id:"transfer",label:"🏦 Transfer",desc:"Bank Transfer"},{id:"ussd",label:"📱 USSD",desc:"*737# etc"}].map(pm=>(
                  <div key={pm.id} onClick={()=>setF(p=>({...p,payMethod:pm.id}))}
                    style={{flex:1,minWidth:100,padding:"12px 14px",borderRadius:12,cursor:"pointer",border:`1.5px solid ${form.payMethod===pm.id?cat.color:"rgba(255,255,255,.1)"}`,background:form.payMethod===pm.id?`${cat.color}12`:"rgba(255,255,255,.03)",transition:"all .15s",textAlign:"center"}}>
                    <div style={{fontSize:14,marginBottom:4}}>{pm.label.split(" ")[0]}</div>
                    <div style={{fontSize:12,fontWeight:700,color:form.payMethod===pm.id?cat.color:"#fff"}}>{pm.label.split(" ").slice(1).join(" ")}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:2}}>{pm.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.2)",borderRadius:11,padding:"10px 13px",fontSize:11,color:"rgba(255,255,255,.55)",lineHeight:1.65}}>
              🔐 Payment is processed securely via Paystack. Funds are held until after the event. Both you and the professional must rate each other before payment is released.
            </div>

            <div style={{display:"flex",gap:9}}>
              <button onClick={back} className="btn-ghost" style={{flex:1}}>← Back</button>
              <button onClick={submit} disabled={submitting} className="btn-green" style={{flex:2,padding:"13px",borderRadius:13,fontSize:13.5}}>
                {submitting
                  ? <span style={{display:"inline-block",width:17,height:17,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .9s linear infinite"}}/>
                  : `🔒 Confirm & Pay ${fmt(totalAmount)}`}
              </button>
            </div>
          </>}

          {/* ── SUCCESS ── */}
          {step===99&&<div style={{textAlign:"center",padding:"14px 0 8px"}}>
            <div style={{fontSize:56,marginBottom:14}}>✅</div>
            <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:900,marginBottom:8}}>Booking Confirmed!</h3>
            <p style={{fontSize:12.5,color:"rgba(255,255,255,.5)",lineHeight:1.7,marginBottom:18}}>
              Your booking for <strong style={{color:cat.color}}>{person.name}</strong> has been confirmed.
              A notification has been sent to the professional.
            </p>
            <div style={{background:"#1a1a1a",border:"1px solid rgba(255,255,255,.09)",borderRadius:14,padding:"14px",textAlign:"left",marginBottom:18}}>
              {[
                {l:"Professional",v:person.name},
                {l:"Date(s)",v:selectedDates.join(", ")},
                {l:"Event",v:form.eventName},
                {l:"Venue",v:form.location},
                {l:"Total Paid",v:fmt(totalAmount),c:cat.color},
              ].map(r=>(
                <div key={r.l} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}}>
                  <span style={{fontSize:11.5,color:"rgba(255,255,255,.4)"}}>{r.l}</span>
                  <span style={{fontSize:12,fontWeight:700,color:r.c||"#fff"}}>{r.v}</span>
                </div>
              ))}
            </div>
            <div style={{background:"rgba(245,200,66,.07)",border:"1px solid rgba(245,200,66,.18)",borderRadius:12,padding:"12px 14px",fontSize:11,color:"rgba(255,255,255,.55)",textAlign:"left",lineHeight:1.75,marginBottom:18}}>
              <strong style={{color:"#f5c842"}}>What happens next:</strong><br/>
              ✓ Professional is notified immediately<br/>
              ✓ Their calendar is blocked for your event dates<br/>
              ✓ You'll get their contact for coordination<br/>
              ✓ After the event, rate each other to release payment
            </div>
            <button onClick={onClose} className="btn-gold" style={{padding:"12px 32px",fontSize:14}}>Done</button>
          </div>}

        </div>
      </div>
    </div>
  );
}

// ─── RATING MODAL ─────────────────────────────────────────────────────────────
function RatingModal({ booking, onClose, onSubmit }) {
  const [score, setScore] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSub] = useState(false);

  const submit = () => {
    if(score===0) return;
    setSub(true);
    setTimeout(()=>{ setSub(false); onSubmit&&onSubmit({score,comment}); onClose(); }, 1000);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="mbox" onClick={e=>e.stopPropagation()} style={{maxWidth:420,animation:"pop .25s ease"}}>
        <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:900}}>Rate this Professional</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.07)",border:"none",color:"rgba(255,255,255,.5)",width:30,height:30,borderRadius:"50%",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:"18px 20px 24px",display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"rgba(245,200,66,.07)",border:"1px solid rgba(245,200,66,.18)",borderRadius:11,padding:"10px 13px",fontSize:11,color:"rgba(255,255,255,.55)",lineHeight:1.65}}>
            ⭐ Rating is required before payment is released. Be honest — it helps the community.
          </div>
          {/* Professional info */}
          {booking&&<div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:44,height:44,borderRadius:12,background:booking.person.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{booking.person.emoji}</div>
            <div>
              <div style={{fontWeight:700,fontSize:13.5}}>{booking.person.name}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:1}}>{booking.form?.eventName||"Your event"} · {booking.dates?.join(", ")}</div>
            </div>
          </div>}
          {/* Stars */}
          <div>
            <label className="lbl">Your Rating</label>
            <div style={{display:"flex",gap:6,justifyContent:"center",margin:"8px 0"}}>
              {[1,2,3,4,5].map(n=>(
                <span key={n} className="rating-star"
                  style={{color:(hover||score)>=n?"#f5c842":"rgba(255,255,255,.2)"}}
                  onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}
                  onClick={()=>setScore(n)}>
                  ★
                </span>
              ))}
            </div>
            {score>0&&<p style={{textAlign:"center",fontSize:12,color:"#f5c842",fontWeight:600,marginTop:4}}>
              {["","Poor","Fair","Good","Very Good","Excellent!"][score]}
            </p>}
          </div>
          {/* Comment */}
          <div>
            <label className="lbl">Comments (optional)</label>
            <textarea className="inp" rows={3} style={{resize:"vertical"}} placeholder="Tell others about your experience…" value={comment} onChange={e=>setComment(e.target.value)}/>
          </div>
          <button onClick={submit} disabled={score===0||submitting}
            style={{background:score>0?"linear-gradient(135deg,#f5c842,#e6a817)":"rgba(255,255,255,.08)",color:score>0?"#000":"rgba(255,255,255,.3)",border:"none",padding:"13px",borderRadius:13,fontSize:13.5,fontWeight:700,cursor:score>0?"pointer":"default",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all .3s"}}>
            {submitting?<span style={{display:"inline-block",width:17,height:17,border:"2.5px solid rgba(0,0,0,.25)",borderTopColor:"#000",borderRadius:"50%",animation:"spin .9s linear infinite"}}/>:"Submit Rating & Release Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LIVENESS CHECK ───────────────────────────────────────────────────────────
const LIVE = [{id:"center",p:"Look straight at camera",i:"👁️"},{id:"left",p:"Turn head slowly LEFT",i:"👈"},{id:"right",p:"Turn head slowly RIGHT",i:"👉"},{id:"up",p:"Tilt head UP slightly",i:"☝️"},{id:"down",p:"Tilt head DOWN slightly",i:"👇"}];
function LiveCapture({ onDone, onBack }) {
  const [step,setStep]=useState(0),[status,setStat]=useState("idle"),[checks,setChk]=useState([]),[rc,setRc]=useState("#f5c842"),[camErr,setCamErr]=useState(false);
  const vRef=useRef(null),strRef=useRef(null),tmr=useRef(null);
  const startCam=async()=>{try{const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false});strRef.current=s;if(vRef.current){vRef.current.srcObject=s;vRef.current.play();}setStat("running");runLive();}catch{setCamErr(true);}};
  const runLive=()=>{let s=0;const next=()=>{if(s>=LIVE.length){setStat("done");setRc("#22c55e");return;}setStep(s);setRc("#f5c842");tmr.current=setTimeout(()=>{setChk(c=>[...c,LIVE[s].id]);setRc("#22c55e");s++;setTimeout(next,500);},2200);};next();};
  useEffect(()=>()=>{clearTimeout(tmr.current);strRef.current?.getTracks().forEach(t=>t.stop());},[]);
  const cur=LIVE[Math.min(step,4)];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:13}}>
      <p style={{fontSize:13.5,fontWeight:700}}>Live Face Verification</p>
      <div style={{background:"rgba(245,200,66,.07)",border:"1px solid rgba(245,200,66,.2)",borderRadius:11,padding:"9px 13px",fontSize:11,color:"rgba(255,255,255,.6)",lineHeight:1.65}}>🔐 Your face is checked against your NIN photo. Follow the prompts to confirm your identity.</div>
      {camErr?<div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:14,padding:"22px",textAlign:"center"}}><div style={{fontSize:34,marginBottom:7}}>📷</div><div style={{fontSize:13.5,fontWeight:700,marginBottom:5}}>Camera access denied</div><div style={{fontSize:11.5,color:"rgba(255,255,255,.5)"}}>Allow camera in browser settings, then try again.</div></div>:
      <div className="cam-box" style={{"--rc":rc}}>
        {status==="idle"?<div style={{textAlign:"center",padding:20}}><div style={{fontSize:38,marginBottom:11}}>📷</div><div style={{fontSize:13,fontWeight:700,marginBottom:13}}>Ready for face verification?</div><button className="btn-gold" onClick={startCam}>Start Camera</button></div>:<>
          <video ref={vRef} autoPlay muted playsInline style={{width:"100%",height:"100%",objectFit:"cover",transform:"scaleX(-1)"}}/>
          <div className="fring"/>
          {status!=="done"&&<div className="lprompt">{cur.i} {cur.p}</div>}
          {status==="done"&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.72)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:9}}><div style={{fontSize:46}}>✅</div><div style={{fontSize:14,fontWeight:700,color:"#22c55e"}}>Liveness Confirmed!</div></div>}
        </>}
      </div>}
      {status==="running"&&<div style={{display:"flex",gap:7,justifyContent:"center",flexWrap:"wrap"}}>
        {LIVE.map((s,i)=><div key={s.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{width:30,height:30,borderRadius:"50%",border:`2px solid ${checks.includes(s.id)?"#22c55e":i===step?"#f5c842":"rgba(255,255,255,.12)"}`,background:checks.includes(s.id)?"rgba(34,197,94,.14)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,transition:"all .3s"}}>{checks.includes(s.id)?"✓":s.i}</div>
          <span style={{fontSize:8.5,color:"rgba(255,255,255,.35)"}}>{s.id}</span>
        </div>)}
      </div>}
      <div style={{display:"flex",gap:9}}>
        <button onClick={onBack} className="btn-ghost" style={{flex:1}}>← Back</button>
        <button onClick={onDone} disabled={status!=="done"&&!camErr} style={{flex:2,background:status==="done"?"linear-gradient(135deg,#22c55e,#16a34a)":"rgba(255,255,255,.07)",color:status==="done"?"#fff":"rgba(255,255,255,.3)",border:"none",padding:"12px",borderRadius:12,fontSize:12.5,fontWeight:700,cursor:status==="done"?"pointer":"default",fontFamily:"inherit",transition:"all .3s"}}>
          {status==="done"?"Continue →":camErr?"Skip (Manual Review)":"Complete all steps first"}
        </button>
      </div>
    </div>
  );
}

// ─── JOIN MODAL ───────────────────────────────────────────────────────────────
function JoinModal({ onClose, onDone }) {
  const [step,setStep]=useState(1),[roles,setRoles]=useState([]);
  const [f,setF]=useState({name:"",email:"",nin:"",phone:"",location:"",wa:"",hotline:"",ig:"",x:"",tiktok:"",bank:"",accNum:"",accName:"",pw:"",pw2:""});
  const [errs,setErrs]=useState({}),[pwI,setPwI]=useState({score:0,label:"",color:"#333",pct:"0%"});
  const TOTAL=5;
  const isSuper=roles.some(r=>r==="coordinator"||r==="event_planner");
  const set=(k,v)=>{setF(p=>({...p,[k]:v}));if(k==="pw")setPwI(pwStrength(v));};
  const validate=()=>{
    const e={};
    if(step===1&&roles.length===0)e.roles="Please select at least one role";
    if(step===2){if(!f.name.trim())e.name="Full name required";if(!f.email.includes("@"))e.email="Valid email required";if(f.nin.replace(/\D/g,"").length<11)e.nin="Enter your NIN";if(!f.phone)e.phone="Phone required";if(!f.location)e.location="Location required";}
    if(step===3){if(!f.pw)e.pw="Password required";else if(f.pw.length<8)e.pw="Min 8 characters";else if(!/[A-Z]/.test(f.pw))e.pw="Must include uppercase";else if(!/[0-9]/.test(f.pw))e.pw="Must include a number";else if(!/[^A-Za-z0-9]/.test(f.pw))e.pw="Must include special char (!@#$%)";if(f.pw!==f.pw2)e.pw2="Passwords do not match";}
    if(step===4){if(!f.wa)e.wa="WhatsApp required";if(isSuper&&!f.ig)e.ig="Instagram required for super users";if(isSuper&&!f.x)e.x="X handle required for super users";}
    setErrs(e); return Object.keys(e).length===0;
  };
  const next=()=>{if(validate())setStep(s=>s+1)};
  const Field=({k,label,placeholder,type="text",required=false})=>(
    <div><label className="lbl">{label}{required&&<span style={{color:"#f5c842"}}> *</span>}</label>
    <input className={`inp${errs[k]?" err":""}`} type={type} placeholder={placeholder} value={f[k]} onChange={e=>set(k,e.target.value)}/>
    {errs[k]&&<p style={{fontSize:10.5,color:"#ef4444",marginTop:3}}>⚠ {errs[k]}</p>}</div>
  );
  const Btns=({label="Continue →"})=>(<div style={{display:"flex",gap:9,marginTop:4}}>{step>1&&<button onClick={()=>setStep(s=>s-1)} className="btn-ghost" style={{flex:1}}>← Back</button>}<button onClick={next} className="btn-gold" style={{flex:step>1?2:1}}>{label}</button></div>);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="mbox" onClick={e=>e.stopPropagation()} style={{maxWidth:500,maxHeight:"94vh",overflowY:"auto"}}>
        <div style={{padding:"20px 20px 0",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div><div style={{fontFamily:"'Playfair Display',serif",fontSize:21,fontWeight:900}}>Join Crew<span style={{color:"#f5c842"}}>NG</span></div><div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>Step {step} of {TOTAL}</div></div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.07)",border:"none",color:"rgba(255,255,255,.5)",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div className="prog-w"><div className="prog-f" style={{width:`${step/TOTAL*100}%`}}/></div>
        <div style={{padding:"18px 20px 24px",display:"flex",flexDirection:"column",gap:14}}>
          {step===1&&<><div><p style={{fontSize:13.5,fontWeight:700,marginBottom:4}}>What roles do you offer?</p><p style={{fontSize:11.5,color:"rgba(255,255,255,.45)",lineHeight:1.65,marginBottom:12}}>Select your primary role first, then any additional roles you qualify for. You appear in search results for all selected roles.</p><RoleDropdown selected={roles} onChange={setRoles}/>{errs.roles&&<p style={{fontSize:10.5,color:"#ef4444",marginTop:6}}>⚠ {errs.roles}</p>}</div>{roles.length>0&&<div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:11,padding:"11px 13px",fontSize:11,color:"rgba(255,255,255,.5)",lineHeight:1.65}}>💡 <strong style={{color:"#fff"}}>{roles.length} role{roles.length>1?"s":""} selected.</strong> You can update roles anytime from your dashboard.</div>}<Btns/></>}
          {step===2&&<><p style={{fontSize:13.5,fontWeight:700}}>Personal Information</p><Field k="name" label="Full Name (must match NIN exactly)" placeholder="e.g. Ngozi Chioma Okafor" required/><Field k="email" label="Email Address" placeholder="your@email.com" type="email" required/><Field k="nin" label="Verified" placeholder="Enter your NIN to get verified" required/><div style={{background:"rgba(245,200,66,.07)",border:"1px solid rgba(245,200,66,.18)",borderRadius:9,padding:"9px 12px",fontSize:10.5,color:"rgba(255,255,255,.5)",lineHeight:1.65}}>🔒 Enter your NIN to get verified on the platform. One-way encrypted.</div><Field k="phone" label="Phone Number" placeholder="+234…" required/><Field k="location" label="State / City" placeholder="e.g. Lagos" required/><Btns/></>}
          {step===3&&<><p style={{fontSize:13.5,fontWeight:700}}>Create Password</p><div style={{background:"rgba(96,165,250,.08)",border:"1px solid rgba(96,165,250,.2)",borderRadius:9,padding:"9px 12px",fontSize:11,color:"rgba(255,255,255,.6)",lineHeight:1.7}}>Must have: <strong style={{color:"#fff"}}>8+ chars · Uppercase · Number · Special char (!@#$%)</strong></div><Field k="pw" label="Password" placeholder="Enter password" type="password" required/>{f.pw&&<><div className="pw-w"><div className="pw-f" style={{width:pwI.pct,background:pwI.color}}/></div><p style={{fontSize:10.5,color:pwI.color,marginTop:2,fontWeight:600}}>{pwI.label} password</p></>}<Field k="pw2" label="Confirm Password" placeholder="Enter again" type="password" required/><Btns/></>}
          {step===4&&<><p style={{fontSize:13.5,fontWeight:700}}>Contact & Social</p><Field k="wa" label="WhatsApp Number" placeholder="+234…" required/><Field k="hotline" label="Hotline (optional)" placeholder="+234…"/><div style={{height:1,background:"rgba(255,255,255,.07)"}}/><p style={{fontSize:11.5,color:"rgba(255,255,255,.45)",lineHeight:1.65}}>{isSuper?<><span style={{color:"#fb7185",fontWeight:700}}>⚠️ Instagram & X required</span> for coordinators/planners.</>:"Optional but recommended."}</p><Field k="ig" label={`Instagram Handle${isSuper?" *":""}`} placeholder="@yourhandle"/><Field k="x" label={`X Handle${isSuper?" *":""}`} placeholder="@yourhandle"/><Field k="tiktok" label="TikTok (optional)" placeholder="@yourhandle"/><Btns/></>}
          {step===5&&<LiveCapture onDone={()=>setStep(99)} onBack={()=>setStep(4)}/>}
          {step===99&&<><p style={{fontSize:13.5,fontWeight:700}}>Bank Account for Payouts</p><div style={{background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.18)",borderRadius:9,padding:"9px 12px",fontSize:10.5,color:"rgba(255,255,255,.5)",lineHeight:1.65}}>💳 AES-256 encrypted. Never displayed publicly.</div><Field k="bank" label="Bank Name" placeholder="e.g. GTBank, Access" required/><Field k="accNum" label="Account Number (10 digits)" placeholder="0123456789" required/><Field k="accName" label="Account Name" placeholder="Must match registered name" required/><div style={{display:"flex",gap:9}}><button onClick={()=>setStep(5)} className="btn-ghost" style={{flex:1}}>← Back</button><button onClick={()=>setStep(999)} className="btn-gold" style={{flex:2}}>Complete Registration</button></div></>}
          {step===999&&<div style={{textAlign:"center",padding:"14px 0 6px"}}><div style={{fontSize:52,marginBottom:12}}>🎉</div><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,marginBottom:9}}>Registration Submitted!</h3><p style={{fontSize:12.5,color:"rgba(255,255,255,.5)",lineHeight:1.7,maxWidth:320,margin:"0 auto 18px"}}>NIN + face verification takes up to 24hrs. Once approved, your profile goes live on all your roles.</p><div style={{background:"rgba(245,200,66,.07)",border:"1px solid rgba(245,200,66,.18)",borderRadius:13,padding:"13px 16px",fontSize:11,color:"rgba(255,255,255,.6)",textAlign:"left",marginBottom:18,lineHeight:1.85}}><strong style={{color:"#f5c842"}}>What happens next:</strong><br/>✓ NIN + face verified (24hrs)<br/>✓ Profile goes live for all your roles<br/>✓ Wallet created automatically<br/>✓ Log in to update profile & roles anytime</div><button onClick={()=>{onDone&&onDone();onClose();}} className="btn-gold" style={{padding:"12px 28px",fontSize:13.5}}>Go to Login →</button></div>}
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN MODAL ──────────────────────────────────────────────────────────────
function LoginModal({ onClose, onSuccess, onJoin, onForgot }) {
  const [f,setF]=useState({email:"",pw:""}),[err,setErr]=useState(""),[loading,setL]=useState(false);
  const submit=()=>{
    if(!f.email||!f.pw){setErr("Email and password required.");return;}
    setL(true);
    setTimeout(()=>{setL(false);
      if(f.email==="admin@crewng.com"&&f.pw==="Admin@1234!")onSuccess({role:"SUPER_ADMIN",name:"Super Admin",email:f.email});
      else if(f.email==="sub@crewng.com"&&f.pw==="Sub@1234!")onSuccess({role:"SUB_ADMIN",name:"Sub Admin",email:f.email});
      else if(f.email.includes("@")&&f.pw.length>=8)onSuccess({role:"WAITER",name:"John Crew",email:f.email});
      else setErr("Invalid email or password.");
    },1000);
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="mbox" onClick={e=>e.stopPropagation()} style={{maxWidth:400}}>
        <div style={{padding:"22px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900}}>Welcome Back</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.07)",border:"none",color:"rgba(255,255,255,.5)",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:"18px 22px 26px",display:"flex",flexDirection:"column",gap:13}}>
          <div><label className="lbl">Email</label><input className="inp" type="email" placeholder="your@email.com" value={f.email} onChange={e=>setF(p=>({...p,email:e.target.value}))}/></div>
          <div><label className="lbl">Password</label><input className="inp" type="password" placeholder="Your password" value={f.pw} onChange={e=>setF(p=>({...p,pw:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&submit()}/></div>
          {err&&<p style={{fontSize:11.5,color:"#ef4444",background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.22)",borderRadius:8,padding:"8px 11px"}}>⚠ {err}</p>}
          <button onClick={submit} disabled={loading} className="btn-gold" style={{padding:"13px",borderRadius:12,width:"100%",fontSize:14}}>
            {loading?<span style={{display:"inline-block",width:17,height:17,border:"2.5px solid rgba(0,0,0,.25)",borderTopColor:"#000",borderRadius:"50%",animation:"spin .9s linear infinite"}}/>:"Log In"}
          </button>
          <button onClick={onForgot} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>Forgot password?</button>
          <div style={{textAlign:"center",fontSize:12.5,color:"rgba(255,255,255,.4)"}}>New here? <span style={{color:"#f5c842",fontWeight:700,cursor:"pointer"}} onClick={()=>{onClose();onJoin&&onJoin()}}>Join the Crew →</span></div>
          <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:9,padding:"9px 12px",fontSize:10,color:"rgba(255,255,255,.3)",lineHeight:1.6,textAlign:"center"}}>Demo: <code style={{color:"#f5c842"}}>admin@crewng.com</code> / <code style={{color:"#f5c842"}}>Admin@1234!</code></div>
        </div>
      </div>
    </div>
  );
}

// ─── FORGOT PASSWORD ──────────────────────────────────────────────────────────
function ForgotModal({ onClose, onBack }) {
  const [email,setEmail]=useState(""),[sent,setSent]=useState(false);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="mbox" onClick={e=>e.stopPropagation()} style={{maxWidth:380}}>
        <div style={{padding:"22px 22px 0",display:"flex",justifyContent:"space-between"}}>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:900}}>Reset Password</span>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.07)",border:"none",color:"rgba(255,255,255,.5)",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{padding:"18px 22px 26px",display:"flex",flexDirection:"column",gap:13}}>
          {!sent?<><p style={{fontSize:12,color:"rgba(255,255,255,.5)",lineHeight:1.65}}>Enter your email. Reset link valid for <strong style={{color:"#fff"}}>15 minutes</strong>.</p><div><label className="lbl">Email</label><input className="inp" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/></div><button onClick={()=>email.includes("@")&&setSent(true)} className="btn-gold" style={{padding:"12px",borderRadius:12,width:"100%"}}>Send Reset Link</button><button onClick={onBack} style={{background:"none",border:"none",color:"rgba(255,255,255,.4)",fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>← Back to Login</button></>:<><div style={{textAlign:"center",padding:"8px 0"}}><div style={{fontSize:46,marginBottom:10}}>📧</div><h3 style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:800,marginBottom:7}}>Check your email</h3><p style={{fontSize:12.5,color:"rgba(255,255,255,.5)",lineHeight:1.65}}>Reset link sent to <strong style={{color:"#f5c842"}}>{email}</strong>. Expires in 15 min.</p></div><button onClick={onClose} className="btn-gold" style={{padding:"12px",borderRadius:12,width:"100%"}}>Done</button></>}
        </div>
      </div>
    </div>
  );
}

// ─── PROFILE CARD ─────────────────────────────────────────────────────────────
function PCard({ p, onClick, onBook }) {
  const cat = catById(p.role);
  const [dot, setDot] = useState(0);
  return (
    <div className="pcard" onClick={()=>onClick(p)}>
      <div style={{position:"relative",width:"100%",paddingBottom:"95%",background:p.bg,flexShrink:0}}>
        <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:60}}>{p.emoji}</div>
        {p.isSuper&&<div style={{position:"absolute",top:38,left:9,background:"linear-gradient(135deg,#f5c842,#e6a817)",color:"#000",fontSize:7.5,fontWeight:800,padding:"2px 8px",borderRadius:50}}>👑 SUPER</div>}
        <div style={{position:"absolute",top:9,left:9,background:p.available?"rgba(34,197,94,.9)":"rgba(239,68,68,.85)",color:"#fff",fontSize:8.5,fontWeight:700,padding:"3px 8px",borderRadius:50}}>{p.available?"● Available":"● Booked"}</div>
        {p.verified&&<div style={{position:"absolute",top:9,right:9,background:"rgba(14,14,14,.85)",color:cat.color,fontSize:8.5,fontWeight:700,padding:"3px 8px",borderRadius:50,border:`1px solid ${cat.color}44`}}>✓ Verified</div>}
        <div style={{position:"absolute",bottom:8,left:0,right:0,display:"flex",justifyContent:"center",gap:4}}>
          {[0,1,2,3,4].map(i=><div key={i} onClick={e=>{e.stopPropagation();setDot(i)}} style={{width:i===dot?14:5,height:5,borderRadius:3,background:i===dot?cat.color:"rgba(255,255,255,.3)",transition:"width .2s",cursor:"pointer"}}/>)}
        </div>
        <div style={{position:"absolute",bottom:22,right:8,background:"rgba(0,0,0,.72)",color:"#fff",fontSize:7.5,fontWeight:700,padding:"2px 7px",borderRadius:50}}>▶360°</div>
      </div>
      <div style={{padding:"10px 11px 12px",display:"flex",flexDirection:"column",gap:7,flex:1}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:5}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12.5,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
            <div style={{fontSize:9.5,color:"rgba(255,255,255,.4)",marginTop:1}}>{p.location} · {p.exp}yr exp</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0}}><Stars r={p.rating}/><div style={{fontSize:8.5,color:"rgba(255,255,255,.4)",marginTop:1}}>{p.rating} ({p.reviews})</div></div>
        </div>
        {p.extra.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{p.extra.slice(0,2).map(r=>{const c=catById(r);return<span key={r} style={{fontSize:8.5,fontWeight:700,background:`${c.color}18`,color:c.color,border:`1px solid ${c.color}28`,padding:"2px 7px",borderRadius:50}}>{c.icon}</span>;})}</div>}
        <div style={{display:"flex",gap:5}}>
          {[{l:"H",v:p.height},{l:"Jobs",v:p.jobs},{l:"Skin",v:p.skin.split(" ")[0]}].map(s=>(
            <div key={s.l} style={{flex:1,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.05)",borderRadius:7,padding:"5px 2px",textAlign:"center"}}>
              <div style={{fontSize:10,fontWeight:700}}>{s.v}</div><div style={{fontSize:8,color:"rgba(255,255,255,.3)",marginTop:1}}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{background:`${cat.color}0c`,border:`1px solid ${cat.color}18`,borderRadius:8,padding:"5px 8px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:7.5,color:"rgba(255,255,255,.35)",marginBottom:1}}>RATE RANGE</div><div style={{fontSize:11,fontWeight:800,color:cat.color}}>{fmtR(p.role)}</div></div>
          <div style={{fontSize:7.5,color:"rgba(255,255,255,.3)",textAlign:"right",lineHeight:1.4}}>Per<br/>event</div>
        </div>
        {/* Book button — in-app */}
        <button
          onClick={e=>{e.stopPropagation();onBook(p)}}
          style={{width:"100%",background:`linear-gradient(135deg,${cat.color},${cat.color}cc)`,color:"#000",border:"none",padding:"8px 0",borderRadius:50,fontSize:11.5,fontWeight:800,cursor:"pointer",fontFamily:"inherit",transition:"all .2s",marginTop:1}}
          onMouseEnter={e=>e.target.style.transform="scale(1.02)"} onMouseLeave={e=>e.target.style.transform=""}>
          📅 Book Now
        </button>
      </div>
    </div>
  );
}

// ─── PROFILE DETAIL MODAL ─────────────────────────────────────────────────────
function ProfileModal({ p, onClose, onBook }) {
  if(!p) return null;
  const cat = catById(p.role);
  return (
    <div className="overlay" onClick={onClose}>
      <div className="mbox" onClick={e=>e.stopPropagation()} style={{maxWidth:490,maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{position:"relative",background:p.bg,paddingBottom:"48%",borderRadius:"22px 22px 0 0",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:84}}>{p.emoji}</div>
          <button onClick={onClose} style={{position:"absolute",top:13,right:13,background:"rgba(0,0,0,.6)",border:"none",color:"#fff",width:32,height:32,borderRadius:"50%",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          {p.verified&&<div style={{position:"absolute",top:13,left:13,background:"rgba(14,14,14,.85)",color:cat.color,fontSize:10,fontWeight:700,padding:"4px 11px",borderRadius:50,border:`1px solid ${cat.color}44`}}>✓ Verified</div>}
          {p.isSuper&&<div style={{position:"absolute",bottom:12,left:13,background:"linear-gradient(135deg,#f5c842,#e6a817)",color:"#000",fontSize:9.5,fontWeight:800,padding:"4px 13px",borderRadius:50}}>👑 SUPER USER — Can Create Events</div>}
        </div>
        {/* Photos */}
        <div style={{display:"flex",gap:7,padding:"12px 15px 0",overflowX:"auto"}}>
          {[0,1,2,3,4].map(i=><div key={i} style={{flexShrink:0,width:50,height:50,borderRadius:10,background:p.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:i===0?`2px solid ${cat.color}`:"2px solid transparent",cursor:"pointer"}}>{p.emoji}</div>)}
          <div style={{flexShrink:0,width:50,height:50,borderRadius:10,background:"rgba(255,255,255,.05)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:1,border:"2px dashed rgba(255,255,255,.14)",cursor:"pointer"}}>
            <span style={{fontSize:15}}>▶</span><span style={{fontSize:7,color:"rgba(255,255,255,.4)"}}>360°</span>
          </div>
        </div>
        <div style={{padding:"13px 15px 22px",display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div><h2 style={{fontSize:18,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>{p.name}</h2><p style={{fontSize:11.5,color:"rgba(255,255,255,.5)",marginTop:2}}>{p.location} · {p.exp} yrs exp</p></div>
            <div style={{textAlign:"right"}}><Stars r={p.rating}/><div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginTop:2}}>{p.rating} · {p.reviews} reviews</div></div>
          </div>
          {/* All roles */}
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {p.allRoles.map(r=>{const c=catById(r);return<span key={r} style={{fontSize:10.5,fontWeight:700,background:`${c.color}18`,color:c.color,border:`1px solid ${c.color}30`,padding:"4px 10px",borderRadius:50}}>{c.icon} {c.label.slice(0,-1)}</span>;})}
          </div>
          {/* Rate range */}
          <div style={{background:`${cat.color}10`,border:`1px solid ${cat.color}28`,borderRadius:11,padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><div style={{fontSize:9,color:"rgba(255,255,255,.4)",marginBottom:2,letterSpacing:.5}}>RATE RANGE / EVENT</div><div style={{fontSize:16,fontWeight:900,color:cat.color}}>{fmtR(p.role)}</div></div>
            <div style={{fontSize:10,color:"rgba(255,255,255,.35)",textAlign:"right",lineHeight:1.5}}>Final amount<br/>set during booking</div>
          </div>
          {/* Stats */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7}}>
            {[{l:"Height",v:p.height},{l:"Skin Tone",v:p.skin},{l:"Jobs Done",v:p.jobs},{l:"Experience",v:`${p.exp}yrs`},{l:"Status",v:p.available?"Available":"Booked",c:p.available?"#22c55e":"#ef4444"},{l:"Location",v:p.location}].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.05)",borderRadius:9,padding:"8px 7px",textAlign:"center"}}>
                <div style={{fontSize:11.5,fontWeight:700,color:s.c||"#fff"}}>{s.v}</div><div style={{fontSize:8.5,color:"rgba(255,255,255,.35)",marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
          {/* Availability calendar */}
          <div>
            <p style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.4)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:9}}>Availability Calendar</p>
            <MiniCalendar bookedDates={p.bookedDates} selectedDates={[]} onToggleDate={null}/>
          </div>
          {/* Skills */}
          <div><p style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.4)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:7}}>Skills</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{p.tags.map(t=><span key={t} style={{fontSize:11,fontWeight:600,background:`${cat.color}18`,color:cat.color,border:`1px solid ${cat.color}30`,padding:"4px 12px",borderRadius:50}}>{t}</span>)}</div></div>
          {/* Contact */}
          <div><p style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.4)",letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Social</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
            {p.ig&&<a href={`https://instagram.com/${p.ig.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:5,background:"rgba(240,144,0,.1)",border:"1px solid rgba(225,48,108,.22)",borderRadius:8,padding:"5px 10px",textDecoration:"none",color:"#fff",fontSize:11,fontWeight:600}}>📸 {p.ig}</a>}
            {p.x&&<a href={`https://x.com/${p.x.replace("@","")}`} target="_blank" rel="noopener noreferrer" style={{display:"flex",alignItems:"center",gap:5,background:"rgba(29,161,242,.1)",border:"1px solid rgba(29,161,242,.2)",borderRadius:8,padding:"5px 10px",textDecoration:"none",color:"#fff",fontSize:11,fontWeight:600}}>𝕏 {p.x}</a>}
          </div></div>
          {/* BOOK BUTTON */}
          <button onClick={()=>{onClose();onBook(p)}}
            style={{width:"100%",background:`linear-gradient(135deg,${cat.color},${cat.color}bb)`,color:"#000",border:"none",padding:"15px",borderRadius:14,fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .2s"}}
            onMouseEnter={e=>e.target.style.transform="translateY(-1px)"} onMouseLeave={e=>e.target.style.transform=""}>
            Book {person.name.split(" ")[0]} for an Event
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD – BOOKINGS TAB ────────────────────────────────────────────────
function BookingsTab({ bookings, onRate }) {
  if(bookings.length===0) return (
    <div className="sbox" style={{textAlign:"center",padding:"36px 0",color:"rgba(255,255,255,.3)"}}>
      <div style={{fontSize:34,marginBottom:9}}>📅</div>
      <div style={{fontWeight:700,marginBottom:6}}>No bookings yet</div>
      <div style={{fontSize:12}}>Once you book a professional, it will appear here with full details.</div>
    </div>
  );
  return (
    <div style={{display:"flex",flexDirection:"column",gap:11}}>
      {bookings.map((b,i)=>{
        const cat=catById(b.person.role);
        const isPast = b.dates.every(d=>new Date(d)<new Date());
        const needsRating = isPast && !b.rated;
        return (
          <div key={i} className="booking-card">
            <div style={{width:48,height:48,borderRadius:13,background:b.person.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{b.person.emoji}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>{b.person.name}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>{catById(b.person.role).label.slice(0,-1)} · {b.form.eventName}</div>
                </div>
                <span className="status-badge" style={{background:isPast?"rgba(96,165,250,.15)":needsRating?"rgba(245,200,66,.15)":"rgba(34,197,94,.15)",color:isPast?"#60a5fa":needsRating?"#f5c842":"#22c55e",border:`1px solid ${isPast?"rgba(96,165,250,.3)":needsRating?"rgba(245,200,66,.3)":"rgba(34,197,94,.3)"}`}}>
                  {isPast ? (b.rated?"✓ Completed":"Pending Rating") : "Upcoming"}
                </span>
              </div>
              <div style={{display:"flex",gap:12,marginTop:8,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>📅 {b.dates.join(", ")}</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>📍 {b.form.location}</span>
                <span style={{fontSize:11,color:cat.color,fontWeight:700}}>{fmt(b.totalAmount)}</span>
              </div>
              {needsRating&&(
                <button onClick={()=>onRate(b)}
                  style={{marginTop:10,background:"linear-gradient(135deg,#f5c842,#e6a817)",color:"#000",border:"none",padding:"7px 16px",borderRadius:50,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                  ⭐ Rate & Release Payment
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── USER DASHBOARD ───────────────────────────────────────────────────────────
function Dashboard({ user, onLogout, bookings, onRate }) {
  const [tab,setTab]=useState("profile"),[roles,setRoles]=useState(["waiter"]);
  const [saved,setSaved]=useState(false),[rSaved,setRS]=useState(false);
  const [pf,setPf]=useState({bio:"",height:"",skin:"Medium",ig:"",x:"",tiktok:"",hotline:""});
  const [pw,setPw]=useState({cur:"",nw:"",c2:""}),[pwE,setPwE]=useState({});
  const savePf=()=>{setSaved(true);setTimeout(()=>setSaved(false),2500)};
  const saveR=()=>{setRS(true);setTimeout(()=>setRS(false),2500)};
  const chgPw=()=>{const e={};if(!pw.cur)e.cur="Required";if(pw.nw.length<8)e.nw="Min 8 chars";else if(!/[^A-Za-z0-9]/.test(pw.nw))e.nw="Need special char";if(pw.nw!==pw.c2)e.c2="Don't match";setPwE(e);if(!Object.keys(e).length){alert("Password updated!");setPw({cur:"",nw:"",c2:""})}};
  const pendingRatings = bookings.filter(b=>b.dates.every(d=>new Date(d)<new Date())&&!b.rated).length;
  const TABS=[{id:"profile",l:"Profile",i:"👤"},{id:"roles",l:"My Roles",i:"🏷️"},{id:"wallet",l:"Wallet",i:"💰"},{id:"bookings",l:`Bookings${bookings.length>0?` (${bookings.length})`:""}`,i:"📅"},{id:"settings",l:"Settings",i:"⚙️"}];
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#fff",padding:"76px 5% 56px",fontFamily:"'Sora',sans-serif"}}>
      <div style={{maxWidth:840,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:48,height:48,borderRadius:13,background:"linear-gradient(135deg,#f5c842,#e6a817)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>👤</div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:900}}>{user.name}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>{user.email} · <span style={{color:"#f5c842"}}>{user.role}</span></div>
            </div>
          </div>
          <div style={{display:"flex",gap:9,alignItems:"center"}}>
            {pendingRatings>0&&<div style={{background:"rgba(245,200,66,.15)",border:"1px solid rgba(245,200,66,.3)",color:"#f5c842",padding:"6px 14px",borderRadius:50,fontSize:12,fontWeight:700}}>{pendingRatings} rating{pendingRatings>1?"s":""} pending</div>}
            <button className="btn-red" onClick={onLogout}>Logout</button>
          </div>
        </div>
        <div style={{display:"flex",gap:7,marginBottom:22,overflowX:"auto",scrollbarWidth:"none"}}>
          {TABS.map(t=><button key={t.id} className={`dtab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)} style={{position:"relative"}}>
            {t.i} {t.l}
            {t.id==="bookings"&&pendingRatings>0&&<span className="notif-dot"/>}
          </button>)}
        </div>
        {tab==="profile"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="sbox"><h3 style={{fontWeight:700,fontSize:14,marginBottom:3}}>Update Your Profile</h3><p style={{fontSize:11.5,color:"rgba(255,255,255,.4)",marginBottom:16}}>Shows on your public profile after admin review.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
            <div style={{gridColumn:"span 2"}}><label className="lbl">Bio</label><textarea className="inp" rows={3} style={{resize:"vertical"}} placeholder="Tell clients about your experience…" value={pf.bio} onChange={e=>setPf(p=>({...p,bio:e.target.value}))}/></div>
            <div><label className="lbl">Height</label><input className="inp" placeholder="e.g. 175cm" value={pf.height} onChange={e=>setPf(p=>({...p,height:e.target.value}))}/></div>
            <div><label className="lbl">Skin Tone</label><select className="inp" style={{cursor:"pointer"}} value={pf.skin} onChange={e=>setPf(p=>({...p,skin:e.target.value}))}>{SKINS.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label className="lbl">Hotline</label><input className="inp" placeholder="+234…" value={pf.hotline} onChange={e=>setPf(p=>({...p,hotline:e.target.value}))}/></div>
            <div><label className="lbl">Instagram</label><input className="inp" placeholder="@yourhandle" value={pf.ig} onChange={e=>setPf(p=>({...p,ig:e.target.value}))}/></div>
            <div><label className="lbl">X (Twitter)</label><input className="inp" placeholder="@yourhandle" value={pf.x} onChange={e=>setPf(p=>({...p,x:e.target.value}))}/></div>
            <div><label className="lbl">TikTok</label><input className="inp" placeholder="@yourhandle" value={pf.tiktok} onChange={e=>setPf(p=>({...p,tiktok:e.target.value}))}/></div>
          </div>
          <div style={{marginTop:14,display:"flex",alignItems:"center",gap:11}}><button className="btn-gold" onClick={savePf}>Save Changes</button>{saved&&<span style={{fontSize:12,color:"#22c55e",fontWeight:600}}>✓ Saved!</span>}</div></div>
          <div className="sbox"><h3 style={{fontWeight:700,fontSize:14,marginBottom:13}}>Photos & 360° Video</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
            {[1,2,3,4,5].map(n=><div key={n} style={{aspectRatio:"1",borderRadius:11,border:"2px dashed rgba(255,255,255,.1)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,cursor:"pointer",background:"rgba(255,255,255,.02)",transition:"border-color .2s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="#f5c842"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(255,255,255,.1)"}><span style={{fontSize:22}}>📷</span><span style={{fontSize:8.5,color:"rgba(255,255,255,.3)"}}>Photo {n}{n===1?" (Main)":""}</span></div>)}
            <div style={{aspectRatio:"1",borderRadius:11,border:"2px dashed rgba(96,165,250,.25)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,cursor:"pointer",background:"rgba(96,165,250,.04)",gridColumn:"span 3"}}><span style={{fontSize:24}}>🎬</span><span style={{fontSize:11,color:"rgba(96,165,250,.8)",fontWeight:600}}>Upload 360° Video</span><span style={{fontSize:8.5,color:"rgba(255,255,255,.3)"}}>Max 60s · MP4/MOV</span></div>
          </div></div>
        </div>}
        {tab==="roles"&&<div className="sbox"><h3 style={{fontWeight:700,fontSize:14,marginBottom:4}}>Manage Your Roles</h3><p style={{fontSize:11.5,color:"rgba(255,255,255,.45)",lineHeight:1.65,marginBottom:16}}>You appear in search results for all selected roles. Changes go live after admin review.</p><RoleDropdown selected={roles} onChange={setRoles}/><div style={{marginTop:16,display:"flex",alignItems:"center",gap:11}}><button className="btn-gold" onClick={saveR}>Save Roles</button>{rSaved&&<span style={{fontSize:12,color:"#22c55e",fontWeight:600}}>✓ Updated!</span>}</div></div>}
        {tab==="wallet"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{background:"linear-gradient(135deg,rgba(245,200,66,.14),rgba(230,168,23,.07))",border:"1px solid rgba(245,200,66,.24)",borderRadius:20,padding:"26px",textAlign:"center"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,.5)",marginBottom:5,letterSpacing:1}}>WALLET BALANCE</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:38,fontWeight:900,color:"#f5c842",marginBottom:5}}>₦{(bookings.filter(b=>b.rated).reduce((a,b)=>a+b.totalAmount,0)).toLocaleString()}</div>
            <div style={{fontSize:11.5,color:"rgba(255,255,255,.4)"}}>Total bookings: {bookings.length} · Completed: {bookings.filter(b=>b.rated).length}</div>
          </div>
          <div className="sbox"><h3 style={{fontWeight:700,fontSize:14,marginBottom:13}}>Withdraw to Bank</h3><div style={{display:"flex",flexDirection:"column",gap:11}}><div><label className="lbl">Amount (₦)</label><input className="inp" type="number" placeholder="Enter amount"/></div><div style={{background:"rgba(34,197,94,.06)",border:"1px solid rgba(34,197,94,.18)",borderRadius:9,padding:"9px 12px",fontSize:11,color:"rgba(255,255,255,.5)"}}>💳 Arrives in 1–2 business days.</div><button className="btn-gold" style={{width:"fit-content"}}>Withdraw Now</button></div></div>
        </div>}
        {tab==="bookings"&&<BookingsTab bookings={bookings} onRate={onRate}/>}
        {tab==="settings"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="sbox"><h3 style={{fontWeight:700,fontSize:14,marginBottom:4}}>Change Password</h3><p style={{fontSize:11.5,color:"rgba(255,255,255,.4)",marginBottom:16}}>Must include uppercase, number, special character.</p><div style={{display:"flex",flexDirection:"column",gap:11}}>
            {[{k:"cur",l:"Current Password",p:"Enter current password"},{k:"nw",l:"New Password",p:"8+ chars, uppercase, number, special char"},{k:"c2",l:"Confirm New Password",p:"Repeat"}].map(fl=>(
              <div key={fl.k}><label className="lbl">{fl.l}</label><input className={`inp${pwE[fl.k]?" err":""}`} type="password" placeholder={fl.p} value={pw[fl.k]} onChange={e=>setPw(p=>({...p,[fl.k]:e.target.value}))}/>{pwE[fl.k]&&<p style={{fontSize:10.5,color:"#ef4444",marginTop:3}}>⚠ {pwE[fl.k]}</p>}</div>
            ))}
            <button className="btn-gold" onClick={chgPw} style={{width:"fit-content"}}>Update Password</button>
          </div></div>
          <div style={{background:"rgba(239,68,68,.05)",border:"1px solid rgba(239,68,68,.18)",borderRadius:18,padding:"20px"}}>
            <h3 style={{fontWeight:700,color:"#f87171",marginBottom:8,fontSize:14}}>Danger Zone</h3>
            <p style={{fontSize:11.5,color:"rgba(255,255,255,.4)",marginBottom:13}}>These actions are permanent.</p>
            <div style={{display:"flex",gap:9,flexWrap:"wrap"}}><button className="btn-red">Deactivate Account</button><button className="btn-red" style={{borderColor:"rgba(239,68,68,.5)"}}>Delete Account</button></div>
          </div>
        </div>}
      </div>
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ user, onLogout }) {
  const [tab,setTab]=useState("overview"),[saForm,setSaForm]=useState({name:"",email:"",pw:"",level:"sub_admin"});
  const isSub=user.role==="SUB_ADMIN";
  const TABS=[{id:"overview",l:"Overview",i:"📊"},{id:"users",l:"Users",i:"👥"},{id:"verify",l:"Verify",i:"🔐"},{id:"bookings",l:"Bookings",i:"📅"},{id:"payments",l:"Payments",i:"💰"},...(!isSub?[{id:"admins",l:"Sub Admins",i:"🔑"},{id:"settings",l:"Settings",i:"⚙️"}]:[])];
  const MOCK_USERS=[{n:"Ngozi Okafor",r:"WAITRESS",s:"Active",v:true,l:"Lagos"},{n:"Emeka Balogun",r:"WAITER",s:"Active",v:false,l:"Abuja"},{n:"Adaora Eze",r:"COORDINATOR",s:"Pending",v:false,l:"PH"},{n:"Rotimi Adeyemi",r:"HOST",s:"Suspended",v:true,l:"Ibadan"},{n:"Sasha Diamond",r:"BIKINI_GIRL",s:"Active",v:true,l:"Lagos"},{n:"Energy Okafor",r:"PARTY_STARTER",s:"Active",v:false,l:"Abuja"}];
  const MOCK_VERIF=[{n:"Funmilayo Nwosu",r:"EVENT_PLANNER",t:"2hrs ago"},{n:"Tunde Fashola",r:"WAITER",t:"5hrs ago"},{n:"Crystal Obi",r:"DANCER",t:"1 day ago"},{n:"Hype Energy",r:"PARTY_STARTER",t:"3hrs ago"}];
  const MOCK_BOOKINGS=[{ref:"CNG-A1B2C3",booker:"Chidi Okafor",professional:"Ngozi Okafor",role:"Waitress",event:"Wedding Reception",date:"2026-06-15",amount:45000,status:"Confirmed"},{ref:"CNG-D4E5F6",booker:"Amaka Balogun",professional:"Energy Okafor",role:"Party Starter",event:"Birthday Party",date:"2026-06-20",amount:35000,status:"Pending Rating"},{ref:"CNG-G7H8I9",booker:"Rotimi Adeyemi",professional:"Adaora Eze",role:"Coordinator",event:"Corporate Dinner",date:"2026-05-30",amount:250000,status:"Completed"}];
  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#fff",fontFamily:"'Sora',sans-serif"}}>
      <div style={{background:"#111",borderBottom:"1px solid rgba(255,255,255,.08)",padding:"0 5%",height:62,display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#f5c842,#e6a817)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:"#000"}}>C</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:17}}>Crew<span style={{color:"#f5c842"}}>NG</span> <span style={{fontSize:11,color:"rgba(255,255,255,.35)",fontFamily:"'Sora',sans-serif",fontWeight:400}}>Admin</span></span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,.5)"}}><span style={{display:"inline-block",width:7,height:7,background:isSub?"#60a5fa":"#f5c842",borderRadius:"50%",marginRight:5}}/>{isSub?"Sub Admin":"Super Admin"} · {user.name}</div>
          <button className="btn-red" onClick={onLogout} style={{padding:"6px 14px",fontSize:11.5}}>Logout</button>
        </div>
      </div>
      <div style={{padding:"24px 5%",maxWidth:1100,margin:"0 auto"}}>
        <div style={{display:"flex",gap:7,marginBottom:24,overflowX:"auto",scrollbarWidth:"none"}}>
          {TABS.map(t=><button key={t.id} className={`atab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>{t.i} {t.l}</button>)}
        </div>

        {tab==="overview"&&<div style={{display:"flex",flexDirection:"column",gap:18}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:12}}>
            {[{l:"Total Users",v:"12,847",i:"👥",c:"#f5c842"},{l:"Pending Verify",v:"34",i:"⏳",c:"#f97316"},{l:"Active Bookings",v:"89",i:"📅",c:"#34d399"},{l:"Total Paid Out",v:"₦48.2M",i:"💰",c:"#60a5fa"},{l:"Suspended",v:"8",i:"🚫",c:"#ef4444"},{l:"Sub Admins",v:"3",i:"🔑",c:"#a78bfa"}].map(s=>(
              <div key={s.l} className="sbox" style={{display:"flex",flexDirection:"column",gap:7}}><div style={{fontSize:26}}>{s.i}</div><div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{s.l}</div></div>
            ))}
          </div>
          <div className="sbox"><h3 style={{fontWeight:700,marginBottom:13,fontSize:14}}>Recent Activity</h3>
          {[{t:"New booking",d:"Chidi Okafor booked Ngozi as Waitress · ₦45,000",time:"4 min ago",c:"#34d399"},{t:"Rating submitted",d:"Booking CNG-G7H8I9 rated · Payment released ₦250,000",time:"22 min ago",c:"#f5c842"},{t:"NIN Verified",d:"Ngozi Okafor — face verified successfully",time:"1 hr ago",c:"#60a5fa"},{t:"Account flagged",d:"Suspicious login on user #4821",time:"3 hrs ago",c:"#ef4444"}].map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:i<3?"1px solid rgba(255,255,255,.05)":"none"}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:a.c,flexShrink:0}}/>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{a.t}</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{a.d}</div></div>
              <div style={{fontSize:10.5,color:"rgba(255,255,255,.3)",flexShrink:0}}>{a.time}</div>
            </div>
          ))}</div>
        </div>}

        {tab==="users"&&<div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
            <input className="inp" style={{flex:1,minWidth:180,padding:"9px 13px",fontSize:12.5}} placeholder="Search name, email, role…"/>
            <select className="fsel"><option>All Roles</option>{CATS.map(c=><option key={c.id}>{c.label}</option>)}</select>
            <select className="fsel"><option>All Status</option><option>Active</option><option>Pending</option><option>Suspended</option></select>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {MOCK_USERS.map((u,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:12,background:"#141414",border:"1px solid rgba(255,255,255,.06)",flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:9,flex:1,minWidth:140}}>
                  <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#2d1b00,#5c3800)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>👤</div>
                  <div><div style={{fontSize:13,fontWeight:700}}>{u.n}</div><div style={{fontSize:10,color:"rgba(255,255,255,.4)"}}>{u.r} · {u.l}</div></div>
                </div>
                <span style={{color:u.s==="Active"?"#22c55e":u.s==="Suspended"?"#ef4444":"#f97316",fontWeight:700,fontSize:11,flexShrink:0}}>{u.s}</span>
                <span style={{fontSize:10.5,color:u.v?"#60a5fa":"rgba(255,255,255,.25)",flexShrink:0}}>{u.v?"✓ Verified":"Unverified"}</span>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <button style={{background:"rgba(96,165,250,.12)",border:"1px solid rgba(96,165,250,.25)",color:"#60a5fa",padding:"5px 10px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>View</button>
                  <button style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.22)",color:"#f87171",padding:"5px 10px",borderRadius:7,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{u.s==="Suspended"?"Unsuspend":"Suspend"}</button>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {tab==="verify"&&<div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div style={{background:"rgba(245,200,66,.07)",border:"1px solid rgba(245,200,66,.2)",borderRadius:13,padding:"12px 16px",fontSize:12,color:"rgba(255,255,255,.6)",lineHeight:1.65}}>🔐 Review: (1) Watch face video. (2) Confirm face matches NIN photo. (3) Confirm name matches NIN exactly. Only then approve.</div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {MOCK_VERIF.map((v,i)=>(
              <div key={i} style={{background:"#141414",border:"1px solid rgba(255,255,255,.08)",borderRadius:16,padding:"15px 17px"}}>
                <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:12,flexWrap:"wrap"}}>
                  <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#2d1b00,#5c3800)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,flexShrink:0}}>👤</div>
                  <div style={{flex:1}}><div style={{fontSize:13.5,fontWeight:700}}>{v.n}</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{v.r} · {v.t}</div></div>
                </div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  <button style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",color:"#fff",padding:"6px 12px",borderRadius:8,fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>▶ Face Video</button>
                  <button style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",color:"#fff",padding:"6px 12px",borderRadius:8,fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🪪 NIN Details</button>
                  <button style={{background:"rgba(34,197,94,.14)",border:"1px solid rgba(34,197,94,.32)",color:"#22c55e",padding:"6px 12px",borderRadius:8,fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✓ Approve</button>
                  <button style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.28)",color:"#f87171",padding:"6px 12px",borderRadius:8,fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✗ Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {tab==="bookings"&&<div style={{display:"flex",flexDirection:"column",gap:13}}>
          <div style={{display:"flex",gap:9,flexWrap:"wrap"}}>
            <input className="inp" style={{flex:1,minWidth:180,padding:"9px 13px",fontSize:12.5}} placeholder="Search by ref, name, event…"/>
            <select className="fsel"><option>All Status</option><option>Confirmed</option><option>Pending Rating</option><option>Completed</option><option>Cancelled</option></select>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {MOCK_BOOKINGS.map((b,i)=>(
              <div key={i} style={{background:"#141414",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,padding:"14px 16px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8,marginBottom:8}}>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:700}}>{b.event}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:2}}>Ref: <span style={{color:"#f5c842"}}>{b.ref}</span> · {b.date}</div>
                  </div>
                  <span className="status-badge" style={{background:b.status==="Completed"?"rgba(34,197,94,.15)":b.status==="Pending Rating"?"rgba(245,200,66,.15)":"rgba(96,165,250,.15)",color:b.status==="Completed"?"#22c55e":b.status==="Pending Rating"?"#f5c842":"#60a5fa",border:`1px solid ${b.status==="Completed"?"rgba(34,197,94,.3)":b.status==="Pending Rating"?"rgba(245,200,66,.3)":"rgba(96,165,250,.3)"}`}}>{b.status}</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                  {[{l:"Booker",v:b.booker},{l:"Professional",v:b.professional},{l:"Role",v:b.role},{l:"Amount",v:fmt(b.amount),c:"#34d399"}].map(r=>(
                    <div key={r.l} style={{background:"rgba(255,255,255,.04)",borderRadius:9,padding:"8px 10px"}}>
                      <div style={{fontSize:9.5,color:"rgba(255,255,255,.35)",marginBottom:3}}>{r.l}</div>
                      <div style={{fontSize:12.5,fontWeight:700,color:r.c||"#fff"}}>{r.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>}

        {tab==="payments"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:11}}>
            {[{l:"Total Processed",v:"₦48.2M",c:"#f5c842"},{l:"This Month",v:"₦6.4M",c:"#34d399"},{l:"Withdrawals",v:"₦31.1M",c:"#60a5fa"},{l:"Pending Release",v:"₦240K",c:"#f97316"}].map(s=>(
              <div key={s.l} className="sbox"><div style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:900,color:s.c}}>{s.v}</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)",marginTop:4}}>{s.l}</div></div>
            ))}
          </div>
          <div className="sbox"><h3 style={{fontWeight:700,fontSize:14,marginBottom:13}}>Recent Transactions</h3>
          {["₦45,000 · Booking CNG-A1B2C3 (Waitress) · Paid · 2hrs ago","₦250,000 · Booking CNG-G7H8I9 (Coordinator) · Released · 5hrs ago","₦35,000 · Booking CNG-D4E5F6 (Party Starter) · Pending Rating · 1 day ago","₦25,000 · Sasha Diamond withdrawal · Bank transfer · 2 days ago"].map((t,i)=>(
            <div key={i} style={{padding:"10px 0",borderBottom:i<3?"1px solid rgba(255,255,255,.05)":"none",fontSize:12.5,color:"rgba(255,255,255,.65)"}}>{t}</div>
          ))}</div>
        </div>}

        {!isSub&&tab==="admins"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="sbox"><h3 style={{fontWeight:700,fontSize:14,marginBottom:4}}>Create Sub Admin</h3><p style={{fontSize:11.5,color:"rgba(255,255,255,.4)",marginBottom:16}}>Sub admins can verify users and handle support but cannot change pricing or manage other admins.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11}}>
            <div><label className="lbl">Full Name</label><input className="inp" placeholder="Admin name" value={saForm.name} onChange={e=>setSaForm(f=>({...f,name:e.target.value}))}/></div>
            <div><label className="lbl">Email</label><input className="inp" type="email" placeholder="sub@crewng.com" value={saForm.email} onChange={e=>setSaForm(f=>({...f,email:e.target.value}))}/></div>
            <div><label className="lbl">Temp Password</label><input className="inp" type="password" placeholder="Must change on first login" value={saForm.pw} onChange={e=>setSaForm(f=>({...f,pw:e.target.value}))}/></div>
            <div><label className="lbl">Admin Level</label><select className="inp" style={{cursor:"pointer"}} value={saForm.level} onChange={e=>setSaForm(f=>({...f,level:e.target.value}))}><option value="sub_admin">Sub Admin</option><option value="verif_admin">Verification Admin</option><option value="support_admin">Support Admin</option></select></div>
          </div>
          <button className="btn-gold" style={{marginTop:13,width:"fit-content"}} onClick={()=>alert("Sub admin created! Credentials sent by email.")}>Create Sub Admin</button></div>
          <div className="sbox"><h3 style={{fontWeight:700,fontSize:14,marginBottom:13}}>Current Admins</h3>
          {[{n:"You (Super Admin)",e:"admin@crewng.com",r:"Super Admin",s:"Jan 2026"},{n:"Titi Fashola",e:"titi@crewng.com",r:"Verification Admin",s:"Feb 2026"}].map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:i<1?"1px solid rgba(255,255,255,.05)":"none",flexWrap:"wrap",gap:8}}>
              <div><div style={{fontSize:13,fontWeight:700}}>{a.n}</div><div style={{fontSize:11,color:"rgba(255,255,255,.4)"}}>{a.e} · {a.r} · Since {a.s}</div></div>
              {i>0&&<button className="btn-red" style={{padding:"5px 12px",fontSize:11}}>Remove</button>}
            </div>
          ))}</div>
        </div>}

        {!isSub&&tab==="settings"&&<div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="sbox"><h3 style={{fontWeight:700,fontSize:14,marginBottom:4}}>Price Range Controls</h3><p style={{fontSize:11.5,color:"rgba(255,255,255,.4)",marginBottom:16}}>Coordinators can pay above max but never below min.</p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {CATS.map(c=>{const r=PRICE_RANGES[c.id];return(
              <div key={c.id} style={{display:"grid",gridTemplateColumns:"auto 1fr 1fr",gap:10,alignItems:"center",padding:"10px",borderRadius:11,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)"}}>
                <div style={{display:"flex",alignItems:"center",gap:7,minWidth:140}}><span>{c.icon}</span><span style={{fontSize:12,fontWeight:600,color:c.color}}>{c.label}</span></div>
                <div><label className="lbl" style={{fontSize:9}}>Min (₦)</label><input className="inp" defaultValue={r.min} style={{padding:"7px 10px",fontSize:12}}/></div>
                <div><label className="lbl" style={{fontSize:9}}>Max (₦)</label><input className="inp" defaultValue={r.max} style={{padding:"7px 10px",fontSize:12}}/></div>
              </div>
            );})}
          </div>
          <button className="btn-gold" style={{marginTop:13,width:"fit-content"}}>Save Price Settings</button></div>
          <div className="sbox"><h3 style={{fontWeight:700,fontSize:14,marginBottom:13}}>Admin Password</h3><div style={{display:"flex",flexDirection:"column",gap:10}}>{["Current Password","New Password","Confirm New Password"].map((l,i)=><div key={i}><label className="lbl">{l}</label><input className="inp" type="password" placeholder={l}/></div>)}<button className="btn-gold" style={{width:"fit-content"}}>Update Admin Password</button></div></div>
        </div>}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function CrewNG() {
  const [view, setView]           = useState("home");
  const [activeCat, setActiveCat] = useState(null);
  const [filters, setFilters]     = useState({ loc:"All", skin:"All", avail:false, minR:0, sort:"rating" });
  const [selP, setSelP]           = useState(null);
  const [bookingFor, setBookFor]  = useState(null);
  const [ratingFor, setRatingFor] = useState(null);
  const [bookings, setBookings]   = useState([]); // all bookings made in this session
  const [modal, setModal]         = useState(null);
  const [loggedIn, setLoggedIn]   = useState(null);
  const [menuOpen, setMenu]       = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const [isMob, setIsMob]         = useState(false);
  const [srRole, setSrRole]       = useState("waiter");
  const [srLoc, setSrLoc]         = useState("");
  const browseRef = useRef(null);

  useEffect(()=>{const c=()=>setIsMob(window.innerWidth<768);c();window.addEventListener("resize",c);return()=>window.removeEventListener("resize",c);},[]);
  useEffect(()=>{const f=()=>setScrolled(window.scrollY>20);window.addEventListener("scroll",f);return()=>window.removeEventListener("scroll",f);},[]);

  const openCat = id => { setActiveCat(id); setView("browse"); setFilters({loc:"All",skin:"All",avail:false,minR:0,sort:"rating"}); setTimeout(()=>browseRef.current?.scrollIntoView({behavior:"smooth"}),50); };
  const catCfg = catById(activeCat||"waiter");

  const allInCat = activeCat
    ? [...(ALL[activeCat]||[]),...Object.values(ALL).flat().filter(p=>p.role!==activeCat&&p.extra.includes(activeCat))].filter((p,i,a)=>a.findIndex(x=>x.id===p.id)===i)
    : [];

  const filtered = allInCat
    .filter(p=>filters.loc==="All"||p.location===filters.loc)
    .filter(p=>filters.skin==="All"||p.skin===filters.skin)
    .filter(p=>!filters.avail||p.available)
    .filter(p=>p.rating>=filters.minR)
    .sort((a,b)=>{
      if(filters.sort==="rating") return b.rating-a.rating;
      if(filters.sort==="price_lo") return a.price.min-b.price.min;
      if(filters.sort==="price_hi") return b.price.max-a.price.max;
      if(filters.sort==="jobs") return b.jobs-a.jobs;
      return 0;
    });

  const handleBooked = booking => {
    setBookings(prev => [...prev, { ...booking, rated: false }]);
  };
  const handleRate = bookingObj => {
    setRatingFor(bookingObj);
  };
  const handleRateSubmit = ({ score, comment }) => {
    setBookings(prev => prev.map(b => b === ratingFor ? { ...b, rated: true, score, comment } : b));
  };

  if(loggedIn&&(loggedIn.role==="SUPER_ADMIN"||loggedIn.role==="SUB_ADMIN")) return <AdminPanel user={loggedIn} onLogout={()=>setLoggedIn(null)}/>;
  if(loggedIn) return (
    <>
      <Dashboard user={loggedIn} onLogout={()=>setLoggedIn(null)} bookings={bookings} onRate={handleRate}/>
      {ratingFor && <RatingModal booking={ratingFor} onClose={()=>setRatingFor(null)} onSubmit={handleRateSubmit}/>}
    </>
  );

  return (
    <div style={{fontFamily:"'Sora','Segoe UI',sans-serif",background:"#0a0a0a",minHeight:"100vh",color:"#fff",overflowX:"hidden"}}>
      <style>{CSS}</style>

      {/* ─── NAV ─── */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:200,padding:"0 5%",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",background:scrolled||menuOpen?"rgba(10,10,10,.96)":"transparent",backdropFilter:scrolled||menuOpen?"blur(20px)":"none",borderBottom:scrolled?"1px solid rgba(255,255,255,.07)":"none",transition:"all .3s"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>{setView("home");setActiveCat(null)}}>
          <div style={{width:34,height:34,background:"linear-gradient(135deg,#f5c842,#e6a817)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:15,color:"#000"}}>C</div>
          <span style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:21,letterSpacing:"-.5px"}}>Crew<span style={{color:"#f5c842"}}>NG</span></span>
        </div>
        {!isMob&&<div style={{display:"flex",gap:28}}>{["How It Works","Browse Crew","For Events"].map(l=><span key={l} className="nav-a" onClick={l==="Browse Crew"?()=>openCat("waiter"):undefined}>{l}</span>)}</div>}
        <div style={{display:"flex",gap:9,alignItems:"center"}}>
          {!isMob?<>
            <button className="btn-outline" onClick={()=>setModal("login")}>Log In</button>
            <button className="btn-gold" onClick={()=>setModal("join")}>Join the Crew</button>
          </>:<>
            <button className="btn-gold" style={{padding:"8px 14px",fontSize:12.5}} onClick={()=>setModal("join")}>Join</button>
            <button className="hbg" onClick={()=>setMenu(o=>!o)}>
              <span className="hbar" style={{transform:menuOpen?"rotate(45deg) translate(5px,5px)":"none"}}/>
              <span className="hbar" style={{opacity:menuOpen?0:1}}/>
              <span className="hbar" style={{transform:menuOpen?"rotate(-45deg) translate(5px,-5px)":"none"}}/>
            </button>
          </>}
        </div>
      </nav>
      {menuOpen&&isMob&&<div className="mob-menu">{["How It Works","Browse Crew","For Events"].map(l=><span key={l} className="nav-a" style={{fontSize:15}} onClick={()=>setMenu(false)}>{l}</span>)}<div style={{display:"flex",gap:9,paddingTop:10,borderTop:"1px solid rgba(255,255,255,.07)"}}><button className="btn-outline" style={{flex:1}} onClick={()=>{setModal("login");setMenu(false)}}>Log In</button><button className="btn-gold" style={{flex:1}} onClick={()=>{setModal("join");setMenu(false)}}>Join the Crew</button></div></div>}

      {/* ─── HOME ─── */}
      {view==="home"&&(<>
        <section style={{position:"relative",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:"110px 5% 80px",overflow:"hidden"}}>
          <div className="mesh"/><div className="grid-l"/>
          <div className="fc fa1" style={{top:"22%",right:"5%"}}>
            <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#f5c842,#e6a817)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>✅</div>
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,.5)",marginBottom:1}}>Just Booked</div><div style={{fontSize:12.5,fontWeight:700}}>Ngozi A. – Waitress</div><div style={{fontSize:10.5,color:"#f5c842"}}>Lagos · May 30</div></div>
          </div>
          <div className="fc fa2" style={{bottom:"28%",right:"4%",animationDelay:"1s"}}>
            <div style={{width:7,height:7,background:"#22c55e",borderRadius:"50%"}}/>
            <div><div style={{fontSize:12,fontWeight:700}}>3 coordinators available</div><div style={{fontSize:10.5,color:"rgba(255,255,255,.5)"}}>in Abuja this weekend</div></div>
          </div>
          <div className="fc fa2" style={{top:"30%",left:"3%",animationDelay:".5s"}}>
            <span style={{fontSize:20}}>⭐</span>
            <div><div style={{fontSize:12,fontWeight:700}}>4.9 / 5 Rating</div><div style={{fontSize:10.5,color:"rgba(255,255,255,.5)"}}>+900 verified reviews</div></div>
          </div>
          <div style={{textAlign:"center",maxWidth:760,position:"relative",zIndex:1,width:"100%"}}>
            <div className="hero-badge"><span>🇳🇬</span> Nigeria's #1 Event Staffing Platform</div>
            <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(32px,8vw,74px)",fontWeight:900,lineHeight:1.08,letterSpacing:"-1.5px",marginBottom:18}}>
              Find & Book Event<br/>
              <span style={{background:"linear-gradient(135deg,#f5c842 20%,#e6a817 80%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Professionals</span>
              <br/>in Minutes
            </h1>
            <p style={{fontSize:"clamp(13px,2.5vw,16.5px)",color:"rgba(255,255,255,.6)",lineHeight:1.75,maxWidth:520,margin:"0 auto 32px"}}>
              No more WhatsApp groups. Browse, book & pay — everything happens inside the app.
            </p>
            <div style={{display:"flex",justifyContent:"center",marginBottom:14,padding:"0 4px"}}>
              <div className="sbar">
                <select className="ssel" value={srRole} onChange={e=>{setSrRole(e.target.value);openCat(e.target.value)}}>{CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select>
                <div className="sdiv"/>
                <input className="sinp" placeholder="State or City (e.g. Lagos)" value={srLoc} onChange={e=>setSrLoc(e.target.value)}/>
                <button className="sbtn" onClick={()=>{openCat(srRole);if(srLoc)setFilters(f=>({...f,loc:srLoc}))}}>Search</button>
              </div>
            </div>
            <p style={{fontSize:11.5,color:"rgba(255,255,255,.3)",marginBottom:46}}>No account needed to browse · Register free to get booked</p>
            <div style={{display:"flex",justifyContent:"center",gap:"clamp(18px,5vw,56px)",flexWrap:"wrap"}}>
              {[{v:"12,000+",l:"Verified Crew"},{v:"4,800+",l:"Events Done"},{v:"36",l:"States"},{v:"98%",l:"Satisfaction"}].map(s=>(
                <div key={s.l} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                  <span style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,4vw,30px)",fontWeight:900,color:"#f5c842"}}>{s.v}</span>
                  <span style={{fontSize:11.5,color:"rgba(255,255,255,.4)"}}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How Booking Works */}
        <section style={{padding:"52px 5%",borderTop:"1px solid rgba(255,255,255,.06)",background:"rgba(245,200,66,.03)"}}>
          <div style={{maxWidth:960,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:32}}>
              <p style={{fontSize:10.5,fontWeight:700,color:"#f5c842",letterSpacing:2,textTransform:"uppercase",marginBottom:9}}>100% In-App</p>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,4vw,32px)",fontWeight:800}}>Book in 4 simple steps</h2>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14}}>
              {[
                {n:"01",i:"🔍",t:"Browse & Find",d:"Search by role, city, skin tone, rating. See their calendar availability before booking."},
                {n:"02",i:"📅",t:"Pick Your Dates",d:"Tap dates on their calendar. Book for one day or multiple days. See total cost instantly."},
                {n:"03",i:"💳",t:"Pay Securely",d:"Confirm event details and pay via card, bank transfer, or USSD. Funds are held safely."},
                {n:"04",i:"⭐",t:"Rate & Release",d:"After the event, both you and the professional rate each other. Payment is then released."},
              ].map(s=>(
                <div key={s.n} style={{display:"flex",flexDirection:"column",gap:11,padding:"20px 18px",borderRadius:16,border:"1px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.02)"}}>
                  <div style={{fontSize:9.5,fontWeight:800,color:"rgba(245,200,66,.5)",letterSpacing:2}}>{s.n}</div>
                  <div style={{fontSize:26}}>{s.i}</div>
                  <div style={{fontSize:13.5,fontWeight:700}}>{s.t}</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,.5)",lineHeight:1.7}}>{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section style={{padding:"52px 5%",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{maxWidth:1100,margin:"0 auto"}}>
            <div style={{textAlign:"center",marginBottom:28}}>
              <p style={{fontSize:10.5,fontWeight:700,color:"#f5c842",letterSpacing:2,textTransform:"uppercase",marginBottom:9}}>10 Categories</p>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,4vw,34px)",fontWeight:800,letterSpacing:"-.5px"}}>Who do you need for your event?</h2>
              <p style={{color:"rgba(255,255,255,.4)",fontSize:12.5,marginTop:7}}>Tap any category — no account needed to browse</p>
            </div>
            <div className="cat-grid">
              {CATS.map(cat=>(
                <div key={cat.id} onClick={()=>openCat(cat.id)}
                  style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7,padding:"18px 10px 16px",borderRadius:17,cursor:"pointer",border:"1.5px solid rgba(255,255,255,.07)",background:"rgba(255,255,255,.03)",transition:"all .27s",position:"relative"}}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${cat.color}14`;e.currentTarget.style.borderColor=cat.color;e.currentTarget.style.transform="translateY(-3px)"}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.03)";e.currentTarget.style.borderColor="rgba(255,255,255,.07)";e.currentTarget.style.transform=""}}>
                  {cat.sup&&<div style={{position:"absolute",top:-1,right:-1,background:"linear-gradient(135deg,#f5c842,#e6a817)",color:"#000",fontSize:7,fontWeight:800,padding:"2px 8px",borderRadius:"0 15px 0 8px"}}>👑</div>}
                  <span style={{fontSize:26}}>{cat.icon}</span>
                  <span style={{fontSize:12.5,fontWeight:700,textAlign:"center",lineHeight:1.3}}>{cat.label}</span>
                  <span style={{fontSize:9.5,color:"rgba(255,255,255,.35)"}}>{ALL[cat.id]?.length}+ available</span>
                  <span style={{fontSize:9.5,color:cat.color,fontWeight:700,textAlign:"center"}}>{fmtR(cat.id)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{padding:"52px 5%"}}>
          <div style={{maxWidth:860,margin:"0 auto",background:"linear-gradient(135deg,rgba(245,200,66,.12),rgba(230,168,23,.06))",border:"1px solid rgba(245,200,66,.24)",borderRadius:24,padding:"clamp(28px,5vw,50px) clamp(18px,5vw,40px)",textAlign:"center"}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(20px,4vw,34px)",fontWeight:900,marginBottom:11}}>Ready to join Nigeria's best event crew?</h2>
            <p style={{color:"rgba(255,255,255,.6)",fontSize:"clamp(12.5px,2vw,15px)",maxWidth:500,margin:"0 auto 26px",lineHeight:1.7}}>Register free, get NIN verified, and start getting booked across Nigeria.</p>
            <div style={{display:"flex",gap:11,justifyContent:"center",flexWrap:"wrap"}}>
              <button className="btn-gold" style={{padding:"12px 30px",fontSize:14}} onClick={()=>setModal("join")}>Join the Crew</button>
              <button className="btn-outline" style={{padding:"12px 30px",fontSize:14}} onClick={()=>openCat("waiter")}>Browse & Book</button>
            </div>
          </div>
        </section>

        <footer style={{padding:"22px 5%",borderTop:"1px solid rgba(255,255,255,.06)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:9}}>
            <span style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:16}}>Crew<span style={{color:"#f5c842"}}>NG</span></span>
            <span style={{fontSize:11,color:"rgba(255,255,255,.3)"}}>© 2026 CrewNG · Nigeria's Event Staffing Platform</span>
            <div style={{display:"flex",gap:16}}>{["Privacy","Terms","Contact","Admin"].map(l=><span key={l} style={{fontSize:11,color:"rgba(255,255,255,.35)",cursor:"pointer"}} onClick={l==="Admin"?()=>setModal("login"):undefined}>{l}</span>)}</div>
          </div>
        </footer>
      </>)}

      {/* ─── BROWSE ─── */}
      {view==="browse"&&(
        <div ref={browseRef} style={{paddingTop:64}}>
          <div style={{background:`linear-gradient(135deg,${catCfg.color}18,${catCfg.color}05)`,borderBottom:`1px solid ${catCfg.color}25`,padding:"24px 5% 0"}}>
            <div style={{maxWidth:1200,margin:"0 auto"}}>
              <button onClick={()=>setView("home")} className="btn-ghost" style={{marginBottom:14,fontSize:12,padding:"7px 14px"}}>← Home</button>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14,flexWrap:"wrap"}}>
                <div style={{width:46,height:46,borderRadius:13,background:`${catCfg.color}1e`,border:`2px solid ${catCfg.color}3a`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:21,flexShrink:0}}>{catCfg.icon}</div>
                <div>
                  <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(19px,4vw,30px)",fontWeight:900,color:catCfg.color}}>{catCfg.label}</h1>
                  <p style={{fontSize:11.5,color:"rgba(255,255,255,.5)",marginTop:2}}>{filtered.length} result{filtered.length!==1?"s":""}{filters.loc!=="All"?` in ${filters.loc}`:""} · Rate: <strong style={{color:catCfg.color}}>{fmtR(activeCat)}</strong></p>
                </div>
                {catCfg.sup&&<div style={{marginLeft:"auto",background:"linear-gradient(135deg,#f5c842,#e6a817)",color:"#000",fontSize:10,fontWeight:800,padding:"5px 13px",borderRadius:50,flexShrink:0}}>👑 Creates Events</div>}
              </div>
              <div className="cpills" style={{marginBottom:16}}>
                {CATS.map(c=>(
                  <div key={c.id} className="cpill" onClick={()=>openCat(c.id)} style={{background:c.id===activeCat?`${c.color}1e`:"rgba(255,255,255,.04)",borderColor:c.id===activeCat?c.color:"rgba(255,255,255,.1)",color:c.id===activeCat?c.color:"rgba(255,255,255,.6)"}}>
                    {c.icon} {c.label}
                    {c.id===activeCat&&<span style={{background:`${c.color}2e`,color:c.color,fontSize:9,padding:"2px 7px",borderRadius:50,fontWeight:700}}>{filtered.length}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Filter bar */}
          <div style={{background:"#111",borderBottom:"1px solid rgba(255,255,255,.07)",padding:"10px 5%",position:"sticky",top:64,zIndex:100}}>
            <div style={{maxWidth:1200,margin:"0 auto"}}>
              <div className="fbar">
                <select className="fsel" value={filters.loc} onChange={e=>setFilters(f=>({...f,loc:e.target.value}))}><option value="All">📍 All States</option>{LOCS.map(l=><option key={l}>{l}</option>)}</select>
                <select className="fsel" value={filters.skin} onChange={e=>setFilters(f=>({...f,skin:e.target.value}))}><option value="All">🎨 Skin Tone</option>{SKINS.map(s=><option key={s}>{s}</option>)}</select>
                <select className="fsel" value={filters.sort} onChange={e=>setFilters(f=>({...f,sort:e.target.value}))}>
                  <option value="rating">⭐ Top Rated</option><option value="jobs">💼 Most Jobs</option><option value="price_lo">💰 Lowest Rate</option><option value="price_hi">💰 Highest Rate</option>
                </select>
                <select className="fsel" value={filters.minR} onChange={e=>setFilters(f=>({...f,minR:+e.target.value}))}><option value={0}>★ Any Rating</option><option value={4}>★ 4.0+</option><option value={4.5}>★ 4.5+</option></select>
                <button onClick={()=>setFilters(f=>({...f,avail:!f.avail}))} style={{background:filters.avail?`${catCfg.color}1e`:"rgba(255,255,255,.05)",border:`1px solid ${filters.avail?catCfg.color:"rgba(255,255,255,.1)"}`,color:filters.avail?catCfg.color:"rgba(255,255,255,.55)",padding:"8px 13px",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0,transition:"all .2s"}}>● Available</button>
                {(filters.loc!=="All"||filters.skin!=="All"||filters.avail||filters.minR>0)&&<button onClick={()=>setFilters({loc:"All",skin:"All",avail:false,minR:0,sort:"rating"})} style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.22)",color:"#f87171",padding:"8px 13px",borderRadius:9,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",flexShrink:0}}>✕ Clear</button>}
                <div style={{marginLeft:"auto",fontSize:11.5,color:"rgba(255,255,255,.3)",flexShrink:0,whiteSpace:"nowrap"}}>{filtered.length} results</div>
              </div>
            </div>
          </div>
          {/* Grid */}
          <div style={{padding:"20px 5% 56px",maxWidth:1200,margin:"0 auto"}}>
            {filtered.length===0
              ?<div style={{textAlign:"center",padding:"64px 0",color:"rgba(255,255,255,.35)",display:"flex",flexDirection:"column",gap:9,alignItems:"center"}}><span style={{fontSize:40}}>🔍</span><span style={{fontSize:16,fontWeight:700}}>No results found</span><span style={{fontSize:12.5}}>Try adjusting your filters</span></div>
              :<div className="prof-grid">{filtered.map(p=><PCard key={p.id} p={p} onClick={setSelP} onBook={setBookFor}/>)}</div>
            }
          </div>
        </div>
      )}

      {/* ─── MODALS ─── */}
      {selP && <ProfileModal p={selP} onClose={()=>setSelP(null)} onBook={p=>{setSelP(null);setBookFor(p)}}/>}
      {bookingFor && <BookingModal person={bookingFor} onClose={()=>setBookFor(null)} onBooked={booking=>{handleBooked(booking);setBookFor(null)}}/>}
      {ratingFor && <RatingModal booking={ratingFor} onClose={()=>setRatingFor(null)} onSubmit={handleRateSubmit}/>}
      {modal==="join" && <JoinModal onClose={()=>setModal(null)} onDone={()=>setModal("login")}/>}
      {modal==="login" && <LoginModal onClose={()=>setModal(null)} onSuccess={u=>{setLoggedIn(u);setModal(null)}} onJoin={()=>setModal("join")} onForgot={()=>setModal("forgot")}/>}
      {modal==="forgot" && <ForgotModal onClose={()=>setModal(null)} onBack={()=>setModal("login")}/>}
    </div>
  );
}
