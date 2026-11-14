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
let sortMode="newest";
function history(){
const m=$("machine").value.trim();
selected=data.machines.find(x=>x.toLowerCase()===m.toLowerCase())||"";
if(!selected){$("subtitle").textContent="Select a machine to view its history.";$("list").className="table-wrap empty";$("list").textContent="Choose a machine to see its turnover comments.";return}
const q=$("filter").value.trim().toLowerCase();
let rows=data.comments.filter(x=>x.machine===selected).filter(x=>[x.operator,x.shopOrder,x.operation,x.comments,x.quantity].join(" ").toLowerCase().includes(q));
const val=x=>String(x??"").toLocaleLowerCase();
rows.sort((a,b)=>{
switch(sortMode){
case "oldest":return a.created-b.created;
case "operator":return val(a.operator).localeCompare(val(b.operator))||b.created-a.created;
case "shopOrder":return val(a.shopOrder).localeCompare(val(b.shopOrder))||b.created-a.created;
case "quantityHigh":return (Number(b.quantity)||0)-(Number(a.quantity)||0)||b.created-a.created;
case "quantityLow":return (Number(a.quantity)||0)-(Number(b.quantity)||0)||b.created-a.created;
case "operation":return val(a.operation).localeCompare(val(b.operation))||b.created-a.created;
default:return b.created-a.created;
}
});
$("subtitle").textContent=rows.length+" "+(rows.length===1?"entry":"entries")+" for "+selected+(q?" · filtered":"");
if(!rows.length){$("list").className="table-wrap empty";$("list").innerHTML='<div class="empty-state"><strong>No matching updates</strong><p>Try a different filter or add a new turnover comment.</p></div>';return}
const fmtDate=t=>new Date(t).toLocaleDateString([],{month:"short",day:"numeric",year:"numeric"});
const fmtTime=t=>new Date(t).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"});
const rowsHtml=rows.map(x=>'<tr><td class="date-cell"><strong>'+fmtDate(x.created)+'</strong><small>'+fmtTime(x.created)+'</small></td><td><span class="operator-name">'+esc(x.operator||"—")+'</span></td><td class="order-cell">'+esc(x.shopOrder||"—")+'</td><td class="qty-cell">'+esc(x.quantity||"—")+'</td><td>'+esc(x.operation||"—")+'</td><td class="comment-cell">'+esc(x.comments||"—")+'</td></tr>').join("");
$("list").className="table-wrap";
$("list").innerHTML='<table class="history-table"><thead><tr><th>Date / time</th><th>Operator</th><th>Shop order</th><th>Qty</th><th>Operation</th><th>Comments</th></tr></thead><tbody>'+rowsHtml+'</tbody></table>';
}
function drawer(open){$("drawer").classList.toggle("open",open);$("backdrop").classList.toggle("hidden",!open)}
$("entry").addEventListener("submit",e=>{e.preventDefault();const m=data.machines.find(x=>x.toLowerCase()===$("machine").value.trim().toLowerCase());if(!m){$("message").textContent="Select a machine from the machine list.";return}data.comments.push({machine:m,operator:$("operator").value.trim(),shopOrder:$("shopOrder").value.trim(),quantity:$("quantity").value,operation:$("operation").value.trim(),comments:$("comments").value.trim(),created:Date.now()});save();$("entry").reset();$("machine").value=m;$("message").textContent="Saved in this browser.";history()});
$("machine").addEventListener("change",history);$("filter").addEventListener("input",history);$("sortBy").addEventListener("change",e=>{sortMode=e.target.value;history()});
$("theme").addEventListener("click",()=>{const t=document.documentElement.dataset.theme==="dark"?"light":"dark";document.documentElement.dataset.theme=t;localStorage.setItem(THEME,t);$("theme").textContent=t==="dark"?"☾":"☼"});
$("settings").addEventListener("click",()=>drawer(true));$("close").addEventListener("click",()=>drawer(false));$("backdrop").addEventListener("click",()=>drawer(false));
$("addMachine").addEventListener("submit",e=>{e.preventDefault();const m=$("newMachine").value.trim();if(!m)return;if(data.machines.some(x=>x.toLowerCase()===m.toLowerCase())){alert("That machine already exists.");return}data.machines.push(m);$("newMachine").value="";save();machines()});
$("machineAdmin").addEventListener("click",e=>{const m=e.target.dataset.remove;if(!m)return;if(!confirm("Remove "+m+" from the selector? Existing history is retained."))return;data.machines=data.machines.filter(x=>x!==m);save();machines();if(selected===m){$("machine").value="";history()}});
$("reset").addEventListener("click",()=>{if(!confirm("Restore sample machines and comments?"))return;data={machines:[...sampleMachines],comments:sampleComments.map(x=>({...x}))};save();machines();$("machine").value="";history()});
$("today").textContent=new Date().toLocaleDateString([],{weekday:"long",month:"long",day:"numeric",year:"numeric"});
const theme=localStorage.getItem(THEME)||"light";document.documentElement.dataset.theme=theme;$("theme").textContent=theme==="dark"?"☾":"☼";machines();history();
})();