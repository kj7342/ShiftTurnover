/* Standalone local demo. SharePoint connection is not enabled in this prototype. */
(()=>{"use strict";
const $=id=>document.getElementById(id),KEY="shiftTurnoverDemo_v1",THEME="shiftTurnoverTheme_v1";
const sampleMachines=["CNC-100","CNC-101","CNC-102","LATHE-201","MILL-305"];
const sampleComments=[{machine:"CNC-102",operator:"Jordan Lee",shopOrder:"SO-48291",quantity:"120",operation:"OP 30",comments:"Tool change completed. First-piece inspection passed; machine running normally.",created:Date.now()-7200000},{machine:"CNC-102",operator:"Morgan Davis",shopOrder:"SO-48291",quantity:"85",operation:"OP 30",comments:"Finished the remaining batch. Please verify coolant level before restarting.",created:Date.now()-93600000}];
let data;try{data=JSON.parse(localStorage.getItem(KEY))||{machines:sampleMachines,comments:sampleComments}}catch{data={machines:sampleMachines,comments:sampleComments}}
// Recover safely if an older or partially initialized browser save has no machine codes.
if(!data || typeof data!=="object") data={};
if(!Array.isArray(data.machines) || data.machines.length===0) data.machines=[...sampleMachines];
if(!Array.isArray(data.comments)) data.comments=[...sampleComments];
let selected="";
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function machines(){const current=$("machine").value; $("machine").innerHTML='<option value="">Choose a machine...</option>'+data.machines.slice().sort().map(m=>'<option value="'+esc(m)+'">'+esc(m)+'</option>').join("");if(data.machines.includes(current))$("machine").value=current;$("machineAdmin").innerHTML=data.machines.slice().sort().map(m=>'<li>'+esc(m)+'<button data-remove="'+esc(m)+'" type="button">Remove</button></li>').join("")||"<li>No machine codes.</li>";}
function history(){
const m=$("machine").value.trim();
selected=data.machines.find(x=>x.toLowerCase()===m.toLowerCase())||"";
if(!selected){$("subtitle").textContent="Select a machine to view its history.";$("list").className="empty";$("list").textContent="Choose a machine above to see its turnover comments.";return}
const q=$("filter").value.trim().toLowerCase();
const rows=data.comments.filter(x=>x.machine===selected).filter(x=>[x.operator,x.shopOrder,x.operation,x.comments,x.quantity].join(" ").toLowerCase().includes(q)).sort((a,b)=>b.created-a.created);
$("subtitle").textContent=rows.length+" "+(rows.length===1?"entry":"entries")+" recorded for "+selected+(q?" · filtered results":"");
if(!rows.length){$("list").className="empty";$("list").innerHTML='<div class="emptyicon">⌕</div><strong>No matching updates</strong><p>Try another search or add a new turnover comment.</p>';return}
const dateKey=t=>{const d=new Date(t);return d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()};
const dateLabel=t=>{const d=new Date(t),now=new Date(),yesterday=new Date();yesterday.setDate(now.getDate()-1);if(dateKey(t)===dateKey(now.getTime()))return"Today";if(dateKey(t)===dateKey(yesterday.getTime()))return"Yesterday";return d.toLocaleDateString([],{weekday:"long",month:"long",day:"numeric",year:"numeric"})};
const initials=s=>String(s||"OP").trim().split(/\\s+/).slice(0,2).map(v=>v.charAt(0)).join("").toUpperCase();
let lastDate="",html="";
rows.forEach(x=>{
const key=dateKey(x.created);
if(key!==lastDate){html+='<div class="date-divider"><span>'+dateLabel(x.created)+'</span></div>';lastDate=key}
const time=new Date(x.created).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});
html+='<article class="log-entry"><div class="log-rail"><span class="log-dot"></span></div><div class="log-card"><div class="log-top"><div class="operator-block"><span class="avatar">'+esc(initials(x.operator))+'</span><div><strong>'+esc(x.operator||"Unknown operator")+'</strong><span class="entry-machine">'+esc(x.machine)+' <i>·</i> Shift update</span></div></div><time>'+time+'</time></div><p class="log-comment">'+esc(x.comments)+'</p><div class="log-meta">'+(x.shopOrder?'<span><small>SHOP ORDER</small><b>'+esc(x.shopOrder)+'</b></span>':'')+(x.quantity?'<span><small>QUANTITY</small><b>'+esc(x.quantity)+'</b></span>':'')+(x.operation?'<span><small>OPERATION</small><b>'+esc(x.operation)+'</b></span>':'')+'</div></div></article>';
});
$("list").className="production-log";$("list").innerHTML=html;
}
function drawer(open){$("drawer").classList.toggle("open",open);$("backdrop").classList.toggle("hidden",!open)}
$("entry").addEventListener("submit",e=>{e.preventDefault();const m=data.machines.find(x=>x.toLowerCase()===$("machine").value.trim().toLowerCase());if(!m){$("message").textContent="Select a machine from the machine list.";return}data.comments.push({machine:m,operator:$("operator").value.trim(),shopOrder:$("shopOrder").value.trim(),quantity:$("quantity").value,operation:$("operation").value.trim(),comments:$("comments").value.trim(),created:Date.now()});save();$("entry").reset();$("machine").value=m;$("message").textContent="Saved in this browser.";history()});
$("machine").addEventListener("change",history);$("filter").addEventListener("input",history);
$("theme").addEventListener("click",()=>{const t=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=t;localStorage.setItem(THEME,t);$("theme").textContent=t==="dark"?"☾":"☼"});
$("settings").addEventListener("click",()=>drawer(true));$("close").addEventListener("click",()=>drawer(false));$("backdrop").addEventListener("click",()=>drawer(false));
$("addMachine").addEventListener("submit",e=>{e.preventDefault();const m=$("newMachine").value.trim();if(!m)return;if(data.machines.some(x=>x.toLowerCase()===m.toLowerCase())){alert("That machine already exists.");return}data.machines.push(m);$("newMachine").value="";save();machines()});
$("machineAdmin").addEventListener("click",e=>{const m=e.target.dataset.remove;if(!m)return;if(!confirm("Remove "+m+" from the selector? Existing history is retained."))return;data.machines=data.machines.filter(x=>x!==m);save();machines();if(selected===m){$("machine").value="";history()}});
$("reset").addEventListener("click",()=>{if(!confirm("Restore sample machines and comments?"))return;data={machines:[...sampleMachines],comments:sampleComments.map(x=>({...x}))};save();machines();$("machine").value="";history()});
$("today").textContent=new Date().toLocaleDateString([],{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const theme=localStorage.getItem(THEME)||"light";document.documentElement.dataset.theme=theme;$("theme").textContent=theme==="dark"?"☾":"☼";machines();history();
})();